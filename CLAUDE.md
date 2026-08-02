# Claude Code Instructions

## Read first

Before planning or editing, read in this order:

1. `README.md`
2. `docs/PROJECT_BLUEPRINT.md`
3. `docs/TECHNICAL_FOUNDATION.md`
4. `docs/BUILD_PLAN.md`
5. `docs/DECISION_LOG.md`

## Repository authority

This repository is the single active repository for the unified NegosyoOS PH product.

The old standalone BusinessOS repository is legacy material and must not be treated as an active dependency or source of authority unless the founder explicitly provides a file for migration review.

## Product rule

This is one application with two bounded domains:

- `start-comply`
- `operate-decide`

Keep shared platform services separate from domain-specific rules.

Do not collapse the application into one generic ERP, POS, accounting, tax, legal, and permit module.

### Naming

`Start & Comply` and `Operate & Decide` are internal codenames. **They must never appear in the interface.** The three features the owner sees are:

| Internal name | User-facing name | The owner's question |
| --- | --- | --- |
| Operate & Decide | **Stocks** | *Ano bibilhin ko, magkano, kailan?* |
| Start & Comply | **Permits** | *Ano kailangan kong ayusin, kailan ang deadline?* |
| Tax readiness | **Taxes** | *Magkano kaya babayaran ko?* |

Taxes is not a third engine. It is the intersection of the other two: operations captures the money data, compliance knows the deadlines, tax is what falls out. That intersection is the reason both domains live in one application.

### The data spine

The owner enters data once — daily gross sales as a single number, purchases and expenses with receipt, and weekly counts of priority items only. Stocks, Permits, and Taxes are all outputs of that one spine.

The single daily gross-sales figure is load-bearing. It is not a POS. Without it the product cannot compute anything tax-related.

## Current implementation authority

Phase 1A foundation-prototype coding is authorised.

Milestones **M0** (scaffold) and **M1** (authentication, tenancy, RLS, audit spine) are complete. **M2 (Stocks)** is the current milestone. The order was corrected against the real repository on 2026-08-02; see DL-025 and `docs/BUILD_PLAN.md`.

The prototype stack in `docs/TECHNICAL_FOUNDATION.md` is selected for implementation unless the founder explicitly changes it. Where that document and `docs/PROJECT_BLUEPRINT.md` v2.0 disagree, **the blueprint is authoritative** and the technical foundation is the document to correct.

This does not approve:

- final branding;
- final commercial architecture;
- direct government filing;
- automatic tax conclusions;
- legal or CPA representation;
- a nationwide rules database;
- subscription billing.

### Unresolved: the first operational vertical

`docs/PROJECT_BLUEPRINT.md` v2.0 names the coffee shop reference case as the selected first vertical. DL-006, an approved project constraint, records the first vertical as **unselected** and states that the DUO BREW workflow does not select CaféOS.

These conflict. The conflict is recorded rather than resolved, because superseding an approved constraint is a founder decision and needs its own decision-log entry. Until that entry exists, treat the coffee shop as the **reference case being built against**, not as an approved market selection, and do not write "first vertical selected" into product prose.

## Coding discipline

- Work in small vertical slices.
- Complete one task from `docs/BUILD_PLAN.md` at a time.
- Show the exact plan before broad changes.
- Prefer plain, maintainable code over clever abstractions.
- Avoid premature generic engines.
- Avoid unnecessary packages.
- Avoid unnecessary Markdown files.
- Do not create one task file per feature.
- Do not redesign unrelated areas.
- Do not commit or push automatically.
- Never expose secrets or service-role keys to the browser.
- Use database migrations for schema changes.
- Enable and test Row Level Security for every exposed table.
- Verify RLS against a real database. A passing test is only evidence if the negative case has been observed to fail for the intended reason (DL-026).
- Treat document access as sensitive by default.
- Keep domain language understandable to ordinary business owners.

## Domain boundaries

### Start & Comply may

- organise requirements, tasks, documents, fees, dates, statuses, and evidence;
- guide owner or representative handoffs;
- explain confirmed documents and official sources;
- prepare self-service checklists;
- escalate high-risk questions.

It must not:

- guarantee approval;
- invent fees or requirements;
- automatically declare full compliance;
- impersonate government;
- present AI as a lawyer or CPA;
- perform direct filing unless later researched and approved;
- automatically declare BMBE eligibility, certificate validity, or income-tax exemption;
- treat a self-reported asset amount as an official eligibility determination.

### Operate & Decide may

- record operational movements;
- compare expected and actual;
- expose shortages or discrepancies;
- recommend bounded owner actions;
- record decisions and outcomes;
- export owner-confirmed records.

It must not:

- call operational records registered accounting books;
- automatically decide tax deductibility;
- accuse a person of theft or fraud from an anomaly;
- force businesses to replace an existing POS.

Stocks leads with the **buying decision**, not the variance report. The primary output is *"Beans: about 3 days left. Order 8 kg — that's your usual week."* Variance is secondary and appears only once a baseline exists. An owner who has never measured a loss will not believe a loss report, but will believe a stockout prediction, because they can check it on Thursday.

Onboarding must never require entering a full inventory: 8–12 priority items only. If first-run setup exceeds 20 minutes, the notebook wins.

### Taxes may

- total gross sales and show the position against the ₱3,000,000 VAT threshold;
- estimate percentage tax and show which BIR form it relates to;
- compare the 8% option against graduated rates as an estimate for discussion.

It must not:

- state an amount owed as fact;
- elect a tax option on the owner's behalf;
- prepare or submit a filing;
- present an estimate without its confirm-with-your-accountant boundary.

The boundary is organise and estimate, never assert and file:

- correct: *"Gross sales this quarter: ₱612,400. At 3%, percentage tax would be about ₱18,372. Confirm with your accountant before filing."*
- wrong: *"You owe ₱18,372. File 2551Q now."*

### RA 11032 statutory clock

The defensible part of Permits is not a checklist; it is RA 11032 enforcement. The application may record the date of complete submission with its receipt, classify a transaction into the 3 / 7 / 20 working-day buckets under §5, count working days, alert when the statutory deadline passes, and generate the §9 written demand for the deemed-approved document.

It must not present the deemed-approved remedy as automatic, guarantee that a demand will succeed, or file anything on the owner's behalf.

## Evidence labels

Use these labels in documentation, seeded reference content, and high-impact AI explanations:

- Approved founder decision
- Approved project constraint
- Founder direction
- Firsthand user observation
- Operator-reported evidence
- Verified external fact
- Public product claim
- Analyst inference
- Proposal
- Unknown
- Pending verification
- Professional review required

Never upgrade the status of a statement silently.

## BMBE guardrails

BMBE means Barangay Micro Business Enterprise under RA 9178. It is not an alternative market outside MSMEs; it is a special certification or status potentially available to qualified micro enterprises.

**Placement:** BMBE is one path inside Permits, delivered in M3. It is not a headline feature and not a separate engine. It sits in the free tier, because the same information is available free from Negosyo Centers and competing against free is unwinnable. The guardrails below stand unchanged (DL-010).

The application may:

- collect an owner-provided eligibility profile;
- record an asset snapshot and its evidence;
- flag that the business may appear eligible;
- store the DTI or Negosyo Center Certificate of Authority;
- track certificate issue and expiry dates;
- record whether BIR treatment has been confirmed;
- warn that BMBE income-tax exemption and the 8% income-tax option require careful compatibility checking.

The application must not:

- issue or imitate a BMBE Certificate of Authority;
- automatically certify eligibility;
- automatically activate an income-tax exemption;
- treat land as part of the statutory asset ceiling calculation;
- assume every service business qualifies;
- hide the professional-services exclusion;
- assume that BMBE removes all taxes, registrations, books, invoices, employee obligations, or LGU requirements.

## Business-classification model

Keep these dimensions separate:

- legal form, such as sole proprietorship, partnership, corporation, or cooperative;
- enterprise size, such as micro, small, medium, or larger;
- certifications and incentive statuses, including BMBE;
- tax registrations or treatments;
- operating model, such as inventory-centred, job-centred, or mixed;
- customer model, such as B2C, B2B, government, or mixed.

A business serving corporations or banks may still itself be a micro, small, or medium enterprise. Client size does not determine the service provider's enterprise size.

Reference-case locations:

- DUO BREW: Mandaluyong City;
- car-tint installation services: Pasig City;
- air-conditioning installation, cleaning, and repair: B2B service case with mostly corporate and bank clients; exact operating details remain pending interview.

## Tenancy rule

Established in M1 and binding on every table added afterwards:

> A person reaches a business through `business_memberships` and through nothing else.

- No other column, anywhere, confers access.
- No development-only business identifier, seeded owner, or bypass may stand in for a real membership.
- `authenticated` holds **no write privilege** on any table. Every write goes through a `SECURITY DEFINER` function with an empty `search_path`, so grants and policies fail independently and a mistake in one does not open the other.
- Identity inside those functions comes from `auth.uid()` only, never from a parameter. A function that takes a user id is a function that can be impersonated through.
- Reuse `private.is_business_member()` rather than copying the membership predicate into each policy, where one copy could drift.

## Architecture guardrails

- Keep the first codebase as one Next.js application.
- Use feature-oriented folders, not a monorepo.
- Shared services may be reused by both domains.
- Domain rules must not directly import private internals from the other domain.
- Cross-domain data transfer must use explicit, typed service boundaries.
- Do not resolve the long-term inventory-versus-jobs architecture through premature abstraction.
- Build the concrete reference workflows first.

## Required checks before reporting completion

Run the available equivalents of:

- type checking;
- linting;
- unit tests added for the change;
- production build;
- relevant end-to-end tests when applicable.

Report:

1. files changed;
2. database migrations added;
3. tests run;
4. known limitations;
5. security or RLS implications;
6. next build-plan task.

Do not claim a task is complete if the build or required tests fail.
