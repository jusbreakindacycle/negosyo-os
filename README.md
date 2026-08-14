# NegosyoOS PH

> **Temporary working name.** Final branding, trademark screening, and market positioning are not
> yet approved.

## What NegosyoOS is

**NegosyoOS is a Business State and Business Navigation System for Philippine MSMEs.**

It helps a business owner understand and manage the current state of the business across:

- identity;
- operations;
- records;
- obligations;
- resources;
- opportunities.

Using business context, trusted structured knowledge, deterministic rules, and AI assistance,
NegosyoOS aims to answer:

> **What deserves attention → why → what is missing/incomplete/at risk → what should I do next?**

The product is intentionally broad in vision but narrow in execution.

## Delivery model

NegosyoOS PH is a **native mobile application only**:

- React Native
- Expo
- Expo Router
- TypeScript
- Supabase/PostgreSQL

The previous Next.js/web/PWA direction is superseded by DL-056.

## Two levels of product organisation

### Business-state domains

These describe what NegosyoOS understands about a business:

1. Identity
2. Operations
3. Records
4. Obligations
5. Resources
6. Opportunities

### User-facing product areas

These are the current navigation areas:

1. **Stocks & Operations**
2. **Permits & Compliance**
3. **Taxes & Records**

These are not competing product definitions. The six domains describe the business-state model; the
three product areas describe the current user-facing decomposition.

Internal codenames must never appear in public UI.

## Core product loop

```text
CREATE / CONNECT BUSINESS
        ↓
BUILD RELEVANT CONTEXT
        ↓
UNDERSTAND BUSINESS STATE
        ↓
DETERMINE WHAT IS RELEVANT
        ↓
IDENTIFY MISSING / INCOMPLETE / AT-RISK ITEMS
        ↓
EXPLAIN WHY
        ↓
RECOMMEND NEXT LEGITIMATE ACTION
        ↓
OWNER / AUTHORISED HUMAN DECIDES
        ↓
BUSINESS STATE CHANGES
        ↓
RE-EVALUATE
```

AI is an assistance layer. It is not the source of regulatory truth.

## Evidence status

| Label | Meaning |
|---|---|
| `VERIFIED` | Evidence was actually observed through the required verification path |
| `IMPLEMENTED_UNVERIFIED` | Implementation exists but required execution/verification is outstanding |
| `DOCUMENTED_ONLY` | Direction or design exists; implementation does not |
| `PLANNED` | Future work is approved but not implemented |
| `RESEARCH_REQUIRED` | Evidence is still needed |
| `OUT_OF_SCOPE` | Explicitly excluded |
| `SUPERSEDED` | Replaced by a later decision |

## Current repository state

See `PROJECT_STATE.md` for the live evidence matrix.

Current baseline:

- `main` at `ce644fd`;
- ten database migrations;
- seven pgTAP suites;
- business-creation ceiling verified in CI;
- lifecycle database behaviour verified in CI;
- native client code exists but has not completed a physical-device walkthrough;
- hosted structural parity for migrations 8–10 is still unverified;
- no user-facing Stocks, Permits, or Taxes workflow exists.

The local reconciliation checks on 2026-08-14 passed:

```text
npm run lint
npm run typecheck
npm test
git diff --check

8 test files passed
71 tests passed
```

## Phase gates

### Phase Gate A — CLOSED

The native dashboard uses:

- Stocks & Operations
- Permits & Compliance
- Taxes & Records

Internal domain codenames remain internal only.

### Phase Gate B — CLOSED for its defined application items

The three-business ceiling is implemented and verified in CI. The native OTP allow-list is in place.
The old web font item is superseded by the mobile pivot.

## Current work status

### Authorised now

- documentation/state reconciliation under DL-064–066;
- read-only hosted parity audit of migrations 8–10, as authorised by DL-064.

### Not currently authorised

No product implementation task is currently designated.

Milestone 2C / Stocks remains the intended **validation wedge**, but verification completion does not
automatically authorise it. A founder decision must explicitly designate the next implementation task.

## Product direction retained from the Master Handoff

The long-term product direction includes:

- contextual business facts;
- requirements and applicability;
- national/local jurisdiction;
- structured authoritative knowledge;
- evidence;
- business journey/navigation;
- AI assistance.

These are not automatically current database tables or features.

The Master Handoff is product-direction context. It does not override repository evidence or silently
authorise implementation.

## What NegosyoOS is not

NegosyoOS is not:

- a government-registration clone;
- a full accounting system;
- a full ERP;
- a POS replacement;
- a full warehouse platform;
- a generic AI chatbot;
- an AI lawyer/accountant;
- an automated BIR/DTI/SEC filing system;
- a nationwide authoritative government-rule database;
- a professional marketplace.

## Product guardrails

- Facts, rules, applicability results, explanations, and actions remain separate.
- AI does not invent regulatory truth.
- Missing evidence remains unknown.
- National and LGU requirements are not treated as one universal checklist.
- Only collect business facts that change a decision or workflow.
- BMBE is a later program/eligibility domain, not the architecture.
- Do not build a generic applicability engine before concrete workflows prove shared behaviour.
- Do not introduce PSIC classification merely because it may be useful later; no PSIC implementation is
  currently authorised by the supplied evidence.
- Exact peso loss is not required to validate recurring operational pain.
- Daily gross sales is not the universal product spine.

## Controlling documents

- `PROJECT_STATE.md` — current truth and evidence
- `PRODUCT_SPEC.md` — current product-specification document already present in the repository
- `docs/DECISION_LOG.md` — why / approved decisions; append-only
- `docs/PROJECT_BLUEPRINT.md` — product thesis and validation framework
- `docs/TECHNICAL_FOUNDATION.md` — implementation boundaries
- `docs/BUILD_PLAN.md` — authorised sequence and gates
- `docs/DEVELOPMENT_WORKFLOW.md` — Git/process rules
- `docs/AI_EXECUTION_PROTOCOL.md` — AI execution routing
- `docs/CLAUDE_SKILLS_POLICY.md` — skill/plugin adoption policy

## Development principle

> **Build the smallest verified workflow that helps an owner know what deserves attention, why it
> matters, what is missing, and what the next legitimate action is.**

Do not turn the broad vision into a collection of modules merely because those modules may eventually
exist.
