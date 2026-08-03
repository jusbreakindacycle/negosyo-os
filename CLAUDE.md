# Claude Code Instructions

## Read first

Before planning, editing, or generating migrations, read in this order:

1. `README.md`
2. `docs/PROJECT_BLUEPRINT.md`
3. `docs/TECHNICAL_FOUNDATION.md`
4. `docs/BUILD_PLAN.md`
5. `docs/DECISION_LOG.md`

Then inspect the current repository tree, routes, migrations, tests, and Git status. Do not infer implementation from milestone names or documentation.

## Repository authority

This repository is the single active repository for NegosyoOS PH.

Legacy repositories, old chat context, branches not present locally, and remembered requirements are not authoritative unless the founder explicitly provides them for migration review.

Where documents conflict:

1. the latest approved entry in `DECISION_LOG.md` governs the decision;
2. `PROJECT_BLUEPRINT.md` governs current product direction;
3. `TECHNICAL_FOUNDATION.md` governs implementation boundaries;
4. `BUILD_PLAN.md` governs authorised sequence;
5. the current code and executed tests govern what is actually implemented and verified.

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

At the documentation review dated 2026-08-03:

- M0 scaffold exists.
- M1 authentication and tenancy foundation exists.
- Business lifecycle, tracked-item, and daily-sales migrations exist.
- The positive behavioural database tests for the newest slices were not established as running in CI.
- No user-facing Stocks workflow, reorder calculation, or buying assistant exists.
- Permits, document vault, Taxes, and AI dashboard are not implemented.

Milestone 2 is a partial database foundation and remains in progress.

Do not claim otherwise unless the current tree and executed checks prove a later state.

## Current authorised work

Follow `docs/BUILD_PLAN.md`.

The next engineering gate is database verification in CI. Do not add more feature SQL until the existing migrations and pgTAP suites run repeatably, except work strictly necessary to establish that test environment.

After that, build only the smallest end-to-end Stocks action slice.

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
- No service-role key enters the browser.
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
- autonomous AI agents;
- unrestricted general chatbot;
- complex offline writes;
- final native application;
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
