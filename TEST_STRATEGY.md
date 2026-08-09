# Test Strategy

Status legend matches `docs/DECISION_LOG.md`: `VERIFIED`, `IMPLEMENTED_UNVERIFIED`,
`DOCUMENTED_ONLY`, `PLANNED`, `RESEARCH_REQUIRED`, `OUT_OF_SCOPE`.

Emulator testing is never treated as physical-device verification. Where only an emulator or
nothing ran, the evidence table below says so explicitly.

## Layers

| Layer | Tool | What it covers | Status this migration |
| --- | --- | --- | --- |
| Unit | Vitest | Validation (`src/lib/validation/`), audit metadata allow-list, `resolveActiveBusinessId`, Supabase env parsing, the OTP type allow-list | `VERIFIED` after `npm test` runs green (M0.6) |
| Component | *(none yet)* | Screen rendering, form interaction | `PLANNED` — `jest-expo` + `@testing-library/react-native`, deliberately not added this slice; no component exists yet to justify the dependency |
| Integration | Manual, device | Auth flow end-to-end, business create/list/switch against the real hosted Supabase project | `IMPLEMENTED_UNVERIFIED` until device-run in M0.6, then `DEVICE VERIFIED` for whatever actually ran |
| PostgreSQL / pgTAP | Supabase CLI + pgTAP, in CI | Schema, RLS isolation, RPC behaviour, audit-audience parity | `CI VERIFIED`, unchanged by this migration (DL-053) |
| RLS isolation (negative case) | pgTAP, in CI | A deliberately broken policy turns CI red | `CI VERIFIED` (DL-053); not re-run this migration since no schema changed |
| Auth | Manual, device | Sign up, verify, sign in, sign out, session restore after relaunch | Evidence recorded per-item in `PROJECT_STATE.md` after M0.6 |
| Deep links | — | Not applicable this slice — the typed-code flow needs none | `OUT_OF_SCOPE` |
| Onboarding | Manual, device | First business creation, empty-state routing | Recorded after M0.6 |
| Business switching | Manual, device + existing unit test | Switch updates the active business; a foreign id in storage returns nothing | Unit: `VERIFIED`. Device negative test: recorded after M0.6 |
| Mobile routing | Manual, device | Unauthenticated → `(auth)`, authenticated → `(app)`, redirect-preserving-session behaviour | Recorded after M0.6 |
| Low-width devices | Manual, device (360px-equivalent) | Layout does not break on a small Android screen | Recorded after M0.6, on whatever device is used |
| Low-end Android | — | Performance on a genuinely low-end device | `NOT EXECUTED` — no such device available this session |
| Poor connectivity | — | Auth/RPC failure and retry behaviour under a flaky network | `PLANNED` — no explicit handling built this slice beyond Supabase SDK defaults |
| Accessibility | — | Screen reader, focus order, touch target size | `PLANNED` — not evaluated this migration |
| Offline behaviour | — | Reads/writes while disconnected | `OUT_OF_SCOPE` — explicitly deferred repository-wide per `docs/BUILD_PLAN.md` |
| CI | GitHub Actions | Lint, typecheck, unit tests, `expo config`, `expo export`; separately, the unchanged database job | Recorded after M0.5 runs |
| Emulator | — | Android Studio AVD | `NOT EXECUTED` this session — physical device used instead, which is the stronger evidence class, not a lesser substitute |
| Physical device | Expo Go on a physical Android phone | Everything under "Auth" through "Low-width devices" above | The authoritative evidence source for this migration; iOS not available and recorded as `NOT EXECUTED` |

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
