# Phase 1A Build Plan

## Working rules

1. Complete one gated slice at a time.
2. Do not call a milestone complete because its schema, documentation, or tests were written.
3. Do not add later features merely because their future need is obvious.
4. User-facing names are **Stocks & Operations**, **Permits & Compliance**, and **Taxes & Records**. Internal package names may remain technical, but internal codenames must not appear in public UI.
5. The dashboard follows the shared action model:

   > What needs attention → why → missing information → bounded next action → owner decision → outcome.

6. AI may explain, summarise, prioritise, and draft. Deterministic rules, source-backed facts, permissions, and owner confirmation control high-impact outcomes.
7. No legal or tax rule is “verified” without a primary source, effective date, applicability conditions, and last-reviewed date.
8. The database suites now run in CI (DL-053), so the SQL freeze that rule imposed no longer applies for that reason. Phase gate B still governs what may be built next.

## Status legend

- `VERIFIED`
- `IMPLEMENTED_UNVERIFIED`
- `DOCUMENTED_ONLY`
- `PLANNED`
- `RESEARCH_REQUIRED`
- `OUT_OF_SCOPE`
- `SUPERSEDED`

## Phase gate A — Documentation and claim repair

**Status: open.** Documentation and claim alignment is complete. The public UI label replacement is not. Phase gate A as a whole stays open until the internal codenames no longer render publicly — the authenticated dashboard still shows `Start & Comply` and `Operate & Decide`.

- [x] Replace the exact-peso-loss validation rule with incident-and-behaviour validation.
- [x] Replace the universal daily-sales spine with an evidence spine.
- [x] Define the shared action model and AI-assisted dashboard.
- [x] Add evidence-status and anti-hallucination rules.
- [x] Add explicit current-phase exclusions.
- [ ] Update public UI labels so internal codenames do not appear. Still open: internal labels still render in the application.
- [x] Correct commit/milestone-facing descriptions that imply the buying assistant is implemented — corrected through DL-050 and the current documentation. Historical commit titles remain unchanged, because commit history is not rewritten.
- [x] Update `CLAUDE.md` to carry the same evidence-status and scope rules.

**Exit condition:** A reader can distinguish current code, unverified code, approved plans, hypotheses, and exclusions without inspecting the entire history.

## Phase gate B — Database verification before more feature SQL

**Status: database-verification portion `VERIFIED`; three application items still open, so the gate as a whole is not complete.**

Database verification (complete — see DL-053):

- [x] Run all existing pgTAP suites in CI.
- [x] Ensure the job uses a repeatable disposable database environment.
- [x] Execute positive and negative cases for `tracked_items` and `daily_sales`.
- [x] Prove that a deliberately broken RLS policy makes CI fail.
- [x] Verify audit-event audience parity and metadata behaviour.
- [x] Resolve any false-positive or unreachable security assertions.
- [x] Record the exact assertion count and environment in the decision log.

Application items (still open — none of these was in scope for the database work). Each now has an approved design in DL-055 and is `DOCUMENTED_ONLY`: decided and designed, with no code implementing it.

- [ ] Add an authenticated business-creation cap or another documented abuse ceiling before public testing. **Approved design (DL-055):** at most three businesses whose status is not `closed` per authenticated owner, enforced server-side. This is an abuse-control rule, not pricing or subscription packaging. Status `DOCUMENTED_ONLY`.
- [ ] Validate OTP `type` through an allow-list before calling `verifyOtp`. **Approved design (DL-055):** an explicit runtime allow-list derived only from the authentication flows NegosyoOS actually supports and from the `token_hash` and `type` contract of the `/auth/confirm` route. Status `DOCUMENTED_ONLY`.
- [ ] Remove build-time dependence on externally downloaded fonts or explicitly accept and test that dependency. **Approved design (DL-055):** replace `next/font/google` with a system-font stack. Status `DOCUMENTED_ONLY`.

**Exit condition:** Every current migration is reproducible from zero and the full database test suite passes in CI. One intentional security regression has been shown to turn CI red.

**Database exit condition met on 2026-08-04.** Seven migrations applied from zero and 239 assertions across five suites passing on a disposable local stack, Supabase CLI 2.111.0, no hosted-project access ([run 30829590044](https://github.com/jusbreakindacycle/negosyo-os/actions/runs/30829590044)). A deliberate `daily_sales_select_member` regression, applied to the CI database only on a since-deleted branch, turned the job red on exactly the five predicted assertions ([run 30831767471](https://github.com/jusbreakindacycle/negosyo-os/actions/runs/30831767471)). The gate stays open until the three application items above are done.

**Phase gate B remains open.** Milestone 2C does not begin until the system-font replacement, the OTP allow-list, and the three-business ceiling are implemented and verified. Phase gate A also remains open on its public UI label item, which is tracked separately above.

---

## Milestone 0 — Repository and application scaffold

**Status: `VERIFIED`**

Previously completed:

- Next.js App Router, TypeScript, Tailwind, `src/`, ESLint, lockfile;
- Supabase client and SSR packages;
- basic CI for application lint, type check, tests, and build;
- mobile-first shell.

No rebuild is authorised unless a defect is found.

## Milestone 1 — Authentication and business tenancy

**Status: core paths previously verified; the database regression requirement is complete (DL-053).**

Previously completed:

- profiles, businesses, memberships, owner role;
- sign-up, sign-in, sign-out, session handling;
- business onboarding and switcher;
- membership-based RLS pattern;
- minimal audit model.

Standing tenancy rule:

> A person reaches a business through `business_memberships` and through nothing else.

**Exit condition:** Retained, and its database regression requirement is met. The suites run in CI and have been observed failing when tenant isolation breaks (DL-053). This closes Milestone 1's database regression requirement only. It does not close Phase gate B, which stays open on its three application items.

## Milestone 2 — First end-to-end Stocks action slice

**Current status: partial database foundation only.**

### 2A. Existing backend work

- [x] Business `legal_name` and lifecycle `status` migration exists.
- [x] Tracked-priority-item migration exists.
- [x] Daily-sales migration and RPCs exist.
- [x] Positive behavioural tests verified in CI (DL-053).
- [ ] User-facing Stocks route and screens.
- [ ] Reorder or purchase recommendation.

### 2B. Operator validation before recommendation logic

The third interview is useful, but an exact peso figure is not required.

- [ ] Ask for the most recent concrete stockout, overbuy, waste, forgotten purchase, unavailable item, or supplier-visit uncertainty.
- [ ] Record how often it happens.
- [ ] Record what information was missing at decision time.
- [ ] Record the current workaround.
- [ ] Ask whether the operator would maintain 8–12 priority items.
- [ ] Ask who would count and how long counting may take.
- [ ] Confirm supplier visit/order cadence, lead time, pack size, and minimum order quantity.
- [ ] Check whether the franchisor already provides an ordering tool and whether third-party tools are allowed.
- [ ] Run a lightweight Messenger, form, or spreadsheet habit test before adding broad automation.

### 2C. Smallest usable workflow

**Not authorised yet.** Milestone 2C does not begin until the three Phase gate B application items are implemented and verified.

- [ ] Onboard 8–12 priority items only.
- [ ] Record current quantity and unit.
- [ ] Record next supplier visit or expected lead time.
- [ ] Allow a simple manually configured warning level before enough history exists.
- [ ] Show an attention item such as “Milk may not last until the next supplier visit.”
- [ ] Show the facts used and what is still unknown.
- [ ] Add the item to a purchase list.
- [ ] Let the owner confirm, change, snooze, or dismiss the action.
- [ ] Record the owner decision and later outcome.
- [ ] Test on a real 360px Android viewport.
- [ ] Keep the normal daily workflow under two minutes; target under 30 seconds only for a single simple entry, not for every business workflow.

### 2D. Optional evidence after the basic loop works

- [ ] Record delivery/receiving.
- [ ] Record purchase and cash outflow.
- [ ] Record spoilage, waste, or item-unavailable events.
- [ ] Record daily gross sales when useful.
- [ ] Confirm before correcting an existing daily-sales date.
- [ ] Flag unusual sales values only after a defensible baseline exists; never block legitimate outliers.
- [ ] Calculate days-to-stockout only when units and usage evidence are compatible.
- [ ] Show recommendation confidence and missing data.
- [ ] Add deterministic calculation tests.

### 2E. Minimal action dashboard

- [ ] Replace placeholder/codename cards with user-facing product areas.
- [ ] Add a “Needs attention” section.
- [ ] Each card shows: issue, reason, next action, source facts, freshness, and unknowns.
- [ ] AI may produce a plain-language daily summary from already-authorised action cards.
- [ ] AI must not create a stock fact, legal obligation, tax amount, or permission.
- [ ] Every AI suggestion links back to the underlying records or rule result.

**Milestone 2 exit condition:** One operator can complete the full priority-item flow, understand why an item needs attention, decide what to buy, and record whether the action helped. The workflow must function without requiring an exact peso-loss calculation or a complete inventory.

**Stop condition:** If three accessible operators experience no recurring purchase/availability problem, refuse the priority-item habit, or find the action cards useless after a realistic trial, stop expanding this Stocks slice and reconsider the wedge.

---

## Milestone 3 — Secure document and evidence vault

**Status: `PLANNED`**

Build before any permit feature that depends on proof of submission.

- [ ] Private storage bucket.
- [ ] Document metadata and links.
- [ ] Business-scoped RLS and signed access.
- [ ] Upload, view, download, replace, and remove.
- [ ] File-size and file-type controls.
- [ ] Evidence status, issuer/source, issue date, expiry date, checksum where useful.
- [ ] Audit events and unauthorised-access tests.
- [ ] Retention and account-deletion policy.

**Exit condition:** A submission receipt or official document can be stored privately, traced to its source, and referenced by a rule without making the file public.

## Milestone 4 — Permits and compliance action slice

**Status: `PLANNED`; legal details remain source-dependent.**

- [ ] Create a generic compliance case.
- [ ] Add tasks, dependencies, blockers, responsible person, and next action.
- [ ] Record requirement source, jurisdiction, business context, effective date, and last verification date.
- [ ] Record fee as official, professional/service, third-party, or unknown.
- [ ] Record temporary, conditional, issue, and expiry dates.
- [ ] Preserve unknowns rather than inventing an answer.
- [ ] Support owner-appointed representative authority with scope and expiry.
- [ ] Use the document vault for assessments, receipts, and submissions.
- [ ] Add Setup mode and an explicit owner-controlled operating-status transition.

### RA 11032 boundary

- [ ] Track the agency’s published classification and processing period only when supported by the applicable Citizen’s Charter or other current official source.
- [ ] Record completeness evidence and required-payment evidence.
- [ ] Do not infer automatic approval merely because time passed.
- [ ] Deadline alerts should initially recommend review or escalation, not declare a permit approved.
- [ ] Defer a generated legal demand letter until the template, trigger conditions, and disclaimers have qualified legal review.

The law’s automatic-approval condition requires submitted documentary requirements and paid fees; transaction-specific classification and other conditions still matter. The product must represent those conditions rather than reduce the law to a universal countdown.

### BMBE boundary

- [ ] Non-binding screening only.
- [ ] Separate enterprise size, eligibility assessment, application, Certificate of Authority, tax treatment, and each claimed benefit.
- [ ] Never activate a benefit from screening alone.
- [ ] Keep BMBE income-tax exemption and the 8% option from being presented as simultaneously available.
- [ ] Require current official evidence and, when necessary, professional review.

**Exit condition:** An owner or authorised representative can see what is done, blocked, missing, due, evidenced, and next—without the application guaranteeing approval or inventing a rule.

## Milestone 5 — Taxes and records action slice

**Status: `PLANNED`; rules must be reverified at implementation time.**

- [ ] Capture taxpayer type, registration facts, applicable tax types, and evidence source.
- [ ] Show record completeness by period.
- [ ] Calculate only from eligible, complete, and clearly scoped inputs.
- [ ] Show missing days, source coverage, assumptions, and last rule verification date.
- [ ] Provide threshold monitoring as an early-warning estimate, not a legal conclusion.
- [ ] Provide percentage-tax or 8% comparisons only when eligibility conditions are known.
- [ ] Require owner review and professional confirmation for high-impact choices.
- [ ] Add deterministic calculation tests and adversarial numeric cases.
- [ ] Never prepare, sign, submit, or pay a return in Phase 1A.

Daily sales is required for sales-based tax estimates, but Taxes must not depend on the Stocks UI or assume that inventory data proves tax completeness.

**Exit condition:** The owner can see what records are missing, what estimate can safely be made, what assumptions were used, and what must be confirmed before filing.

## Milestone 6 — Unified dashboard and bounded AI assistance

**Status: `PLANNED`; built incrementally from M2 onward.**

- [ ] Aggregate domain-produced action cards into Today, Upcoming, Waiting, and Review.
- [ ] Preserve domain ownership: the dashboard reads actions; it does not become a universal write engine.
- [ ] Prioritisation is deterministic where urgency is rule-based.
- [ ] AI may summarise and explain the already-produced cards.
- [ ] AI output contains source links, unknowns, and a bounded next action.
- [ ] No LLM has direct database write authority.
- [ ] High-impact changes require explicit confirmation and server-side authorisation.
- [ ] Log model, prompt version, source record IDs, and confirmation where appropriate.
- [ ] Provide a non-AI fallback for every required workflow.

**Exit condition:** The dashboard remains useful when AI is disabled, and AI makes it easier to understand rather than changing the underlying truth.

## Milestone 7 — Supervised field test and operational readiness

- [ ] Fictional demo data clearly labelled.
- [ ] Onboarding and recording-burden test.
- [ ] Feedback capture without sensitive records.
- [ ] Error, loading, and not-found states.
- [ ] Basic observability and privacy review.
- [ ] Low-width, slow-network, keyboard, and accessibility testing.
- [ ] Export one operations action trail and one compliance case.
- [ ] Field-test script and success measures.
- [ ] Confirm whether owners return without founder prompting.
- [ ] Ask willingness to pay only after the workflow has demonstrated value.

**Exit condition:** Ready for supervised prototype testing, not production launch.

## Post-validation packaging

Only after the core workflow survives field testing:

- web app manifest and icons;
- installability;
- safe application-shell caching;
- connectivity indicator;
- TWA/Play Store evaluation;
- subscription billing evaluation.

Offline writes, background sync, and native application work remain deferred until conflict rules are proven.

## Explicitly out of scope for Phase 1A

- nationwide authoritative requirement database;
- direct government filing, payment, signing, or portal automation;
- automatic approval claims or unreviewed demand letters;
- automatic BMBE certification or tax-benefit activation;
- full tax return preparation;
- registered bookkeeping or accounting system;
- full POS;
- payroll and HR;
- banking, lending, insurance, or investment products;
- logistics marketplace;
- professional marketplace;
- all vertical packs;
- full job/order engine before job-centred discovery;
- multi-branch complexity;
- autonomous AI agents;
- unrestricted general-purpose chatbot;
- complex offline writes;
- subscription billing and final pricing;
- production launch;
- final shared inventory/jobs abstraction.

## Post-Phase 1A discovery candidate

Interview the B2B air-conditioning services operator before implementing quotations, work orders, technician assignment, equipment history, completion evidence, invoicing, receivables, collections, or recurring maintenance. These remain hypotheses until operator-confirmed.
