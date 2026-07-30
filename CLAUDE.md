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

## Current implementation authority

Phase 1A foundation-prototype coding is authorised.

The prototype stack in `docs/TECHNICAL_FOUNDATION.md` is selected for implementation unless the founder explicitly changes it.

This does not approve:

- final branding;
- final commercial architecture;
- direct government filing;
- automatic tax conclusions;
- legal or CPA representation;
- a nationwide rules database;
- a first operational vertical;
- CaféOS as the market;
- DUO BREW as a pilot.

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
