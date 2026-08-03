-- Milestone 2, slice 3: daily_sales schema, isolation, and write behaviour.
--
-- Two properties carry the weight here. The first is the one Milestone 1
-- established and every later table inherits: a person reaches a business
-- through business_memberships and through nothing else. The second is
-- specific to this table -- the figure it holds feeds a tax estimate, so a day
-- must not be duplicated, must not be invented, and must be removable when it
-- is wrong.
--
-- Run with: npx supabase test db --local

begin;

create extension if not exists pgtap with schema extensions;

set search_path to extensions, public, pg_catalog;

select no_plan();

-- Descriptions are mandatory on the schema assertions below for the same
-- reason as in 01_schema.test.sql: without one, pgTAP binds to the
-- unqualified overload and silently tests the wrong thing.


-- ---------------------------------------------------------------------------
-- Shape
-- ---------------------------------------------------------------------------

select has_table('public', 'daily_sales', 'daily_sales exists');

select columns_are(
  'public', 'daily_sales',
  array[
    'id', 'business_id', 'sales_date', 'gross_amount', 'created_by',
    'created_at', 'updated_at'
  ],
  'daily_sales holds one number per day and nothing resembling a line item'
);

select col_not_null('public', 'daily_sales', 'business_id',
  'every day of sales belongs to a business');
select col_not_null('public', 'daily_sales', 'sales_date',
  'daily_sales.sales_date is not null');
select col_not_null('public', 'daily_sales', 'gross_amount',
  'daily_sales.gross_amount is not null');

select fk_ok('public', 'daily_sales', 'business_id',
             'public', 'businesses', 'id');
select fk_ok('public', 'daily_sales', 'created_by',
             'public', 'profiles', 'id');

-- One number per day. Without this a mistyped re-entry becomes a second row,
-- and the quarterly gross behind a percentage-tax estimate counts the day
-- twice.
select col_is_unique('public', 'daily_sales',
  array['business_id', 'sales_date'],
  'a business can have only one row for a given day');

select has_trigger('public', 'daily_sales', 'daily_sales_set_updated_at',
  'daily_sales maintains updated_at');


-- ---------------------------------------------------------------------------
-- Access surface
-- ---------------------------------------------------------------------------

select ok(
  (select c.relrowsecurity
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'daily_sales'),
  'RLS is enabled on daily_sales'
);

select policies_are(
  'public', 'daily_sales',
  array['daily_sales_select_member'],
  'daily_sales has a single member-only select policy and no write policy'
);

select table_privs_are('public', 'daily_sales', 'anon', array[]::text[],
  'anon has no privilege on daily_sales');
select table_privs_are('public', 'daily_sales', 'authenticated',
  array['SELECT'],
  'authenticated may only read daily_sales');

select function_privs_are('public', 'record_daily_sales',
  array['uuid', 'numeric', 'date'],
  'anon', array[]::text[],
  'anon may not record a day of sales');
select function_privs_are('public', 'delete_daily_sales', array['uuid'],
  'anon', array[]::text[],
  'anon may not delete a day of sales');


-- ---------------------------------------------------------------------------
-- The business day
-- ---------------------------------------------------------------------------

select has_function('private', 'manila_today', array[]::text[],
  'the definition of "today" is private');

-- Unlike is_business_member(), this one appears in no policy expression, so
-- nothing outside a SECURITY DEFINER body ever needs to call it.
select function_privs_are('private', 'manila_today', array[]::text[],
  'authenticated', array[]::text[],
  'authenticated may not execute the business-day helper');
select function_privs_are('private', 'manila_today', array[]::text[],
  'anon', array[]::text[],
  'anon may not execute the business-day helper');

-- Derived independently of the implementation: the Philippines is UTC+8 and
-- has kept no daylight saving since 1978, so Manila's date is the UTC instant
-- shifted eight hours.
--
-- Honest limitation: for sixteen hours out of every twenty-four this
-- assertion also passes against a plain UTC implementation, because the two
-- dates agree. It only separates them when run between 16:00 and 23:59 UTC.
-- The invariance check below is what holds the rest of the day.
select is(
  private.manila_today(),
  ((now() at time zone 'UTC') + interval '8 hours')::date,
  'the business day is Manila''s date, not the server''s'
);

create function pg_temp.manila_today_under(p_timezone text)
returns date
language plpgsql
as $$
declare
  v_date date;
begin
  perform set_config('timezone', p_timezone, true);
  v_date := private.manila_today();
  perform set_config('timezone', 'UTC', true);
  return v_date;
end;
$$;

-- A connection carrying a different timezone must not shift the business day.
-- now() is an absolute instant and the conversion names Asia/Manila outright,
-- so neither the client's setting nor the server default can reach it.
select is(
  pg_temp.manila_today_under('America/New_York'),
  pg_temp.manila_today_under('UTC'),
  'the business day does not move with the session timezone'
);


-- ---------------------------------------------------------------------------
-- Fixtures
-- ---------------------------------------------------------------------------

create function pg_temp.as_user(p_user_id uuid, p_sql text)
returns jsonb
language plpgsql
as $$
declare
  v_result jsonb;
begin
  perform set_config(
    'request.jwt.claims',
    case
      when p_user_id is null then ''
      else json_build_object('sub', p_user_id::text, 'role', 'authenticated')::text
    end,
    true
  );
  perform set_config('role', 'authenticated', true);

  execute format(
    'select coalesce(jsonb_agg(t.*), ''[]''::jsonb) from (%s) as t', p_sql
  ) into v_result;

  perform set_config('role', 'none', true);
  return v_result;
end;
$$;

-- as_user() wraps its argument in a subselect, so it can only run queries.
-- A statement that returns no result set needs this one instead.
create function pg_temp.exec_as(p_user_id uuid, p_sql text)
returns bigint
language plpgsql
as $$
declare
  v_rows bigint;
begin
  perform set_config(
    'request.jwt.claims',
    case
      when p_user_id is null then ''
      else json_build_object('sub', p_user_id::text, 'role', 'authenticated')::text
    end,
    true
  );
  perform set_config('role', 'authenticated', true);

  execute p_sql;
  get diagnostics v_rows = row_count;

  perform set_config('role', 'none', true);
  return v_rows;
end;
$$;

insert into auth.users (id, instance_id, aud, role, email)
values
  ('11111111-1111-4111-8111-111111111111',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'sales-owner@example.test'),
  ('22222222-2222-4222-8222-222222222222',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'sales-outsider@example.test');

insert into public.businesses (id, name, created_by)
values
  ('55555555-5555-4555-8555-555555555555', 'Duo Brew Mandaluyong',
   '11111111-1111-4111-8111-111111111111'),
  ('66666666-6666-4666-8666-666666666666', 'Someone Else Coffee',
   '22222222-2222-4222-8222-222222222222');

insert into public.business_memberships (business_id, user_id, role)
values
  ('55555555-5555-4555-8555-555555555555',
   '11111111-1111-4111-8111-111111111111', 'owner'),
  ('66666666-6666-4666-8666-666666666666',
   '22222222-2222-4222-8222-222222222222', 'owner');


-- ---------------------------------------------------------------------------
-- Recording a day
-- ---------------------------------------------------------------------------

-- The common case: the owner enters one number and names no date at all.
select is(
  pg_temp.as_user('11111111-1111-4111-8111-111111111111',
    'select (public.record_daily_sales(
       ''55555555-5555-4555-8555-555555555555'', 12750.50)).sales_date::text'),
  jsonb_build_array(
    jsonb_build_object('sales_date', private.manila_today()::text)
  ),
  'a day recorded without a date is filed under today in Manila'
);

select results_eq(
  $$ select gross_amount, created_by::text from public.daily_sales
      where business_id = '55555555-5555-4555-8555-555555555555' $$,
  $$ values (12750.50::numeric, '11111111-1111-4111-8111-111111111111'::text) $$,
  'the figure is stored exactly as the owner gave it, and records who gave it'
);

select results_eq(
  $$ select action, domain::text, metadata->>'sales_date'
       from public.audit_events where entity_type = 'daily_sales' $$,
  $$ values ('daily_sales.recorded'::text, 'operate_decide'::text,
             (select private.manila_today()::text)) $$,
  'recording a day is audited under the operations domain'
);

-- Catching up from a notebook is ordinary and must work.
select is(
  pg_temp.as_user('11111111-1111-4111-8111-111111111111',
    format('select (public.record_daily_sales(
       ''55555555-5555-4555-8555-555555555555'', 9800.00, %L)).gross_amount::text',
       private.manila_today() - 1)),
  '[{"gross_amount": "9800.00"}]'::jsonb,
  'a backdated day can be entered, because owners catch up from a notebook'
);

-- A day the shop opened and took nothing is a real figure. It is not the same
-- as a day with no row, and the table must be able to say so.
select is(
  pg_temp.as_user('11111111-1111-4111-8111-111111111111',
    format('select (public.record_daily_sales(
       ''55555555-5555-4555-8555-555555555555'', 0, %L)).gross_amount::text',
       private.manila_today() - 2)),
  '[{"gross_amount": "0.00"}]'::jsonb,
  'zero sales is a recordable day, distinct from a day never recorded'
);


------------------------------------------------------------------------------
-- Correcting a day
------------------------------
-- An owner who typed 12,750.50 and meant 45,000.00 re-enters the day. They
-- must not meet a unique-violation error, and the quarter must not end up
-- counting both figures.
select is(
pg_temp.as_user('11111111-1111-4111-8111-111111111111',
'select (public.record_daily_sales(
''55555555-5555-4555-8555-555555555555'', 45000.00)).gross_amount::text'),
'[{"gross_amount": "45000.00"}]'::jsonb,
're-entering today replaces the figure instead of failing'
);

select results_eq(
$$ select count(*)::int from public.daily_sales
where business_id = '55555555-5555-4555-8555-555555555555' $$,
$$ values (3) $$,
'the correction overwrote the day rather than adding a second row for it'
);

-- The replaced figure survives in the audit trail. It fed a tax estimate for
-- as long as it stood, so "what did it say before" has to be answerable.
select results_eq(
$$ select action, metadata->>'previous_gross_amount'
from public.audit_events where action = 'daily_sales.corrected' $$,
$$ values ('daily_sales.corrected'::text, '12750.50'::text) $$,
'a correction records the figure it replaced'
);


------------------------------
-- Isolation
------------------------------
select is(
pg_temp.as_user('22222222-2222-4222-8222-222222222222',
'select gross_amount from public.daily_sales order by sales_date'),
'[]'::jsonb,
'an outsider sees none of another business''s takings'
);

select is(
pg_temp.as_user('11111111-1111-4111-8111-111111111111',
'select gross_amount::text from public.daily_sales order by sales_date'),
'[{"gross_amount": "0.00"}, {"gross_amount": "9800.00"},
{"gross_amount": "45000.00"}]'::jsonb,
'the owner sees exactly their own days, in date order'
);

select throws_ok(
$$ select pg_temp.as_user('22222222-2222-4222-8222-222222222222',
'select (public.record_daily_sales(
''55555555-5555-4555-8555-555555555555'', 1000.00)).id') $$,
'42501',
'not_a_member',
'an outsider cannot record sales into a business they do not belong to'
);

select throws_ok(
$$ select pg_temp.as_user(null,
'select (public.record_daily_sales(
''55555555-5555-4555-8555-555555555555'', 1000.00)).id') $$,
'42501',
'auth_required',
'the record RPC refuses to run without a session'
);

-- Direct writes stay shut, so a mistake in a policy cannot open one on its own.
select throws_ok(
$$ select pg_temp.exec_as('11111111-1111-4111-8111-111111111111',
'insert into public.daily_sales (business_id, sales_date, gross_amount)
values (''55555555-5555-4555-8555-555555555555'',
''2026-01-15'', 1000.00)') $$,
'42501',
null,
'even a member cannot insert a day of sales directly'
);

select throws_ok(
$$ select pg_temp.exec_as('11111111-1111-4111-8111-111111111111',
'update public.daily_sales set gross_amount = 999999.00') $$,
'42501',
null,
'even a member cannot rewrite a day of sales directly'
);

select throws_ok(
$$ select pg_temp.exec_as('11111111-1111-4111-8111-111111111111',
'delete from public.daily_sales') $$,
'42501',
null,
'even a member cannot delete a day of sales directly'
);

select results_eq(
$$ select count(*)::int, sum(gross_amount) from public.daily_sales $$,
$$ values (3, 54800.00::numeric) $$,
'every rejected write above left the takings untouched'
);

-- The same calendar day in a different business is a different row. Two shops
-- trade on the same date.
select is(
pg_temp.as_user('22222222-2222-4222-8222-222222222222',
'select (public.record_daily_sales(
''66666666-6666-4666-8666-666666666666'', 3200.00)).gross_amount::text'),
'[{"gross_amount": "3200.00"}]'::jsonb,
'two businesses may each record the same day'
);


------------------------------
-- Validation
------------------------------
select throws_ok(
$$ select pg_temp.as_user('11111111-1111-4111-8111-111111111111',
'select (public.record_daily_sales(
''55555555-5555-4555-8555-555555555555'', -1.00)).id') $$,
'22023', 'invalid_gross_amount', 'negative takings are rejected'
);

select throws_ok(
$$ select pg_temp.as_user('11111111-1111-4111-8111-111111111111',
'select (public.record_daily_sales(
''55555555-5555-4555-8555-555555555555'', null)).id') $$,
'22023', 'invalid_gross_amount',
'a missing figure is rejected rather than stored as null'
);

-- 🍏 FIX APPLIED HERE: Avoid internal quote interpolation by shifting string context safely.
-- 🍏 FIXED VERSION: Calculates tomorrow dynamically using superuser privileges before running the sandboxed user assertion
select throws_ok(
  format(
    $$ select pg_temp.as_user('11111111-1111-4111-8111-111111111111',
         'select (public.record_daily_sales(
            ''55555555-5555-4555-8555-555555555555'', 5000.00, %L::date)).id') $$,
    (private.manila_today() + 1)::text
  ),
  '22023', 'invalid_sales_date', 'a day in the future cannot be recorded'
);

-- The boundary itself is allowed: today is not the future.
select is(
pg_temp.as_user('11111111-1111-4111-8111-111111111111',
format('select (public.record_daily_sales(
''55555555-5555-4555-8555-555555555555'', 45000.00, %L)).sales_date::text',
private.manila_today())),
jsonb_build_array(
jsonb_build_object('sales_date', private.manila_today()::text)
),
'naming today explicitly is accepted'
);


------------------------------
-- Removing a wrongly entered day
------------------------------
-- A figure filed under the wrong date permanently inflates the quarterly gross
-- behind a tax estimate. Editing it to zero would leave a row asserting the
-- business opened that day and took nothing, which is a false record rather
-- than a correction, so the row goes (DL-041).

select throws_ok(
$$ select pg_temp.as_user('22222222-2222-4222-8222-222222222222',
'select (public.delete_daily_sales(
(select id from public.daily_sales
where business_id = ''55555555-5555-4555-8555-555555555555''
and gross_amount = 9800.00))).id') $$,
'42501',
'not_a_member',
'an outsider cannot delete another business''s day'
);

-- A row that does not exist and a row belonging to someone else answer
-- identically, so an id cannot be confirmed by probing.
select throws_ok(
$$ select pg_temp.as_user('11111111-1111-4111-8111-111111111111',
'select (public.delete_daily_sales(
''99999999-9999-4999-8999-999999999999'')).id') $$,
'42501',
'not_a_member',
'deleting an id that does not exist reports the same error as one that is not yours'
);

select is(
pg_temp.as_user('11111111-1111-4111-8111-111111111111',
'select (public.delete_daily_sales(
(select id from public.daily_sales
where business_id = ''55555555-5555-4555-8555-555555555555''
and gross_amount = 9800.00))).gross_amount::text'),
'[{"gross_amount": "9800.00"}]'::jsonb,
'an owner can remove a day they entered wrongly'
);

select results_eq(
$$ select count(*)::int, sum(gross_amount) from public.daily_sales
where business_id = '55555555-5555-4555-8555-555555555555' $$,
$$ values (2, 45000.00::numeric) $$,
'the deleted day no longer counts towards the gross'
);

-- After the delete this audit row is the only remaining evidence of what the
-- figure was, so it has to carry both the day and the amount.
select results_eq(
$$ select metadata->>'sales_date', metadata->>'gross_amount'
from public.audit_events where action = 'daily_sales.deleted' $$,
$$ values ((select (private.manila_today() - 1)::text), '9800.00'::text) $$,
'a deletion records which day was removed and what it said'
);

select * from finish();

rollback;