# NegosyoOS PH

> **Temporary working name.** Final branding has not been approved or screened.

NegosyoOS PH helps a small Filipino business owner know three things: **what to buy, what to file, and how much they owe.**

It is one mobile-first application for Philippine MSME owners who have no point-of-sale system, no bookkeeper on staff, and no reliable way to tell whether they are losing money. It does not require them to buy hardware, hire anyone, or change how they sell.

## The three features

| Feature | The owner's question |
| --- | --- |
| **Stocks** | *Ano bibilhin ko, magkano, kailan?* |
| **Permits** | *Ano kailangan kong ayusin, kailan ang deadline?* |
| **Taxes** | *Magkano kaya babayaran ko?* |

Taxes is not a third engine. It is the intersection of the other two: operations captures the money data, compliance knows the deadlines, and tax is what falls out. That is the reason both belong in one application rather than two.

Internally the two domains are codenamed `Start & Comply` and `Operate & Decide`. Those names are for the codebase only and never appear in the interface.

## The data spine

The owner enters data once, in under thirty seconds a day:

- gross sales — one number per day;
- purchases and expenses, with receipt;
- stock counts — weekly, priority items only.

Everything the product shows is an output of that one spine. The daily gross-sales figure is load-bearing: without it there is nothing to compute percentage tax, the 8% comparison, or the ₱3M VAT threshold position from.

## Two modes

Before the business opens, only the registration path is visible, and Stocks and Taxes read *"Mabubuksan kapag bukas na ang tindahan mo."* Marking the mayor's permit as issued switches the application into running mode, where all three features appear. It is an earned moment, not a settings toggle.

## Current status

**Phase 1A — Foundation Prototype**

| Milestone | Content | Status |
| --- | --- | --- |
| M0 | Repository and application scaffold | ✅ Complete |
| M1 | Authentication, business tenancy, RLS, audit spine | ✅ Complete |
| M2 | Stocks | In progress |
| M3 | Permits, the RA 11032 clock, Setup mode | |
| M4 | Document vault | |
| M5 | Taxes | |
| M6 | Deadlines, PWA baseline, TWA packaging | |
| M7 | Field-test preparation | |

Coding is authorised for a narrow prototype. This is not commercial validation, final architecture approval, or approval of a market.

## What this is not

The application does not claim to be a government platform, guarantee any permit or tax outcome, present operational records as registered accounting books, present AI as a lawyer or CPA, or tell anyone what business to start. It organises and estimates; it does not assert and file.

Two reference cases inform the build — a franchisee-operated coffee shop in Mandaluyong and a car-tint installation business in Pasig. Neither has yet produced a peso figure for a loss, and that null result is recorded rather than quietly dropped. A third case, a B2B air-conditioning services business, is preserved for later job-centred validation and has not been interviewed.

## Development

```bash
npm install
npm run dev
```

Checks, all of which must pass before a task is reported complete:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Database work requires the Supabase CLI. `db:reset` and `db:test` need Docker; where Docker is unavailable, migrations and pgTAP suites are applied and verified against the linked development project instead.

```bash
npx supabase db push --linked      # apply migrations
npm run db:types:linked            # regenerate src/types/database.ts
```

## Controlling files

Read these before development:

- [`docs/PROJECT_BLUEPRINT.md`](docs/PROJECT_BLUEPRINT.md) — authoritative where documents disagree
- [`docs/TECHNICAL_FOUNDATION.md`](docs/TECHNICAL_FOUNDATION.md)
- [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md)
- [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md)
- [`CLAUDE.md`](CLAUDE.md)

## Development principle

> One unified product, three features, one data spine, narrow validated releases.

Do not attempt to build the complete Philippine MSME lifecycle in the first release.
