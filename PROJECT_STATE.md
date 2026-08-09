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
| Mobile application scaffold (Expo Router) | *filled in after M0.2–M0.4* | |
| Native auth (typed email OTP, allow-listed) | *filled in after M0.4* | |
| Business tenancy on mobile (create/list/switch) | *filled in after M0.4* | |
| Session restore after relaunch | *filled in after M0.6, device-verified* | |
| Cross-business isolation on mobile | *filled in after M0.6* | |
| Application CI (Expo) | *filled in after M0.5* | |
| Database CI (pgTAP) | unchanged, `CI VERIFIED` | Not modified by this migration |
| Local pgTAP execution | `BLOCKED` | Docker not installed on the founder's machine (DL-026), unchanged |
| Stocks user interface | `DOCUMENTED_ONLY` | Not started; out of scope for this migration |
| Permits, Taxes, document vault, AI dashboard | `PLANNED` | Not started |
| Three-business ceiling (DL-055 item 6) | `DOCUMENTED_ONLY` | Deferred to the next branch, see below |

## Blocking risks

See `RISK_REGISTER.md` for the full register. The two that gate what "done" can mean here:

1. No Docker locally → pgTAP is CI-only, never locally re-run before a push. Unchanged from DL-026.
2. No iOS device or emulator available this session → iOS and Android-emulator evidence are
   `NOT EXECUTED`, not `VERIFIED`. Only physical Android + Expo Go evidence is claimed.

## Exactly one next allowed engineering task

> **`feature/business-creation-ceiling`** — enforce, server-side, at most three businesses whose
> status is not `closed` per authenticated owner (DL-055 item 6; carried forward in
> [DL-059](docs/DECISION_LOG.md#dl-059)), as an additive migration with pgTAP coverage proving both
> the allowed and blocked cases. This is the first follow-up branch after
> `migration/mobile-foundation` merges, and it precedes all Stocks work.

No Stocks screen, reorder logic, or other Milestone 2C work is authorised before this task and the
mobile foundation acceptance gate (`docs/BUILD_PLAN.md`) are both complete.
