-- Business onboarding lifecycle, slice 1: the registration dimension.
--
-- DL-060 item 3 requires lifecycle and formal-registration progress to be
-- separate facts, and DL-063 fixes the concrete shape. One column cannot carry
-- both: "I'm already operating" and "I'm already operating informally" are both
-- businesses whose status is `operating`, and what differs between them is how
-- far registration has got. Collapsing them onto one enum value would either
-- lose the distinction or encode an unregistered business as a compliance state
-- it has not reached.
--
-- This is the same "model separately" rule docs/PROJECT_BLUEPRINT.md already
-- applies to legal form, enterprise size, BMBE status, and tax treatment.


-- ---------------------------------------------------------------------------
-- business_registration_status
-- ---------------------------------------------------------------------------
-- An owner self-declaration. It is not evidence, not verification, and not a
-- compliance determination -- Permits (Milestone 4) owns evidence, issuing
-- office, jurisdiction, effective date, and expiry. Nothing here may be
-- rendered as "registered", "compliant", "approved", or "eligible", and
-- `not_started` may never block, gate, or downgrade a workflow. An informal
-- business that is trading is a first-class user of this product.
--
-- `unknown` exists as a real value rather than being expressed by a null. Two
-- ways to say "not known" is one too many, and the standing rule when evidence
-- is missing is to return unknown and name the missing fact rather than guess
-- at it.

create type public.business_registration_status as enum (
  'unknown',
  'not_started',
  'in_progress',
  'complete'
);

comment on type public.business_registration_status is
  'How far formal registration has got, as declared by the owner. Never evidence, never a compliance determination. Separate from business_status, which is the lifecycle.';


-- ---------------------------------------------------------------------------
-- The column
-- ---------------------------------------------------------------------------
-- Default `unknown`, so every row that existed before this migration stays
-- honest. Those owners were never asked which state their business was in --
-- the application only ever collected a name -- so the product must not answer
-- for them. A legacy row therefore reads `operating` + `unknown` and keeps
-- exactly the experience it had, with the registration fact shown as
-- unrecorded rather than invented.
--
-- NOT NULL because every row has an answer, even if that answer is "we don't
-- know".

alter table public.businesses
  add column registration_status public.business_registration_status
    not null default 'unknown';

comment on column public.businesses.registration_status is
  'Owner-declared registration progress. Recorded once during onboarding; no editing path exists until Permits ships (DL-063 item A-5). Display it as a record made during setup, never as a current compliance fact.';


-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------
-- Nothing to grant. The column is covered by the existing table-level SELECT
-- grant to `authenticated` and by businesses_select_member, so it is readable
-- by members of the business and by nobody else.
--
-- There is deliberately no UPDATE grant and no new policy here, and none is
-- added by the migration that follows either. `authenticated` still holds
-- SELECT and nothing more on public.businesses; the write path is the RPC in
-- 20260813141500. supabase/tests/database/01_schema.test.sql asserts that
-- privilege set exactly, so a later change that widens it fails the suite
-- rather than passing unnoticed.
