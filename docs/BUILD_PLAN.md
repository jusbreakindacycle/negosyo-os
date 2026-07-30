# Phase 1A Build Plan

## Working rule

Complete one milestone at a time. Do not build later features merely because their future need is obvious.

## Milestone 0 — Repository and application scaffold

- [ ] Confirm clean Git status.
- [ ] Initialise Next.js with TypeScript, App Router, Tailwind, `src/`, ESLint, and `@/*`.
- [ ] Add shadcn/ui using the current supported setup.
- [ ] Add Supabase client and SSR packages using current official guidance.
- [ ] Create `.env.example`.
- [ ] Add basic CI for lint, type check, test, and build.
- [ ] Create mobile-first public placeholder and authenticated app shell.
- [ ] Record exact installed versions in the lockfile, not in product prose.

**Exit condition:** Development server, lint, type check, tests, and production build pass.

## Milestone 1 — Authentication and business tenancy

- [ ] Configure Supabase local or linked development workflow.
- [ ] Add initial migrations for profiles, businesses, and memberships.
- [ ] Enable RLS.
- [ ] Add owner role.
- [ ] Implement sign-up, sign-in, sign-out, and session handling.
- [ ] Create business onboarding.
- [ ] Create business switcher for authorised businesses.
- [ ] Add cross-business isolation tests.
- [ ] Add minimal audit event model.

**Exit condition:** An owner can create a business and cannot access another owner’s business.

## Milestone 2 — Unified dashboard and domain navigation

- [ ] Create mobile-first app navigation.
- [ ] Create one business dashboard with two clear workspaces:
  - Start & Comply
  - Operate & Decide
- [ ] Show current business and evidence-status language.
- [ ] Add empty states that explain each domain in plain language.
- [ ] Avoid final visual branding.

**Exit condition:** A normal owner can explain the difference between the two workspaces after using the interface.

## Milestone 3 — Secure document vault

- [ ] Create private storage bucket.
- [ ] Add document metadata and linking tables.
- [ ] Add RLS and signed-file access.
- [ ] Upload, view, download, and remove a document.
- [ ] Record document category and evidence status.
- [ ] Add file-size and file-type validation.
- [ ] Add audit events.
- [ ] Test unauthorised access.

**Exit condition:** Documents are private by default and can be linked to either domain without duplicating the file.

## Milestone 4 — Start & Comply reference slice

Build a generic case tracker informed by the Pasig car-tint installation-services experience.

- [ ] Create compliance case.
- [ ] Add task or requirement.
- [ ] Assign owner or representative.
- [ ] Record evidence status.
- [ ] Record fee type:
  - official;
  - service;
  - third-party;
  - unknown.
- [ ] Attach assessment or receipt.
- [ ] Add temporary, conditional, and expiry dates.
- [ ] Add timeline event.
- [ ] Display current next action.
- [ ] Display unknowns without inventing an answer.
- [ ] Add tests for representative access limits.
- [ ] Add a BMBE screening profile that can return only:
  - potentially eligible;
  - likely not eligible based on supplied information;
  - insufficient information;
  - professional or official review required.
- [ ] Record dated asset snapshot and evidence status.
- [ ] Exclude land from the displayed statutory asset computation.
- [ ] Capture possible professional-services exclusion.
- [ ] Store Certificate of Authority details separately from screening.
- [ ] Track issue, expiry, and renewal dates.
- [ ] Record claimed BIR tax treatment separately from certificate status.
- [ ] Warn when BMBE income-tax exemption and the 8% income-tax option appear inconsistent.
- [ ] Add tests proving that screening does not activate certification or tax exemption.

**Exit condition:** A handoff recipient can see completed steps, pending steps, authority, documents, fees, dates, unknowns, and the next action. A business can also be screened and tracked for BMBE without the application issuing a certificate or declaring a tax exemption.

## Milestone 5 — Operate & Decide reference slice

Build the priority-stock and purchasing loop informed by DUO BREW in Mandaluyong City.

- [ ] Create tracked priority item.
- [ ] Record unit and latest count.
- [ ] Create purchase need.
- [ ] Owner approves, changes, or rejects.
- [ ] Record purchase and outflow.
- [ ] Attach receipt.
- [ ] Record receiving quantity.
- [ ] Calculate expected quantity.
- [ ] Record later actual count.
- [ ] Expose discrepancy.
- [ ] Record bounded owner action.
- [ ] Record outcome.
- [ ] Add deterministic calculation tests.

**Exit condition:** The workflow connects stock, purchase decision, cash outflow, receipt, receiving, discrepancy, action, and verified outcome.

## Milestone 6 — PWA baseline and mobile hardening

- [ ] Add web app manifest.
- [ ] Add icons and installability requirements.
- [ ] Add connectivity indicator.
- [ ] Add safe application-shell caching.
- [ ] Test common low-width viewports.
- [ ] Test slow network behaviour.
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
