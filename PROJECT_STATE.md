# Project State

**This document owns "what is true right now."** For product definition see `PRODUCT_SPEC.md`;
for why a decision was made see `docs/DECISION_LOG.md`; for build sequence see
`docs/BUILD_PLAN.md`; for implementation boundaries see `docs/TECHNICAL_FOUNDATION.md`. Where two
documents appear to disagree, this file's evidence table and `docs/DECISION_LOG.md`'s most recent
entry govern, in that order — see `README.md`'s controlling-files section.

Last updated: 2026-08-09, on branch `migration/mobile-foundation`.

## Founder decision this document reflects

NegosyoOS PH is a **native mobile application only** (React Native, Expo, Expo Router,
TypeScript). This supersedes the prior Next.js/responsive-web/PWA delivery decision. See
[DL-056](docs/DECISION_LOG.md#dl-056).

## Current branch / workstream

`migration/mobile-foundation`, branched from `main` at `9043d50`. Not merged, not pushed. See
`docs/DEVELOPMENT_WORKFLOW.md` for what happens to it next.

## Active migration

Mobile foundation reconciliation: replace the Next.js client with an Expo Router client, keep the
Supabase/PostgreSQL backend and every migration unchanged, restate governing documentation, and
verify the result on a physical Android device before authorising any Stocks work.

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
| Application CI (Expo) | `IMPLEMENTED_UNVERIFIED` | `.github/workflows/ci.yml` updated (lint, typecheck, unit tests, `expo config`, `expo export`); not yet run on GitHub Actions because this branch has not been pushed |
| Database CI (pgTAP) | unchanged, `CI VERIFIED` | Not modified by this migration |
| Local pgTAP execution | `BLOCKED` | Docker not installed on the founder's machine (DL-026), unchanged |
| Stocks user interface | `DOCUMENTED_ONLY` | Not started; out of scope for this migration |
| Permits, Taxes, document vault, AI dashboard | `PLANNED` | Not started |
| Three-business ceiling (DL-055 item 6) | `DOCUMENTED_ONLY` | Deferred to the next branch, see below |

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

## Exactly one next allowed engineering task

> **`feature/business-creation-ceiling`** — enforce, server-side, at most three businesses whose
> status is not `closed` per authenticated owner (DL-055 item 6; carried forward in
> [DL-059](docs/DECISION_LOG.md#dl-059)), as an additive migration with pgTAP coverage proving both
> the allowed and blocked cases. This is the first follow-up branch after
> `migration/mobile-foundation` merges, and it precedes all Stocks work.

No Stocks screen, reorder logic, or other Milestone 2C work is authorised before this task and the
mobile foundation acceptance gate (`docs/BUILD_PLAN.md`) are both complete.
