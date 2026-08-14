# Documentation Reconciliation

**Purpose:** record exactly what was reset/reconciled and prevent another round of stale-document
editing.

## Source hierarchy used

1. Current repository (`main` / current code and executed checks)
2. Latest approved `docs/DECISION_LOG.md`
3. `PROJECT_STATE.md`
4. `PRODUCT_SPEC.md`
5. `docs/PROJECT_BLUEPRINT.md`
6. `docs/TECHNICAL_FOUNDATION.md`
7. `docs/BUILD_PLAN.md`
8. External `NEGOSYOOS_MASTER_HANDOFF.md` for product direction, not repository evidence

The Master Handoff is not treated as a substitute for repository evidence.

## Corrections made by this reset

### 1. Phase Gate A

**Closed.**

The old statement that internal codenames still render in the dashboard is stale. The native
dashboard uses the three public product-area names.

### 2. Phase Gate B

**Closed for its defined application items.**

The three-business ceiling is not an unbuilt task. It is implemented and verified in CI:

- `b52def1`
- PR #15
- CI run `31622986650`

The OTP allow-list is carried into native verification. The old web-font item is superseded by the
mobile pivot.

### 3. Migrations 8–10

Repository CI verification is no longer the uncertainty.

Observed CI run:

- PR #17
- run `31669151317`
- ten migrations from zero
- seven pgTAP suites
- 312 assertions
- PASS

What remains uncertain is **hosted structural parity**, not repository CI.

### 4. Hosted parity

Migrations 1–7 remain `VERIFIED` under DL-054.

Migrations 8–10 remain `IMPLEMENTED_UNVERIFIED`.

A read-only DL-054-style audit is authorised by DL-064. It must check catalogue structure and ACLs
without writing to the hosted project.

### 5. Physical device

The mobile code has passed local static/unit checks, including:

```text
npm run lint
npm run typecheck
npm test
git diff --check
```

The local unit result is:

```text
8 test files passed
71 tests passed
```

No physical-device walkthrough has been completed. Client capabilities therefore remain
`IMPLEMENTED_UNVERIFIED`.

### 6. No current implementation task

The phrase "next implementation task" must not be filled with `feature/business-onboarding-lifecycle`;
that branch is already merged.

Stocks / Milestone 2C remains the intended validation wedge, but it is not automatically authorised
after verification. A founder decision must explicitly designate the next implementation task.

### 7. Master Handoff reconciliation

The Master Handoff's broad product definition is retained:

> NegosyoOS is a Business State and Business Navigation System for Philippine MSMEs.

Its six conceptual domains remain above the three user-facing product areas.

The following remain direction, not current implementation:

- business profile/context;
- requirements;
- applicability;
- jurisdiction/PSGC;
- structured authoritative knowledge;
- evidence model;
- business journey;
- broader AI assistance.

### 8. Business context

DL-065 is the controlling clarification:

- onboarding context is allowed when needed to orient the experience;
- persistent profile facts require a concrete consuming workflow;
- AI classification is not a substitute for asking the owner.

No general business-profile schema is authorised by this reconciliation.

### 9. PSIC

The supplied repository/decision sources do **not** establish an approved PSIC implementation.

Therefore this reset does not add:

- a PSIC field;
- a PSIC table;
- a PSIC classifier;
- AI-generated PSIC classification;
- a PSIC-based rules engine.

If PSIC is later required, it needs a concrete consumer, source/evidence, value model, and a founder
decision before implementation.

### 10. Reference scenarios

The decision log preserves multiple real-world reference cases:

- DUO BREW coffee shop, Mandaluyong;
- car-tint installation service, Pasig;
- air-conditioning installation/cleaning/repair, B2B service.

These are **validation/reference cases**, not three separate product verticals.

The coffee shop is the current Stocks reference case. The other cases protect the product from being
mistaken for café-only software.

## Decision log handling

`docs/DECISION_LOG.md` is append-only.

**Do not replace the entire decision log.**

The supplied decision-log material already contains DL-064, DL-065, and DL-066. Those entries should be
preserved as the append-only continuation of the existing log. Historical entries DL-060 and DL-063
must not be rewritten.

## Files intentionally not reset by this package

- `docs/DECISION_LOG.md` — append-only; preserve existing history and DL-064–066.
- `docs/PROJECT_BLUEPRINT.md` — no replacement required from the evidence reviewed here.
- `docs/TECHNICAL_FOUNDATION.md` — no replacement required from the evidence reviewed here.
- `RISK_REGISTER.md` — no replacement required.
- `TEST_STRATEGY.md` — no replacement required.
- `docs/DEVELOPMENT_WORKFLOW.md` — its `develop` integration description remains a separate governance
  issue and should not be silently rewritten here.
- `PRODUCT_SPEC.md` — **exists in the repository**. It should not be invented, deleted, or replaced
  merely because an earlier conversation incorrectly questioned its existence.

## Verification after applying this package

Run:

```powershell
npm run lint
npm run typecheck
npm test
git diff --check
git status
git diff
```

Do not commit or push until the full diff has been reviewed.
