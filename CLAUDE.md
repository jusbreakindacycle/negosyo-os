# Claude Code Instructions

## Delivery model

**NegosyoOS PH is a native mobile application only** — React Native, Expo, Expo Router,
TypeScript, against a Supabase/PostgreSQL backend. It is not a web application, not a
web-plus-mobile platform, not PWA-first, and not a future-native wrapper around a website
(DL-056). Do not reintroduce Next.js, `@supabase/ssr`, browser cookies, or any web-only package
without a new approved decision.

## Read first

Before planning, editing, or generating migrations, read in this order:

1. `README.md`
2. `PROJECT_STATE.md`
3. `docs/PROJECT_BLUEPRINT.md`
4. `docs/TECHNICAL_FOUNDATION.md`
5. `docs/BUILD_PLAN.md`
6. `docs/DECISION_LOG.md`
7. `docs/DEVELOPMENT_WORKFLOW.md`

Then inspect the current repository tree, routes, migrations, tests, and Git status. Do not infer implementation from milestone names or documentation.

**Process authorities — read when the task involves them, not on every task:**
`docs/AI_EXECUTION_PROTOCOL.md` (how much reasoning and execution capability a task needs) and
`docs/CLAUDE_SKILLS_POLICY.md` (whether an additional skill or plugin should be adopted at all).
Both are subordinate to every document above and to the rules in this file.

## Execution routing

`docs/AI_EXECUTION_PROTOCOL.md` is the canonical source. The part that applies to every task:

- Classify the task before starting, then use the **smallest sufficient configuration that can
  reliably complete it without sacrificing architectural, security, or data-integrity quality**.
  Maximum effort and extended execution are never the default.
- **Escalate** when investigation reveals hidden complexity: reclassify, raise the configuration,
  reassess scope, and stop for approval if the architecture or risk profile changed. A larger
  configuration is never permission to widen scope.
- **De-escalate** once the architecture is settled and approved and the remaining work is
  mechanical. De-escalation never lowers the verification floor: evidence labels,
  executed-versus-not-executed reporting, negative-case discipline, branch safety, and the
  completion report apply identically at every configuration.
- No repository file can make an AI environment change its own model, effort, or execution mode.
  The protocol is advisory to the founder and self-regulating for the agent. It authorises nothing
  that the rules below forbid.

## Branch safety

1. Inspect `git status`, current branch, local HEAD, and remote relationship before implementation.
2. Do not begin normal feature work directly on `main`.
3. Do not begin normal isolated feature work directly on `develop`.
4. Determine the intended capability/issue before implementation.
5. Use one appropriately named short-lived branch (`feature/*`, `fix/*`, `hotfix/*`, `refactor/*`, `test/*`, `docs/*`, `chore/*`, `spike/*`, `migration/*` — see `docs/DEVELOPMENT_WORKFLOW.md`).
6. Do not combine unrelated capabilities in one branch.
7. Do not merge, push, delete branches, force-update refs, or alter `main` automatically unless explicitly authorized.
8. Leave a branch buildable and testable whenever reasonably possible.
9. Database schema changes require new additive migrations.
10. Never edit already-applied migrations merely to simplify a feature.
11. Report branch name, changed files, tests, database impact, and intended PR target at completion.
12. If the current branch does not match the requested scope, stop implementation and reconcile branch context first.

A request such as "add this small feature" is not permission to modify unrelated modules.

## Repository authority

This repository is the single active repository for NegosyoOS PH.

Legacy repositories, old chat context, branches not present locally, and remembered requirements are not authoritative unless the founder explicitly provides them for migration review.

Where documents conflict:

1. the latest approved entry in `DECISION_LOG.md` governs the decision;
2. `PROJECT_STATE.md` governs what is currently true;
3. `PROJECT_BLUEPRINT.md` governs current product direction;
4. `TECHNICAL_FOUNDATION.md` governs implementation boundaries;
5. `BUILD_PLAN.md` governs authorised sequence;
6. `docs/DEVELOPMENT_WORKFLOW.md` governs Git branching and process;
7. the current code and executed tests govern what is actually implemented and verified.

Do not rewrite decision history. Append a new decision when direction changes.

## Product statement

NegosyoOS PH helps Philippine MSME owners establish and maintain their businesses, meet compliance obligations, control daily operations, and make better decisions through affordable AI-assisted self-service, with human support available when needed.

The three user-facing product areas are:

- **Stocks & Operations**
- **Permits & Compliance**
- **Taxes & Records**

Internal codenames must not appear in public-facing UI.

## Shared action model

All product areas follow:

> What needs attention → why it matters → missing information → bounded next action → owner decision → outcome.

The dashboard aggregates domain-produced action items. It does not bypass domain rules or become a universal write engine.

## AI boundary

Standing rule:

> Deterministic rules and recorded evidence determine. AI explains, organises, and assists. The owner or authorised human decides.

AI may:

- summarise authorised action items;
- explain in plain English or Taglish;
- ask for missing information;
- draft checklists, purchase lists, reminders, follow-up messages, or questions;
- surface contradictions or unusual records;
- recommend professional review.

AI must not:

- invent requirements, fees, deadlines, tax rates, stock facts, or permissions;
- fill missing evidence from general knowledge;
- choose a tax option;
- declare compliance, approval, eligibility, deductibility, exemption, or final liability;
- directly perform high-impact writes without explicit confirmation and server-side authorisation;
- file, sign, pay, submit, or become an authorised representative;
- become a required dependency for a core workflow.

When evidence is missing, return `unknown` and identify the missing fact.

## Evidence-status protocol

Use only:

- `VERIFIED`
- `IMPLEMENTED_UNVERIFIED`
- `DOCUMENTED_ONLY`
- `PLANNED`
- `RESEARCH_REQUIRED`
- `OUT_OF_SCOPE`
- `SUPERSEDED`

Rules:

- A decision is not implementation.
- A migration is not a shipped workflow.
- Generated types are not runtime proof.
- A written test is not verified until it runs and reaches the intended path.
- A passing security test is not evidence until a negative case fails for the intended reason.
- A working workflow is not commercial validation.
- AI-generated text is not evidence.
- Never upgrade a label silently.

Legal, regulatory, tax, fee, deadline, eligibility, and market claims require sources appropriate to the exact claim. Current rules require an effective date and last-reviewed date.

## Current repository truth

**See `PROJECT_STATE.md` for the live evidence matrix.** Summary at the mobile-foundation
reconciliation dated 2026-08-09:

- The client is being rebuilt as a native Expo/Expo Router application; the Next.js scaffold is
  retired (DL-056). See `PROJECT_STATE.md` for exactly what has been verified so far.
- M1 authentication and tenancy foundation exists at the database layer.
- Business lifecycle, tracked-item, and daily-sales migrations exist, unchanged.
- The database suites run in CI. Seven migrations apply from zero, and five suites totalling 239 assertions pass on a disposable stack (DL-053).
- A deliberate tenant-isolation regression was applied to the CI database only, on a since-deleted branch, and was observed turning the test job red on exactly the five predicted assertions. The gate can fail (DL-053).
- The database-verification portion of Phase gate B is complete.
- The hosted Supabase project structurally matches the repository for everything the repository owns, audited read-only on 2026-08-04 (DL-054, re-confirmed 2026-08-09). Hosted runtime RLS behaviour is `IMPLEMENTED_UNVERIFIED`; no pgTAP suite has run against the hosted project.
- No user-facing Stocks workflow, reorder calculation, or buying assistant exists.
- Permits, document vault, Taxes, and AI dashboard are not implemented.

Milestone 2 is a partial database foundation and remains in progress. A verified database is not a shipped workflow.

Do not claim otherwise unless the current tree and executed checks prove a later state.

## Current authorised work

Follow `docs/BUILD_PLAN.md` and `PROJECT_STATE.md`'s single next allowed engineering task.

Database verification in CI is done, so the freeze it justified no longer applies for that reason.
Of the three DL-055 Phase gate B application items, two are resolved by the mobile pivot
(DL-059): the font item is moot (no Next.js), and the OTP allow-list is carried into the native
verify path (DL-058). **One remains open:**

- a provisional ceiling of at most three businesses whose status is not `closed` per authenticated owner, as an abuse control and not as pricing or packaging. This is `PROJECT_STATE.md`'s next allowed task, `feature/business-creation-ceiling`, and it must be implemented and verified before Milestone 2C.

Phase gate A also remains open on one item: internal codenames still render in the authenticated dashboard and must be replaced with the user-facing product-area names — now in the native client.

Only after those gates are resolved, build the smallest end-to-end Stocks action slice. Do not start Stocks screens, reorder logic, or any other Milestone 2C work before then.

## Stocks & Operations guardrails

The first slice addresses recurring operational incidents such as:

- stockout;
- overbuying;
- waste or spoilage;
- forgotten purchasing;
- unavailable items;
- uncertainty before supplier ordering;
- missing job materials in a later validated job-centred workflow.

An exact peso loss is useful but not required to validate the problem.

Do not require full inventory onboarding. Begin with 8–12 priority items.

Daily gross sales:

- may support sales-based tax estimates and some demand analysis;
- is not the universal product spine;
- is not required for every low-stock or purchase action;
- is not proof of tax completeness.

Do not produce a confident reorder quantity unless units, current quantity, usage or minimum level, timing, lead time, and pack/MOQ constraints are sufficient. Otherwise show a bounded qualitative action and the missing fields.

## Permits & Compliance guardrails

May organise:

- cases, tasks, dependencies, blockers;
- documents, assessments, receipts, dates;
- source, jurisdiction, effective date, and evidence status;
- owner and representative handoff;
- renewal and review reminders.

Must not:

- invent a requirement or fee;
- encode one LGU process as nationwide;
- guarantee approval;
- automatically declare compliance;
- present AI as a lawyer or government officer;
- directly file or pay in Phase 1A.

RA 11032 must not be reduced to a universal countdown. Completeness, payment, official classification, the applicable Citizen’s Charter, and other conditions must be represented or remain unknown. Initial output is review/escalation guidance, not automatic approval. A legal demand letter requires qualified review before release.

## Taxes & Records guardrails

May:

- show record completeness;
- total owner-confirmed figures;
- provide bounded estimates;
- monitor thresholds as warnings;
- explain which facts are missing;
- prepare questions for an accountant or official channel.

Must not:

- state an estimated amount as final liability;
- select or activate a tax option;
- treat Stocks records as complete tax records;
- certify BMBE treatment;
- present BMBE income-tax exemption and the 8% option as simultaneously available;
- prepare, sign, submit, or pay a return in Phase 1A.

All calculations are deterministic, versioned, tested, and linked to current primary sources.

## BMBE model

Keep separate:

- enterprise size;
- non-binding eligibility assessment;
- application;
- Certificate of Authority;
- validity period;
- claimed BIR treatment;
- each tax, labour, financing, training, or LGU effect;
- official or professional confirmation.

Never use one `is_bmbe` boolean as the entire model.

## Tenancy and authorisation

A person reaches a business through `business_memberships` and no other route.

- No client-supplied user ID confers identity.
- No service-role key, database password, or other privileged secret enters the mobile bundle. Only `EXPO_PUBLIC_*` values are read client-side, and everything `EXPO_PUBLIC_*` is considered shipped and exposed.
- Every exposed table has RLS.
- Important writes use authorised server paths or controlled RPCs.
- `SECURITY DEFINER` functions use an empty `search_path`.
- Paid, lifecycle, or role restrictions that matter are enforced server-side, not only by hidden components.
- Representative authority is task-scoped and time-bounded when implemented.
- Audit history must not expose a wider audience than the underlying records without an explicit decision.

## Coding discipline

- Work in small vertical slices.
- Change only files required for the current task.
- Prefer plain code over abstractions.
- Do not build a universal engine before at least two concrete workflows prove shared behaviour.
- Do not create tables because they appear in future documentation.
- Do not redesign unrelated areas.
- Do not add packages without a concrete need.
- Use migrations for schema changes.
- Preserve correction and audit semantics.
- Keep ordinary-owner language in the UI.
- Do not commit or push automatically.
- Do not include secrets, local settings, `.env.local`, or Supabase temp files in shared archives.

## Phase 1A exclusions

Do not implement unless a new approved decision explicitly changes scope:

- full POS, ERP, accounting, payroll, or HR;
- banking, lending, insurance, or investment products;
- nationwide authoritative government-rule database;
- direct filing, signing, payment, or portal automation;
- automatic certification or exemption activation;
- professional marketplace;
- all vertical packs;
- full B2B jobs engine before discovery;
- autonomous AI agents (a product feature; this exclusion does not govern how AI-assisted development work is executed — see `docs/AI_EXECUTION_PROTOCOL.md`);
- unrestricted general chatbot;
- complex offline writes;
- final, store-ready, production-hardened native application (the client is native from the start per DL-056; out of scope here is production/store-release polish, not the native architecture itself);
- subscription billing;
- production launch.

## Required plan before editing

State:

1. repository state observed;
2. current evidence status;
3. exact user capability targeted;
4. files expected to change;
5. explicit exclusions;
6. tests that must run;
7. expected evidence status after completion.

Do not ask for information already present in the controlling documents or current repository.

## Completion report

Report exactly:

1. files changed;
2. user capability now available;
3. migrations added or changed;
4. tests actually executed and results;
5. tests not executed and why;
6. security, privacy, legal, and RLS implications;
7. remaining evidence status;
8. deviations or decisions requiring founder approval;
9. next authorised build-plan task.

Do not claim completion when required checks fail or were not run.
