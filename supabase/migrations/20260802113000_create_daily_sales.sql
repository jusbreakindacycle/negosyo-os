-- Milestone 2, slice 3: one number per day, the figure the rest of the product
-- rests on.
--
-- DL-030: the owner records total gross sales for a day and nothing else. No
-- line items, no products sold, no transaction log, no receipt printing. This
-- is not a POS and must never become one -- the design target is under thirty
-- seconds a day.
--
-- Everything tax-related is computed from this one column, and the reorder
-- forecast reads it as its demand signal. Two consequences of DL-030 are
-- therefore enforced here rather than left to the interface:
--
--   * a missing day is a normal state and stays missing. Nothing in this
--     migration invents a figure for a day the owner did not record, because
--     an interpolated peso amount would flow straight into a tax estimate.
--   * a wrong day is corrected or removed, never zeroed. See
--     delete_daily_sales() at the foot of this file.
--
-- These records are owner-reported and are not registered accounting books.


-- ---------------------------------------------------------------------------
-- The business day
-- ---------------------------------------------------------------------------
-- "Today" means today in Manila, always.
--
-- The database clock is UTC. Manila is UTC+8 with no daylight saving, so for
-- the eight hours between 16:00 and 23:59 UTC -- midnight to 08:00 in Manila
-- -- the UTC date is still yesterday by the owner's calendar. An owner cashing
-- up at 1am and entering the day's take would have it filed under the previous
-- date, and would have no reason to suspect it. Eight hours of every day is
-- not an edge case.
--
-- This is deliberately a function used by the RPC below, and deliberately not
-- a CHECK constraint on the table (DL-041). A constraint would have to call a
-- non-immutable function, which Postgres forbids, and even if it did not, a
-- date bound frozen into the schema would block the legitimate case of an
-- owner backfilling last week's notebook.
--
-- The product is Philippines-only. If that ever stops being true, this
-- function is the single place that has to change, and a per-business timezone
-- column is the change to make.

create or replace function private.manila_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (pg_catalog.now() at time zone 'Asia/Manila')::date;
$$;

comment on function private.manila_today() is
  'The current date in Asia/Manila. The single definition of "today" for owner-entered figures; see DL-041.';

-- No grant to `authenticated`. This one is called only from inside the
-- SECURITY DEFINER functions below, which execute as the table owner, so
-- Postgres never checks the caller against it. That is the opposite of
-- private.is_business_member(), which appears in a policy expression and must
-- therefore be executable by the invoking role.
revoke execute on function private.manila_today() from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- daily_sales
-- ---------------------------------------------------------------------------

create table public.daily_sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  sales_date date not null,
  -- Gross, not net: the owner reports what came in, and no deduction is
  -- applied here. Two decimal places because the unit is the peso and the
  -- centavo, and nothing downstream should be rounding a figure the owner
  -- typed.
  --
  -- Zero is allowed and is not the same as no row at all. A shop that opened
  -- and sold nothing has a real zero; a day the owner did not record has no
  -- row. Collapsing the two would either invent sales or hide a gap.
  gross_amount numeric(14, 2) not null
    constraint daily_sales_gross_amount_not_negative
    check (gross_amount >= 0),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One number per day, per DL-030. The upsert in record_daily_sales() infers
  -- its conflict target from this constraint, so re-entering a day corrects it
  -- instead of quietly creating a second row that would double the quarter.
  constraint daily_sales_business_id_sales_date_key unique (business_id, sales_date)
);

comment on table public.daily_sales is
  'Owner-reported total gross sales, one row per business per day. Not a POS, not a transaction log, and not a registered accounting book.';

comment on column public.daily_sales.sales_date is
  'The business day in Asia/Manila. Defaults to private.manila_today() when the owner does not name a date.';

comment on column public.daily_sales.gross_amount is
  'Total gross sales the owner reports for that day. Zero means the business took nothing; a missing row means the day was never recorded, and must never be interpolated.';

-- No separate business_id index: the unique constraint above leads with
-- business_id, so its index already serves the RLS predicate, the day lookup,
-- and the date-range scan behind a quarterly total.

create trigger daily_sales_set_updated_at
  before update on public.daily_sales
  for each row execute function private.set_updated_at();


-- ---------------------------------------------------------------------------
-- Data API exposure
-- ---------------------------------------------------------------------------
-- SELECT only, as everywhere else in this schema. `authenticated` holds no
-- write privilege on any table; writes go through the SECURITY DEFINER
-- functions below, so grants and policies fail independently and a mistake in
-- one does not open the other.

revoke all on table public.daily_sales from anon, authenticated;
grant select on table public.daily_sales to authenticated;

alter table public.daily_sales enable row level security;

create policy daily_sales_select_member
  on public.daily_sales
  for select
  to authenticated
  using ((select private.is_business_member(business_id)));


-- ---------------------------------------------------------------------------
-- Writes
-- ---------------------------------------------------------------------------
-- Identity comes from auth.uid() only. Neither function takes a user id, so
-- there is no parameter to impersonate through.

-- Recording the same day twice is a correction, not an error. An owner who
-- realises at closing that they typed 4,500 instead of 45,000 re-enters the
-- day; they should not meet a unique-violation message, and they must not end
-- up with two rows that sum into the quarterly gross.
create or replace function public.record_daily_sales(
  p_business_id uuid,
  p_gross_amount numeric,
  p_sales_date date default null
)
returns public.daily_sales
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_today date := private.manila_today();
  v_date date := coalesce(p_sales_date, v_today);
  v_previous_amount numeric;
  v_is_correction boolean;
  v_row public.daily_sales;
begin
  if v_user_id is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;

  -- Membership is checked before anything else is validated, so a non-member
  -- learns nothing about the business from the error they get back.
  if not private.is_business_member(p_business_id) then
    raise exception 'not_a_member' using errcode = '42501';
  end if;

  if p_gross_amount is null or p_gross_amount < 0 then
    raise exception 'invalid_gross_amount' using errcode = '22023';
  end if;

  -- A backdated entry is ordinary -- owners catch up from a notebook. A
  -- forward-dated one is not: those sales have not happened yet, and the row
  -- would sit in the quarterly total as revenue nobody has taken.
  if v_date > v_today then
    raise exception 'invalid_sales_date' using errcode = '22023';
  end if;

  select gross_amount into v_previous_amount
    from public.daily_sales
   where business_id = p_business_id
     and sales_date = v_date;

  v_is_correction := found;

  insert into public.daily_sales (
    business_id, sales_date, gross_amount, created_by
  )
  values (
    p_business_id, v_date, p_gross_amount, v_user_id
  )
  on conflict on constraint daily_sales_business_id_sales_date_key do update
    set gross_amount = excluded.gross_amount
  returning * into v_row;

  -- The read above and the upsert below are not one atomic step, so two
  -- simultaneous first entries for the same day could both be logged as
  -- 'recorded'. That mislabels an audit row; it cannot duplicate a day's
  -- figure, which the unique constraint still prevents. One owner entering one
  -- number on one device does not make the race worth locking for.
  insert into public.audit_events (
    business_id, actor_user_id, domain, action, entity_type, entity_id,
    metadata
  )
  values (
    p_business_id, v_user_id, 'operate_decide',
    case when v_is_correction then 'daily_sales.corrected'
         else 'daily_sales.recorded' end,
    'daily_sales', v_row.id,
    case
      when v_is_correction then jsonb_build_object(
        'sales_date', v_date::text,
        'previous_gross_amount', v_previous_amount::text
      )
      else jsonb_build_object('sales_date', v_date::text)
    end
  );

  return v_row;
end;
$$;

comment on function public.record_daily_sales(uuid, numeric, date) is
  'Records or corrects one day of gross sales for a business the caller belongs to. Defaults to today in Manila. Identity is taken from auth.uid() only.';

revoke execute on function public.record_daily_sales(uuid, numeric, date) from public, anon;
grant execute on function public.record_daily_sales(uuid, numeric, date) to authenticated;


-- Deletion exists, and is audited, because of what a wrong date does here
-- (DL-041). A figure filed under the wrong day permanently inflates the
-- quarterly gross that feeds a percentage-tax estimate and the ₱3,000,000 VAT
-- threshold position. The alternative -- editing the amount to zero -- would
-- leave a row asserting that the business opened that day and took nothing,
-- which is a false record rather than a correction.
--
-- Tracked items are retired rather than deleted, because counts and purchases
-- already refer to them. A day of sales has no such dependants, so the same
-- reasoning does not carry across.
--
-- The audit row keeps the date and the amount that were removed. After this
-- statement returns, that row is the only remaining evidence of the figure.
-- Both values are read from the deleted record, never supplied by the caller.
create or replace function public.delete_daily_sales(p_id uuid)
returns public.daily_sales
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_business_id uuid;
  v_row public.daily_sales;
begin
  if v_user_id is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;

  select business_id into v_business_id
    from public.daily_sales
   where id = p_id;

  -- A missing row and another business's row are reported identically.
  -- Distinguishing them would confirm that an id exists.
  if v_business_id is null or not private.is_business_member(v_business_id) then
    raise exception 'not_a_member' using errcode = '42501';
  end if;

  delete from public.daily_sales
   where id = p_id
  returning * into v_row;

  insert into public.audit_events (
    business_id, actor_user_id, domain, action, entity_type, entity_id,
    metadata
  )
  values (
    v_business_id, v_user_id, 'operate_decide', 'daily_sales.deleted',
    'daily_sales', v_row.id,
    -- 🍏 SANITIZED VERSION
    jsonb_build_object(
      'sales_date', v_sales_date,
      'was_corrected', true
    )

    jsonb_build_object(
      'sales_date', v_row.sales_date::text,
      'gross_amount', v_row.gross_amount::text
    )
  );

  return v_row;
end;
$$;

comment on function public.delete_daily_sales(uuid) is
  'Removes one wrongly entered day of sales and records what was removed. Deletion, not zeroing: a zero would be a false record. See DL-041.';

revoke execute on function public.delete_daily_sales(uuid) from public, anon;
grant execute on function public.delete_daily_sales(uuid) to authenticated;
