# Phase 1A Build Plan

**Native mobile only since DL-056.**

This plan describes authorised implementation sequence. It does not authorise work merely because a
future milestone is written here.

## Working rules

1. Complete one gated slice at a time.
2. A schema, screen, test, or document is not a completed user workflow by itself.
3. Do not build future capabilities merely because they are foreseeable.
4. Public product areas are Stocks & Operations, Permits & Compliance, and Taxes & Records.
5. The shared action model is:

   > What needs attention → why → missing information → bounded next action → owner decision → outcome.

6. Deterministic rules and source-backed facts control authoritative outcomes.
7. AI explains and assists; it does not decide.
8. Schema changes are additive migrations only.
9. Applied migrations are never edited.

## Status legend

- `VERIFIED`
- `IMPLEMENTED_UNVERIFIED`
- `DOCUMENTED_ONLY`
- `PLANNED`
- `RESEARCH_REQUIRED`
- `OUT_OF_SCOPE`
- `SUPERSEDED`

## Phase Gate A — Documentation and claim repair

**CLOSED on 2026-08-13.**

Completed:

- evidence-status rules;
- anti-hallucination rules;
- incident-and-behaviour validation;
- evidence-spine rule;
- shared action model;
- mobile-only public UI labels;
- correction of claims that the buying assistant already existed.

The native dashboard now renders the public product-area names.

## Phase Gate B — Database/application safety

**CLOSED for its defined application items.**

### Database verification

Verified under DL-053 and subsequent CI runs.

### Application items

- [x] Three-business ceiling — implemented and verified in CI (`b52def1`, PR #15, run
      `31622986650`).
- [x] OTP runtime allow-list — carried into the native typed-email verification path under DL-058/DL-059.
- [x] Former web-font item — superseded by the native-mobile pivot under DL-056/DL-059.

## Milestone 0M — Native mobile foundation

**Implemented, but physical-device verification remains outstanding.**

The repository contains the Expo Router mobile foundation, authentication, tenancy, and lifecycle
onboarding code.

No rebuild is authorised unless a verified defect requires it.

## Milestone 1 — Authentication, tenancy, lifecycle

Database behaviour is verified in CI.

Client-side behaviour remains `IMPLEMENTED_UNVERIFIED` until the physical-device walkthrough is
completed.

The lifecycle model keeps:

- business lifecycle status;
- registration status

as separate dimensions.

Registration status is an owner self-declaration, not proof of compliance.

## Milestone 2 — Stocks validation wedge

### Status

**Direction retained. Implementation not currently authorised.**

Stocks is the first validation wedge because the repository has a concrete operational reference case
and recurring purchasing/availability problems. It is not a narrowing of the overall product into a
coffee-shop app.

### Operator validation

Before building recommendation logic, validate:

- recent stockout/overbuy/waste/forgotten-purchase incidents;
- frequency;
- missing information at decision time;
- current workaround;
- willingness to maintain 8–12 priority items;
- who performs the count;
- supplier cadence;
- lead time;
- pack/MOQ constraints;
- whether an incumbent/franchisor ordering tool already exists;
- whether a lightweight Messenger/form/spreadsheet habit test works.

Exact peso loss is useful but is **not required**.

### Smallest usable Stocks workflow

When explicitly authorised by a founder decision:

- onboard 8–12 priority items;
- record current quantity and unit;
- record supplier timing;
- allow a simple warning threshold;
- surface an attention item;
- show facts used and unknowns;
- add to purchase list;
- allow confirm/change/snooze/dismiss;
- record outcome;
- test on a real Android viewport.

Do not build a full inventory/warehouse system.

## Milestone 2C gate

Milestone 2C is **gated** by the outstanding verification work in `PROJECT_STATE.md`.

Those verification gates are not a sequence and closing them does not itself authorise Stocks.

A founder decision must explicitly designate the next implementation task.

## Long-term domain work

The Master Handoff preserves these as future direction:

- business profile/context;
- requirement model;
- applicability;
- national/local jurisdiction;
- PSGC-compatible geography;
- structured authoritative knowledge;
- evidence;
- business journey.

### Rule-engine constraint

Do not build a generic applicability engine before at least two concrete workflows demonstrate the
shared behaviour.

### Knowledge constraint

Do not build a searchable article library. Structured authoritative rule/provenance data may be
built when an authorised workflow consumes it.

### BMBE constraint

BMBE is a later program/eligibility case. Do not make it the architecture.

## Milestone 3 — Evidence/document capability

`PLANNED`.

Only build when an authorised workflow actually needs private evidence storage.

## Milestone 4 — Permits & Compliance

`PLANNED`.

The workflow must model source, jurisdiction, effective date, applicability conditions, evidence,
blockers, and next actions. It must not guarantee approval.

## Milestone 5 — Taxes & Records

`PLANNED`.

Calculations must be deterministic, versioned, scoped, tested, and based on current authoritative
rules. Estimates are not final liability.

## Product-wide stop rule

If validation shows that the accessible target operators do not experience the recurring problem,
will not maintain the minimum data habit, or find the proposed action useless after a realistic
trial, stop or redesign the slice instead of expanding it.
