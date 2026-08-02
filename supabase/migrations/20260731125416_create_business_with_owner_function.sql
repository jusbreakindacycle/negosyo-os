-- Milestone 1, slice 1: the only way to create a business.
--
-- Creating a business and creating its owner membership must be one
-- indivisible act. A business with no owner membership would be unreachable
-- by anyone, including the person who just made it.


-- SECURITY DEFINER is genuinely required here: `authenticated` holds no INSERT
-- on businesses, business_memberships, or audit_events, by design.
--
-- The Supabase security checklist says to keep SECURITY DEFINER functions out
-- of exposed schemas. This one cannot be -- PostgREST can only call an RPC in
-- an exposed schema -- so the compensating controls carry the weight instead:
--
--   * the first statement rejects a missing session;
--   * identity comes only from auth.uid(), never from a parameter, so the
--     caller cannot act as someone else;
--   * search_path is empty and every reference is schema-qualified;
--   * EXECUTE is revoked from public and anon.
--
-- supabase/tests/database/03_create_business_rpc.test.sql asserts each one.
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
begin
  if v_user_id is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;

  if v_name is null or char_length(v_name) < 2 or char_length(v_name) > 160 then
    raise exception 'invalid_business_name' using errcode = '22023';
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

-- Atomicity note: PostgREST runs one RPC call inside one transaction, and a
-- PL/pgSQL body with no EXCEPTION block aborts that transaction on any error.
-- All four writes therefore commit together or not at all. An EXCEPTION
-- handler here would break exactly that property, so there is none.

comment on function public.create_business_with_owner(text) is
  'Creates a business and its creator''s owner membership in one transaction. Identity is taken from auth.uid() only.';

revoke execute on function public.create_business_with_owner(text) from public, anon;
grant execute on function public.create_business_with_owner(text) to authenticated;
