# NegosyoOS PH

> **Temporary working name.** Final branding, trademark screening, and market positioning are not yet approved.

**NegosyoOS PH is a native mobile application only** — React Native, Expo, Expo Router, TypeScript,
against a Supabase/PostgreSQL backend. There is no web client, no PWA/TWA path, and no
"web-first, native-later" plan. See [DL-056](docs/DECISION_LOG.md#dl-056).

## Which document is authoritative for what

- `PROJECT_STATE.md` — what is true *right now*: evidence matrix, active branch, blocking risks,
  the one next allowed engineering task.
- `PRODUCT_SPEC.md` — what the product *is*: mobile-only, target user, MVP boundary, sequencing.
- [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) — *why*, append-only, most recent entry governs a
  conflict.
- [`docs/PROJECT_BLUEPRINT.md`](docs/PROJECT_BLUEPRINT.md) — product authority: thesis, reference
  cases, validation framework.
- [`docs/TECHNICAL_FOUNDATION.md`](docs/TECHNICAL_FOUNDATION.md) — implementation boundaries.
- [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) — authorised build sequence and gates.
- [`docs/DEVELOPMENT_WORKFLOW.md`](docs/DEVELOPMENT_WORKFLOW.md) — Git branching, tagging, and
  change-management policy.
- [`docs/AI_EXECUTION_PROTOCOL.md`](docs/AI_EXECUTION_PROTOCOL.md) — how much reasoning and execution
  capability an AI-assisted task needs: classification, routing, escalation, de-escalation, and
  execution modes. Subordinate to every document above.
- [`docs/CLAUDE_SKILLS_POLICY.md`](docs/CLAUDE_SKILLS_POLICY.md) — whether an additional skill or
  plugin should be adopted at all. Subordinate to every document above.
- `RISK_REGISTER.md` / `TEST_STRATEGY.md` — standing risk and test-coverage tracking.

Where two documents disagree, the most recent `docs/DECISION_LOG.md` entry governs the decision;
`PROJECT_STATE.md` governs what is currently true; `docs/PROJECT_BLUEPRINT.md` governs product
direction; `docs/TECHNICAL_FOUNDATION.md` governs implementation boundaries;
`docs/BUILD_PLAN.md` governs sequence.

## Product statement

**Public-facing**

NegosyoOS PH helps Philippine MSME owners establish and maintain their businesses, meet compliance obligations, control daily operations, and make better decisions through affordable AI-assisted self-service, with human support available when needed.

**Full internal positioning**

NegosyoOS PH helps Philippine micro, small, and medium enterprise owners—including qualified BMBEs, owner-operated establishments, service contractors, and growing B2B businesses—establish and maintain their businesses, meet compliance obligations, control daily operations, and make better decisions through affordable AI-assisted self-service, with authorised representatives and qualified professionals available when needed.

## The three product areas

| Product area | Main owner question | Examples |
| --- | --- | --- |
| **Stocks & Operations** | What needs attention or purchasing? | Low stock, overbuying, waste, forgotten purchases, job materials, unavailable items |
| **Permits & Compliance** | What must I prepare, submit, renew, or follow up? | Requirements, blockers, evidence, appointments, renewals, authorised handoffs |
| **Taxes & Records** | What must I record, review, estimate, or file? | Missing records, filing periods, threshold monitoring, bounded estimates |

These areas share one operating pattern:

> **What needs attention → why it matters → what is missing → what to do next → what happened after.**

The authenticated dashboard is the owner’s action centre. Domain rules and recorded business facts produce attention items. AI may summarise, prioritise, explain, and help prepare a next step. AI does not invent obligations, certify compliance, choose a tax treatment, or silently perform high-impact actions.

## What the product is solving

The first Stocks reference case is not required to name an exact peso loss before its problem is considered real. Confirmed operational pain may appear as:

- running out of ingredients or supplies;
- buying too much;
- spoilage or waste;
- forgetting what to purchase;
- customer embarrassment when an item is unavailable;
- uncertainty before going to a supplier;
- materials missing for an upcoming job.

Peso impact remains useful when available, but it is not the only evidence of a worthwhile problem.

## Evidence and claim status

Every material capability or rule should use one of these labels:

| Label | Meaning |
| --- | --- |
| `VERIFIED` | Implemented and supported by an observed passing test, controlled manual verification, or current primary source |
| `IMPLEMENTED_UNVERIFIED` | Code or migration exists, but the relevant behaviour has not been executed successfully in the required environment |
| `DOCUMENTED_ONLY` | Described or decided, but not implemented |
| `PLANNED` | Approved future work with an entry and exit gate |
| `RESEARCH_REQUIRED` | A legal, regulatory, market, or user claim that still needs evidence |
| `OUT_OF_SCOPE` | Deliberately excluded from the current phase |
| `SUPERSEDED` | Historical decision retained in the log but replaced by a later decision |

A decision is not an implementation. A migration is not a shipped workflow. A written test is not verified until it has run. A roadmap statement is not a public product capability.

## Current repository state

**See `PROJECT_STATE.md` for the current evidence matrix** — it is updated more often than this
section and governs in a conflict. Summary as of the 2026-08-09 mobile-foundation reconciliation:

The client architecture pivoted to native mobile only (DL-056); the database layer — seven
migrations, five pgTAP suites, 239 assertions, verified in CI with an observed tenant-isolation
regression proof (DL-053), and hosted structural parity audited read-only (DL-054, re-confirmed
2026-08-09) — carried forward unchanged. An earlier milestone commit, `6321534`, is titled
“Milestone 2 — Stocks: tracked items, daily sales, and the buying assistant.” That title is broader
than the delivered user capability (DL-050); commit history is not rewritten, so the correction
lives in the decision log rather than in the commit itself.

| Area | Current evidence status |
| --- | --- |
| Mobile application scaffold (Expo Router) | See `PROJECT_STATE.md` |
| Database verification in CI | `VERIFIED` — seven migrations from zero, 239 assertions across five suites passing, and a deliberate tenant-isolation regression observed turning the job red (DL-053); unchanged by the mobile pivot |
| Repository-owned hosted structural parity | `VERIFIED` through the 2026-08-04 read-only catalogue audit (DL-054), re-confirmed 2026-08-09. This covers what the repository owns, not every platform-managed respect of the hosted project |
| Hosted runtime RLS behaviour | `IMPLEMENTED_UNVERIFIED` — no pgTAP suite has been run against the hosted project, and no hosted policy has been exercised at runtime |
| Native authentication and business tenancy | See `PROJECT_STATE.md` |
| Business lifecycle fields | `VERIFIED` at the database level — columns, enum, and default are asserted in CI; no lifecycle workflow exists in the interface |
| Tracked priority items database | `VERIFIED` at the database level — schema, isolation, and RPC behaviour assert in CI |
| Daily-sales database and RPCs | `VERIFIED` at the database level, positive and negative paths included |
| Stocks screens | `DOCUMENTED_ONLY` |
| Buying/reorder assistant | `DOCUMENTED_ONLY` |
| AI-assisted action dashboard | `DOCUMENTED_ONLY` |
| Permits workflow | `PLANNED` |
| Secure document vault | `PLANNED` |
| Taxes workflow | `PLANNED` |

**Milestone 2 is therefore a partial database foundation, not a completed Stocks feature.**

## Immediate build priority

1. ~~Make the database test suites run in CI and prove they fail when isolation is deliberately broken.~~ Done on 2026-08-04: 239 assertions across five suites, seven migrations applied from zero, and a deliberate tenant-isolation regression observed turning CI red on exactly the predicted assertions (DL-053).
2. ~~Correct the documentation claims that imply features already exist.~~ Finalised by this documentation change: README, `CLAUDE.md`, the build plan, the technical foundation, and the decision log now carry the same evidence labels.
3. ~~Pivot the client to native mobile only.~~ Recorded as DL-056; the `migration/mobile-foundation` reconciliation is this work.
4. Replace the internal codenames still rendering in the authenticated dashboard with the user-facing product-area names, in the native client. This is the one remaining Phase gate A item.
5. Close the remaining Phase gate B application item — the other two are resolved by DL-059:
   - ~~replace `next/font/google` with a system-font stack~~ — moot: there is no Next.js and no build-time font download to eliminate (DL-059);
   - ~~add an explicit OTP runtime allow-list before `verifyOtp`~~ — carried into the native verify path as `['email']` (DL-058, DL-059);
   - enforce, server-side, a ceiling of at most three businesses whose status is not `closed` per authenticated owner, as an abuse control rather than pricing or packaging. **Still open** — see `PROJECT_STATE.md`'s next allowed task.
6. Only then build one end-to-end Stocks action slice on a real 360px Android viewport:
   - configure a small priority-item list;
   - record a count;
   - identify a low or uncertain item;
   - add it to a purchase list;
   - show the reason and missing information;
   - let the owner confirm, change, or dismiss the action;
   - record the outcome.
7. Test the workflow with a real operator before expanding to Permits, Taxes, broad AI, or additional verticals.

Daily gross sales may support tax estimates and some demand models, but it is **not the universal prerequisite for every Stocks or dashboard action**.

## Product boundaries

NegosyoOS PH does not:

- claim to be a government platform;
- guarantee registration, permit, tax, funding, or business outcomes;
- act as a lawyer, CPA, accountant, bookkeeper, engineer, government officer, or authorised representative;
- automatically declare a business compliant, BMBE-qualified, tax-exempt, or eligible for a particular tax treatment;
- invent missing requirements, fees, deadlines, classifications, or legal explanations;
- treat all LGUs, agencies, taxpayers, or MSMEs as identical;
- present operational records as registered books of accounts;
- directly file, sign, pay, or submit to government systems in Phase 1A;
- require an exact peso-loss estimate before validating an operational problem;
- promise exact demand, reorder, or tax outputs when the data is incomplete;
- build a full POS, ERP, payroll, accounting suite, banking product, lending product, marketplace, or professional-services marketplace in Phase 1A.

## Development

```bash
npm install
npx expo start
```

Then open the app in Expo Go on a physical Android device, or an emulator if one is configured.

### Running on a physical device

Three environment conditions must hold. Each one fails with the same misleading Expo Go
message, `java.io.IOException: Failed to download remote update`, so check all three
before suspecting application code.

1. **Expo Go must match the SDK.** SDK 57 requires Expo Go Android client **57.0.3**. An
   older client fetches the manifest, rejects the `exposdk:57.0.0` runtime version, and
   never requests a bundle — so the dev server logs nothing at all. Confirm the installed
   client under Expo Go → Settings.

   **The Google Play listing is not the current client.** As of 2026-08-12 Play serves
   Expo Go 54.0.8 (published 2026-05-12) and offers no update, which cannot run an SDK 57
   project. Current Android clients are published as APKs to
   `https://github.com/expo/expo-go-releases/releases`. Resolve the exact client version
   and download URL for any SDK from `https://api.expo.dev/v2/versions/latest`, fields
   `sdkVersions["57.0.0"].androidClientVersion` and `.androidClientUrl`.

   A development build avoids this coupling entirely, because it is compiled against the
   project's own SDK rather than depending on whichever client Expo has published.

2. **Never hardcode `sdkVersion` in `app.json`.** Expo infers it from the installed `expo`
   package. A stale pin silently makes the served manifest advertise the wrong runtime.
   Verify with `npx expo config --type public`.

3. **The device must reach Metro.** Test from the phone's browser at
   `http://<pc-lan-ip>:8081`. If that is unreachable while the phone and PC share a
   subnet, the cause is router client/AP isolation or a VPN on the phone, not the firewall.
   Use the tunnel, which bypasses the LAN entirely:

   ```bash
   npx expo start --tunnel
   ```

A cold Metro bundle takes roughly four minutes on a low-power laptop, against about twelve
seconds warm, which is slow enough to time out the device's download. Warm the cache from
the PC before scanning the QR code, and reserve `--clear` for genuine stale-cache
debugging rather than routine starts:

```bash
curl -s -o /dev/null -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:8081/node_modules/expo-router/entry.bundle?platform=android&dev=true&transform.engine=hermes&transform.bytecode=1&transform.routerRoot=app"
```

Application checks:

```bash
npm run typecheck
npm run lint
npm test
npx expo config --type public
npx expo export --platform android
```

Database changes are not complete until migrations and pgTAP suites run in a repeatable environment, preferably CI. A linked development project may support investigation, but it is not a substitute for an automated regression gate.

That gate now exists. Every push to `main` or `develop`, and every pull request into them, applies all migrations from zero to a disposable Supabase stack and runs the pgTAP suites, reporting the exact executed assertion count. It needs no hosted-project credentials. Running the suites locally still requires Docker, which is not installed on the founder's machine (DL-026), so CI remains the only place they execute.

## Development principle

> Build the smallest verified workflow that helps an owner know what needs attention, why it matters, and what to do next.

Do not build the complete Philippine MSME lifecycle in the first release.
