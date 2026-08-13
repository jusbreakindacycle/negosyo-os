-- Business onboarding lifecycle: declare_business_status() behaviour.
--
-- DL-060 item 4 approved an owner-declared graduation while Permits is absent,
-- and DL-063 fixed the legal transition set. The property that matters most
-- here is that this function is the *only* way businesses.status ever changes
-- after creation: `authenticated` holds no UPDATE on public.businesses, so a
-- transition rule that this function enforces cannot be routed around.
--
-- Every refusal below is preceded by a precondition proving the guard was
-- actually reached. DL-026 found two assertions that reported a passing guard
-- while testing nothing, and DL-053 found three more; the pattern that caused
-- them -- resolving a target id inside the session that RLS hides it from -- is
-- avoided here by resolving nothing at all. Every id is a literal, and the
-- fixtures are built as the session role so their visibility is known.
--
-- Run with: npx supabase test db --local

begin;

create extension if not exists pgtap with schema extensions;

set search_path to extensions, public, pg_catalog;

select no_plan();


create function pg_temp.declare_as(
  p_user_id uuid,
  p_business_id uuid,
  p_status public.business_status
)
returns public.business_status
language plpgsql
as $$
declare
  v_status public.business_status;
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

  select (public.declare_business_status(p_business_id, p_status)).status into v_status;

  perform set_config('role', 'none', true);
  return v_status;
end;
$$;

-- How many businesses a given caller can actually see. Used to prove that the
-- outsider below is a real outsider rather than someone the fixtures happened
-- to grant access to.
create function pg_temp.visible_count_as(p_user_id uuid, p_business_id uuid)
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_user_id::text, 'role', 'authenticated')::text,
    true
  );
  perform set_config('role', 'authenticated', true);

  select count(*)::integer into v_count
    from public.businesses
   where id = p_business_id;

  perform set_config('role', 'none', true);
  return v_count;
end;
$$;


insert into auth.users (id, instance_id, aud, role, email)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'lifecycle-owner@example.test'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'lifecycle-outsider@example.test');

-- Built directly rather than through the creation RPC. 03 already covers what
-- that RPC produces; this suite needs known ids in known states, including a
-- closed one that no application path can currently create.
insert into public.businesses (id, name, status, registration_status, created_by)
values
  ('11111111-1111-4111-8111-111111111111', 'Draft Shop', 'draft', 'not_started',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('22222222-2222-4222-8222-222222222222', 'Registering Shop', 'registering', 'in_progress',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('33333333-3333-4333-8333-333333333333', 'Operating Shop', 'operating', 'complete',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('44444444-4444-4444-8444-444444444444', 'Closed Shop', 'closed', 'complete',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('66666666-6666-4666-8666-666666666666', 'Second Draft Shop', 'draft', 'unknown',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

-- Written the way every row that predates this work was written: no
-- registration_status at all. This is the backwards-compatibility guarantee --
-- an existing business keeps its lifecycle and gains a registration position of
-- `unknown`, because nobody ever asked its owner and the product must not
-- answer for them.
insert into public.businesses (id, name, created_by)
values
  ('77777777-7777-4777-8777-777777777777', 'Legacy Shop',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

select is(
  (select registration_status::text from public.businesses
    where id = '77777777-7777-4777-8777-777777777777'),
  'unknown',
  'a row written without a registration status defaults to unknown, not to a claim'
);

select is(
  (select status::text from public.businesses
    where id = '77777777-7777-4777-8777-777777777777'),
  'operating',
  'and its lifecycle default is unchanged by this migration, so legacy rows keep Running mode'
);

insert into public.business_memberships (business_id, user_id, role)
values
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner'),
  ('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner'),
  ('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner'),
  ('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner'),
  ('66666666-6666-4666-8666-666666666666', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner');


-- ---------------------------------------------------------------------------
-- Graduation from draft
-- ---------------------------------------------------------------------------

select is(
  (select status::text from public.businesses
    where id = '11111111-1111-4111-8111-111111111111'),
  'draft',
  'precondition: the business starts in draft'
);

select is(
  pg_temp.declare_as('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111', 'operating')::text,
  'operating',
  'the owner may declare a draft business operating'
);

select is(
  (select status::text from public.businesses
    where id = '11111111-1111-4111-8111-111111111111'),
  'operating',
  'and the stored row really changed, not just the returned copy'
);

-- The audit row is the only place the previous state survives once the update
-- commits, which is why DL-060 named both keys and why previous_status is read
-- from the row inside the function rather than taken from the caller.
select results_eq(
  $$ select action, entity_type, domain::text, actor_user_id::text, metadata
       from public.audit_events
      where business_id = '11111111-1111-4111-8111-111111111111' $$,
  $$ values ('business.status_declared'::text, 'business'::text, 'shared'::text,
             'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::text,
             '{"previous_status": "draft", "next_status": "operating"}'::jsonb) $$,
  'one shared-domain audit event records the declaration and both statuses'
);


-- ---------------------------------------------------------------------------
-- Graduation from registering
-- ---------------------------------------------------------------------------
-- A business that was already part-way through registration graduates by the
-- same route. Registration progress is not consulted: an informal operator who
-- will never file for a mayor's permit still needs to reach Running mode.

select is(
  (select status::text from public.businesses
    where id = '22222222-2222-4222-8222-222222222222'),
  'registering',
  'precondition: the second business starts in registering'
);

select is(
  pg_temp.declare_as('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '22222222-2222-4222-8222-222222222222', 'operating')::text,
  'operating',
  'the owner may declare a registering business operating'
);

select is(
  (select registration_status::text from public.businesses
    where id = '22222222-2222-4222-8222-222222222222'),
  'in_progress',
  'graduating does not touch the registration dimension, which is a separate fact'
);


-- ---------------------------------------------------------------------------
-- A missing session is refused
-- ---------------------------------------------------------------------------
-- Routed through the helper with a null user, so request.jwt.claims is blanked
-- first. A direct call would still see the claims installed by the previous
-- call and would test nothing -- the exact defect DL-026 recorded.

select throws_ok(
  $$ select pg_temp.declare_as(null,
       '66666666-6666-4666-8666-666666666666', 'operating') $$,
  '42501',
  'auth_required',
  'the RPC refuses to run without a session, even though it is SECURITY DEFINER'
);


-- ---------------------------------------------------------------------------
-- A non-member is refused, and the row does not move
-- ---------------------------------------------------------------------------
-- The three preconditions are what make the refusal mean something. Without
-- them, "not_a_member" is equally consistent with the row never having existed.

select is(
  (select count(*)::int from public.businesses
    where id = '33333333-3333-4333-8333-333333333333'),
  1,
  'precondition: the target business exists'
);

select is(
  (select count(*)::int from public.business_memberships
    where business_id = '33333333-3333-4333-8333-333333333333'
      and user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  0,
  'precondition: the outsider holds no membership of it'
);

select is(
  pg_temp.visible_count_as('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '33333333-3333-4333-8333-333333333333'),
  0,
  'precondition: and Row Level Security hides it from them entirely'
);

select throws_ok(
  $$ select pg_temp.declare_as('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
       '33333333-3333-4333-8333-333333333333', 'operating') $$,
  '42501',
  'not_a_member',
  'an outsider cannot declare a status on a business they do not belong to'
);

select is(
  (select status::text from public.businesses
    where id = '33333333-3333-4333-8333-333333333333'),
  'operating',
  'and the target row is untouched by the refused call'
);

-- A business that does not exist is reported identically to one that belongs to
-- somebody else. Distinguishing them would turn this RPC into a way to test
-- whether an id is real.
select throws_ok(
  $$ select pg_temp.declare_as('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
       '99999999-9999-4999-8999-999999999999', 'operating') $$,
  '42501',
  'not_a_member',
  'a business that does not exist is refused with the same error as a foreign one'
);


-- ---------------------------------------------------------------------------
-- Everything outside the two legal transitions is refused
-- ---------------------------------------------------------------------------

-- Un-graduation. There is no product reason to walk a trading business back
-- into Setup mode, and no screen offers it.
select throws_ok(
  $$ select pg_temp.declare_as('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       '33333333-3333-4333-8333-333333333333', 'draft') $$,
  '22023',
  'invalid_status_transition',
  'an operating business cannot be walked back to draft'
);

-- A no-op. Refused rather than accepted, so the audit trail never records a
-- change that did not happen -- a duplicate tap on the graduation control must
-- not produce a second event claiming operating became operating.
select throws_ok(
  $$ select pg_temp.declare_as('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       '33333333-3333-4333-8333-333333333333', 'operating') $$,
  '22023',
  'invalid_status_transition',
  'declaring a status the business already holds is refused'
);

-- Closing has no path in this branch, by decision rather than by omission
-- (DL-063). It arrives with the branch that ships the closing workflow.
select throws_ok(
  $$ select pg_temp.declare_as('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       '66666666-6666-4666-8666-666666666666', 'closed') $$,
  '22023',
  'invalid_status_transition',
  'no business can be closed through this RPC'
);

select throws_ok(
  $$ select pg_temp.declare_as('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       '44444444-4444-4444-8444-444444444444', 'operating') $$,
  '22023',
  'invalid_status_transition',
  'and a closed business cannot be reopened through it either'
);

-- draft -> registering is deliberately absent. Moving a business into the
-- registration phase belongs to Permits, which will have evidence behind it; a
-- control here would change a word on a screen and nothing else.
select throws_ok(
  $$ select pg_temp.declare_as('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       '66666666-6666-4666-8666-666666666666', 'registering') $$,
  '22023',
  'invalid_status_transition',
  'draft cannot be moved to registering, which is Permits'' job and not this one''s'
);


-- ---------------------------------------------------------------------------
-- Refused calls leave nothing behind
-- ---------------------------------------------------------------------------
-- The guards all run before the update, so there is no partial write to clean
-- up. These assert that directly rather than trusting the ordering to stay
-- where it is.

select is(
  (select status::text from public.businesses
    where id = '66666666-6666-4666-8666-666666666666'),
  'draft',
  'the business that was refused three times is still exactly as it was'
);

select is(
  (select count(*)::int from public.audit_events
    where business_id = '66666666-6666-4666-8666-666666666666'),
  0,
  'and no refused call wrote an audit event'
);

select is(
  (select count(*)::int from public.audit_events
    where business_id = '33333333-3333-4333-8333-333333333333'),
  0,
  'nor did the refusals against the operating business'
);

select is(
  (select count(*)::int from public.audit_events
    where action = 'business.status_declared'),
  2,
  'exactly the two successful declarations are recorded, and nothing else'
);


-- ---------------------------------------------------------------------------
-- The write path did not widen access
-- ---------------------------------------------------------------------------
-- DL-060 forbids a general UPDATE grant on public.businesses, and this is the
-- assertion that would catch one arriving as a shortcut. It duplicates a check
-- in 01_schema deliberately: the temptation to add the grant appears while
-- working on this function, not while working on the schema file.

select table_privs_are('public', 'businesses', 'authenticated',
  array['SELECT'],
  'authenticated still may only read businesses -- the status write path is this RPC and nothing else');

select table_privs_are('public', 'businesses', 'anon', array[]::text[],
  'anon still holds no privilege on businesses');


select * from finish();

rollback;
