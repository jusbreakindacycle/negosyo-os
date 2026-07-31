-- Milestone 1, slice 1: businesses and the membership table that grants
-- access to them.
--
-- Tenancy rule for the whole application: a person reaches a business through
-- business_memberships and through nothing else. No other column, anywhere,
-- confers access.


-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
-- One value for now. docs/TECHNICAL_FOUNDATION.md lists admin, staff,
-- representative, and viewer as eventual roles; each arrives in the milestone
-- that actually uses it, via its own `alter type ... add value` migration.

create type public.business_role as enum ('owner');


-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------
-- Classification columns (legal form, enterprise size, customer model,
-- operating model, certification status, tax registration) are deliberately
-- absent. docs/PROJECT_BLUEPRINT.md requires those to be separate dimensions
-- rather than one overloaded "business type", and they belong to the milestone
-- that first needs them.

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null
    constraint businesses_name_length
    check (char_length(btrim(name)) between 2 and 160),
  -- A historical fact, not an access grant. Nulled rather than cascaded so
  -- deleting an account never destroys the business record.
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.businesses is
  'A business owned by one or more members. Visibility comes only from business_memberships.';

create index businesses_created_by_idx
  on public.businesses (created_by);

create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function private.set_updated_at();


-- ---------------------------------------------------------------------------
-- business_memberships
-- ---------------------------------------------------------------------------

create table public.business_memberships (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.business_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_memberships_business_id_user_id_key
    unique (business_id, user_id)
);

comment on table public.business_memberships is
  'The single source of authority for which user may access which business.';

-- The unique constraint above indexes (business_id, user_id), which is what
-- the RLS predicate on businesses probes. This second index covers the other
-- direction -- "list the businesses I belong to" -- and the user_id foreign
-- key.
create index business_memberships_user_id_business_id_idx
  on public.business_memberships (user_id, business_id);

create trigger business_memberships_set_updated_at
  before update on public.business_memberships
  for each row execute function private.set_updated_at();


-- ---------------------------------------------------------------------------
-- Data API exposure
-- ---------------------------------------------------------------------------
-- SELECT only, for both tables. `authenticated` holds no INSERT anywhere in
-- this schema: every write goes through create_business_with_owner(), which
-- is SECURITY DEFINER. Grants and policies therefore fail independently, so a
-- mistake in one does not open the other.

revoke all on table public.businesses from anon, authenticated;
grant select on table public.businesses to authenticated;

revoke all on table public.business_memberships from anon, authenticated;
grant select on table public.business_memberships to authenticated;


-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- auth.uid() is wrapped in a scalar subquery throughout so the planner
-- evaluates it once per query rather than once per row.
--
-- auth.role() is not used anywhere: it is deprecated, and it returns
-- 'authenticated' for anonymous sign-ins too. The TO clause is the correct
-- way to target a role, always paired with an ownership predicate.

alter table public.businesses enable row level security;

-- The subquery reads business_memberships, whose own policy references only
-- auth.uid(), so there is no policy recursion. It resolves against the
-- (business_id, user_id) unique index.
create policy businesses_select_member
  on public.businesses
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.business_memberships m
      where m.business_id = businesses.id
        and m.user_id = (select auth.uid())
    )
  );

alter table public.business_memberships enable row level security;

-- You see your own memberships only. Milestone 1 has no invitations, so
-- nothing needs a view of co-members; Milestone 4 will widen this with its own
-- policy and tests when representatives arrive.
create policy business_memberships_select_own
  on public.business_memberships
  for select
  to authenticated
  using ((select auth.uid()) = user_id);
