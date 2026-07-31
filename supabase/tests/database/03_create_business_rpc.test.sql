-- Milestone 1, slice 4: create_business_with_owner() behaviour.
--
-- The property that matters most here is atomicity. A business row that exists
-- without its owner membership would be permanently unreachable, including by
-- the person who created it, so the two writes must never come apart.
--
-- Run with: npx supabase test db --local

begin;

create extension if not exists pgtap with schema extensions;

set search_path to extensions, public, pg_catalog;

select no_plan();


create function pg_temp.call_rpc_as(p_user_id uuid, p_name text)
returns uuid
language plpgsql
as $$
declare
  v_id uuid;
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

  select (public.create_business_with_owner(p_name)).id into v_id;

  perform set_config('role', 'none', true);
  return v_id;
end;
$$;


insert into auth.users (id, instance_id, aud, role, email)
values
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'rpc-owner@example.test'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'rpc-other@example.test');


-- ---------------------------------------------------------------------------
-- The happy path writes three linked rows
-- ---------------------------------------------------------------------------

select lives_ok(
  $$ select pg_temp.call_rpc_as('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Duo Brew') $$,
  'an authenticated user can create their first business'
);

select results_eq(
  $$ select name, created_by::text from public.businesses order by created_at $$,
  $$ values ('Duo Brew'::text, 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::text) $$,
  'the business is stored with the caller recorded as its creator'
);

select results_eq(
  $$ select m.role::text, m.user_id::text
       from public.business_memberships m
       join public.businesses b on b.id = m.business_id
      where b.name = 'Duo Brew' $$,
  $$ values ('owner'::text, 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::text) $$,
  'the creator receives exactly one owner membership'
);

select results_eq(
  $$ select e.action, e.entity_type, e.domain::text, e.actor_user_id::text
       from public.audit_events e
       join public.businesses b on b.id = e.business_id
      where b.name = 'Duo Brew' $$,
  $$ values ('business.created'::text, 'business'::text, 'shared'::text,
             'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::text) $$,
  'one shared-domain audit event records who created the business'
);

select results_eq(
  $$ select e.entity_id = b.id
       from public.audit_events e
       join public.businesses b on b.id = e.business_id
      where b.name = 'Duo Brew' $$,
  $$ values (true) $$,
  'the audit event points at the business it describes'
);

select is(
  (select metadata from public.audit_events
     join public.businesses b on b.id = audit_events.business_id
    where b.name = 'Duo Brew'),
  '{}'::jsonb,
  'the audit event carries no personal data'
);


-- ---------------------------------------------------------------------------
-- A second business is allowed
-- ---------------------------------------------------------------------------
-- Milestone 1 lists and switches between businesses, so there is no
-- one-business cap hiding in the RPC.

select lives_ok(
  $$ select pg_temp.call_rpc_as('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Second Shop') $$,
  'the same owner may create a second business'
);

select results_eq(
  $$ select count(*)::int from public.business_memberships
      where user_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' $$,
  $$ values (2) $$,
  'each business gets its own owner membership'
);


-- ---------------------------------------------------------------------------
-- Rejections
-- ---------------------------------------------------------------------------

select throws_ok(
  $$ select public.create_business_with_owner('No Session Here') $$,
  '42501',
  'auth_required',
  'the RPC refuses to run without a session, even though it is SECURITY DEFINER'
);

select throws_ok(
  $$ select pg_temp.call_rpc_as('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '') $$,
  '22023', 'invalid_business_name', 'an empty business name is rejected'
);

select throws_ok(
  $$ select pg_temp.call_rpc_as('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '   ') $$,
  '22023', 'invalid_business_name', 'a whitespace-only business name is rejected'
);

select throws_ok(
  $$ select pg_temp.call_rpc_as('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'A') $$,
  '22023', 'invalid_business_name', 'a one-character business name is rejected'
);

select throws_ok(
  $$ select pg_temp.call_rpc_as('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
       repeat('x', 161)) $$,
  '22023', 'invalid_business_name', 'an over-long business name is rejected'
);

select throws_ok(
  $$ select pg_temp.call_rpc_as('cccccccc-cccc-4ccc-8ccc-cccccccccccc', null) $$,
  '22023', 'invalid_business_name', 'a null business name is rejected'
);


-- ---------------------------------------------------------------------------
-- Atomicity: a rejected call leaves nothing behind
-- ---------------------------------------------------------------------------

select results_eq(
  $$ select count(*)::int from public.businesses $$,
  $$ values (2) $$,
  'the rejected calls above created no business rows'
);

select results_eq(
  $$ select count(*)::int from public.business_memberships $$,
  $$ values (2) $$,
  'the rejected calls above created no membership rows'
);

select results_eq(
  $$ select count(*)::int from public.audit_events $$,
  $$ values (2) $$,
  'the rejected calls above created no audit events'
);


-- ---------------------------------------------------------------------------
-- Identity comes from auth.uid() and nowhere else
-- ---------------------------------------------------------------------------

select lives_ok(
  $$ select pg_temp.call_rpc_as('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Other Owner Shop') $$,
  'a second user can create their own business'
);

select results_eq(
  $$ select b.created_by::text
       from public.businesses b where b.name = 'Other Owner Shop' $$,
  $$ values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd'::text) $$,
  'the business belongs to the caller, not to whoever called previously'
);

select is(
  (select count(*)::int from public.business_memberships
    where user_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  2,
  'creating a business for one user grants no membership to another'
);

-- The RPC takes only a name. There is no user-id parameter to impersonate
-- through, which is the reason the signature is what it is.
select is(
  (select count(*)::int from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'create_business_with_owner'
      and p.pronargs = 1),
  1,
  'the RPC accepts a business name and nothing else'
);


select * from finish();

rollback;
