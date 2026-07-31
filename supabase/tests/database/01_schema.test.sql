-- Milestone 1, slice 4: schema, grant, and RLS-enablement assertions.
--
-- Run with: npx supabase test db --local
--
-- pgtap is created inside the test transaction and rolled back with it, so the
-- extension never lands in a migration or in the deployed database.

begin;

create extension if not exists pgtap with schema extensions;

set search_path to extensions, public, pg_catalog;

-- no_plan() rather than plan(n): the count of assertions below changes
-- whenever a column is added, and a stale number fails the suite for a reason
-- that has nothing to do with the schema.
select no_plan();


-- ---------------------------------------------------------------------------
-- Tables exist
-- ---------------------------------------------------------------------------

select has_schema('private', 'the private helper schema exists');

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'businesses', 'businesses exists');
select has_table('public', 'business_memberships', 'business_memberships exists');
select has_table('public', 'audit_events', 'audit_events exists');


-- ---------------------------------------------------------------------------
-- Columns and types
-- ---------------------------------------------------------------------------

select columns_are(
  'public', 'profiles',
  array['id', 'display_name', 'created_at', 'updated_at'],
  'profiles has exactly the expected columns'
);
select col_type_is('public', 'profiles', 'id', 'uuid');
select col_type_is('public', 'profiles', 'display_name', 'text');
select col_type_is('public', 'profiles', 'created_at', 'timestamp with time zone');
select col_type_is('public', 'profiles', 'updated_at', 'timestamp with time zone');
select col_not_null('public', 'profiles', 'created_at');
select col_not_null('public', 'profiles', 'updated_at');
select col_is_null('public', 'profiles', 'display_name');

select columns_are(
  'public', 'businesses',
  array['id', 'name', 'created_by', 'created_at', 'updated_at'],
  'businesses has exactly the expected columns'
);
select col_type_is('public', 'businesses', 'id', 'uuid');
select col_type_is('public', 'businesses', 'name', 'text');
select col_type_is('public', 'businesses', 'created_by', 'uuid');
select col_not_null('public', 'businesses', 'name');
select col_is_null('public', 'businesses', 'created_by');
select col_has_default('public', 'businesses', 'id');

select columns_are(
  'public', 'business_memberships',
  array['id', 'business_id', 'user_id', 'role', 'created_at', 'updated_at'],
  'business_memberships has exactly the expected columns'
);
select col_not_null('public', 'business_memberships', 'business_id');
select col_not_null('public', 'business_memberships', 'user_id');
select col_not_null('public', 'business_memberships', 'role');

select columns_are(
  'public', 'audit_events',
  array[
    'id', 'business_id', 'actor_user_id', 'domain', 'action',
    'entity_type', 'entity_id', 'metadata', 'occurred_at'
  ],
  'audit_events has exactly the expected columns'
);
select col_type_is('public', 'audit_events', 'id', 'bigint');
select col_type_is('public', 'audit_events', 'metadata', 'jsonb');
select col_not_null('public', 'audit_events', 'action');
select col_not_null('public', 'audit_events', 'entity_type');
select col_not_null('public', 'audit_events', 'metadata');
-- Nullable so a future account-level event has somewhere to live; a null here
-- is invisible to the select policy, which is the safe default.
select col_is_null('public', 'audit_events', 'business_id');

-- audit_events is append-only, so it carries no updated_at to maintain.
select hasnt_column('public', 'audit_events', 'updated_at',
  'audit_events is append-only and has no updated_at');


-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

select has_type('public', 'business_role', 'business_role type exists');
select enum_has_labels('public', 'business_role', array['owner'],
  'business_role carries only owner in this milestone');

select has_type('public', 'audit_domain', 'audit_domain type exists');
select enum_has_labels('public', 'audit_domain',
  array['shared', 'start_comply', 'operate_decide'],
  'audit_domain keeps the two bounded domains separate from shared');


-- ---------------------------------------------------------------------------
-- Keys, foreign keys, uniqueness
-- ---------------------------------------------------------------------------

select col_is_pk('public', 'profiles', 'id');
select col_is_pk('public', 'businesses', 'id');
select col_is_pk('public', 'business_memberships', 'id');
select col_is_pk('public', 'audit_events', 'id');

select fk_ok('public', 'profiles', 'id', 'auth', 'users', 'id');
select fk_ok('public', 'businesses', 'created_by', 'public', 'profiles', 'id');
select fk_ok('public', 'business_memberships', 'business_id', 'public', 'businesses', 'id');
select fk_ok('public', 'business_memberships', 'user_id', 'public', 'profiles', 'id');
select fk_ok('public', 'audit_events', 'business_id', 'public', 'businesses', 'id');
select fk_ok('public', 'audit_events', 'actor_user_id', 'public', 'profiles', 'id');

select col_is_unique(
  'public', 'business_memberships', array['business_id', 'user_id'],
  'one membership row per person per business'
);


-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

select has_index('public', 'businesses', 'businesses_created_by_idx');
select has_index('public', 'business_memberships', 'business_memberships_user_id_business_id_idx');
select has_index('public', 'business_memberships', 'business_memberships_business_id_user_id_key');
select has_index('public', 'audit_events', 'audit_events_business_id_occurred_at_idx');


-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

select has_trigger('public', 'profiles', 'profiles_set_updated_at');
select has_trigger('public', 'businesses', 'businesses_set_updated_at');
select has_trigger('public', 'business_memberships', 'business_memberships_set_updated_at');
select has_trigger('auth', 'users', 'on_auth_user_created');


-- ---------------------------------------------------------------------------
-- Row Level Security is enabled everywhere
-- ---------------------------------------------------------------------------

select ok(
  (select c.relrowsecurity
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'profiles'),
  'RLS is enabled on profiles'
);
select ok(
  (select c.relrowsecurity
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'businesses'),
  'RLS is enabled on businesses'
);
select ok(
  (select c.relrowsecurity
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'business_memberships'),
  'RLS is enabled on business_memberships'
);
select ok(
  (select c.relrowsecurity
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'audit_events'),
  'RLS is enabled on audit_events'
);

-- Catalogue-wide guard. This fails on its own the first time a future
-- migration adds a public table and forgets RLS, without anybody having to
-- remember to extend this file.
select is_empty(
  $$
    select c.relname
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relkind = 'r'
       and not c.relrowsecurity
  $$,
  'no table in the public schema has RLS disabled'
);


-- ---------------------------------------------------------------------------
-- Policies are exactly the ones intended
-- ---------------------------------------------------------------------------

select policies_are(
  'public', 'profiles',
  array['profiles_select_own', 'profiles_update_own'],
  'profiles has only own-row select and update policies'
);
select policies_are(
  'public', 'businesses',
  array['businesses_select_member'],
  'businesses has a single member-only select policy and no write policy'
);
select policies_are(
  'public', 'business_memberships',
  array['business_memberships_select_own'],
  'business_memberships has a single own-row select policy and no write policy'
);
select policies_are(
  'public', 'audit_events',
  array['audit_events_select_business_member'],
  'audit_events is readable by members and writable by nobody'
);


-- ---------------------------------------------------------------------------
-- Grants: the outer lock
-- ---------------------------------------------------------------------------
-- anon gets nothing at all, and authenticated gets no INSERT anywhere. Every
-- write goes through create_business_with_owner(), so grants and policies fail
-- independently of each other.

select table_privs_are('public', 'profiles', 'anon', array[]::text[],
  'anon has no privilege on profiles');
select table_privs_are('public', 'businesses', 'anon', array[]::text[],
  'anon has no privilege on businesses');
select table_privs_are('public', 'business_memberships', 'anon', array[]::text[],
  'anon has no privilege on business_memberships');
select table_privs_are('public', 'audit_events', 'anon', array[]::text[],
  'anon has no privilege on audit_events');

select table_privs_are('public', 'profiles', 'authenticated',
  array['SELECT', 'UPDATE'],
  'authenticated may read and update profiles but not insert or delete');
select table_privs_are('public', 'businesses', 'authenticated',
  array['SELECT'],
  'authenticated may only read businesses');
select table_privs_are('public', 'business_memberships', 'authenticated',
  array['SELECT'],
  'authenticated may only read business_memberships');
select table_privs_are('public', 'audit_events', 'authenticated',
  array['SELECT'],
  'authenticated may only read audit_events');


-- ---------------------------------------------------------------------------
-- Function exposure
-- ---------------------------------------------------------------------------

select has_function('public', 'create_business_with_owner', array['text'],
  'the business creation RPC exists');
select is(
  (select prosecdef from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'create_business_with_owner'),
  true,
  'create_business_with_owner is SECURITY DEFINER'
);
select is(
  (select proconfig from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'create_business_with_owner'),
  array['search_path='],
  'create_business_with_owner pins an empty search_path'
);

select function_privs_are('public', 'create_business_with_owner', array['text'],
  'authenticated', array['EXECUTE'],
  'authenticated may call the business creation RPC');
select function_privs_are('public', 'create_business_with_owner', array['text'],
  'anon', array[]::text[],
  'anon may not call the business creation RPC');

-- Helper functions live in private, which is not an exposed schema.
select has_function('private', 'set_updated_at', 'the timestamp trigger helper is private');
select has_function('private', 'handle_new_user', 'the profile bootstrap helper is private');
select function_privs_are('private', 'handle_new_user', array[]::text[],
  'authenticated', array[]::text[],
  'authenticated cannot call the profile bootstrap helper directly');


-- ---------------------------------------------------------------------------
-- The auth.users trigger creates exactly one profile
-- ---------------------------------------------------------------------------

insert into auth.users (id, instance_id, aud, role, email)
values (
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'schema-test@example.test'
);

select results_eq(
  $$ select count(*)::int from public.profiles
      where id = '00000000-0000-0000-0000-0000000000a1' $$,
  $$ values (1) $$,
  'inserting an auth user creates exactly one profile row'
);

select results_eq(
  $$ select display_name from public.profiles
      where id = '00000000-0000-0000-0000-0000000000a1' $$,
  $$ values (null::text) $$,
  'the bootstrap trigger sets no display name, so no user metadata is trusted'
);


select * from finish();

rollback;
