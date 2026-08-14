# Project State

**This document owns what is true right now.**

It does not redefine product vision. Product direction is governed by the repository's approved
decisions and the external `NEGOSYOOS_MASTER_HANDOFF.md` only where that direction has been
reconciled into the decision log. This file records repository reality, evidence, gates, and
authorised work.

Last updated: **2026-08-14**
Repository baseline inspected: `main` at `ce644fd`
Current documentation workstream: `docs/state-reconciliation` (local branch)

## Current repository truth

NegosyoOS PH is a **native mobile application only**: React Native, Expo, Expo Router, and
TypeScript against Supabase/PostgreSQL. The former Next.js/web/PWA direction is superseded by
DL-056.

The repository currently contains the business-onboarding lifecycle foundation. It does **not**
contain a user-facing Stocks workflow, Permits workflow, Taxes workflow, document vault, or
AI dashboard.

The external Master Handoff describes the broader product as a Business State and Business
Navigation System. That broader vision is retained. The current repository is only a foundation
toward that vision.

## Current branch and integration state

`main` is at `ce644fd`.

The following work is already merged into `main`:

- `feature/business-creation-ceiling` → `b52def1` / PR #15
- `feature/business-onboarding-lifecycle` → `570fdb9` / PR #17, followed by `ce644fd` / PR #18

`origin/develop` remains at `2d42ecc` and is stale relative to `main`. PRs #12–#18 targeted
`main`, so `main` is the actual integration baseline. The discrepancy with
`docs/DEVELOPMENT_WORKFLOW.md` is recorded but is not silently resolved here.

`origin/revert-17-feature/business-onboarding-lifecycle` exists at `3c78e19`, but no corresponding
revert commit is present in `main`. The evidence does not establish the intent behind that branch.
No explanation is inferred.

## Current workstream

**Documentation and evidence reconciliation only.**

No product implementation is currently authorised by this document.

DL-064 ratified the earlier merge/hosted-push governance deviation and authorised one read-only
hosted parity audit as verification work.

DL-065 clarified onboarding context versus persistent profile facts versus AI classification.

DL-066 reconciled the Master Handoff's product-direction vocabulary and deferred architecture
without authorising new implementation.

## Evidence matrix

| Capability | Status | Evidence |
|---|---|---|
| Database migrations 1–7 | `VERIFIED` | CI from zero; 239 assertions across five suites; deliberate tenant-isolation regression observed failing CI (DL-053) |
| Database migrations 8–10 | `VERIFIED` | PR #17 / CI run `31669151317`: all ten migrations from zero, seven pgTAP suites, 312 assertions passed, including suites 06–07 |
| Three-business ceiling | `VERIFIED` | PR #15 / CI run `31622986650`: six suites, 259 assertions passed, including `06_business_creation_ceiling.test.sql` |
| Hosted structural parity, migrations 1–7 | `VERIFIED` | DL-054 read-only audit, 2026-08-04; re-confirmed 2026-08-09 |
| Hosted structural parity, migrations 8–10 | `IMPLEMENTED_UNVERIFIED` | Hosted migration state is supported by linked type generation and PR evidence, but no DL-054-style catalogue audit has verified migration list, grants, ACLs, or policies |
| Hosted runtime RLS behaviour | `IMPLEMENTED_UNVERIFIED` | No pgTAP suite has executed against the hosted project |
| Native Expo application scaffold | `IMPLEMENTED_UNVERIFIED` | Local lint/typecheck/Expo checks have passed; no physical-device walkthrough |
| Native typed email OTP | `IMPLEMENTED_UNVERIFIED` | Code and installed `@supabase/auth-js` contract checked; no complete physical-device auth walkthrough |
| Business tenancy create/list/switch | `IMPLEMENTED_UNVERIFIED` | Code exists; no physical-device walkthrough |
| Business lifecycle onboarding | `IMPLEMENTED_UNVERIFIED` | Four entry choices, server-derived lifecycle, registration dimension, Setup/Running/closed views, graduation RPC; unit suite has 71 passing tests; no device walkthrough |
| Registration status dimension | `VERIFIED` at database level / `IMPLEMENTED_UNVERIFIED` at client level | Migration and pgTAP coverage exist; client rendering/behaviour remains device-unverified |
| `declare_business_status` RPC | `VERIFIED` at database level / `IMPLEMENTED_UNVERIFIED` at client level | Lifecycle suite covers the RPC and legal transitions; client invocation remains device-unverified |
| Nature-of-business onboarding context | `DOCUMENTED_ONLY` | DL-065 says enough context may orient onboarding, but no implementation is authorised yet |
| Persistent business-profile facts | `DOCUMENTED_ONLY` | Each fact requires a concrete consuming workflow before persistence |
| PSIC / formal industry classification | `DOCUMENTED_ONLY` | No repository implementation or approved decision establishing PSIC as an onboarding field was found in the supplied sources |
| Stocks workflow | `DOCUMENTED_ONLY` | No user-facing Stocks flow exists |
| Permits/compliance workflow | `PLANNED` | Not implemented |
| Taxes/records workflow | `PLANNED` | Not implemented |
| Document/evidence vault | `PLANNED` | Not implemented |
| Generic applicability engine | `DOCUMENTED_ONLY` | Long-term direction; deferred until concrete workflows prove shared behaviour |
| Jurisdiction/PSGC model | `DOCUMENTED_ONLY` | Long-term direction; no implementation authorised |
| Structured rule/knowledge store | `DOCUMENTED_ONLY` | Direction retained; article-library UI remains rejected |
| AI dashboard | `DOCUMENTED_ONLY` | AI remains assistance, not authority |

## What was actually verified on 2026-08-14

The following commands were executed successfully on the current local checkout:

```text
npm run lint
npm run typecheck
npm test
git diff --check
```

Result:

```text
8 test files passed
71 tests passed
```

No product code was changed by these checks.

No physical-device walkthrough was executed.

No hosted database query was executed during this local reconciliation.

## Phase gates

### Phase Gate A — Documentation and claim repair

**CLOSED on 2026-08-13.**

The native dashboard renders the three user-facing product areas:

- Stocks & Operations
- Permits & Compliance
- Taxes & Records

Internal codenames may remain in internal audit/domain values where required for historical
compatibility, but they must not render in public UI.

### Phase Gate B — Database/application safety

**CLOSED for the currently defined application items.**

The three-business ceiling is implemented and verified in CI. The OTP allow-list is carried into the native verification path. The former font item is superseded by the native-mobile pivot.

The database-verification portion was already verified under DL-053.

## Outstanding verification gates before Milestone 2C

These are **gates, not a build sequence**. No decision entry orders them against one another:

1. Read-only hosted parity audit for migrations 8–10.
2. Physical-device walkthrough:
   - launch;
   - sign-up;
   - email-code verification;
   - sign-in;
   - sign-out;
   - session restore after relaunch;
   - business creation/list/switch behaviour;
   - mobile cross-business negative case.
3. Hosted runtime RLS behaviour.

An observed CI run for migrations 8–10 is already available and is recorded above; it is no longer an outstanding gate.

## Authorised work

1. Documentation/state reconciliation associated with DL-064, DL-065, and DL-066.
2. The read-only hosted parity audit authorised by DL-064.

The hosted audit is catalogue-only:

- migration list;
- `business_registration_status` enum and column;
- `create_business_with_owner` signature and grants;
- `declare_business_status` signature and grants;
- absence of an `UPDATE` grant on `public.businesses`;
- relevant policies/ACLs.

No DDL, DML, migration application, or other hosted write is authorised by this item.

## Next implementation task

**None currently designated.**

Stocks / Milestone 2C remains the intended validation wedge in the broader product plan, but it does **not** become authorised merely because the verification gates close.

A founder decision in `docs/DECISION_LOG.md` must explicitly designate the next implementation task.

This prevents "verification complete" from being mistaken for "implementation authorised."

## Important product-direction continuity

The Master Handoff remains the broad product-direction reference:

> NegosyoOS is a Business State and Business Navigation System for Philippine MSMEs.

Its six conceptual business-state domains remain:

- identity;
- operations;
- records;
- obligations;
- resources;
- opportunities.

The repository's three user-facing product areas remain:

- Stocks & Operations;
- Permits & Compliance;
- Taxes & Records.

These are different levels of decomposition, not competing product definitions.

The long-term direction includes contextual business facts, applicability, jurisdiction, authoritative knowledge, evidence, business journey, and AI assistance. These are **not all current tables or features**.

## Known constraints

- Docker is not installed locally, so pgTAP is CI-only.
- No iOS device/emulator is available for verification.
- Client-side evidence remains below `VERIFIED` until a physical-device walkthrough occurs.
- Hosted structural parity for migrations 8–10 remains unverified.
- No second-business UI and no closing workflow exist; the three-business ceiling is therefore a practical permanent cap until those capabilities are separately authorised and implemented.
- Do not infer a PSIC classification system from the Master Handoff. No such implementation is currently established by the supplied repository evidence.

## Source discipline

`docs/DECISION_LOG.md` is append-only. Do not rewrite historical entries.

`PRODUCT_SPEC.md` **exists in the repository**. It remains a controlling product document, but its current "migration" sequencing text should not be treated as a replacement for the broader Master Handoff/product-direction model.

The Master Handoff is external product-direction context, not repository-state evidence.