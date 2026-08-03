# Phase 1A Build Plan

## Working rule

Complete one milestone at a time. Do not build later features merely because their future need is obvious.

Milestone numbering was corrected against the actual state of the repository on 2026-08-02. Authentication and tenancy were built before Stocks, and are retained rather than rebuilt. See DL-025.

User-facing names are **Stocks**, **Permits**, and **Taxes**. `Start & Comply` and `Operate & Decide` are internal codenames and must never appear in the interface.

## Milestone 0 — Repository and application scaffold ✅ Complete

- [x] Confirm clean Git status.
- [x] Initialise Next.js with TypeScript, App Router, Tailwind, `src/`, ESLint, and `@/*`.
- [x] Add shadcn/ui using the current supported setup.
- [x] Add Supabase client and SSR packages using current official guidance.
- [x] Create `.env.example`.
- [x] Add basic CI for lint, type check, test, and build.
- [x] Create mobile-first public placeholder and authenticated app shell.
- [x] Record exact installed versions in the lockfile, not in product prose.

**Exit condition:** Development server, lint, type check, tests, and production build pass. — met.

## Milestone 1 — Authentication and business tenancy ✅ Complete

- [x] Configure Supabase local or linked development workflow.
- [x] Add initial migrations for profiles, businesses, and memberships.
- [x] Enable RLS.
- [x] Add owner role.
- [x] Implement sign-up, sign-in, sign-out, and session handling.
- [x] Create business onboarding.
- [x] Create business switcher for authorised businesses.
- [x] Add cross-business isolation tests.
- [x] Add minimal audit event model.

**Exit condition:** An owner can create a business and cannot access another owner's business. — met, and verified against a real Supabase instance rather than asserted.

Tenancy rule established here and binding on every later milestone: **a person reaches a business through `business_memberships` and through nothing else.** No later table may introduce a second route to access, and no development shortcut may stand in for a real membership.

## Milestone 2 — Stocks

The priority-stock and buying loop, informed by DUO BREW in Mandaluyong City. Primary output is a purchase recommendation, not a variance report.

- [x] Extend `businesses` with `legal_name` and lifecycle `status`.
- [x] Create tracked priority item with unit and pack size.
- [ ] Onboard 8–12 priority items only, never a full inventory.
- [ ] Record a stock count.
- [ ] Record a delivery or receiving event.
- [x] Record **daily gross sales** as one number per day.
- [ ] Confirm before replacing a day that already has a figure — never a silent overwrite (DL-042).
- [ ] Calculate days-to-stockout.
- [ ] Produce a reorder recommendation with quantity.
- [ ] Record the owner's approve, change, or reject decision.
- [ ] Record purchase and cash outflow, with receipt.
- [ ] Calculate expected quantity and expose variance against a later actual count.
- [ ] Record bounded owner action and verified outcome.
- [ ] Add deterministic calculation tests.
- [ ] Add RLS and cross-business isolation tests for every new table.

**Exit condition:** The workflow connects count, delivery, daily sales, reorder recommendation, purchase, discrepancy, action, and verified outcome. Variance appears only once a baseline exists.

**Historical note, not a task.** The daily-sales slice went in as commit `b912c53` on `feature/milestone-2-stocks`, which also carried the DL-027 to DL-040 documentation realignment. That documentation work was already sitting uncommitted in the working tree when the slice began, and could not be split out without interactive staging, which is unavailable in this environment. The branch was squash-merged as `6321534` (PR #4) and deleted, so `b912c53` is not reachable from `main` and no separate documentation commit exists to look for. Recorded so a later reader does not go hunting for one.

## Milestone 3 — Permits, the statutory clock, and Setup mode

A generic case tracker informed by the Pasig car-tint installation-services experience. No business type is out of scope.

- [ ] Create compliance case and registration path.
- [ ] Add task or requirement with dependency blockers.
- [ ] Assign owner or representative.
- [ ] Record evidence status.
- [ ] Record fee type: official, service, third-party, or unknown.
- [ ] Attach assessment or receipt.
- [ ] Add temporary, conditional, and expiry dates.
- [ ] Add timeline event and display the current next action.
- [ ] Display unknowns without inventing an answer.
- [ ] Record date of complete submission with receipt as evidence.
- [ ] Classify each transaction as simple, complex, or highly technical.
- [ ] Count working days against the RA 11032 §5 limits of 3, 7, and 20.
- [ ] Alert the moment a statutory deadline passes.
- [ ] Generate the RA 11032 §9 formal demand letter.
- [ ] Implement Setup mode, in which only the registration path is visible.
- [ ] Implement graduation to Running mode when the mayor's permit is marked issued.
- [ ] Add tests for representative access limits.
- [ ] Add a BMBE screening profile returning only: potentially eligible; likely not eligible based on supplied information; insufficient information; or professional or official review required.
- [ ] Record dated asset snapshot and evidence status.
- [ ] Exclude land from the displayed statutory asset computation.
- [ ] Capture possible professional-services exclusion.
- [ ] Store Certificate of Authority details separately from screening.
- [ ] Track issue, expiry, and renewal dates.
- [ ] Record claimed BIR tax treatment separately from certificate status.
- [ ] Warn when BMBE income-tax exemption and the 8% income-tax option appear inconsistent.
- [ ] Add tests proving that screening does not activate certification or tax exemption.

**Exit condition:** A handoff recipient can see completed steps, pending steps, authority, documents, fees, dates, unknowns, and the next action. A business can be screened and tracked for BMBE without the application issuing a certificate or declaring a tax exemption. The statutory clock runs without claiming a guaranteed outcome.

## Milestone 4 — Secure document vault

Required by Milestone 3: the statutory clock depends on a stored submission receipt.

- [ ] Create private storage bucket.
- [ ] Add document metadata and linking tables.
- [ ] Add RLS and signed-file access.
- [ ] Upload, view, download, and remove a document.
- [ ] Record document category and evidence status.
- [ ] Add file-size and file-type validation.
- [ ] Add audit events.
- [ ] Test unauthorised access.

**Exit condition:** Documents are private by default and can be linked to either domain without duplicating the file.

## Milestone 5 — Taxes

Readiness and estimation only. Organise and estimate, never assert and file.

- [ ] Running total of annual gross sales.
- [ ] ₱3,000,000 VAT threshold monitor with a warning at ₱2.5M.
- [ ] Percentage-tax estimate at 3% of quarterly gross sales, referencing BIR Form 2551Q.
- [ ] 8% versus graduated comparison using recorded expenses, framed as an estimate for discussion.
- [ ] Show every figure with its confirm-with-your-accountant boundary.
- [ ] Add deterministic calculation tests.

**Exit condition:** An owner sees an estimated liability and the ₱3M position without the application electing a tax option, asserting an amount owed, or preparing a filing.

## Milestone 6 — Deadlines, PWA baseline, and packaging

- [ ] Deadline and renewal engine, including the January renewal calendar.
- [ ] Add web app manifest.
- [ ] Add icons and installability requirements.
- [ ] Add connectivity indicator.
- [ ] Add safe application-shell caching.
- [ ] Test common low-width viewports, including 360px.
- [ ] Test slow network behaviour.
- [ ] TWA packaging for Play Store distribution.
- [ ] Do not add offline write synchronisation yet.

**Exit condition:** The prototype is installable and usable as a mobile web application while clearly communicating connectivity state.

## Milestone 7 — Field-test preparation

- [ ] Add demo data that is fictional and clearly labelled.
- [ ] Add onboarding explanation.
- [ ] Add feedback capture without sensitive records.
- [ ] Create export of one compliance case.
- [ ] Create export of one operations decision trail.
- [ ] Review privacy and security gaps.
- [ ] Review recording burden.
- [ ] Prepare interview and usability-test script outside the product code.

**Exit condition:** The app is ready for supervised prototype testing, not production launch.

## Explicitly deferred

- final name and branding;
- nationwide government rules;
- automatic BMBE certification or exemption activation;
- direct filing and payment;
- full tax computation;
- full accounting;
- full POS;
- additional vertical packs;
- native app;
- complex offline writes;
- subscription billing;
- professional marketplace;
- automated AI agents;
- final inventory/jobs shared engine.


## Post-Phase 1A validation candidate

After the inventory-centred workflow has been field-tested, interview the air-conditioning services operator and evaluate a structurally different B2B job workflow.

Possible subjects for validation:

- corporate client sites;
- quotations and approvals;
- work orders;
- technician assignment;
- equipment history;
- parts consumption;
- job-completion evidence;
- invoicing;
- accounts receivable;
- recurring preventive-maintenance contracts.

Do not implement these as confirmed requirements before the operator interview.
