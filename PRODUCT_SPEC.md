# Product Spec

**This document owns "what the product is."** Full product thesis, reference cases, and
validation framework remain in `docs/PROJECT_BLUEPRINT.md`, which this file does not duplicate.

## The product

NegosyoOS PH is a **native mobile application**, built with React Native, Expo, Expo Router, and
TypeScript, for Philippine MSME owners. There is no web client, no PWA/TWA path, and no
"web-first, native-later" sequencing. See [DL-056](docs/DECISION_LOG.md#dl-056).

> NegosyoOS PH helps Philippine MSME owners establish and maintain their businesses, meet
> compliance obligations, control daily operations, and make better decisions through affordable
> AI-assisted self-service, with human support available when needed.

## Target user

An owner-operator of a Philippine micro or small business — first reference case: a coffee shop
(DUO BREW, Mandaluyong) doing purchasing and stock decisions from a phone, often on a mid-range or
low-end Android device, sometimes on unstable connectivity. Not a desk worker at a computer.

## Primary problem (first slice)

Recurring purchasing and availability pain that does not require an exact peso-loss figure to be
real: stockouts, overbuying, spoilage/waste, forgotten purchases, unavailable items at the counter,
uncertainty before a supplier visit. See `docs/PROJECT_BLUEPRINT.md` §6.

## Product pillars (unchanged by the mobile pivot)

1. **Stocks & Operations** — what needs attention or purchasing.
2. **Permits & Compliance** — what must be prepared, submitted, renewed, or followed up.
3. **Taxes & Records** — what must be recorded, reviewed, estimated, or filed.

All three follow the shared action model: *what needs attention → why it matters → missing
information → bounded next action → owner decision → outcome.* AI explains and organises;
deterministic rules and recorded evidence decide; the owner or an authorised human confirms.
Internal codenames must never appear in user-facing UI.

## MVP boundary — this migration

This document's scope for the current work is the **mobile foundation only**: an app that launches,
routes authenticated and unauthenticated users correctly, lets an owner sign up, verify by typed
email code, sign in, sign out, survive a relaunch with session intact, and create/list/switch a
business through the existing membership-based backend. No product-area screen ships in this
slice.

## Current sequencing

1. Mobile foundation (this migration).
2. `feature/business-creation-ceiling` — the one open Phase gate B application item this migration
   does not close (see `PROJECT_STATE.md`).
3. First end-to-end Stocks action slice — 8–12 priority items, count entry, a bounded low-stock
   action, purchase-list add, owner confirm/change/dismiss, outcome recorded. Not started.
4. Permits, Taxes, unified dashboard, broader AI — all `PLANNED`, in that order, each gated on the
   one before it surviving a real operator.

## Explicitly out of scope for this migration

Everything in `docs/BUILD_PLAN.md`'s Phase 1A exclusion list, plus, specific to the mobile pivot:
any Stocks/Permits/Taxes screen, offline writes beyond what session persistence requires, EAS
production deployment, subscription billing, iOS build/signing, and any change to the database
schema or hosted data.
