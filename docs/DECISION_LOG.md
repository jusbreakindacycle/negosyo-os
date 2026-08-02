# Decision Log

Append only. Do not rewrite historical entries to make later decisions appear inevitable.

---

## DL-001 — One unified product and repository

**Date:** 2026-07-31  
**Status:** Approved founder decision

NegosyoOS PH proceeds as one application, one owner account, and one active repository.

The previous standalone BusinessOS repository is retired as an active project after preserving its important principles and evidence in this repository.

This does not approve final branding or production architecture.

---

## DL-002 — Two bounded domains

**Date:** 2026-07-31  
**Status:** Approved founder decision

The unified product contains:

- Start & Comply
- Operate & Decide

Both belong to the same application. Their rules, decisions, and professional boundaries remain distinguishable.

---

## DL-003 — Phase 1A foundation-prototype coding

**Date:** 2026-07-31  
**Status:** Approved founder decision

Coding may begin for a narrow foundation prototype.

The prototype includes shared foundations and one small reference workflow in each domain.

This does not establish market validation, a production launch, or the final release scope.

---

## DL-004 — Prototype technical stack

**Date:** 2026-07-31  
**Status:** Selected for prototype implementation

Use:

- Next.js App Router;
- TypeScript;
- Tailwind CSS;
- shadcn/ui;
- Supabase PostgreSQL, Auth, Storage, and RLS;
- responsive PWA-first delivery.

Use one application repository, not a monorepo.

The stack may be revisited after prototype and field evidence.

---

## DL-005 — Self-service-first service model

**Date:** 2026-07-31  
**Status:** Approved founder direction

The default service is owner self-service with software and AI assistance.

Owners may appoint representatives for specific transactions.

Qualified professionals are optional escalation where necessary.

A mandatory case manager is not part of normal use.

---

## DL-006 — First operational vertical remains unselected

**Date:** 2026-07-31  
**Status:** Approved project constraint

The twelve carried-forward operational candidates remain hypotheses.

The DUO BREW reference workflow does not select CaféOS.

Vertical selection requires comparative evidence.

---

## DL-007 — Inventory versus jobs and orders remains unresolved

**Date:** 2026-07-31  
**Status:** Open product and architecture question

The operations domain should eventually accommodate physical items, customer work, or both.

The prototype will not create a universal engine.

A concrete inventory-centred flow will be built first, followed later by a structurally different job-centred flow before extracting shared architecture.

---

## DL-008 — Minimal documentation rule

**Date:** 2026-07-31  
**Status:** Approved repository-governance decision

The repository uses a small set of controlling documents.

Do not create one Markdown file per task, feature, screen, or discussion.

Update the controlling files when a durable decision changes.

---

## DL-009 — Working names only

**Date:** 2026-07-31  
**Status:** Working names

The following are temporary:

- NegosyoOS PH
- PermitFlow PH
- BusinessOS
- Start & Comply
- Operate & Decide

Final naming requires separate research and approval.

---

## DL-010 — BMBE model added to Start & Comply

**Date:** 2026-07-31  
**Status:** Approved product constraint

BMBE is modelled as a time-bound business certification and possible incentive status within Start & Comply.

The application may provide preliminary eligibility screening, evidence organisation, Certificate of Authority tracking, expiry and renewal reminders, and BIR-treatment status tracking.

The application must not automatically certify eligibility, issue a Certificate of Authority, activate an income-tax exemption, or imply that BMBE removes all other registrations, taxes, records, invoices, labour obligations, or LGU requirements.

BMBE certificate status and each claimed legal, tax, labour, financing, training, or local-government effect must be represented separately.


---

## DL-011 — Enterprise classification and reference cases corrected

**Date:** 2026-07-31  
**Status:** Approved founder clarification

MSME is the broad enterprise-size classification covering micro, small, and medium enterprises.

BMBE is not an alternative to MSME or a separate market outside MSMEs. It is a special certification or incentive status potentially available to qualified micro enterprises.

Legal form, enterprise size, BMBE status, tax treatment, operating model, and customer model must be represented separately.

The real-world discovery cases are corrected and expanded:

- DUO BREW is located in Mandaluyong City;
- the car-tint installation services business is located in Pasig City;
- the air-conditioning installation, cleaning, and repair business is a B2B service case serving mostly corporations and banks.

The size of a client does not determine the service provider’s own enterprise-size classification.

The air-conditioning case is preserved as a potential job-centred validation workflow, but its detailed requirements remain pending operator interview.

---

## DL-025 — Milestone order corrected against actual repository state

**Date:** 2026-08-02
**Status:** Approved founder decision

Entries DL-012 to DL-024 were never recorded in this file. DL-025 is used as directed; the gap is left rather than renumbered, because this log is append-only and rewriting it to look continuous would misrepresent its history.

### What was actually in the repository

A planning document circulated before this entry described the repository as containing only the `main` branch and the Milestone 0 scaffold, and treated authentication, tenancy, and Stocks as work still to be sequenced. That description was inaccurate. The verified state on 2026-08-02 was:

| Branch | Head | Contents |
|---|---|---|
| `main` | `373bb01` | `chore(release): promote Milestone 0 scaffold to main` |
| `develop` | `2d42ecc` | `feat: scaffold NegosyoOS PH application (#1)` |
| `feature/milestone-1-auth-tenancy` | `1ea2338` | `wip: implement Milestone 1 pending database verification` |

Two details are recorded precisely, because both were stated loosely before:

- `373bb01` does exist and is the head of `main`. It is a single-parent promotion commit, not a merge commit; its parent is `3cafdcc`.
- `2d42ecc` is the squashed work commit of PR #1, but it sits on `develop` and is **not** an ancestor of `main`.

The Milestone 1 branch held working sign-up, sign-in, session handling, business onboarding, a business switcher, four migrations, membership-based RLS, an audit spine, and three pgTAP suites: roughly 1,530 lines under `src/`, 560 lines of unit tests, 340 lines of migrations, and 790 lines of database tests.

### Decision

Authentication and tenancy were completed ahead of Stocks. They are **retained, not rebuilt**, and the milestone numbering is corrected to match what exists rather than the order originally imagined:

**M0** scaffold (complete) · **M1** auth and tenancy (complete) · **M2** Stocks · **M3** Permits with the RA 11032 clock and Setup mode · **M4** document vault · **M5** Taxes · **M6** deadlines, PWA, and TWA packaging · **M7** field test.

The earlier plan to build Stocks first and migrate its data behind real ownership later is therefore void. There is no data to migrate; ownership already exists.

### Consequences

1. **Stocks is built on real authentication.** Every Stocks table uses the membership-based RLS pattern established in `20260731125356_create_businesses_and_memberships.sql`. No development-only business identifier is introduced, and no shortcut stands in for a real membership.
2. **`businesses` is altered, not created.** It already exists with `name`, which is kept as-is. A nullable `legal_name` and a `status` enum — `draft | registering | operating | closed`, defaulting to `operating` for existing rows — arrive in a new migration.
3. **RLS is verified, not asserted.** See DL-026.

---

## DL-026 — Milestone 1 RLS verified against a real Supabase instance

**Date:** 2026-08-02
**Status:** Approved project constraint

Milestone 1 was committed as `wip: implement Milestone 1 pending database verification`. The pgTAP suites had never been executed anywhere: the linked project `NegosyoOS PH Development` held zero migrations and zero tables.

The four migrations were applied to that project and all three suites were run against it. The first run failed 40 of 127 assertions. Every failure was a defect in the **tests**, not in the schema:

- **34 failures — pgTAP overload ambiguity.** With four untyped string literals, `col_type_is('public', 'profiles', 'id', 'uuid')` binds to `col_type_is(table, column, type, description)` rather than the schema-qualified form, so it searched for a column named `profiles` on a table named `public` and reported `Column public.profiles does not exist`. The same collision affected `col_not_null`, `col_is_null`, `col_has_default`, `col_is_pk`, `has_index`, and `has_trigger`. Fixed by giving every such call an explicit description, which selects an arity where only the schema-qualified overload exists.
- **1 failure — catalogue text.** `set search_path = ''` is stored as `search_path=""` on this instance and as `search_path=` elsewhere. The assertion now compares the decoded setting.
- **5 failures — leaked session in the test itself.** `set_config(..., true)` is local to the *transaction*, not the statement. The no-session assertion called the RPC directly, so the previous caller's claims were still installed, `auth.uid()` returned that user, and the call created a business. The guard was never exercised. Routing the call through the helper with a null user blanks `request.jwt.claims` first.

The third item is the one that mattered. It was an assertion that reported a passing security guard while testing nothing. A separate probe confirmed the guard itself is correct: with claims genuinely absent, `create_business_with_owner` raises `42501 auth_required` as both `postgres` and `authenticated`, and writes nothing.

After the fixes, **all 127 assertions pass** — 82 schema, 24 cross-business isolation, 21 RPC behaviour.

**Standing rule:** a passing RLS test is only evidence if the negative case has been observed to fail for the intended reason. An assertion that cannot distinguish "the guard fired" from "the guard was never reached" is not a test. Milestone 1 is not marked complete on the strength of tests that have never run.

**Known environment limitation:** Docker is not installed on the founder's machine, so `supabase db reset` and `supabase test db` cannot run locally, and CI does not yet execute the pgTAP suites. Verification currently runs against the linked development project. Restoring a local or CI path for these suites is an open task.
