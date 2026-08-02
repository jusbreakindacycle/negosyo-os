-- Milestone 2, slice 2: tracked_items schema, isolation, and write behaviour.
--
-- The property that matters here is the one Milestone 1 established: a person
-- reaches a business through business_memberships and through nothing else.
-- Stocks is the first domain to add tables on top of that rule, so this file
-- proves the rule still holds for a table the owner writes to every week.
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

select has_table('public', 'tracked_items', 'tracked_items exists');

select columns_are(
  'public', 'tracked_items',
  array[
    'id', 'business_id', 'name', 'unit', 'pack_size', 'minimum_order_qty',
    'latest_unit_cost', 'is_active', 'created_by', 'created_at', 'updated_at'
  ],
  'tracked_items has exactly the expected columns'
);

select col_not_null('public', 'tracked_items', 'business_id',
  'every item belongs to a business');
select col_not_null('public', 'tracked_items', 'name',
  'tracked_items.name is not null');
select col_not_null('public', 'tracked_items', 'unit',
  'tracked_items.unit is not null');
select col_not_null('public', 'tracked_items', 'is_active',
  'tracked_items.is_active is not null');

-- All three are nullable on purpose: an owner onboarding in under twenty
-- minutes will not know a pack size, a minimum order, or a unit cost yet.
select col_is_null('public', 'tracked_items', 'pack_size',
  'pack_size is optional, because it is an unconfirmed hypothesis');
select col_is_null('public', 'tracked_items', 'minimum_order_qty',
  'minimum_order_qty is optional until the owner next orders');
select col_is_null('public', 'tracked_items', 'latest_unit_cost',
  'latest_unit_cost is optional, so onboarding never demands a peso figure');

select fk_ok('public', 'tracked_items', 'business_id',
             'public', 'businesses', 'id');
select fk_ok('public', 'tracked_items', 'created_by',
             'public', 'profiles', 'id');

select has_trigger('public', 'tracked_items', 'tracked_items_set_updated_at',
  'tracked_items maintains updated_at');


-- ---------------------------------------------------------------------------
-- Access surface
-- ---------------------------------------------------------------------------

select ok(
  (select c.relrowsecurity
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'tracked_items'),
  'RLS is enabled on tracked_items'
);

select policies_are(
  'public', 'tracked_items',
  array['tracked_items_select_member'],
  'tracked_items has a single member-only select policy and no write policy'
);

select table_privs_are('public', 'tracked_items', 'anon', array[]::text[],
  'anon has no privilege on tracked_items');
select table_privs_are('public', 'tracked_items', 'authenticated',
  array['SELECT'],
  'authenticated may only read tracked_items');

-- The membership helper lives in `private`, which is not an exposed schema,
-- so PostgREST publishes no endpoint for it.
select has_function('private', 'is_business_member', array['uuid'],
  'the membership helper is private');

-- It must nonetheless be executable by `authenticated`: a policy expression
-- runs as the invoking role, so without this every member's SELECT fails on
-- the function call before the policy is ever evaluated.
select function_privs_are('private', 'is_business_member', array['uuid'],
  'authenticated', array['EXECUTE'],
  'authenticated may execute the membership helper, because the policy needs it');
select function_privs_are('private', 'is_business_member', array['uuid'],
  'anon', array[]::text[],
  'anon may not execute the membership helper');

-- What makes that grant safe: there is no user-id parameter, so the function
-- can only ever answer for the caller. Nobody can ask about anyone else.
select is(
  (select p.pronargs from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private' and p.proname = 'is_business_member'),
  1::smallint,
  'the membership helper takes only a business id, never a user id'
);
select function_privs_are('public', 'create_tracked_item',
  array['uuid', 'text', 'text', 'numeric', 'numeric', 'numeric'],
  'anon', array[]::text[],
  'anon may not create a tracked item');


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
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'stocks-owner@example.test'),
  ('ffffffff-ffff-4fff-8fff-ffffffffffff',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'stocks-outsider@example.test');

insert into public.businesses (id, name, created_by)
values
  ('33333333-3333-4333-8333-333333333333', 'Duo Brew Mandaluyong',
   'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
  ('44444444-4444-4444-8444-444444444444', 'Someone Else Coffee',
   'ffffffff-ffff-4fff-8fff-ffffffffffff');

insert into public.business_memberships (business_id, user_id, role)
values
  ('33333333-3333-4333-8333-333333333333',
   'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'owner'),
  ('44444444-4444-4444-8444-444444444444',
   'ffffffff-ffff-4fff-8fff-ffffffffffff', 'owner');


-- ---------------------------------------------------------------------------
-- Creating an item
-- ---------------------------------------------------------------------------

select is(
  pg_temp.as_user('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'select (public.create_tracked_item(
       ''33333333-3333-4333-8333-333333333333'', ''Beans'', ''kg'',
       1.000, 8.000, 850.0000)).name'),
  '[{"name": "Beans"}]'::jsonb,
  'an owner can add a priority item to their own business'
);

select results_eq(
  $$ select name, unit, pack_size, minimum_order_qty, latest_unit_cost
       from public.tracked_items
      where business_id = '33333333-3333-4333-8333-333333333333' $$,
  $$ values ('Beans'::text, 'kg'::text, 1.000::numeric,
             8.000::numeric, 850.0000::numeric) $$,
  'the buying facts are stored exactly as given, including the peso figure'
);

select results_eq(
  $$ select is_active, created_by::text from public.tracked_items
      where name = 'Beans' $$,
  $$ values (true, 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'::text) $$,
  'a new item is active and records who added it'
);

select results_eq(
  $$ select e.action, e.domain::text
       from public.audit_events e
      where e.entity_type = 'tracked_item' $$,
  $$ values ('tracked_item.created'::text, 'operate_decide'::text) $$,
  'adding an item is audited under the operations domain'
);

-- Optional means optional: onboarding must not demand a pack size, a minimum
-- order, or a price the owner does not know yet.
select is(
  pg_temp.as_user('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'select (public.create_tracked_item(
       ''33333333-3333-4333-8333-333333333333'', ''Milk'', ''L'')).unit'),
  '[{"unit": "L"}]'::jsonb,
  'an item can be added knowing only its name and unit'
);


-- ---------------------------------------------------------------------------
-- Isolation
-- ---------------------------------------------------------------------------

select is(
  pg_temp.as_user('ffffffff-ffff-4fff-8fff-ffffffffffff',
    'select name from public.tracked_items order by name'),
  '[]'::jsonb,
  'an outsider sees none of another business''s items'
);

select is(
  pg_temp.as_user('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'select name from public.tracked_items order by name'),
  '[{"name": "Beans"}, {"name": "Milk"}]'::jsonb,
  'the owner sees exactly their own items'
);

select throws_ok(
  $$ select pg_temp.as_user('ffffffff-ffff-4fff-8fff-ffffffffffff',
       'select (public.create_tracked_item(
          ''33333333-3333-4333-8333-333333333333'', ''Smuggled'', ''kg'')).id') $$,
  '42501',
  'not_a_member',
  'an outsider cannot add an item to a business they do not belong to'
);

select throws_ok(
  $$ select pg_temp.as_user('ffffffff-ffff-4fff-8fff-ffffffffffff',
       'select (public.update_tracked_item(
          (select id from public.tracked_items where name = ''Beans''),
          ''Renamed'')).id') $$,
  '42501',
  'not_a_member',
  'an outsider cannot edit another business''s item'
);

select throws_ok(
  $$ select pg_temp.as_user(null,
       'select (public.create_tracked_item(
          ''33333333-3333-4333-8333-333333333333'', ''No Session'', ''kg'')).id') $$,
  '42501',
  'auth_required',
  'the create RPC refuses to run without a session'
);

-- Direct writes stay shut, so a mistake in a policy cannot open one on its own.
select throws_ok(
  $$ select pg_temp.exec_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
       'insert into public.tracked_items (business_id, name, unit)
        values (''33333333-3333-4333-8333-333333333333'', ''Direct'', ''kg'')') $$,
  '42501',
  null,
  'even a member cannot insert a tracked item directly'
);

select throws_ok(
  $$ select pg_temp.exec_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
       'update public.tracked_items set name = ''Renamed Directly''') $$,
  '42501',
  null,
  'even a member cannot update a tracked item directly'
);

select throws_ok(
  $$ select pg_temp.exec_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
       'delete from public.tracked_items') $$,
  '42501',
  null,
  'even a member cannot delete a tracked item directly'
);

select results_eq(
  $$ select count(*)::int from public.tracked_items $$,
  $$ values (2) $$,
  'every rejected write above left the table untouched'
);


-- ---------------------------------------------------------------------------
-- Editing
-- ---------------------------------------------------------------------------

select is(
  pg_temp.as_user('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'select (public.update_tracked_item(
       (select id from public.tracked_items where name = ''Beans''),
       null, null, null, null, 910.0000)).latest_unit_cost::text'),
  '[{"latest_unit_cost": "910.0000"}]'::jsonb,
  'recording a new price leaves the other facts alone'
);

select results_eq(
  $$ select name, unit, minimum_order_qty from public.tracked_items
      where latest_unit_cost = 910.0000 $$,
  $$ values ('Beans'::text, 'kg'::text, 8.000::numeric) $$,
  'a null argument means leave it alone, not overwrite it with null'
);

select is(
  pg_temp.as_user('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'select (public.update_tracked_item(
       (select id from public.tracked_items where name = ''Milk''),
       null, null, null, null, null, false)).is_active'),
  '[{"is_active": false}]'::jsonb,
  'an item is retired rather than deleted, so its history stays readable'
);


-- ---------------------------------------------------------------------------
-- Validation
-- ---------------------------------------------------------------------------

select throws_ok(
  $$ select pg_temp.as_user('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
       'select (public.create_tracked_item(
          ''33333333-3333-4333-8333-333333333333'', ''   '', ''kg'')).id') $$,
  '22023', 'invalid_item_name', 'a whitespace-only item name is rejected'
);

select throws_ok(
  $$ select pg_temp.as_user('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
       'select (public.create_tracked_item(
          ''33333333-3333-4333-8333-333333333333'', ''Sugar'', '''')).id') $$,
  '22023', 'invalid_item_unit', 'an empty unit is rejected'
);

select throws_ok(
  $$ select pg_temp.as_user('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
       'select (public.create_tracked_item(
          ''33333333-3333-4333-8333-333333333333'', ''Sugar'', ''kg'', 0)).id') $$,
  '22023', 'invalid_pack_size', 'a pack size of zero is rejected'
);

select throws_ok(
  $$ select pg_temp.as_user('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
       'select (public.create_tracked_item(
          ''33333333-3333-4333-8333-333333333333'', ''Sugar'', ''kg'',
          null, -1)).id') $$,
  '22023', 'invalid_minimum_order_qty', 'a negative minimum order is rejected'
);

select throws_ok(
  $$ select pg_temp.as_user('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
       'select (public.create_tracked_item(
          ''33333333-3333-4333-8333-333333333333'', ''Sugar'', ''kg'',
          null, null, -0.5)).id') $$,
  '22023', 'invalid_unit_cost', 'a negative unit cost is rejected'
);

-- A free unit cost is a real thing -- a franchisor may supply an item at no
-- charge -- so zero is allowed where negative is not.
select is(
  pg_temp.as_user('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'select (public.create_tracked_item(
       ''33333333-3333-4333-8333-333333333333'', ''Stirrers'', ''pc'',
       null, null, 0)).latest_unit_cost::text'),
  '[{"latest_unit_cost": "0.0000"}]'::jsonb,
  'a zero unit cost is allowed, because supplied-free is a real arrangement'
);

-- One item, one row. "Beans" and "beans " are the same thing to an owner
-- counting stock, and splitting them would split the item's history.
select throws_ok(
  $$ select pg_temp.as_user('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
       'select (public.create_tracked_item(
          ''33333333-3333-4333-8333-333333333333'', ''  beans  '', ''kg'')).id') $$,
  '23505',
  null,
  'the same item name cannot be added twice in different casing or spacing'
);

-- The same name in a different business is a different item, though.
select is(
  pg_temp.as_user('ffffffff-ffff-4fff-8fff-ffffffffffff',
    'select (public.create_tracked_item(
       ''44444444-4444-4444-8444-444444444444'', ''Beans'', ''kg'')).name'),
  '[{"name": "Beans"}]'::jsonb,
  'two businesses may each track an item of the same name'
);


select * from finish();

rollback;
