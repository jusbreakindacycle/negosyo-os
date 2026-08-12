# Project State

**This document owns "what is true right now."** For product definition see `PRODUCT_SPEC.md`;
for why a decision was made see `docs/DECISION_LOG.md`; for build sequence see
`docs/BUILD_PLAN.md`; for implementation boundaries see `docs/TECHNICAL_FOUNDATION.md`. Where two
documents appear to disagree, this file's evidence table and `docs/DECISION_LOG.md`'s most recent
entry govern, in that order — see `README.md`'s controlling-files section.

Last updated: 2026-08-13, on branch `feature/business-creation-ceiling`.

## Founder decision this document reflects

NegosyoOS PH is a **native mobile application only** (React Native, Expo, Expo Router,
TypeScript). This supersedes the prior Next.js/responsive-web/PWA delivery decision. See
[DL-056](docs/DECISION_LOG.md#dl-056).

## Current branch / workstream

`feature/business-creation-ceiling`, branched from `main` at `8bdbbd2`. Not merged, not pushed.

`migration/mobile-foundation` **is merged**: it landed on `main` as `8bdbbd2` through PR #14 on
2026-08-12, as a squash commit whose tree is identical to the branch tip `4206af9`. The previous
revision of this file described it as unmerged and unpushed; that is no longer true.

One inherited inaccuracy is corrected with it. `origin/develop` still points at `2d42ecc`, the
pre-Milestone-1 scaffold, and is eleven commits behind. PRs #12, #13, and #14 all targeted `main`
directly, so `main` — not `develop` — is where integration actually happens, whatever
`docs/DEVELOPMENT_WORKFLOW.md` describes. Reconciling the two is not this branch's work, but the
gap should not go unrecorded.

## Active workstream

Phase gate B's last open application item: a server-side ceiling of at most three businesses whose
status is not `closed` per authenticated owner (DL-055 item 6, DL-059 item 3).

## Evidence matrix

| Capability | Status | Evidence |
| --- | --- | --- |
| Database schema (7 migrations) | `VERIFIED` | CI applies from zero; 239 pgTAP assertions pass across 5 suites; a deliberate tenant-isolation regression was observed turning CI red (DL-053) |
| Repository-owned hosted structural parity | `VERIFIED` | Read-only catalogue audit, 2026-08-04 (DL-054); re-confirmed read-only this session, 2026-08-09 — all 7 migrations present and matching on the hosted project |
| Hosted runtime RLS behaviour | `IMPLEMENTED_UNVERIFIED` | No pgTAP suite has run against the hosted project |
| Mobile application scaffold (Expo Router) | `IMPLEMENTED_UNVERIFIED` | Expo SDK 57.0.11 / React Native 0.86.2, versions from a real `npx expo install` resolution. `npm run typecheck`, `npm run lint`, `npx expo config --type public`, and `npx expo export --platform android` (1382 modules, produced a working Android Hermes bundle) all pass locally. Not yet run on a device |
| Native auth (typed email OTP, allow-listed) | `IMPLEMENTED_UNVERIFIED` | Code complete; `verifyOtp` contract checked against installed `@supabase/auth-js` 2.111.0 and current Supabase docs, not assumed. `tests/unit/otp-types.test.ts` (7 assertions) passes locally. Sign-up → verify → sign-in → sign-out flow not yet exercised on a device |
| Business tenancy on mobile (create/list/switch) | `IMPLEMENTED_UNVERIFIED` | Code complete, ported from the web client's proven logic. Not yet exercised on a device |
| Session restore after relaunch | `NOT EXECUTED` | Requires a device walkthrough: kill and relaunch the app after signing in |
| Cross-business isolation on mobile | `VERIFIED` at the database layer (DL-053, unchanged); mobile-client negative test `NOT EXECUTED` | Requires a device walkthrough: put a foreign business id in AsyncStorage and confirm no data returns |
| Application CI (Expo) | `VERIFIED` | Ran on GitHub Actions for PR #14 and passed. Six checks green — `verify (22)`, `verify (24)`, and `Run pgTAP Security Tests`, across [run 31610028954](https://github.com/jusbreakindacycle/negosyo-os/actions/runs/31610028954) and [run 31610032243](https://github.com/jusbreakindacycle/negosyo-os/actions/runs/31610032243), 2026-08-12 |
| Database CI (pgTAP) | unchanged, `CI VERIFIED` | Not modified by the mobile migration; re-ran green on PR #14 |
| Local pgTAP execution | `BLOCKED` | Docker not installed on the founder's machine (DL-026), unchanged. Re-checked 2026-08-13: `docker` and `psql` both absent from PATH |
| Stocks user interface | `DOCUMENTED_ONLY` | Not started |
| Permits, Taxes, document vault, AI dashboard | `PLANNED` | Not started |
| Three-business ceiling (DL-055 item 6) | `IMPLEMENTED_UNVERIFIED` | Migration `20260813090000_limit_active_businesses_per_owner.sql` and suite `06_business_creation_ceiling.test.sql` are written. **Neither has executed anywhere.** Docker is absent, and CI fires on PRs into `main`/`develop`, so no run exists yet |
| Business lifecycle in the interface | `DOCUMENTED_ONLY` | The `status` column exists and is `VERIFIED` at the database layer, but nothing reads or writes it. `create_business_with_owner` does not set it, so every business takes the column default `operating`. Confirmed on the hosted project 2026-08-13: the single existing business row has status `operating`. See DL-060 |

## Local verification executed this session (2026-08-09)

| Command | Result |
| --- | --- |
| `npm install` | 454 packages added, 274 removed (the Next.js tree replaced by the Expo/React Native tree). Peer-dependency warnings only from `expo-router`'s optional web support pulling in `react-dom`/radix packages; not used by this app |
| `npm run typecheck` (`tsc --noEmit`) | Passes, zero errors |
| `npm run lint` (ESLint via `eslint-config-expo/flat.js`) | Passes, zero errors. One pre-existing warning on the generated `src/types/database.ts` (Unicode BOM), not hand-edited |
| `npm test` (Vitest) | 30/30 tests pass across 5 suites |
| `npx expo config --type public` | Valid config resolved, `EXPO_PUBLIC_*` env vars loaded from `.env.local` |
| `npx expo export --platform android` | Succeeded: 1382 modules bundled, produced `_expo/static/js/android/entry-*.hbc` |
| `git diff --stat main migration/mobile-foundation -- supabase/` | Empty — zero files under `supabase/` changed |

Two real defects were found and fixed during this pass, not just re-run until green:
`business-provider.tsx` originally called an async function directly inside a `useEffect`, which
`react-hooks/set-state-in-effect` (part of `eslint-config-expo`'s React Hooks v7 rules) correctly
flagged as a synchronous-setState-in-effect risk; it was restructured to route every state update
through a `.then()` callback, the same shape `auth-provider.tsx` already used. A stale `.next/`
build directory and `next-env.d.ts` left over from before this session were also caught by lint and
removed.

**Not yet executed:** anything requiring a physical device (`npx expo start` + Expo Go). One attempt
was made to run `npx expo start` in this session; its interactive terminal output (the QR code and
dev-server menu) could not be captured through the non-interactive channel this session runs
commands through, and the process was stopped rather than left running unobserved. This does not
indicate a defect in the app — `expo export` already proved the same bundling pipeline works — it
means the device walkthrough itself needs to run in a terminal someone is actually watching, with a
phone in hand. See `TEST_STRATEGY.md` and the reconciliation report's device checklist.

## Blocking risks

See `RISK_REGISTER.md` for the full register. The three that gate what "done" can mean here:

1. No Docker locally → pgTAP is CI-only, never locally re-run before a push. Unchanged from DL-026.
2. Device verification requires a human at a terminal with a phone — it cannot be completed inside
   this session. See above.
3. No iOS device or emulator available at all → iOS and Android-emulator evidence will remain
   `NOT EXECUTED` even once the physical Android walkthrough is done.

## Local verification executed 2026-08-13 (`feature/business-creation-ceiling`)

| Command | Result |
| --- | --- |
| `npm run lint` | Passes, zero errors |
| `npm run typecheck` (`tsc --noEmit`) | Passes, zero errors |
| `npm test` (Vitest) | 36/36 pass across 6 suites — 30 pre-existing plus 6 new in `tests/unit/create-business-errors.test.ts` |
| `npx expo config --type public` | Valid config resolved |
| `npx expo export --platform android` | Succeeded, produced an Android Hermes bundle |
| `docker --version`, `psql --version` | Both absent — the new pgTAP suite cannot run locally (DL-026) |

Read-only catalogue checks against the hosted project `vbmfkfkfpvgezgyahdpb` (Postgres 17.6), to
replace assumptions in the new migration with checked facts. No write, no DDL, no DML:

| Checked | Observed |
| --- | --- |
| `pg_catalog.hashtext(text)` | present, returns `integer` |
| `pg_catalog.pg_advisory_xact_lock(integer, integer)` | present |
| `public.business_status` | `draft, registering, operating, closed` — matches the repository |
| `public.business_role` | `owner` only — so the new `role = 'owner'` predicate guards a future widening rather than filtering anything today |
| `public.businesses.status` default | `'operating'` |
| `create_business_with_owner` | `SECURITY DEFINER`, `search_path=""`, no ceiling yet — the expected baseline for a `create or replace` |
| Live rows in `public.businesses` | one, status `operating` |

## Exactly one next allowed engineering task

> **`feature/business-onboarding-lifecycle`** — replace name-only business onboarding with a
> lifecycle-aware flow, add the separate registration-status dimension, derive Setup mode and
> Running mode from `businesses.status`, and add the owner-declared graduation path. Approved by
> [DL-060](docs/DECISION_LOG.md#dl-060). It begins only after this branch's ceiling work is merged
> and its CI run observed green.

No Stocks screen, reorder logic, or other Milestone 2C work is authorised before both that task and
the mobile foundation acceptance gate (`docs/BUILD_PLAN.md`) are complete.
