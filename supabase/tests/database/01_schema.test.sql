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

-- Every assertion below passes an explicit description, and that is load-
-- bearing rather than cosmetic. pgTAP overloads these functions on argument
-- count, and the schema-qualified and unqualified forms collide: with four
-- untyped literals, col_type_is('public', 'profiles', 'id', 'uuid') binds to
-- col_type_is(table, column, type, description) and looks for a column named
-- "profiles" on a table named "public". It then fails with "Column
-- public.profiles does not exist", which reads like a missing table rather
-- than a mis-resolved call. Supplying the description moves each call to an
-- arity where only the schema-qualified overload exists.


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
select col_type_is('public', 'profiles', 'id', 'uuid',
  'profiles.id is uuid');
select col_type_is('public', 'profiles', 'display_name', 'text',
  'profiles.display_name is text');
select col_type_is('public', 'profiles', 'created_at', 'timestamp with time zone',
  'profiles.created_at is timestamptz');
select col_type_is('public', 'profiles', 'updated_at', 'timestamp with time zone',
  'profiles.updated_at is timestamptz');
select col_not_null('public', 'profiles', 'created_at',
  'profiles.created_at is not null');
select col_not_null('public', 'profiles', 'updated_at',
  'profiles.updated_at is not null');
select col_is_null('public', 'profiles', 'display_name',
  'profiles.display_name is nullable and set by the owner later');

select columns_are(
  'public', 'businesses',
  array['id', 'name', 'legal_name', 'status', 'created_by', 'created_at', 'updated_at'],
  'businesses has exactly the expected columns'
);
select col_type_is('public', 'businesses', 'id', 'uuid',
  'businesses.id is uuid');
select col_type_is('public', 'businesses', 'name', 'text',
  'businesses.name is text');
select col_type_is('public', 'businesses', 'created_by', 'uuid',
  'businesses.created_by is uuid');
select col_not_null('public', 'businesses', 'name',
  'businesses.name is not null');
select col_is_null('public', 'businesses', 'created_by',
  'businesses.created_by is nullable, so deleting an account keeps the business');
select col_has_default('public', 'businesses', 'id',
  'businesses.id is generated');

-- A business in Setup mode has no registered name yet, so a not-null
-- constraint here would only force one to be invented.
select col_is_null('public', 'businesses', 'legal_name',
  'businesses.legal_name is nullable throughout Setup mode');
select col_type_is('public', 'businesses', 'legal_name', 'text',
  'businesses.legal_name is text');
select col_not_null('public', 'businesses', 'status',
  'businesses.status is not null');
select col_has_default('public', 'businesses', 'status',
  'businesses.status defaults, so rows created before Milestone 2 stayed valid');

select columns_are(
  'public', 'business_memberships',
  array['id', 'business_id', 'user_id', 'role', 'created_at', 'updated_at'],
  'business_memberships has exactly the expected columns'
);
select col_not_null('public', 'business_memberships', 'business_id',
  'business_memberships.business_id is not null');
select col_not_null('public', 'business_memberships', 'user_id',
  'business_memberships.user_id is not null');
select col_not_null('public', 'business_memberships', 'role',
  'business_memberships.role is not null');

select columns_are(
  'public', 'audit_events',
  array[
    'id', 'business_id', 'actor_user_id', 'domain', 'action',
    'entity_type', 'entity_id', 'metadata', 'occurred_at'
  ],
  'audit_events has exactly the expected columns'
);
select col_type_is('public', 'audit_events', 'id', 'bigint',
  'audit_events.id is bigint');
select col_type_is('public', 'audit_events', 'metadata', 'jsonb',
  'audit_events.metadata is jsonb');
select col_not_null('public', 'audit_events', 'action',
  'audit_events.action is not null');
select col_not_null('public', 'audit_events', 'entity_type',
  'audit_events.entity_type is not null');
select col_not_null('public', 'audit_events', 'metadata',
  'audit_events.metadata is not null');
-- Nullable so a future account-level event has somewhere to live; a null here
-- is invisible to the select policy, which is the safe default.
select col_is_null('public', 'audit_events', 'business_id',
  'audit_events.business_id is nullable and such rows are invisible to the policy');

-- audit_events is append-only, so it carries no updated_at to maintain.
select hasnt_column('public', 'audit_events', 'updated_at',
  'audit_events is append-only and has no updated_at');


-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

select has_type('public', 'business_role', 'business_role type exists');
select enum_has_labels('public', 'business_role', array['owner'],
  'business_role carries only owner in this milestone');

select has_type('public', 'business_status', 'business_status type exists');
select enum_has_labels('public', 'business_status',
  array['draft', 'registering', 'operating', 'closed'],
  'business_status covers the whole lifecycle, including closure');

select has_type('public', 'audit_domain', 'audit_domain type exists');
select enum_has_labels('public', 'audit_domain',
  array['shared', 'start_comply', 'operate_decide'],
  'audit_domain keeps the two bounded domains separate from shared');


-- ---------------------------------------------------------------------------
-- Keys, foreign keys, uniqueness
-- ---------------------------------------------------------------------------

select col_is_pk('public', 'profiles', 'id', 'profiles.id is the primary key');
select col_is_pk('public', 'businesses', 'id', 'businesses.id is the primary key');
select col_is_pk('public', 'business_memberships', 'id',
  'business_memberships.id is the primary key');
select col_is_pk('public', 'audit_events', 'id', 'audit_events.id is the primary key');

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

select has_index('public', 'businesses', 'businesses_created_by_idx',
  'businesses has an index covering the created_by foreign key');
select has_index('public', 'business_memberships',
  'business_memberships_user_id_business_id_idx',
  'business_memberships can answer "list the businesses I belong to"');
select has_index('public', 'business_memberships',
  'business_memberships_business_id_user_id_key',
  'the membership unique constraint indexes what the RLS predicate probes');
select has_index('public', 'audit_events',
  'audit_events_business_id_occurred_at_idx',
  'audit_events can be read newest-first for one business');


-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

select has_trigger('public', 'profiles', 'profiles_set_updated_at',
  'profiles maintains updated_at');
select has_trigger('public', 'businesses', 'businesses_set_updated_at',
  'businesses maintains updated_at');
select has_trigger('public', 'business_memberships', 'business_memberships_set_updated_at',
  'business_memberships maintains updated_at');
select has_trigger('auth', 'users', 'on_auth_user_created',
  'a new auth user is given a profile');


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
-- `set search_path = ''` reaches the catalogue as the text search_path=""
-- here, and as search_path= on other builds. Both mean an empty search path,
-- so this compares the decoded setting rather than the raw catalogue text and
-- still fails if the pin is dropped, renamed, or given a non-empty value.
select is(
  (select array_agg(
            split_part(cfg, '=', 1) || '=' || btrim(split_part(cfg, '=', 2), '"')
            order by cfg)
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     cross join lateral unnest(p.proconfig) as cfg
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
