# Test Strategy

Status legend matches `docs/DECISION_LOG.md`: `VERIFIED`, `IMPLEMENTED_UNVERIFIED`,
`DOCUMENTED_ONLY`, `PLANNED`, `RESEARCH_REQUIRED`, `OUT_OF_SCOPE`.

Emulator testing is never treated as physical-device verification. Where only an emulator or
nothing ran, the evidence table below says so explicitly.

## Layers

| Layer | Tool | What it covers | Status this migration |
| --- | --- | --- | --- |
| Unit | Vitest | Validation (`src/lib/validation/`), audit metadata allow-list, `resolveActiveBusinessId`, Supabase env parsing, the OTP type allow-list | `VERIFIED` — `npm test`: 30/30 pass across 5 suites, 2026-08-09 |
| Static build pipeline | `tsc`, ESLint, `expo config`, `expo export` | Types, lint rules (incl. React Hooks correctness), config validity, full Metro bundle | `VERIFIED` — all four pass locally; `expo export --platform android` bundled 1382 modules into a working Hermes bundle |
| Component | *(none yet)* | Screen rendering, form interaction | `PLANNED` — `jest-expo` + `@testing-library/react-native`, deliberately not added this slice; no component exists yet to justify the dependency |
| Integration | Manual, device | Auth flow end-to-end, business create/list/switch against the real hosted Supabase project | `NOT EXECUTED` — requires `npx expo start` + Expo Go on a physical device; attempted once in this session but the dev server's interactive output could not be captured non-interactively, so it must be run directly by whoever has the device |
| PostgreSQL / pgTAP | Supabase CLI + pgTAP, in CI | Schema, RLS isolation, RPC behaviour, audit-audience parity | `CI VERIFIED`, unchanged by this migration (DL-053) |
| RLS isolation (negative case) | pgTAP, in CI | A deliberately broken policy turns CI red | `CI VERIFIED` (DL-053); not re-run this migration since no schema changed |
| Auth | Manual, device | Sign up, verify, sign in, sign out, session restore after relaunch | `NOT EXECUTED` — see the device checklist in the final reconciliation report |
| Deep links | — | Not applicable this slice — the typed-code flow needs none | `OUT_OF_SCOPE` |
| Onboarding | Manual, device | First business creation, empty-state routing | `NOT EXECUTED` |
| Business switching | Manual, device + existing unit test | Switch updates the active business; a foreign id in storage returns nothing | Unit: `VERIFIED`. Device negative test: `NOT EXECUTED` |
| Mobile routing | Manual, device | Unauthenticated → `(auth)`, authenticated → `(app)`, redirect-preserving-session behaviour | `NOT EXECUTED` |
| Low-width devices | Manual, device (360px-equivalent) | Layout does not break on a small Android screen | `NOT EXECUTED` |
| Low-end Android | — | Performance on a genuinely low-end device | `NOT EXECUTED` — no such device available this session |
| Poor connectivity | — | Auth/RPC failure and retry behaviour under a flaky network | `PLANNED` — no explicit handling built this slice beyond Supabase SDK defaults |
| Accessibility | — | Screen reader, focus order, touch target size | `PLANNED` — not evaluated this migration |
| Offline behaviour | — | Reads/writes while disconnected | `OUT_OF_SCOPE` — explicitly deferred repository-wide per `docs/BUILD_PLAN.md` |
| CI | GitHub Actions | Lint, typecheck, unit tests, `expo config`, `expo export`; separately, the unchanged database job | `IMPLEMENTED_UNVERIFIED` — workflow updated and the same steps pass locally; not yet run on GitHub Actions because this branch has not been pushed |
| Emulator | — | Android Studio AVD | `NOT EXECUTED` this session |
| Physical device | Expo Go on a physical Android phone | Everything under "Auth" through "Low-width devices" above | `NOT EXECUTED` this session — see the final report for exactly why and what to run |

## What "done" means for this migration specifically

The mobile foundation acceptance gate in `docs/BUILD_PLAN.md` is the checklist. A line item is
never marked done from inspection of code alone — it requires the command or device action that
produced the evidence, stated in `PROJECT_STATE.md`.

## Explicit gaps carried forward (not silently dropped)

- Component testing tool selection is deferred, not abandoned — first candidate is `jest-expo`.
- Poor-connectivity and offline behaviour remain `PLANNED`, matching the repository-wide offline
  exclusion already in `docs/BUILD_PLAN.md`.
- Accessibility testing has no owner yet; it becomes required before Milestone 7
  (`docs/BUILD_PLAN.md`), not before this migration.
