# Risk Register

Format: description, likelihood, impact, mitigation, evidence status, responsible layer.
Likelihood/impact are qualitative (low/medium/high) — no incident data exists yet to calibrate them
further, and that absence is itself recorded rather than papered over with invented numbers.

## Authentication and session

**Mobile authentication (typed email OTP)**
- Likelihood: medium. Impact: high — a broken verify path blocks every new owner.
- Mitigation: `verifyOtp({ email, token, type: 'email' })` per the installed `@supabase/auth-js`
  2.111.0 contract and current Supabase docs; a runtime allow-list restricts which `type` values may
  reach `verifyOtp` at all (DL-058), because `EmailOtpType` includes `(string & {})` and gives the
  compiler nothing to enforce.
- Evidence status: `IMPLEMENTED_UNVERIFIED` until device-verified in M0.6.
- Layer: `src/features/auth/`.

**Deep links**
- Likelihood: low this slice — the chosen flow (typed code) needs no deep link.
- Impact if later added: medium — a malformed or spoofed `negosyoos://` link reaching an unguarded
  handler could attempt a forged verification.
- Mitigation: none implemented; deferred with the flow itself. If a deep-link flow is added later,
  it goes through the same allow-list as the typed-code path, not a separate one.
- Evidence status: `OUT_OF_SCOPE` for this migration.
- Layer: `app/`.

**Session persistence**
- Likelihood: low. Impact: high — silent logout erodes trust fast on a habit-forming product.
- Mitigation: AsyncStorage-backed Supabase session storage with `persistSession`/`autoRefreshToken`,
  plus the documented `AppState` refresh-start/stop pattern.
- Evidence status: `IMPLEMENTED_UNVERIFIED` until relaunch is device-tested.
- Layer: `src/lib/supabase/client.ts`.

**Session storage is app-private storage, not the OS keystore**
- Likelihood: n/a (accepted design, not a bug). Impact: low on a non-rooted device; higher on a
  rooted/compromised device, where any app-private storage is already weaker.
- Mitigation: this is the Supabase-documented React Native pattern; `expo-secure-store` was
  considered and not adopted this slice because it adds a dependency without a demonstrated need
  ("do not add packages without a concrete need"). Recorded here as a known, accepted limitation
  rather than left implicit.
- Evidence status: `DOCUMENTED_ONLY` — no rooted-device test performed.
- Layer: `src/lib/supabase/client.ts`.

## Tenancy and authorisation

**Tenant isolation (RLS)**
- Likelihood: low — unchanged, previously verified (DL-053). Impact: critical — cross-business data
  exposure.
- Mitigation: no schema change in this migration; `supabase/` is a no-touch zone. Mobile client
  changes only affect where the stored preference lives, never the query authorization.
- Evidence status: `VERIFIED` at the database layer (DL-053); mobile-client negative test
  (foreign business id in local storage) planned for M0.6.
- Layer: `supabase/migrations/`, RLS policies.

**Exposed mobile credentials**
- Likelihood: low. Impact: high if violated — a leaked service-role key bypasses RLS entirely.
- Mitigation: only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are read by
  the client; both are safe to expose because every table they reach has RLS. Tree re-scanned for a
  service-role key before this migration's report is written.
- Evidence status: reported plainly in the final report, either way.
- Layer: `src/lib/supabase/env.ts`, `.env.example`.

**Secret handling**
- Likelihood: low. Impact: high.
- Mitigation: `.gitignore` covers `.env*` (already did), plus new mobile build artefacts
  (`.expo/`, `android/`, `ios/`, `*.keystore`, `google-services.json`) so a local native build does
  not accidentally get committed.
- Evidence status: `VERIFIED` by inspection of the committed `.gitignore`.
- Layer: repository root.

## Data and schema

**Schema drift (repository vs. hosted)**
- Likelihood: low — re-audited read-only this session; all 7 migrations match.
- Impact: medium — undetected drift would make CI's "applies from zero" claim misleading for the
  hosted project specifically.
- Mitigation: DL-054's audit process, repeated periodically; this migration adds no new migration.
- Evidence status: `VERIFIED` (repository-owned parity), `IMPLEMENTED_UNVERIFIED` (hosted runtime).
- Layer: `supabase/migrations/`.

## Device and network

**Low-end-device performance**
- Likelihood: medium — target users skew toward mid/low-range Android. Impact: medium.
- Mitigation: Expo Router + minimal dependency surface; no premature component-test tooling added.
  Real low-end-device profiling deferred until a product screen exists to profile.
- Evidence status: `NOT EXECUTED` this migration — verification device is the founder's own phone,
  not confirmed low-end.
- Layer: whole app.

**Unreliable mobile connectivity**
- Likelihood: high for the target user. Impact: medium — auth and RPC calls can fail mid-flow.
- Mitigation: none implemented yet beyond Supabase's default retry/refresh behaviour. Explicit
  offline/error-state design is deferred to `TEST_STRATEGY.md`'s `PLANNED` items.
- Evidence status: `PLANNED`.
- Layer: `src/features/auth/`, `src/features/businesses/`.

**Stale/offline state**
- Likelihood: medium. Impact: medium — a stale local active-business id after membership changes.
- Mitigation: `resolveActiveBusinessId` re-validates the stored id against the live RLS-filtered
  list on every read; an invalid id silently falls back to the first authorised business. This
  logic is reused unchanged from the web client.
- Evidence status: `VERIFIED` by existing unit tests; device-retest planned in M0.6.
- Layer: `src/features/businesses/`.

## Privacy and compliance

**Privacy**
- Likelihood: low this slice — no new personal data collected beyond existing auth email.
- Impact: high once documents/records ship.
- Mitigation: audit-metadata allow-list (`src/lib/audit/events.ts`) carried over unchanged.
- Evidence status: `VERIFIED` for what exists; `PLANNED` for future document handling.
- Layer: `src/lib/audit/`.

**Sensitive uploaded documents**
- Likelihood: n/a — no document vault exists yet.
- Impact: high once it does.
- Mitigation: none yet; Milestone 3 in `docs/BUILD_PLAN.md` owns this.
- Evidence status: `OUT_OF_SCOPE` for this migration.
- Layer: not yet built.

**Legal/regulatory source staleness**
- Likelihood: high over time for any jurisdiction-specific rule. Impact: high — an owner acting on
  a stale rule.
- Mitigation: evidence-status protocol requires effective date and last-reviewed date on every
  legal claim; none are made by the mobile foundation itself.
- Evidence status: `OUT_OF_SCOPE` for this migration; governs future Permits/Taxes work.
- Layer: future `src/features/permits/`, `src/features/taxes/`.

**AI unsupported claims**
- Likelihood: n/a — no AI integration exists yet.
- Impact: high once it does.
- Mitigation: the AI boundary in `CLAUDE.md` and `docs/TECHNICAL_FOUNDATION.md` §10 applies
  unchanged to any future mobile AI surface.
- Evidence status: `OUT_OF_SCOPE` for this migration.
- Layer: future `src/lib/ai/`.

## Engineering process

**Dependency/supply-chain risk**
- Likelihood: medium — Expo/React Native pulls a larger native dependency tree than the Next.js
  scaffold did. Impact: medium.
- Mitigation: dependencies installed only via `npx expo install` against pinned SDK 57, never
  hand-picked versions; lockfile committed.
- Evidence status: `VERIFIED` by inspection of `package-lock.json` after M0.2.
- Layer: `package.json`.

**Destructive migrations**
- Likelihood: low. Impact: critical.
- Mitigation: `supabase/` remains a no-touch zone in this migration; the standing rule (never edit
  an applied migration; only additive new ones) is restated in `docs/DEVELOPMENT_WORKFLOW.md`.
- Evidence status: `VERIFIED` by inspection — zero files under `supabase/migrations/` changed.
- Layer: `supabase/migrations/`.

**Accidental agent Git operations**
- Likelihood: medium for any AI coding agent working in this repository without guardrails.
  Impact: high — force-push or branch deletion is not easily undone.
- Mitigation: the twelve-point BRANCH SAFETY block added to `CLAUDE.md` (DL-057); no remote
  ref was mutated by this migration — every remote-affecting command is written out for the founder
  to run, not executed.
- Evidence status: `VERIFIED` — `git status`/`git branch -vv` in the final report show no remote
  branch touched.
- Layer: repository governance.
