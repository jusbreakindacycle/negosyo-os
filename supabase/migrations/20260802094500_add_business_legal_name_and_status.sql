-- Milestone 2, slice 1: the two columns the application's shape depends on.
--
-- businesses already exists from Milestone 1, so this is an ALTER. The
-- everyday `name` column is kept exactly as it is: it is what the owner calls
-- the business and what appears in the switcher, and it is present from the
-- moment the row is created.


-- ---------------------------------------------------------------------------
-- Lifecycle status
-- ---------------------------------------------------------------------------
-- docs/PROJECT_BLUEPRINT.md section 4: the application changes shape depending
-- on where the business is in its lifecycle. Setup mode shows only the
-- registration path; Running mode shows all three features. Marking the
-- mayor's permit issued is what moves a business from `registering` to
-- `operating`.
--
-- `closed` is declared now rather than added later because closure is part of
-- the lifecycle the product already claims to cover, and widening an enum in a
-- migration that also backfills rows is more disruptive than declaring the
-- value up front.

create type public.business_status as enum (
  'draft',
  'registering',
  'operating',
  'closed'
);

comment on type public.business_status is
  'Where a business is in its lifecycle. Drives Setup mode versus Running mode.';


alter table public.businesses
  add column status public.business_status not null default 'operating';

comment on column public.businesses.status is
  'Lifecycle stage. Existing rows default to operating: every business created before this migration was created by someone already trading.';


-- ---------------------------------------------------------------------------
-- Registered name
-- ---------------------------------------------------------------------------
-- Nullable, and it must stay nullable. A business in Setup mode has no
-- registered name yet -- that is the outcome of the DTI or SEC step it is
-- still working through. Forcing a value here would mean inventing one.
--
-- Kept separate from `name` because they are different facts: `name` is what
-- the owner calls the shop, `legal_name` is what appears on the certificate.
-- They frequently differ, and the compliance domain needs the registered form
-- specifically.

alter table public.businesses
  add column legal_name text
    constraint businesses_legal_name_length
    check (
      legal_name is null
      or char_length(btrim(legal_name)) between 2 and 200
    );

comment on column public.businesses.legal_name is
  'Registered DTI or SEC name, once one exists. Null throughout Setup mode. Never inferred from name.';


-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------
-- Nothing to grant. Both columns are covered by the existing table-level
-- SELECT grant to `authenticated` and by businesses_select_member, so they are
-- readable by members and by nobody else.
--
-- There is deliberately no UPDATE grant and no write policy: `authenticated`
-- holds no write privilege on businesses, and that stays true here. The write
-- path for status is the graduation step in Milestone 3, which arrives as a
-- SECURITY DEFINER function alongside the Setup-mode flow that gives it
-- meaning. Adding a general-purpose update path now would create a way to
-- declare a business `operating` without the permit that is supposed to mean.
