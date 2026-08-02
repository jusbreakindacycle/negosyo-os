-- Milestone 1, slice 1: minimal append-only audit trail.
--
-- Shape follows docs/TECHNICAL_FOUNDATION.md section 12: actor, business,
-- domain, action, entity type and id, a summary, and a server-generated
-- timestamp.


-- Milestone 1 writes only 'shared'. The two domain values are declared now so
-- the later slices do not need a backfill.
create type public.audit_domain as enum ('shared', 'start_comply', 'operate_decide');


create table public.audit_events (
  -- bigint identity rather than a random uuid: this is the fastest-growing
  -- table in the schema and its id never appears in a URL or a cookie, so
  -- index locality matters more than opacity here.
  id bigint generated always as identity primary key,
  -- Nullable so a future account-level event has somewhere to live. A null
  -- business_id is invisible to every policy below, which is the safe default.
  business_id uuid references public.businesses (id) on delete cascade,
  actor_user_id uuid references public.profiles (id) on delete set null,
  domain public.audit_domain not null default 'shared',
  action text not null
    constraint audit_events_action_length
    check (char_length(action) between 1 and 100),
  entity_type text not null
    constraint audit_events_entity_type_length
    check (char_length(entity_type) between 1 and 60),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

comment on table public.audit_events is
  'Append-only history of shared-platform actions. Never write a password, token, TIN, or other personal data into metadata.';

comment on column public.audit_events.metadata is
  'Small allow-listed summary only. src/lib/audit/events.ts filters keys before anything reaches this column.';

-- No updated_at and no update/delete grant: an audit row is a record of what
-- happened, so there is nothing legitimate to change about it afterwards.

create index audit_events_business_id_occurred_at_idx
  on public.audit_events (business_id, occurred_at desc);


-- ---------------------------------------------------------------------------
-- Data API exposure
-- ---------------------------------------------------------------------------
-- Read-only for members. Writes happen exclusively inside SECURITY DEFINER
-- functions, so there is no INSERT grant and no write policy.

revoke all on table public.audit_events from anon, authenticated;
grant select on table public.audit_events to authenticated;

alter table public.audit_events enable row level security;

create policy audit_events_select_business_member
  on public.audit_events
  for select
  to authenticated
  using (
    business_id is not null
    and exists (
      select 1
      from public.business_memberships m
      where m.business_id = audit_events.business_id
        and m.user_id = (select auth.uid())
    )
  );
