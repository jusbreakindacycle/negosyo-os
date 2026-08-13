-- Phase gate B, application item 6: the three-business abuse ceiling.
--
-- DL-055 item 6 requires "at most three businesses whose status is not
-- `closed` per authenticated owner", enforced server-side. This suite proves
-- the allowed case and the blocked case, and -- per the standing rule in
-- DL-026 -- proves the blocked case is blocked *for the intended reason*
-- rather than because creation broke in general.
--
-- Run with: npx supabase test db --local

begin;

create extension if not exists pgtap with schema extensions;

set search_path to extensions, public, pg_catalog;

select no_plan();


-- Same shape as the helper in 03_create_business_rpc.test.sql. It is repeated
-- rather than shared because pg_temp is session-scoped and each suite file
-- runs in its own session; there is no import mechanism that would not
-- introduce load-order coupling between suites.
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

-- Counts an owner's ceiling the way the function counts it. Used for the
-- preconditions, so a precondition that disagrees with the implementation
-- shows up as a failing assertion rather than as a silently skipped guard.
create function pg_temp.active_owned(p_user_id uuid)
returns integer
language sql
stable
as $$
  select count(*)::integer
    from public.business_memberships m
    join public.businesses b on b.id = m.business_id
   where m.user_id = p_user_id
     and m.role = 'owner'
     and b.status <> 'closed';
$$;


insert into auth.users (id, instance_id, aud, role, email)
values
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'ceiling-owner@example.test'),
  ('ffffffff-ffff-4fff-8fff-ffffffffffff',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'ceiling-other@example.test'),
  ('99999999-9999-4999-8999-999999999999',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'ceiling-member@example.test');


-- ---------------------------------------------------------------------------
-- Three are allowed
-- ---------------------------------------------------------------------------
-- The ceiling is three, so all three of these must succeed. A cap that fired
-- early would be a defect in the other direction, and it would be invisible if
-- this suite only ever asserted the refusal.

select lives_ok(
  $$ select pg_temp.call_rpc_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'First Shop') $$,
  'an owner may create a first business'
);

select lives_ok(
  $$ select pg_temp.call_rpc_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Second Shop') $$,
  'an owner may create a second business'
);

select lives_ok(
  $$ select pg_temp.call_rpc_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Third Shop') $$,
  'an owner may create a third business'
);


-- ---------------------------------------------------------------------------
-- The fourth is refused
-- ---------------------------------------------------------------------------

-- Precondition. Without it, the refusal below is equally consistent with the
-- three calls above having silently failed to record anything -- which is the
-- failure mode DL-026 found twice and DL-053 found three more times.
select is(
  pg_temp.active_owned('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
  3,
  'precondition: the owner really does hold three businesses that are not closed'
);

select throws_ok(
  $$ select pg_temp.call_rpc_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Fourth Shop') $$,
  '53400',
  'business_limit_reached',
  'a fourth business is refused once three are open'
);


-- ---------------------------------------------------------------------------
-- The refusal leaves nothing behind
-- ---------------------------------------------------------------------------
-- The guard runs before every insert, so there is no partial write to clean
-- up. These assert that directly rather than trusting the ordering to stay
-- where it is.

select is(
  (select count(*)::int from public.businesses where name = 'Fourth Shop'),
  0,
  'the refused call created no business row'
);

select is(
  (select count(*)::int from public.business_memberships
    where user_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
  3,
  'the refused call created no membership row'
);

select is(
  (select count(*)::int from public.audit_events
    where actor_user_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
  3,
  'the refused call wrote no audit event'
);


-- ---------------------------------------------------------------------------
-- The ceiling did not swallow the checks that come before it
-- ---------------------------------------------------------------------------
-- Both of these callers are at the ceiling. If either returned
-- business_limit_reached, the argument and session checks would have been
-- reordered behind it, and a caller sending nonsense would be told the wrong
-- thing about why they were refused.

select throws_ok(
  $$ select pg_temp.call_rpc_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'A') $$,
  '22023',
  'invalid_business_name',
  'at the ceiling, a bad name is still reported as a bad name'
);

select throws_ok(
  $$ select pg_temp.call_rpc_as(null, 'No Session Here') $$,
  '42501',
  'auth_required',
  'the missing-session guard still fires first'
);


-- ---------------------------------------------------------------------------
-- The ceiling is per owner, not global
-- ---------------------------------------------------------------------------
-- This is what distinguishes "the guard counted this owner's businesses" from
-- "creation is broken for everybody". Without it the refusal above proves
-- nothing about the predicate.

select lives_ok(
  $$ select pg_temp.call_rpc_as('ffffffff-ffff-4fff-8fff-ffffffffffff', 'Other Owner Shop') $$,
  'a different owner is unaffected by the first owner reaching the ceiling'
);

select is(
  pg_temp.active_owned('ffffffff-ffff-4fff-8fff-ffffffffffff'),
  1,
  'the second owner holds only their own business'
);

select is(
  pg_temp.active_owned('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
  3,
  'and creating it consumed nothing from the first owner'
);


-- ---------------------------------------------------------------------------
-- Closing a business frees the slot
-- ---------------------------------------------------------------------------
-- `closed` is excluded from the count so that three is a ceiling on concurrent
-- use rather than a lifetime quota. Run as the session role, because no
-- application path may update businesses.status -- there is no UPDATE grant to
-- `authenticated` and no RPC that sets it. That absence is the subject of its
-- own open decision and is deliberately not changed here.

update public.businesses
   set status = 'closed'
 where name = 'First Shop';

select is(
  pg_temp.active_owned('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
  2,
  'a closed business no longer counts toward the ceiling'
);

select lives_ok(
  $$ select pg_temp.call_rpc_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Replacement Shop') $$,
  'closing a business lets the owner create another one'
);

select is(
  (select count(*)::int from public.businesses
    where created_by = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
  4,
  'the closed business still exists; its history was not deleted to make room'
);

select throws_ok(
  $$ select pg_temp.call_rpc_as('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Fifth Shop') $$,
  '53400',
  'business_limit_reached',
  'and the ceiling applies again at three open businesses'
);


-- ---------------------------------------------------------------------------
-- The count follows membership, not created_by
-- ---------------------------------------------------------------------------
-- created_by is documented as a historical fact rather than an access grant,
-- and it is nulled when an account is deleted. Counting it would raise the
-- ceiling for anyone whose creator row was cleared. These three businesses
-- have created_by null and were never touched by this user's RPC calls; only
-- the owner memberships connect them.

insert into public.businesses (id, name, created_by)
values
  ('11111111-1111-4111-8111-111111111111', 'Inherited One', null),
  ('22222222-2222-4222-8222-222222222222', 'Inherited Two', null),
  ('33333333-3333-4333-8333-333333333333', 'Inherited Three', null);

insert into public.business_memberships (business_id, user_id, role)
values
  ('11111111-1111-4111-8111-111111111111',
   '99999999-9999-4999-8999-999999999999', 'owner'),
  ('22222222-2222-4222-8222-222222222222',
   '99999999-9999-4999-8999-999999999999', 'owner'),
  ('33333333-3333-4333-8333-333333333333',
   '99999999-9999-4999-8999-999999999999', 'owner');

select is(
  (select count(*)::int from public.businesses
    where created_by = '99999999-9999-4999-8999-999999999999'),
  0,
  'precondition: this owner created none of their three businesses'
);

select is(
  pg_temp.active_owned('99999999-9999-4999-8999-999999999999'),
  3,
  'precondition: they hold three owner memberships all the same'
);

select throws_ok(
  $$ select pg_temp.call_rpc_as('99999999-9999-4999-8999-999999999999', 'Fourth By Membership') $$,
  '53400',
  'business_limit_reached',
  'businesses reached through membership alone still consume the ceiling'
);

-- Not asserted here, because it cannot be: public.business_role is an enum of
-- exactly one value, so there is no non-owner membership to create and no way
-- to show that one does not consume the ceiling. The `role = 'owner'`
-- predicate in the function is written for the milestone that adds staff,
-- representative, and viewer. Whoever adds the first of those roles owns
-- adding that assertion here.


select * from finish();

rollback;
