-- Business onboarding lifecycle, slice 2: the two write paths.
--
-- Until now `create_business_with_owner` accepted only a name and never set
-- `status`, so every business created through the application took the column
-- default `operating` -- a state nobody chose and nobody was asked about
-- (DL-060). This migration replaces that function with one that derives the
-- lifecycle state from what the owner actually said, and adds the owner-declared
-- graduation path DL-060 item 4 approved.
--
-- Design decisions and their reasons are recorded in DL-063. What lives here is
-- why the SQL is shaped the way it is.


-- ---------------------------------------------------------------------------
-- Why this drops and recreates rather than replacing
-- ---------------------------------------------------------------------------
-- Postgres identifies a function by name *and argument types*, so
-- `create or replace function` with extra parameters does not replace anything:
-- it creates a second overload. The existing one-argument call would then match
-- both and fail as ambiguous (42725). Dropping first is the only way to end up
-- with exactly one creation path, which is the property the whole tenancy model
-- leans on.
--
-- The already-applied migrations are untouched.
-- 20260731125416_create_business_with_owner_function.sql and
-- 20260813090000_limit_active_businesses_per_owner.sql remain byte for byte as
-- they were applied; this is a new forward migration
-- (docs/DEVELOPMENT_WORKFLOW.md; CLAUDE.md branch rule 10).
--
-- A dropped function does not carry its ACL to its replacement, so the
-- revoke/grant pair at the end of each definition below is load-bearing here
-- rather than restated for documentation.

drop function public.create_business_with_owner(text);


-- ---------------------------------------------------------------------------
-- create_business_with_owner
-- ---------------------------------------------------------------------------
-- There is deliberately no lifecycle-status parameter. The owner answers two
-- questions -- "are you open?" and "how far has registration got?" -- and the
-- status is derived from those here, inside the function, once. Accepting a
-- status instead would put the mapping in the client and still oblige this
-- function to re-derive it in order to validate, leaving two copies of one rule
-- and a class of contradictory input to reject. Deriving it makes a
-- contradiction unrepresentable rather than merely refused, and it makes
-- `closed` impossible at creation by construction rather than by a guard.
--
-- Everything the previous version guaranteed is unchanged: identity comes only
-- from auth.uid() so there is no parameter to impersonate through, search_path
-- is empty and every reference is schema-qualified, the three-business ceiling
-- is counted through memberships and serialised by an advisory lock, and there
-- is no EXCEPTION block, so all four writes commit together or not at all.

create function public.create_business_with_owner(
  p_name                text,
  p_is_operating        boolean                             default false,
  p_registration_status public.business_registration_status default 'unknown',
  p_legal_name          text                                default null
)
returns public.businesses
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_name text := btrim(p_name);
  v_legal_name text := btrim(p_legal_name);
  -- Null-tolerant: a caller may send an explicit null for either, and the
  -- conservative reading of "said nothing" is a business that is not yet open
  -- and whose registration position is unknown.
  v_is_operating boolean := coalesce(p_is_operating, false);
  v_registration_status public.business_registration_status
    := coalesce(p_registration_status, 'unknown');
  v_status public.business_status;
  v_business public.businesses;
  v_active_count integer;
begin
  if v_user_id is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;

  if v_name is null or char_length(v_name) < 2 or char_length(v_name) > 160 then
    raise exception 'invalid_business_name' using errcode = '22023';
  end if;

  -- Mirrors businesses_legal_name_length. Checked here as well as by the
  -- constraint so the caller gets a named error rather than a constraint
  -- violation, and so a whitespace-only value is rejected rather than stored
  -- as two spaces.
  if p_legal_name is not null
     and (char_length(v_legal_name) < 2 or char_length(v_legal_name) > 200) then
    raise exception 'invalid_legal_name' using errcode = '22023';
  end if;

  -- The DL-063 mapping, and the only place it exists.
  --
  -- An owner who is trading is `operating` whatever their registration says --
  -- that is what keeps "no permit does not mean not operating" true in the
  -- data rather than only in the prose. A business that is not yet open is
  -- `registering` once registration has actually started, and `draft`
  -- otherwise, including when the owner declined to say.
  --
  -- `closed` cannot be produced by any branch. That is the construction the
  -- earlier design's `invalid_initial_status` guard was going to check for;
  -- with no status parameter the guard is unreachable, so it is absent rather
  -- than kept as a dead branch (DL-063).
  v_status := case
    when v_is_operating then 'operating'::public.business_status
    when v_registration_status in ('in_progress', 'complete')
      then 'registering'::public.business_status
    else 'draft'::public.business_status
  end;

  -- Order matters, and it is the same order as before. Arguments are checked
  -- first; the ceiling is a fact about stored state and is checked second, so
  -- "you sent me nonsense" and "you already have three" stay distinguishable
  -- to both the caller and the test suite.

  -- Without this lock the ceiling is decorative: under READ COMMITTED two
  -- concurrent calls from the same person both read a count of 2, both pass,
  -- and both insert. Transaction-scoped, so it is released whether the
  -- transaction commits or aborts.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('negosyoos:business_create'),
    pg_catalog.hashtext(v_user_id::text)
  );

  -- Counted through business_memberships rather than businesses.created_by,
  -- which is a historical fact and is nulled when an account is deleted.
  -- `role = 'owner'` is explicit so that a future viewer or staff membership
  -- does not silently consume an owner's ceiling.
  select count(*)
    into v_active_count
    from public.business_memberships m
    join public.businesses b on b.id = m.business_id
   where m.user_id = v_user_id
     and m.role = 'owner'
     and b.status <> 'closed';

  if v_active_count >= 3 then
    raise exception 'business_limit_reached' using errcode = '53400';
  end if;

  -- Defensive: the auth.users trigger normally created this already.
  insert into public.profiles (id)
  values (v_user_id)
  on conflict (id) do nothing;

  insert into public.businesses (
    name, legal_name, status, registration_status, created_by
  )
  values (
    v_name, nullif(v_legal_name, ''), v_status, v_registration_status, v_user_id
  )
  returning * into v_business;

  insert into public.business_memberships (business_id, user_id, role)
  values (v_business.id, v_user_id, 'owner');

  -- Metadata stays empty, as it was. The business name is already readable by
  -- everyone who can read this audit row, so copying it in would add exposure
  -- without adding evidence (DL-043).
  insert into public.audit_events (
    business_id,
    actor_user_id,
    domain,
    action,
    entity_type,
    entity_id
  )
  values (
    v_business.id,
    v_user_id,
    'shared',
    'business.created',
    'business',
    v_business.id
  );

  return v_business;
end;
$$;

comment on function public.create_business_with_owner(text, boolean, public.business_registration_status, text) is
  'Creates a business and its creator''s owner membership in one transaction. Identity comes from auth.uid() only. The lifecycle status is derived here from the owner''s operating declaration and registration progress (DL-063); there is no status parameter, and `closed` is impossible at creation. Refuses a fourth business whose status is not closed -- an abuse ceiling, not a pricing tier (DL-055 item 6).';

revoke execute on function public.create_business_with_owner(text, boolean, public.business_registration_status, text)
  from public, anon;
grant execute on function public.create_business_with_owner(text, boolean, public.business_registration_status, text)
  to authenticated;


-- ---------------------------------------------------------------------------
-- declare_business_status
-- ---------------------------------------------------------------------------
-- DL-031 made "the mayor's permit marked issued" the trigger that moves a
-- business from Setup mode to Running mode. Permits does not exist yet, so a
-- business created as `draft` today would have no way out of Setup mode at all
-- and the flow would be a trap. DL-060 item 4 lets the owner declare the
-- transition until Permits ships.
--
-- An owner-declared transition is a statement about operating reality. It
-- certifies nothing, and no surface may render it as a compliance claim.
--
-- This is a function and not an UPDATE grant. `authenticated` still holds
-- SELECT and nothing else on public.businesses: a general update path would let
-- any authenticated caller set any status on any business they can see, and
-- would make the transition rules below decorative.

create function public.declare_business_status(
  p_business_id uuid,
  p_status public.business_status
)
returns public.businesses
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_previous public.business_status;
  v_business public.businesses;
begin
  if v_user_id is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;

  -- Read as the definer, so the row is visible regardless of the caller's
  -- policy view, and then decide on membership explicitly. Resolving it under
  -- the caller's own visibility would let RLS hide the row and send a genuine
  -- non-member down the "no such business" path without the membership check
  -- ever being asked about a real record -- the defect DL-026 and DL-053 each
  -- found in assertions that looked like they were testing a guard.
  select status into v_previous
    from public.businesses
   where id = p_business_id;

  -- A business that does not exist and a business belonging to someone else
  -- are reported identically. Distinguishing them would confirm that an id
  -- exists.
  if v_previous is null or not private.is_business_member(p_business_id) then
    raise exception 'not_a_member' using errcode = '42501';
  end if;

  -- The whole legal transition set, and nothing else (DL-063).
  --
  -- `draft -> registering` is absent on purpose: moving a business into the
  -- registration phase belongs to Permits, which will have evidence behind it.
  -- A no-op is refused rather than accepted, so the audit trail never records a
  -- change that did not happen. Nothing enters or leaves `closed` here; closing
  -- arrives with the branch that ships the closing workflow.
  if not (
       (v_previous = 'draft' and p_status = 'operating')
    or (v_previous = 'registering' and p_status = 'operating')
  ) then
    raise exception 'invalid_status_transition' using errcode = '22023';
  end if;

  update public.businesses
     set status = p_status
   where id = p_business_id
  returning * into v_business;

  -- previous_status is read from the row above and is never supplied by the
  -- caller (DL-041). It is also the reason this row exists: once the update
  -- commits, the audit event is the only remaining evidence of where the
  -- business was. Both keys are the ones DL-060 named and that
  -- src/lib/audit/events.ts already allow-lists.
  --
  -- No new exposure. audit_events and businesses both resolve to members of the
  -- same business, so this value is readable by exactly the audience that can
  -- already read the column it describes -- the parity DL-043 made a tested
  -- invariant.
  insert into public.audit_events (
    business_id,
    actor_user_id,
    domain,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_business_id,
    v_user_id,
    'shared',
    'business.status_declared',
    'business',
    p_business_id,
    pg_catalog.jsonb_build_object(
      'previous_status', v_previous::text,
      'next_status', v_business.status::text
    )
  );

  return v_business;
end;
$$;

comment on function public.declare_business_status(uuid, public.business_status) is
  'Records the owner''s declaration that a business has started operating. Identity comes from auth.uid() only; membership is required. Legal transitions are draft->operating and registering->operating and nothing else. A statement about operating reality, not a compliance claim.';

revoke execute on function public.declare_business_status(uuid, public.business_status)
  from public, anon;
grant execute on function public.declare_business_status(uuid, public.business_status)
  to authenticated;
