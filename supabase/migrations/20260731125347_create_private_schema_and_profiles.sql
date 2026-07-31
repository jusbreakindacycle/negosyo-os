-- Milestone 1, slice 1: private helper schema and the profiles table.
--
-- `private` is not listed in config.toml's api.schemas, so nothing in it is
-- reachable through the Data API. Helper functions live here rather than in
-- `public`, where Postgres grants EXECUTE to PUBLIC by default and every
-- function becomes a callable endpoint.

create schema if not exists private;

revoke all on schema private from anon, authenticated;


-- ---------------------------------------------------------------------------
-- Timestamp maintenance
-- ---------------------------------------------------------------------------
-- SECURITY INVOKER (the default). A trigger function needs no EXECUTE grant
-- for the querying role: Postgres checks that privilege once, when the trigger
-- is created, not on every fire. So revoking below does not break the trigger.

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function private.set_updated_at() from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
-- One row per auth user. Deliberately holds no email: that fact belongs to
-- auth.users and duplicating it would create two sources of truth for a piece
-- of personal data.
--
-- display_name is nullable and set by the owner later. It is never read from
-- raw_user_meta_data, which is user-editable and unsafe as an input to
-- anything the database treats as authoritative.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text
    constraint profiles_display_name_length
    check (
      display_name is null
      or char_length(btrim(display_name)) between 1 and 120
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Application profile for an authenticated user. Access to business data comes from business_memberships, never from this table.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();


-- ---------------------------------------------------------------------------
-- Data API exposure
-- ---------------------------------------------------------------------------
-- config.toml leaves auto_expose_new_tables unset, so new tables are not
-- granted to anon/authenticated automatically. The explicit revoke makes the
-- outcome identical even if that setting is later turned on.
--
-- No INSERT grant: rows are created only by the auth.users trigger below.
-- No DELETE grant: removing a profile is removing an account, which has no
-- flow in this milestone.

revoke all on table public.profiles from anon, authenticated;
grant select, update on table public.profiles to authenticated;

alter table public.profiles enable row level security;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- Both USING and WITH CHECK. Without WITH CHECK a user could rewrite the row's
-- id and take over another profile.
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);


-- ---------------------------------------------------------------------------
-- Profile bootstrap
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER is required: supabase_auth_admin, which inserts the
-- auth.users row, cannot write public.profiles.
--
-- The body is deliberately one idempotent statement reading only new.id. An
-- error raised here would surface to the person signing up as "Database error
-- saving new user", so there is nothing else in it to go wrong.

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
