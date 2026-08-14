# Claude Code Instructions

## Delivery model

NegosyoOS PH is a **native mobile application only** — React Native, Expo, Expo Router, TypeScript,
against Supabase/PostgreSQL. Do not reintroduce Next.js, `@supabase/ssr`, browser cookies, PWA/TWA
architecture, or other web-only delivery without a new approved decision.

## Read first

Before planning or editing:

1. `README.md`
2. `PROJECT_STATE.md`
3. `PRODUCT_SPEC.md`
4. `docs/PROJECT_BLUEPRINT.md`
5. `docs/TECHNICAL_FOUNDATION.md`
6. `docs/BUILD_PLAN.md`
7. `docs/DECISION_LOG.md`
8. `docs/DEVELOPMENT_WORKFLOW.md`

Then inspect the current tree, routes, migrations, tests, and Git status.

`docs/AI_EXECUTION_PROTOCOL.md` and `docs/CLAUDE_SKILLS_POLICY.md` are process authorities when
their subject is relevant. They authorise nothing that this file or the decision log forbids.

## Repository authority

This repository is the implementation authority for what exists.

For conflicts:

1. latest approved `docs/DECISION_LOG.md` entry governs decisions;
2. `PROJECT_STATE.md` governs current repository truth and evidence;
3. `PRODUCT_SPEC.md` and `docs/PROJECT_BLUEPRINT.md` govern product direction within their scopes;
4. `docs/TECHNICAL_FOUNDATION.md` governs implementation boundaries;
5. `docs/BUILD_PLAN.md` governs authorised sequence;
6. current code and executed tests determine implementation evidence.

The external `NEGOSYOOS_MASTER_HANDOFF.md` is product-direction context. It is not evidence of what
the repository implements. Where it introduces durable direction that conflicts with an approved
repository decision, record the reconciliation in the decision log rather than silently choosing
one.

## Branch safety

1. Inspect Git state before implementation.
2. Never do normal feature work directly on `main` or `develop`.
3. Use one short-lived, correctly prefixed branch per capability.
4. Do not combine unrelated capabilities.
5. Do not merge, push, delete branches, force-update refs, or alter `main` automatically.
6. Database changes require additive migrations.
7. Never edit an already-applied migration.
8. Leave the branch buildable/testable where reasonably possible.
9. Report branch, changed files, tests, database impact, and intended PR target.
10. If the branch does not match the requested scope, stop and reconcile first.

## Product definition

NegosyoOS is a **Business State and Business Navigation System for Philippine MSMEs**.

It helps an owner understand and manage business state across:

- identity;
- operations;
- records;
- obligations;
- resources;
- opportunities.

The current user-facing product areas remain:

- **Stocks & Operations**
- **Permits & Compliance**
- **Taxes & Records**

The six business-state domains and three product areas are not competing definitions. The six are
the conceptual model; the three are the current user-facing navigation decomposition.

## Core product loop

```text
BUSINESS CONTEXT
      ↓
BUSINESS STATE
      ↓
WHAT IS RELEVANT?
      ↓
WHAT IS MISSING / INCOMPLETE / AT RISK?
      ↓
WHY DOES IT MATTER?
      ↓
WHAT IS THE NEXT LEGITIMATE ACTION?
      ↓
OWNER / AUTHORISED HUMAN DECIDES
      ↓
BUSINESS STATE CHANGES
      ↓
RE-EVALUATE
```

The dashboard aggregates domain-produced actions. It is not a universal write engine.

## AI boundary

Deterministic rules and recorded evidence determine. AI explains, organises, and assists. The owner
or authorised human decides.

AI may explain, summarise, ask for missing information, draft bounded material, surface
contradictions, and recommend professional review.

AI must not invent requirements, fees, deadlines, tax rates, stock facts, permissions, or evidence;
declare compliance/eligibility/finality; choose a tax treatment; or perform high-impact writes without
explicit confirmation and server-side authorisation.

When evidence is missing, use `unknown` and identify the missing fact.

## Evidence-status protocol

Use only:

- `VERIFIED`
- `IMPLEMENTED_UNVERIFIED`
- `DOCUMENTED_ONLY`
- `PLANNED`
- `RESEARCH_REQUIRED`
- `OUT_OF_SCOPE`
- `SUPERSEDED`

Never silently upgrade a label.

A decision is not implementation. A migration is not a workflow. A written test is not verified until
it runs through the intended path. A passing security test must demonstrate the intended negative case.

## Current authorised work

**No product implementation task is currently designated.**

Authorised work is limited to:

1. documentation/state reconciliation under DL-064–066;
2. the read-only hosted parity audit authorised by DL-064.

Milestone 2C / Stocks remains a future validation wedge, not a currently authorised implementation
task. Closing verification gates does not itself authorise Stocks.

## Phase gates

### Phase Gate A — CLOSED

The native dashboard uses the three public product-area names. Internal codenames must not appear
in public UI.

### Phase Gate B — CLOSED for its defined application items

The three-business ceiling is implemented and verified in CI. OTP verification uses the native
allow-list. The former font item is superseded by the mobile-only pivot.

## Product/domain guardrails

### Business context

Collect enough context to make onboarding relevant. Do not persist facts merely because they may be
useful later.

Nature of business may be an onboarding-context input when a separately authorised workflow defines
its exact behaviour. Persistent industry/activity/location/profile fields each require a concrete
consumer and decision.

Do not infer a business type with AI as a substitute for asking the owner.

Do not introduce PSIC merely because classification sounds useful. No PSIC implementation is currently
authorised by the supplied repository evidence.

### Applicability

The long-term model is:

```text
FACT
  ↓
RULE
  ↓
APPLICABILITY RESULT
  ↓
EXPLANATION
  ↓
ACTION
```

Do not build a generic applicability engine until concrete workflows prove shared behaviour.

### Jurisdiction

National and local applicability must remain distinct. Location can matter at province,
city/municipality, barangay, or agency level. A future geographic model should be robust and
PSGC-compatible, but no geography engine is currently authorised.

### Knowledge

A searchable article-library product surface is rejected. Authoritative structured knowledge may
still exist internally when an authorised workflow consumes it. Preserve source, authority,
jurisdiction, effective date, applicability conditions, verification status, and version history.

### BMBE

BMBE is a later program/eligibility domain, not the architecture. Do not build a BMBE-specific engine
before a generic mechanism has been justified by multiple concrete workflows.

### Stocks

The intended validation wedge concerns recurring operational incidents such as stockout, overbuying,
waste/spoilage, forgotten purchasing, unavailable items, supplier uncertainty, and later validated
job-material readiness.

Do not require exact peso loss. Do not require full inventory onboarding. Do not produce confident
reorder quantities when required facts are missing.

## Tenancy and security

A person reaches a business through `business_memberships` and no other route.

- No client-supplied user ID confers identity.
- No privileged secret enters the mobile bundle.
- Every exposed table has RLS.
- Important writes use authorised server paths or controlled RPCs.
- `SECURITY DEFINER` functions use an empty `search_path`.
- Important restrictions are enforced server-side.
- Audit visibility must not exceed the underlying record audience without a decision.

## Coding discipline

- Small vertical slices.
- Plain code over premature abstractions.
- No universal engine before two concrete workflows prove shared behaviour.
- No tables merely because future documentation mentions them.
- No unrelated redesign.
- No unnecessary packages.
- Additive migrations only.
- Preserve audit/correction semantics.
- No automatic commit/push.

## Phase 1A exclusions

Do not implement without a new approved decision:

- full POS/ERP/accounting/payroll/HR;
- banking/lending/insurance/investment;
- nationwide authoritative rules database;
- direct filing/signing/payment/portal automation;
- automatic certification or exemption activation;
- professional marketplace;
- all vertical packs;
- full B2B jobs engine before discovery;
- autonomous AI agents as a product feature;
- unrestricted general chatbot;
- complex offline writes;
- production/store-release hardening;
- subscription billing;
- production launch.

## Required plan before editing

State:

1. repository state observed;
2. evidence status;
3. exact capability targeted;
4. files expected to change;
5. exclusions;
6. tests required;
7. expected evidence status.

## Completion report

Report:

1. files changed;
2. capability available;
3. migrations added/changed;
4. tests actually executed;
5. tests not executed and why;
6. security/privacy/legal/RLS implications;
7. remaining evidence status;
8. deviations or founder decisions required;
9. next authorised build-plan task.

Never claim completion when required checks did not run.
