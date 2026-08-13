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

-- Routed through the helper with a null user rather than called directly.
--
-- set_config(..., true) is local to the *transaction*, not to the statement,
-- so the claims installed by the last call_rpc_as() above outlive it. A direct
-- call here would still see that session, auth.uid() would return the previous
-- user, and the RPC would cheerfully create a business -- so the assertion
-- would report a passing guard while testing nothing. Passing null makes the
-- helper blank request.jwt.claims first, which is what "no session" means.
select throws_ok(
  $$ select pg_temp.call_rpc_as(null, 'No Session Here') $$,
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

-- This assertion used to read `pronargs = 1`, on the reasoning that a
-- one-argument function has no user id to impersonate through. The signature
-- grew in 20260813141500, so the count is no longer the property worth
-- asserting -- but the property it was protecting is. Stated directly: no
-- argument of this function is a user identity, whatever it is called.
select is(
  (select count(*)::int
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     cross join lateral unnest(p.proargtypes::oid[]) as t(oid)
    where n.nspname = 'public'
      and p.proname = 'create_business_with_owner'
      and t.oid = 'uuid'::regtype),
  0,
  'the RPC takes no uuid argument, so a caller cannot create a business as someone else'
);


-- ---------------------------------------------------------------------------
-- Lifecycle initialisation (DL-063)
-- ---------------------------------------------------------------------------
-- Before this, the RPC never set `status`, so every business took the column
-- default `operating` -- a state nobody chose and nobody was asked about. The
-- mapping now lives inside the function, and these assertions are what hold it
-- there.

-- Backwards compatibility first. The one-argument call is what suites 03 and 06
-- have always used, and it is what any caller written before the signature grew
-- would send. It must still resolve, and it must land in Setup mode rather than
-- claiming the business is trading.
select is(
  (select status::text from public.businesses where name = 'Duo Brew'),
  'draft',
  'a caller that says nothing gets draft, never operating'
);
select is(
  (select registration_status::text from public.businesses where name = 'Duo Brew'),
  'unknown',
  'and its registration position is recorded as unknown rather than assumed'
);
select is(
  (select legal_name from public.businesses where name = 'Duo Brew'),
  null,
  'no legal name is invented for a business that supplied none'
);


create function pg_temp.create_as(
  p_user_id uuid,
  p_name text,
  p_is_operating boolean,
  p_registration_status public.business_registration_status,
  p_legal_name text default null
)
returns public.businesses
language plpgsql
as $$
declare
  v_business public.businesses;
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_user_id::text, 'role', 'authenticated')::text,
    true
  );
  perform set_config('role', 'authenticated', true);

  v_business := public.create_business_with_owner(
    p_name, p_is_operating, p_registration_status, p_legal_name
  );

  perform set_config('role', 'none', true);
  return v_business;
end;
$$;


-- The four owner-facing entry cases, asserted as the four rows of the DL-063
-- mapping. The two `operating` rows are the ones that matter most: a business
-- that is trading is operating whatever its registration says, which is what
-- keeps "no permit does not mean not operating" true in the data and not only
-- in the prose.
select is(
  (pg_temp.create_as('dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    'Pre Opening Shop', false, 'not_started')).status::text,
  'draft',
  'not open and registration not started becomes draft'
);
select is(
  (pg_temp.create_as('dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    'Registering Shop', false, 'in_progress')).status::text,
  'registering',
  'not open but registration under way becomes registering'
);
select is(
  (pg_temp.create_as('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'Informal Shop', true, 'not_started')).status::text,
  'operating',
  'trading without registration is still operating -- no permit does not mean not operating'
);

-- A fresh owner for the fourth row: the two above have consumed enough of the
-- three-business ceiling that reusing them would test the ceiling by accident.
insert into auth.users (id, instance_id, aud, role, email)
values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'rpc-lifecycle@example.test');

select is(
  (pg_temp.create_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'Registered Shop', true, 'complete', 'Registered Shop Trading OPC')).status::text,
  'operating',
  'trading and registered becomes operating'
);
select is(
  (select legal_name from public.businesses where name = 'Registered Shop'),
  'Registered Shop Trading OPC',
  'the registered name is stored when the owner supplies one'
);

-- `complete` while not open still means the business is not trading. The
-- registration dimension never promotes a business into Running mode; only the
-- owner's operating declaration does.
select is(
  (pg_temp.create_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'Registered Not Open', false, 'complete')).status::text,
  'registering',
  'fully registered but not yet open is registering, not operating'
);

-- Declining the follow-up question is a normal answer, and it must not be read
-- as either progress or its absence.
select is(
  (pg_temp.create_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'Declined Question', false, 'unknown')).status::text,
  'draft',
  'declining the registration question leaves the business in draft'
);

-- `closed` cannot be produced by any input, because there is no status
-- parameter to supply it through. This is the construction that replaced the
-- earlier design's invalid_initial_status guard; asserting it here is what
-- stops a later signature change from quietly reintroducing the hole.
select is(
  (select count(*)::int from public.businesses where status = 'closed'),
  0,
  'no combination of inputs creates a closed business'
);

select throws_ok(
  $$ select pg_temp.create_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
       'Bad Legal Name', true, 'complete', 'x') $$,
  '22023',
  'invalid_legal_name',
  'a too-short registered name is rejected by name rather than by constraint violation'
);

select throws_ok(
  $$ select pg_temp.create_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
       'Blank Legal Name', true, 'complete', '   ') $$,
  '22023',
  'invalid_legal_name',
  'a whitespace-only registered name is rejected rather than stored as spaces'
);


select * from finish();

rollback;
