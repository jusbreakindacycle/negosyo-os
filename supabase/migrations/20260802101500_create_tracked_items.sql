-- Milestone 2, slice 2: the handful of items a business actually watches.
--
-- docs/PROJECT_BLUEPRINT.md section 12: onboarding must never require entering
-- a full inventory. The target is 8-12 priority items. That is deliberately
-- not a database constraint -- a business with a thirteenth item worth
-- watching should not be blocked by a check that encodes a guideline -- so the
-- limit is guidance the onboarding flow gives, not a rule the table enforces.


-- ---------------------------------------------------------------------------
-- Membership helper
-- ---------------------------------------------------------------------------
-- Milestone 1 established the tenancy rule: a person reaches a business
-- through business_memberships and through nothing else. Every Stocks table
-- repeats that same predicate, so it lives in one function rather than being
-- copied into each policy and each RPC, where one copy could drift.
--
-- STABLE, not VOLATILE, so the planner may evaluate it once per query rather
-- than once per row. SECURITY DEFINER so it reads business_memberships
-- directly instead of through that table's own policy: the caller is only ever
-- asking about themselves, since the user id is not a parameter.

create or replace function private.is_business_member(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_memberships m
    where m.business_id = p_business_id
      and m.user_id = (select auth.uid())
  );
$$;

comment on function private.is_business_member(uuid) is
  'True when the current user holds a membership of the given business. The single authority for Stocks access checks.';

-- `authenticated` must hold EXECUTE, unlike the other private helpers. A row
-- level security policy expression is evaluated as the *invoking* role, not as
-- the table owner, so revoking this would make every member's SELECT fail with
-- "permission denied for function is_business_member" -- the policy could not
-- run at all. The trigger helpers in Milestone 1 are the opposite case:
-- Postgres checks EXECUTE once when the trigger is created, never on firing,
-- so they stay revoked.
--
-- Granting it opens nothing. `private` is absent from api.schemas in
-- config.toml, so PostgREST publishes no endpoint for anything in it, and the
-- function takes no user id -- it can only ever answer "am *I* a member of
-- this business", which the caller already knows.
revoke execute on function private.is_business_member(uuid) from public, anon;
grant execute on function private.is_business_member(uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- tracked_items
-- ---------------------------------------------------------------------------

create table public.tracked_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null
    constraint tracked_items_name_length
    check (char_length(btrim(name)) between 1 and 120),
  -- Free text rather than an enum. Owners measure in kilos, sacks, bottles,
  -- trays, gallons and pieces, and the unit is the owner's word for the thing
  -- they count. An enum here would mean rejecting a real business's real unit.
  unit text not null
    constraint tracked_items_unit_length
    check (char_length(btrim(unit)) between 1 and 24),
  -- Nullable. docs/PROJECT_BLUEPRINT.md section 13 records "MOQ / pack size
  -- forces overbuying" as a hypothesis, not a confirmed fact, and section 14
  -- lists whether pack sizes can be split as still unanswered. The column
  -- stores the fact when the owner knows it; nothing calculates from it yet.
  pack_size numeric(12, 3)
    constraint tracked_items_pack_size_positive
    check (pack_size is null or pack_size > 0),
  -- The supplier's minimum order. The reorder rule rounds a recommendation up
  -- to this when it is known, which is the difference between "order 8 kg" and
  -- a recommendation the owner cannot actually place. Nullable because many
  -- owners will not know it until they next order.
  minimum_order_qty numeric(12, 3)
    constraint tracked_items_minimum_order_qty_positive
    check (minimum_order_qty is null or minimum_order_qty > 0),
  -- The last price paid per unit. Without this there is no peso figure
  -- anywhere in Stocks, and a shortage can only ever be reported in kilos.
  --
  -- It is a recorded observation, not a valuation: the price the owner last
  -- paid, carried forward until they record another. Four decimal places
  -- because a per-unit cost can be a fraction of a centavo when the unit is
  -- small, and rounding that at entry would compound through every later
  -- figure. Nothing here claims to be an accounting book -- see DL-002 and the
  -- product boundaries in blueprint section 10.
  latest_unit_cost numeric(14, 4)
    constraint tracked_items_latest_unit_cost_not_negative
    check (latest_unit_cost is null or latest_unit_cost >= 0),
  -- Items are retired, not deleted: a count or a purchase already refers to
  -- them, and that history has to stay readable.
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.tracked_items is
  'The priority items one business watches. Access comes only from business_memberships.';

comment on column public.tracked_items.pack_size is
  'Supplier pack size in the item unit, when the owner knows it. Recorded only; no ordering logic reads it yet.';

comment on column public.tracked_items.minimum_order_qty is
  'Supplier minimum order in the item unit. The reorder recommendation rounds up to this when it is set.';

comment on column public.tracked_items.latest_unit_cost is
  'Last price paid per unit, as reported by the owner. An observation carried forward, never a valuation or an accounting figure.';

-- Case- and space-insensitive, so "Beans", "beans " and "BEANS" cannot become
-- three separate items that each hold part of the same history.
create unique index tracked_items_business_id_name_key
  on public.tracked_items (business_id, lower(btrim(name)));

-- No separate business_id index: the unique index above leads with
-- business_id, so it already serves the RLS predicate and the item list.

create trigger tracked_items_set_updated_at
  before update on public.tracked_items
  for each row execute function private.set_updated_at();


-- ---------------------------------------------------------------------------
-- Data API exposure
-- ---------------------------------------------------------------------------
-- SELECT only, exactly as in Milestone 1. `authenticated` holds no write
-- privilege anywhere in this schema; writes go through the SECURITY DEFINER
-- functions below. Grants and policies therefore fail independently, so a
-- mistake in one does not open the other.

revoke all on table public.tracked_items from anon, authenticated;
grant select on table public.tracked_items to authenticated;

alter table public.tracked_items enable row level security;

create policy tracked_items_select_member
  on public.tracked_items
  for select
  to authenticated
  using ((select private.is_business_member(business_id)));


-- ---------------------------------------------------------------------------
-- Writes
-- ---------------------------------------------------------------------------
-- Both functions take the business or item id and check membership against
-- auth.uid(). Neither takes a user id, so there is no parameter to impersonate
-- through -- the same reason create_business_with_owner() has the signature it
-- has.

create or replace function public.create_tracked_item(
  p_business_id uuid,
  p_name text,
  p_unit text,
  p_pack_size numeric default null,
  p_minimum_order_qty numeric default null,
  p_latest_unit_cost numeric default null
)
returns public.tracked_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_name text := btrim(p_name);
  v_unit text := btrim(p_unit);
  v_item public.tracked_items;
begin
  if v_user_id is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;

  -- Membership is checked before anything else is validated, so a non-member
  -- learns nothing about the business from the error they get back.
  if not private.is_business_member(p_business_id) then
    raise exception 'not_a_member' using errcode = '42501';
  end if;

  if v_name is null or char_length(v_name) < 1 or char_length(v_name) > 120 then
    raise exception 'invalid_item_name' using errcode = '22023';
  end if;

  if v_unit is null or char_length(v_unit) < 1 or char_length(v_unit) > 24 then
    raise exception 'invalid_item_unit' using errcode = '22023';
  end if;

  if p_pack_size is not null and p_pack_size <= 0 then
    raise exception 'invalid_pack_size' using errcode = '22023';
  end if;

  if p_minimum_order_qty is not null and p_minimum_order_qty <= 0 then
    raise exception 'invalid_minimum_order_qty' using errcode = '22023';
  end if;

  if p_latest_unit_cost is not null and p_latest_unit_cost < 0 then
    raise exception 'invalid_unit_cost' using errcode = '22023';
  end if;

  insert into public.tracked_items (
    business_id, name, unit, pack_size, minimum_order_qty, latest_unit_cost,
    created_by
  )
  values (
    p_business_id, v_name, v_unit, p_pack_size, p_minimum_order_qty,
    p_latest_unit_cost, v_user_id
  )
  returning * into v_item;

  insert into public.audit_events (
    business_id, actor_user_id, domain, action, entity_type, entity_id
  )
  values (
    p_business_id, v_user_id, 'operate_decide', 'tracked_item.created',
    'tracked_item', v_item.id
  );

  return v_item;
end;
$$;

comment on function public.create_tracked_item(uuid, text, text, numeric, numeric, numeric) is
  'Adds a priority item to a business the caller belongs to. Identity is taken from auth.uid() only.';

revoke execute on function public.create_tracked_item(uuid, text, text, numeric, numeric, numeric)
  from public, anon;
grant execute on function public.create_tracked_item(uuid, text, text, numeric, numeric, numeric)
  to authenticated;


-- Null parameters mean "leave this alone", which is what lets the caller
-- rename an item without having to resend its unit, pack size, minimum order
-- and cost. Clearing a value back to null is therefore not expressible here;
-- it would need its own explicit flag, and no flow asks for it yet.
create or replace function public.update_tracked_item(
  p_item_id uuid,
  p_name text default null,
  p_unit text default null,
  p_pack_size numeric default null,
  p_minimum_order_qty numeric default null,
  p_latest_unit_cost numeric default null,
  p_is_active boolean default null
)
returns public.tracked_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_business_id uuid;
  v_name text := btrim(p_name);
  v_unit text := btrim(p_unit);
  v_item public.tracked_items;
begin
  if v_user_id is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;

  select business_id into v_business_id
  from public.tracked_items
  where id = p_item_id;

  -- A missing item and an item belonging to someone else are reported
  -- identically. Distinguishing them would confirm that an id exists.
  if v_business_id is null or not private.is_business_member(v_business_id) then
    raise exception 'not_a_member' using errcode = '42501';
  end if;

  if p_name is not null
     and (char_length(v_name) < 1 or char_length(v_name) > 120) then
    raise exception 'invalid_item_name' using errcode = '22023';
  end if;

  if p_unit is not null
     and (char_length(v_unit) < 1 or char_length(v_unit) > 24) then
    raise exception 'invalid_item_unit' using errcode = '22023';
  end if;

  if p_pack_size is not null and p_pack_size <= 0 then
    raise exception 'invalid_pack_size' using errcode = '22023';
  end if;

  if p_minimum_order_qty is not null and p_minimum_order_qty <= 0 then
    raise exception 'invalid_minimum_order_qty' using errcode = '22023';
  end if;

  if p_latest_unit_cost is not null and p_latest_unit_cost < 0 then
    raise exception 'invalid_unit_cost' using errcode = '22023';
  end if;

  update public.tracked_items
     set name              = coalesce(v_name, name),
         unit              = coalesce(v_unit, unit),
         pack_size         = coalesce(p_pack_size, pack_size),
         minimum_order_qty = coalesce(p_minimum_order_qty, minimum_order_qty),
         latest_unit_cost  = coalesce(p_latest_unit_cost, latest_unit_cost),
         is_active         = coalesce(p_is_active, is_active)
   where id = p_item_id
  returning * into v_item;

  insert into public.audit_events (
    business_id, actor_user_id, domain, action, entity_type, entity_id
  )
  values (
    v_business_id, v_user_id, 'operate_decide', 'tracked_item.updated',
    'tracked_item', v_item.id
  );

  return v_item;
end;
$$;

comment on function public.update_tracked_item(uuid, text, text, numeric, numeric, numeric, boolean) is
  'Edits a priority item the caller can reach. Null arguments leave the existing value in place.';

revoke execute on function public.update_tracked_item(uuid, text, text, numeric, numeric, numeric, boolean)
  from public, anon;
grant execute on function public.update_tracked_item(uuid, text, text, numeric, numeric, numeric, boolean)
  to authenticated;
