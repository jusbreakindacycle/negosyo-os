-- Milestone 1, slice 4: two users, two businesses, no leakage.
--
-- This file proves the milestone exit condition: an owner can reach their own
-- business and cannot reach anyone else's -- enforced by Postgres, not by a
-- WHERE clause in application code.
--
-- Run with: npx supabase test db --local

begin;

create extension if not exists pgtap with schema extensions;

set search_path to extensions, public, pg_catalog;

select no_plan();


-- ---------------------------------------------------------------------------
-- Role-switching helpers
-- ---------------------------------------------------------------------------
-- Each helper switches role internally and switches back, so every pgTAP
-- assertion runs as postgres. Running pgTAP's own bookkeeping under a
-- restricted role is what makes RLS test suites fail for reasons unrelated to
-- the policies being tested.
--
-- auth.uid() reads request.jwt.claims->>'sub', which is what these set.

create function pg_temp.query_as(p_role text, p_user_id uuid, p_sql text)
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
      else json_build_object('sub', p_user_id::text, 'role', p_role)::text
    end,
    true
  );
  perform set_config('role', p_role, true);

  execute format(
    'select coalesce(jsonb_agg(t.*), ''[]''::jsonb) from (%s) as t', p_sql
  ) into v_result;

  -- 'none' is the reset value for the role GUC, and resetting is always
  -- permitted regardless of the role currently in effect.
  perform set_config('role', 'none', true);
  return v_result;
end;
$$;

create function pg_temp.exec_as(p_role text, p_user_id uuid, p_sql text)
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
      else json_build_object('sub', p_user_id::text, 'role', p_role)::text
    end,
    true
  );
  perform set_config('role', p_role, true);

  execute p_sql;
  get diagnostics v_rows = row_count;

  perform set_config('role', 'none', true);
  return v_rows;
end;
$$;


-- ---------------------------------------------------------------------------
-- Fixtures, created as postgres so RLS is bypassed on the way in
-- ---------------------------------------------------------------------------
-- Inserted directly rather than through the RPC: this file tests the policies
-- in isolation. 03_create_business_rpc.test.sql covers the RPC.

insert into auth.users (id, instance_id, aud, role, email)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'owner-a@example.test'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'owner-b@example.test');

insert into public.businesses (id, name, created_by)
values
  ('11111111-1111-4111-8111-111111111111', 'Business One',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('22222222-2222-4222-8222-222222222222', 'Business Two',
   'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

insert into public.business_memberships (business_id, user_id, role)
values
  ('11111111-1111-4111-8111-111111111111',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner'),
  ('22222222-2222-4222-8222-222222222222',
   'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'owner');

insert into public.audit_events
  (business_id, actor_user_id, domain, action, entity_type, entity_id)
values
  ('11111111-1111-4111-8111-111111111111',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'shared', 'business.created',
   'business', '11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222',
   'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'shared', 'business.created',
   'business', '22222222-2222-4222-8222-222222222222');


-- ---------------------------------------------------------------------------
-- Reads: each owner sees their own business and nothing else
-- ---------------------------------------------------------------------------

select is(
  pg_temp.query_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'select name from public.businesses order by name'),
  '[{"name": "Business One"}]'::jsonb,
  'owner A sees exactly one business, their own'
);

select is(
  pg_temp.query_as('authenticated', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'select name from public.businesses order by name'),
  '[{"name": "Business Two"}]'::jsonb,
  'owner B sees exactly one business, their own'
);

select is(
  pg_temp.query_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'select name from public.businesses
      where id = ''22222222-2222-4222-8222-222222222222'''),
  '[]'::jsonb,
  'owner A asking for business two by id gets nothing back, not an error'
);

select is(
  pg_temp.query_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'select role::text, business_id::text from public.business_memberships'),
  '[{"role": "owner", "business_id": "11111111-1111-4111-8111-111111111111"}]'::jsonb,
  'owner A sees exactly one membership, as owner of business one'
);

select is(
  pg_temp.query_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'select id::text from public.business_memberships
      where user_id = ''bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'''),
  '[]'::jsonb,
  'owner A cannot see owner B''s membership row'
);

select is(
  pg_temp.query_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'select action, business_id::text from public.audit_events order by id'),
  '[{"action": "business.created", "business_id": "11111111-1111-4111-8111-111111111111"}]'::jsonb,
  'owner A sees only their own business''s audit history'
);

select is(
  pg_temp.query_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'select id::text from public.audit_events
      where business_id = ''22222222-2222-4222-8222-222222222222'''),
  '[]'::jsonb,
  'owner A cannot read owner B''s audit events'
);


-- ---------------------------------------------------------------------------
-- Writes: authenticated holds no INSERT anywhere
-- ---------------------------------------------------------------------------
-- These fail on the grant, before any policy is consulted. That is the point:
-- a mistake in a policy cannot open a write path on its own.

select throws_ok(
  $$ select pg_temp.exec_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       'insert into public.businesses (name) values (''Smuggled Business'')') $$,
  '42501',
  null,
  'owner A cannot insert a business directly'
);

select throws_ok(
  $$ select pg_temp.exec_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       'insert into public.business_memberships (business_id, user_id, role)
        values (''22222222-2222-4222-8222-222222222222'',
                ''aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'', ''owner'')') $$,
  '42501',
  null,
  'owner A cannot grant themselves membership of business two'
);

select throws_ok(
  $$ select pg_temp.exec_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       'insert into public.audit_events
          (business_id, domain, action, entity_type)
        values (''11111111-1111-4111-8111-111111111111'', ''shared'',
                ''forged.event'', ''business'')') $$,
  '42501',
  null,
  'owner A cannot forge an audit event, even for their own business'
);

select throws_ok(
  $$ select pg_temp.exec_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       'update public.businesses set name = ''Taken Over''
         where id = ''22222222-2222-4222-8222-222222222222''') $$,
  '42501',
  null,
  'owner A cannot rename owner B''s business'
);

select throws_ok(
  $$ select pg_temp.exec_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       'delete from public.businesses
         where id = ''22222222-2222-4222-8222-222222222222''') $$,
  '42501',
  null,
  'owner A cannot delete owner B''s business'
);

select throws_ok(
  $$ select pg_temp.exec_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       'update public.audit_events set action = ''rewritten''') $$,
  '42501',
  null,
  'the audit trail cannot be rewritten'
);

select throws_ok(
  $$ select pg_temp.exec_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       'delete from public.audit_events') $$,
  '42501',
  null,
  'the audit trail cannot be deleted'
);


-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

select is(
  pg_temp.query_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'select id::text from public.profiles order by id'),
  '[{"id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}]'::jsonb,
  'owner A sees only their own profile'
);

select is(
  pg_temp.exec_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'update public.profiles set display_name = ''Ana'''),
  1::bigint,
  'owner A can set their own display name'
);

-- The UPDATE grant exists here, so this is the policy doing the work: the row
-- is simply not visible to the statement.
select is(
  pg_temp.exec_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'update public.profiles set display_name = ''Renamed''
      where id = ''bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'''),
  0::bigint,
  'owner A updating owner B''s profile changes nothing'
);

select is(
  (select display_name from public.profiles
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  null,
  'owner B''s display name is genuinely untouched'
);

-- Without WITH CHECK on the update policy this would succeed and hand owner A
-- control of owner B's profile row.
select throws_ok(
  $$ select pg_temp.exec_as('authenticated', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       'update public.profiles
           set id = ''bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb''
         where id = ''aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa''') $$,
  '42501',
  null,
  'owner A cannot reassign their own profile id to owner B'
);


-- ---------------------------------------------------------------------------
-- Signed-out visitors
-- ---------------------------------------------------------------------------
-- anon holds no grant at all, so every one of these fails before RLS is even
-- reached.

select throws_ok(
  $$ select pg_temp.query_as('anon', null, 'select id from public.profiles') $$,
  '42501', null, 'anon cannot read profiles'
);
select throws_ok(
  $$ select pg_temp.query_as('anon', null, 'select id from public.businesses') $$,
  '42501', null, 'anon cannot read businesses'
);
select throws_ok(
  $$ select pg_temp.query_as('anon', null, 'select id from public.business_memberships') $$,
  '42501', null, 'anon cannot read business_memberships'
);
select throws_ok(
  $$ select pg_temp.query_as('anon', null, 'select id from public.audit_events') $$,
  '42501', null, 'anon cannot read audit_events'
);


-- ---------------------------------------------------------------------------
-- Uniqueness
-- ---------------------------------------------------------------------------

select throws_ok(
  $$ insert into public.business_memberships (business_id, user_id, role)
     values ('11111111-1111-4111-8111-111111111111',
             'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner') $$,
  '23505',
  null,
  'a user cannot hold two membership rows for the same business'
);


select * from finish();

rollback;
