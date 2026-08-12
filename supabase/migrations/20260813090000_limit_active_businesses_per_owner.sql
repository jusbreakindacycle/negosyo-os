-- Phase gate B, application item 6: an abuse ceiling on business creation.
--
-- DL-055 item 6 approved "at most three businesses whose status is not
-- `closed` per authenticated owner", enforced server-side. DL-055 item 7 and
-- DL-059 item 3 both restate what it is *not*: this is abuse control, not
-- pricing, not packaging, and not a subscription tier. Nothing in the
-- interface may present it as one.
--
-- This is a new migration that replaces the function body.
-- 20260731125416_create_business_with_owner_function.sql is left byte for byte
-- as it was applied (docs/DEVELOPMENT_WORKFLOW.md; CLAUDE.md branch rule 10).


-- Why the ceiling lives inside this function rather than in a CHECK constraint
-- or a policy:
--
--   * a CHECK constraint cannot see other rows, so it cannot count them;
--   * an RLS policy cannot help, because `authenticated` holds no INSERT on
--     public.businesses at all -- there is no INSERT for a policy to gate;
--   * this function is the *only* way a business row is ever created, so a
--     guard here has no way around it that does not require the database
--     password or the service-role key.
--
-- Everything else about the function is unchanged from the original: identity
-- still comes only from auth.uid(), search_path is still empty, every
-- reference is still schema-qualified, and there is still no EXCEPTION block,
-- so all four writes commit together or not at all.
create or replace function public.create_business_with_owner(p_name text)
returns public.businesses
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_name text := btrim(p_name);
  v_business public.businesses;
  v_active_count integer;
begin
  if v_user_id is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;

  if v_name is null or char_length(v_name) < 2 or char_length(v_name) > 160 then
    raise exception 'invalid_business_name' using errcode = '22023';
  end if;

  -- Order matters. The name is an argument and is checked first; the ceiling
  -- is a fact about stored state and is checked second. Keeping them in this
  -- order means "you sent me nonsense" and "you already have three" stay
  -- distinguishable to both the caller and the test suite -- the same reason
  -- DL-053 separated "no such row", "real row, wrong tenant", and "bad
  -- argument" when it repaired the tracked-item and daily-sales assertions.

  -- Without this lock the ceiling is decorative. Under READ COMMITTED two
  -- concurrent calls from the same person both read a count of 2, both pass
  -- the check, and both insert -- leaving four. Firing parallel requests is
  -- precisely the behaviour an abuse control exists to stop, so the check is
  -- serialised per owner rather than left to chance.
  --
  -- Transaction-scoped, so it is released when the RPC's transaction ends
  -- whether it commits or aborts; nothing has to unlock it. The first key
  -- namespaces this lock so it cannot collide with an unrelated advisory lock
  -- taken elsewhere for a different purpose.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('negosyoos:business_create'),
    pg_catalog.hashtext(v_user_id::text)
  );

  -- Counted through business_memberships, not businesses.created_by.
  -- created_by is documented in 20260731125356 as "a historical fact, not an
  -- access grant", and it is nulled when an account is deleted -- so counting
  -- it would both miss businesses transferred to someone else and quietly
  -- raise the ceiling for anyone whose creator row was cleared.
  --
  -- `role = 'owner'` is written explicitly even though public.business_role
  -- currently has exactly one value. When staff, representative, and viewer
  -- arrive, being a viewer on ten businesses must not consume the ceiling on
  -- businesses this person actually owns. Leaving the predicate off would read
  -- as correct today and silently change meaning the day the enum widens --
  -- the same class of latent drift DL-043 recorded for the audit audience.
  select count(*)
    into v_active_count
    from public.business_memberships m
    join public.businesses b on b.id = m.business_id
   where m.user_id = v_user_id
     and m.role = 'owner'
     and b.status <> 'closed';

  -- `closed` is excluded rather than every status counted, so an owner who
  -- shuts a business down regains the slot. That is what makes three a
  -- ceiling on concurrent use rather than a lifetime quota.
  if v_active_count >= 3 then
    raise exception 'business_limit_reached' using errcode = '53400';
  end if;

  -- Defensive: the auth.users trigger normally created this already.
  insert into public.profiles (id)
  values (v_user_id)
  on conflict (id) do nothing;

  insert into public.businesses (name, created_by)
  values (v_name, v_user_id)
  returning * into v_business;

  insert into public.business_memberships (business_id, user_id, role)
  values (v_business.id, v_user_id, 'owner');

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

-- Error code note. Postgres has no code that means "an application policy
-- limit was reached", so 53400 configuration_limit_exceeded is the closest
-- standard class: insufficient resources, limit exceeded. It is deliberately
-- not 42501, which this function already uses for a missing session, and not
-- 22023, which it uses for a malformed name. The message text is what the
-- client matches on, exactly as it does for the other two.

comment on function public.create_business_with_owner(text) is
  'Creates a business and its creator''s owner membership in one transaction. Identity is taken from auth.uid() only. Refuses a fourth business whose status is not closed, per DL-055 item 6 -- an abuse ceiling, not a pricing tier.';

-- CREATE OR REPLACE preserves a function's ACL, so these two statements change
-- nothing when this migration is applied in order after 20260731125416. They
-- are restated so that this file describes the complete intended exposure of
-- the function it defines, rather than depending on a reader following the
-- grant back through an earlier migration.
revoke execute on function public.create_business_with_owner(text) from public, anon;
grant execute on function public.create_business_with_owner(text) to authenticated;
