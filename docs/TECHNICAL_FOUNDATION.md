# Technical Foundation

| Decision | Prototype selection |
| --- | --- |
| Delivery | Responsive Progressive Web Application |
| Application framework | Next.js App Router |
| Language | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Supabase |
| Database | PostgreSQL through Supabase |
| Authentication | Supabase Auth using current SSR guidance |
| File storage | Supabase Storage |
| Authorisation | PostgreSQL Row Level Security |
| Deployment target | Standards-compatible Next.js hosting |
| Repository model | One application repository, not a monorepo |
| Status | Selected for Phase 1A prototype; revisitable after validation |

## 1. Why this stack

The prototype needs:

- one codebase for desktop and mobile web;
- installable PWA capability;
- fast solo development;
- secure authentication and business-level access control;
- relational data;
- private document storage;
- low initial infrastructure complexity;
- a future path to native packaging without starting with two codebases.

Next.js supports the App Router, built-in TypeScript setup, and an official PWA guide. Supabase provides PostgreSQL, authentication, storage, and Row Level Security. Tailwind and shadcn/ui support rapid, customisable interface development.

This is a prototype stack decision, not a claim that it is permanently optimal.

## 2. Version policy

- Use the latest stable, mutually compatible versions at project initialisation.
- Do not use prerelease or canary packages without explicit approval.
- Use a Node.js version supported by the selected Next.js release. Next.js 16 documentation currently lists Node.js 20.9 as the minimum.
- Commit the lockfile.
- Record major upgrades in `DECISION_LOG.md`.
- Do not pin version numbers in product documentation unless a compatibility requirement exists.

## 3. Initial project setup

Recommended scaffold:

```bash
npx create-next-app@latest . --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"
```

Then add Supabase and shadcn/ui using their current official installation instructions.

Use npm unless the founder explicitly selects another package manager.

## 4. Code organisation

```text
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   └── (app)/
├── components/
│   ├── ui/
│   └── shared/
├── features/
│   ├── businesses/
│   ├── documents/
│   ├── start-comply/
│   └── operate-decide/
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── validation/
│   └── utilities/
└── types/

supabase/
├── migrations/
└── seed.sql

tests/
├── unit/
└── e2e/
```

Avoid a monorepo during Phase 1A.

## 5. Domain-boundary rule

`start-comply` and `operate-decide` may depend on typed shared services such as businesses, documents, identity, and audit history.

They must not directly manipulate each other’s private tables or internal implementation details.

Cross-domain information should pass through explicit application services.

Example:

- Operate & Decide may submit owner-confirmed purchase documents to the shared document vault.
- Start & Comply may reference those documents.
- Start & Comply must not automatically declare the purchase deductible.

## 6. Initial data model

This is a prototype model, not the final enterprise architecture.

This section originally predated `docs/PROJECT_BLUEPRINT.md` v2.0 and was incomplete: it omitted daily sales and suppliers entirely, and its Operate & Decide list did not carry the buying facts that a reorder recommendation needs. It is corrected here. **Where this section and the blueprint still disagree, the blueprint governs.**

Do not create every table at once. Add tables only when the corresponding build-plan slice begins. Status below reflects what exists in `supabase/migrations`.

### Shared

| Table | Status |
| --- | --- |
| `profiles` | Built (M1) |
| `businesses` | Built (M1); `legal_name` and `status` added in M2 |
| `business_memberships` | Built (M1) |
| `audit_events` | Built (M1) |
| `branches` | Not yet needed |
| `documents` | M4 |
| `document_links` | M4 |

`businesses` carries three separate name-and-lifecycle facts. `name` is what the owner calls the business and exists from the moment the row is created. `legal_name` is the registered DTI or SEC name and **must stay nullable**, because a business in Setup mode has not got one yet. `status` is `draft | registering | operating | closed` and is what drives Setup mode versus Running mode.

### Operate & Decide — Stocks

| Table | Status | Note |
| --- | --- | --- |
| `tracked_items` | Built (M2) | 8–12 priority items, with `unit`, `pack_size`, `minimum_order_qty`, `latest_unit_cost` |
| `daily_sales` | M2 | One gross-sales figure per business per day. Load-bearing for all of Taxes. |
| `stock_counts` | M2 | |
| `suppliers` | M2 | Adds `tracked_items.supplier_id` by `ALTER` when it lands |
| `purchases` | M2 | |
| `purchase_lines` | M2 | |
| `receiving_events` | M2 | |
| `purchase_needs` | M2 | The reorder recommendation and the owner's decision on it |
| `discrepancies` | M2 | Secondary to the buying decision, not the headline |
| `owner_actions` | M2 | |
| `action_outcomes` | M2 | |
| `inventory_movements` | Deferred | Do not build a general movement ledger before the concrete flow works |

`daily_sales` and `latest_unit_cost` are the only sources of a peso figure in Stocks. Without them a shortage can only ever be reported in kilos, and nothing tax-related can be computed at all.

### Start & Comply — Permits

| Table | Status |
| --- | --- |
| `compliance_cases` | M3 |
| `compliance_tasks` | M3 |
| `task_assignments` | M3 |
| `fee_records` | M3 |
| `status_events` | M3 |
| `business_certifications` | M3 (BMBE Certificate of Authority) |
| `eligibility_assessments` | M3 (non-binding screening only) |
| `asset_snapshots` | M3 |
| `certification_effects` | M3 |

The RA 11032 clock needs the date of complete submission, the 3 / 7 / 20 transaction class, and the submission receipt as evidence. The receipt is a document, so the statutory clock depends on M4.


### Enterprise classification data

Avoid one overloaded field for “business type.”

Model separately:

- `legal_form`;
- `enterprise_size_class`;
- `customer_model`;
- `operating_model`;
- `certification_status`;
- `tax_registration_status`.

A business serving corporate or bank clients must not be classified as large based on client type alone.

### BMBE modelling constraint

Do not create a single boolean such as `is_bmbe`.

Use separate concepts:

- `eligibility_assessments` for non-binding screening output;
- `asset_snapshots` for dated, evidence-labelled owner or document values;
- `business_certifications` for an actual Certificate of Authority and its validity period;
- `certification_effects` for a claimed tax, labour, financing, training, or LGU consequence and its confirmation status.

A certificate and a tax effect are not the same fact.

Suggested status values should distinguish:

- potentially eligible;
- application planned;
- application submitted;
- certificate issued;
- certificate expired;
- certificate revoked or cancelled;
- effect unconfirmed;
- effect document-supported;
- professional review required.

Do not calculate final BMBE eligibility or activate tax treatment solely in client code.

## 7. Multi-tenancy and authorisation

Each business-owned record must be linked to a `business_id`.

Users access a business through `business_memberships` **and through nothing else.** No other column confers access, and no development-only identifier may stand in for a real membership.

As implemented in M1 and carried into every table since:

- `authenticated` holds no write privilege on any table. Every write goes through a `SECURITY DEFINER` function with an empty `search_path`, so grants and policies fail independently and a mistake in one does not open the other.
- Identity inside those functions comes from `auth.uid()` only, never from a parameter. A function taking a user id is a function that can be impersonated through.
- `private.is_business_member()` holds the membership predicate once rather than repeating it in each policy, where one copy could drift.
- That helper must be executable by `authenticated`, because a policy expression is evaluated as the invoking role rather than as the table owner. Granting it opens nothing: `private` is absent from `api.schemas`, so PostgREST publishes no endpoint for it, and the function takes no user id.

Roles arrive in the milestone that first uses them, each by its own `alter type ... add value`. `business_role` currently carries `owner` alone.

Eventual roles for the prototype:

- `owner`
- `admin`
- `staff`
- `representative`
- `viewer`

Roles alone are insufficient. Domain actions must also check business membership and, for representatives, task-specific authority where applicable.

Every exposed Supabase table must:

1. enable RLS;
2. have explicit policies;
3. deny access when no policy matches;
4. be tested for cross-business isolation.

Never expose a service-role key to the client.

## 8. Documents

Documents are private by default.

Store:

- storage path;
- business owner;
- uploader;
- document category;
- evidence label;
- source or issuer;
- issue date;
- expiry date;
- verification status;
- checksum or immutable identifier when useful;
- created and updated timestamps.

Use signed access rather than public buckets for sensitive business documents.

Avoid storing secrets or government portal credentials.

## 9. PWA and offline strategy

Phase 1A:

- responsive mobile-first layout;
- web app manifest;
- installability;
- cached application shell where appropriate;
- clear online or offline status;
- safe read-only fallback for selected previously loaded screens.

Defer complex offline writes and background synchronisation until the online domain flows and conflict rules are stable.

When offline writes are introduced:

- queue explicit commands rather than silently overwriting records;
- show pending-sync status;
- retain client-generated IDs;
- make commands idempotent;
- define conflict resolution per record type;
- never present unsynchronised compliance status as confirmed.

## 10. Validation and forms

Use schema validation for all external input.

Recommended:

- Zod for shared validation schemas;
- React Hook Form where client-side form state is complex;
- server-side validation even when client validation exists.

Avoid generic form builders during the first slices.

## 11. Testing baseline

Required categories:

- unit tests for calculations and status transitions;
- RLS tests for multi-business isolation;
- integration tests for important database workflows;
- end-to-end tests for the owner’s main path;
- production build in continuous integration.

High-priority end-to-end flows:

1. sign in and create business;
2. owner invites or assigns a representative;
3. compliance case records a task, fee, receipt, and temporary expiry;
4. inventory flow records count, purchase decision, outflow, receiving, discrepancy, and outcome;
5. unauthorised user cannot access another business.

## 12. Audit and timestamps

Use server-generated timestamps for authoritative events.

Audit:

- actor;
- business;
- domain;
- action;
- entity type and ID;
- before and after summary where appropriate;
- source;
- timestamp.

Do not store passwords, OTPs, tokens, or unnecessary sensitive content in audit records.

## 13. AI integration boundary

Do not integrate an AI provider in the first foundation milestone.

First establish:

- typed domain data;
- evidence labels;
- deterministic calculations;
- auditability;
- user confirmation points.

Later AI calls must:

- use the minimum necessary data;
- treat BMBE screening as preliminary and evidence-dependent;
- avoid training on client records by default;
- record model and prompt version;
- distinguish source fact from inference;
- require owner confirmation before high-impact changes;
- avoid autonomous filing, payment, or legal representation.

## 14. Official technical references

- Next.js App Router and installation: https://nextjs.org/docs/app
- Next.js Progressive Web Apps guide: https://nextjs.org/docs/app/guides/progressive-web-apps
- Supabase with Next.js: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase Auth for Next.js: https://supabase.com/docs/guides/auth/quickstarts/nextjs
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage access control: https://supabase.com/docs/guides/storage/security/access-control
- Tailwind framework guides: https://tailwindcss.com/docs/installation/framework-guides
- shadcn/ui Next.js installation: https://ui.shadcn.com/docs/installation/next
