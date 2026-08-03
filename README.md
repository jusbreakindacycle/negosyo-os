# NegosyoOS PH

> **Temporary working name.** Final branding, trademark screening, and market positioning are not yet approved.

## Product statement

**Public-facing**

NegosyoOS PH helps Philippine MSME owners establish and maintain their businesses, meet compliance obligations, control daily operations, and make better decisions through affordable AI-assisted self-service, with human support available when needed.

**Full internal positioning**

NegosyoOS PH helps Philippine micro, small, and medium enterprise owners—including qualified BMBEs, owner-operated establishments, service contractors, and growing B2B businesses—establish and maintain their businesses, meet compliance obligations, control daily operations, and make better decisions through affordable AI-assisted self-service, with authorised representatives and qualified professionals available when needed.

## The three product areas

| Product area | Main owner question | Examples |
| --- | --- | --- |
| **Stocks & Operations** | What needs attention or purchasing? | Low stock, overbuying, waste, forgotten purchases, job materials, unavailable items |
| **Permits & Compliance** | What must I prepare, submit, renew, or follow up? | Requirements, blockers, evidence, appointments, renewals, authorised handoffs |
| **Taxes & Records** | What must I record, review, estimate, or file? | Missing records, filing periods, threshold monitoring, bounded estimates |

These areas share one operating pattern:

> **What needs attention → why it matters → what is missing → what to do next → what happened after.**

The authenticated dashboard is the owner’s action centre. Domain rules and recorded business facts produce attention items. AI may summarise, prioritise, explain, and help prepare a next step. AI does not invent obligations, certify compliance, choose a tax treatment, or silently perform high-impact actions.

## What the product is solving

The first Stocks reference case is not required to name an exact peso loss before its problem is considered real. Confirmed operational pain may appear as:

- running out of ingredients or supplies;
- buying too much;
- spoilage or waste;
- forgetting what to purchase;
- customer embarrassment when an item is unavailable;
- uncertainty before going to a supplier;
- materials missing for an upcoming job.

Peso impact remains useful when available, but it is not the only evidence of a worthwhile problem.

## Evidence and claim status

Every material capability or rule should use one of these labels:

| Label | Meaning |
| --- | --- |
| `VERIFIED` | Implemented and supported by an observed passing test, controlled manual verification, or current primary source |
| `IMPLEMENTED_UNVERIFIED` | Code or migration exists, but the relevant behaviour has not been executed successfully in the required environment |
| `DOCUMENTED_ONLY` | Described or decided, but not implemented |
| `PLANNED` | Approved future work with an entry and exit gate |
| `RESEARCH_REQUIRED` | A legal, regulatory, market, or user claim that still needs evidence |
| `OUT_OF_SCOPE` | Deliberately excluded from the current phase |
| `SUPERSEDED` | Historical decision retained in the log but replaced by a later decision |

A decision is not an implementation. A migration is not a shipped workflow. A written test is not verified until it has run. A roadmap statement is not a public product capability.

## Current repository state

Public `main` was reviewed on **2026-08-03**. The latest listed milestone commit is `6321534`, titled “Milestone 2 — Stocks: tracked items, daily sales, and the buying assistant.” The title is broader than the delivered user capability.

| Area | Current evidence status |
| --- | --- |
| Next.js application scaffold | `VERIFIED` by prior audit checks |
| Authentication and business tenancy foundation | `VERIFIED`; the isolation suites now run in CI on every push and pull request (DL-053) |
| Business lifecycle fields | `VERIFIED` at the database level — columns, enum, and default are asserted in CI; no lifecycle workflow exists in the interface |
| Tracked priority items database | `VERIFIED` at the database level — schema, isolation, and RPC behaviour assert in CI |
| Daily-sales database and RPCs | `VERIFIED` at the database level, positive and negative paths included |
| Stocks screens | `DOCUMENTED_ONLY` |
| Buying/reorder assistant | `DOCUMENTED_ONLY` |
| AI-assisted action dashboard | `DOCUMENTED_ONLY` |
| Permits workflow | `PLANNED` |
| Secure document vault | `PLANNED` |
| Taxes workflow | `PLANNED` |
| Installable PWA/offline workflow | `PLANNED` |

**Milestone 2 is therefore a partial database foundation, not a completed Stocks feature.**

## Immediate build priority

1. ~~Make the database test suites run in CI and prove they fail when isolation is deliberately broken.~~ Done on 2026-08-04: 239 assertions across five suites, seven migrations applied from zero, and a deliberate tenant-isolation regression observed turning CI red on exactly the predicted assertions (DL-053).
2. Correct UI and documentation claims that imply features already exist.
3. Build one end-to-end Stocks action slice on a real 360px Android viewport:
   - configure a small priority-item list;
   - record a count;
   - identify a low or uncertain item;
   - add it to a purchase list;
   - show the reason and missing information;
   - let the owner confirm, change, or dismiss the action;
   - record the outcome.
4. Test the workflow with a real operator before expanding to Permits, Taxes, broad AI, or additional verticals.

Daily gross sales may support tax estimates and some demand models, but it is **not the universal prerequisite for every Stocks or dashboard action**.

## Product boundaries

NegosyoOS PH does not:

- claim to be a government platform;
- guarantee registration, permit, tax, funding, or business outcomes;
- act as a lawyer, CPA, accountant, bookkeeper, engineer, government officer, or authorised representative;
- automatically declare a business compliant, BMBE-qualified, tax-exempt, or eligible for a particular tax treatment;
- invent missing requirements, fees, deadlines, classifications, or legal explanations;
- treat all LGUs, agencies, taxpayers, or MSMEs as identical;
- present operational records as registered books of accounts;
- directly file, sign, pay, or submit to government systems in Phase 1A;
- require an exact peso-loss estimate before validating an operational problem;
- promise exact demand, reorder, or tax outputs when the data is incomplete;
- build a full POS, ERP, payroll, accounting suite, banking product, lending product, marketplace, or professional-services marketplace in Phase 1A.

## Development

```bash
npm install
npm run dev
```

Application checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Database changes are not complete until migrations and pgTAP suites run in a repeatable environment, preferably CI. A linked development project may support investigation, but it is not a substitute for an automated regression gate.

That gate now exists. Every push to `main` or `develop`, and every pull request into them, applies all migrations from zero to a disposable Supabase stack and runs the pgTAP suites, reporting the exact executed assertion count. It needs no hosted-project credentials. Running the suites locally still requires Docker, which is not installed on the founder's machine (DL-026), so CI remains the only place they execute.

## Controlling files

Read these before development:

- [`docs/PROJECT_BLUEPRINT.md`](docs/PROJECT_BLUEPRINT.md) — product authority
- [`docs/TECHNICAL_FOUNDATION.md`](docs/TECHNICAL_FOUNDATION.md) — implementation boundaries
- [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) — authorised sequence and release gates
- [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) — append-only decision history
- [`CLAUDE.md`](CLAUDE.md) — repository working instructions

## Development principle

> Build the smallest verified workflow that helps an owner know what needs attention, why it matters, and what to do next.

Do not build the complete Philippine MSME lifecycle in the first release.
