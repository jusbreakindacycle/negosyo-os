# Technical Foundation

| Decision | Phase 1A selection |
| --- | --- |
| Delivery | Responsive web application; PWA packaging after workflow validation |
| Framework | Next.js App Router |
| Language | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Supabase |
| Database | PostgreSQL through Supabase |
| Authentication | Supabase Auth with SSR |
| File storage | Supabase Storage |
| Authorisation | PostgreSQL RLS plus server/database command checks |
| Repository | One application repository |
| AI | Optional assisted layer over deterministic domain outputs |
| Status | Prototype architecture; revisitable after validation |

## 1. Architectural principles

1. **Domain truth before AI prose.**
2. **Business membership is the only route to business data.**
3. **High-impact writes are authorised server-side or in database RPCs.**
4. **The dashboard aggregates domain actions; it does not own every domain record.**
5. **Missing data produces an unknown state, not an invented value.**
6. **A rule is versioned data with provenance, not hard-coded anonymous prose.**
7. **A test is evidence only after it executes the intended path.**
8. **The product must remain usable without an AI provider.**
9. **Current scope is a narrow prototype, not a universal MSME platform implementation.**

## 2. Current implementation truth

As of the public repository review on 2026-08-03:

| Capability | Status |
| --- | --- |
| App scaffold, auth screens, business creation/switching | Implemented |
| Membership-based tenancy foundation | Implemented; prior verification exists |
| Application CI | Present |
| Full database test execution in CI | Not established |
| Business lifecycle fields | Migration exists |
| Tracked items | Migration exists |
| Daily sales | Migration and RPCs exist |
| Stocks user interface | Not implemented |
| Reorder calculation | Not implemented |
| Action dashboard | Not implemented |
| Permits, documents, taxes, AI integration | Not implemented |

Do not derive repository status from commit titles alone. The source tree, migrations, routes, executed tests, and observed runtime are the evidence.

## 3. Code organisation

Target organisation:

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
│   ├── dashboard/
│   ├── documents/
│   ├── stocks/
│   ├── permits/
│   └── taxes/
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── validation/
│   ├── evidence/
│   ├── rules/
│   ├── ai/
│   └── utilities/
└── types/

supabase/
├── migrations/
└── tests/database/

tests/
├── unit/
├── integration/
└── e2e/
```

Internal legacy codenames may survive in migration history or package names, but new user-facing components use Stocks, Permits, and Taxes terminology.

Avoid a monorepo during Phase 1A unless a measured build or ownership problem requires one.

## 4. Domain boundaries

Stocks, Permits, and Taxes may use typed shared services:

- identity and businesses;
- memberships and authority;
- documents and evidence;
- tasks and deadlines;
- audit history;
- notifications;
- dashboard action presentation.

They must not directly manipulate each other’s private tables.

Taxes may consume owner-confirmed sales or expense records through explicit interfaces. It must not query arbitrary Stocks implementation details or assume operational records are complete tax records.

The dashboard consumes domain-produced action candidates. It must not bypass domain commands to mutate private tables.

## 5. Shared action contract

Start as an application-layer typed read model, not a universal database table.

```ts
type EvidenceStatus =
  | "verified"
  | "implemented_unverified"
  | "documented_only"
  | "planned"
  | "research_required";

type ActionDomain = "stocks" | "permits" | "taxes" | "shared";

interface ActionCandidate {
  id: string;
  businessId: string;
  domain: ActionDomain;
  title: string;
  reason: string;
  nextAction: string;
  priority: "low" | "medium" | "high" | "critical";
  dueAt?: string;
  sourceRefs: string[];
  sourceFreshness?: string;
  missingData: string[];
  evidenceStatus: EvidenceStatus;
  confidence?: "insufficient" | "low" | "medium" | "high";
  requiresConfirmation: boolean;
  authorisedActions: string[];
}
```

Rules:

- Domain code creates the candidate.
- Deterministic urgency overrides AI ranking.
- AI may rewrite `title`, `reason`, or `nextAction` for clarity without changing facts.
- Source references and missing data are immutable inputs to the AI layer.
- The dashboard never treats an AI-only candidate as an obligation.
- Do not persist a general action table until at least two domains prove that the lifecycle and fields are genuinely shared.

## 6. Evidence and provenance model

Material facts should support:

- `source_type`;
- `source_reference`;
- `recorded_by`;
- `recorded_at`;
- `effective_from` / `effective_to`;
- `verified_at`;
- `evidence_status`;
- `correction_of` or version;
- `notes` for uncertainty, not hidden assumptions.

Legal and compliance rules also require:

- jurisdiction;
- agency;
- business applicability;
- official citation;
- effective date;
- supersession relationship;
- last-reviewed date;
- reviewer or verification method.

AI output is never a source.

## 7. Stocks data and calculations

Current/near-term records may include:

- priority tracked items;
- stock counts;
- supplier or supplier cadence;
- lead time;
- pack size and minimum order quantity;
- purchases and receiving;
- waste/spoilage/unavailability events;
- purchase recommendations and owner decisions;
- outcomes;
- daily sales when relevant.

### Daily sales boundary

Daily sales is:

- required for sales-based tax estimates;
- potentially useful for demand analysis;
- not required for every low-stock or purchase-list action;
- not proof that tax records are complete;
- not automatically comparable across businesses or periods.

### Numeric safety

- Validate type, scale, date, and business membership.
- Do not use one global hard ceiling for legitimate business values.
- After a sufficient baseline exists, require confirmation for anomalous values.
- Show the entered figure and usual range.
- Log the confirmation.
- Treat missing days and corrected records explicitly.
- Every derived value includes input coverage and formula version.

### Reorder safety

Do not calculate a confident quantity unless compatible values exist for:

- current quantity and unit;
- expected usage or owner-defined minimum;
- time until next purchase/delivery;
- lead time;
- pack size/MOQ where relevant.

Otherwise return a bounded qualitative action with missing fields.

## 8. Permits and compliance rules

A compliance rule is not universal unless its scope says so.

Minimum rule fields:

- rule ID and version;
- jurisdiction and agency;
- business/activity conditions;
- official source;
- effective and expiry/supersession dates;
- required documents;
- fee status or source;
- processing classification when officially published;
- evidence required to start a clock;
- result boundaries;
- last verification date.

### RA 11032 safety

Do not reduce RA 11032 to a universal 3/7/20 countdown.

A clock may start only when the product has enough evidence for the relevant trigger. Automatic-approval language must account for complete documentary requirements, required payments, applicable classification, Citizen’s Charter, and other statutory or sector-specific conditions.

Until a legally reviewed flow exists, alerts say “processing period may have passed—review or escalate” rather than “approved.”

## 9. Tax rules and calculations

Tax calculations are pure deterministic functions over explicit inputs and a versioned rule.

Every output returns:

- input period;
- input coverage;
- taxpayer facts used;
- missing facts;
- rule version and effective date;
- calculation;
- estimate/official boundary;
- warnings;
- next review action.

The LLM does not calculate the authoritative amount, select eligibility, or choose an election.

BMBE certification, BIR treatment, and the 8% option are separate facts. The system must not treat screening as certification or display BMBE income-tax exemption and the 8% option as simultaneously applicable.

Rules must be checked against current primary sources at implementation and periodically thereafter.

## 10. AI architecture

Recommended flow:

```text
Business records + versioned rules
             ↓
Deterministic domain service
             ↓
ActionCandidate / calculation result
             ↓
Minimum necessary context
             ↓
AI explanation or summary
             ↓
Owner confirmation / authorised command
             ↓
Server or SECURITY DEFINER RPC
```

AI requirements:

- server-side provider key only;
- minimum necessary business data;
- no client record training by default;
- model and prompt version logging where outputs affect decisions;
- source references preserved;
- structured output validation;
- timeout and non-AI fallback;
- no direct unrestricted database access;
- no autonomous filing, payment, communication, or role assignment;
- no silent retries that duplicate high-impact actions.

Prompt rule:

> When required evidence is missing, return `unknown` and ask for the missing fact. Never complete the gap from general knowledge.

## 11. Multi-tenancy and authorisation

Each business-owned record has `business_id`.

Users access a business through `business_memberships` and no other identity field.

Existing pattern retained:

- no direct authenticated table writes where RPC control is required;
- `SECURITY DEFINER` functions use an empty `search_path`;
- identity comes from `auth.uid()`;
- helper predicates remain outside published API schemas;
- RLS on every exposed table;
- grants and RLS provide independent failure layers.

Before adding roles beyond owner:

- define read/write matrix by table and action;
- ensure audit history is not a wider read path than the underlying data;
- model representative authority by task and validity period;
- test role changes, revocation, and stale sessions.

Paid or lifecycle restrictions that matter must be enforced server-side, not only by hidden React components.

## 12. Abuse controls

Before public testing:

- cap business creation per account or document a different ceiling;
- limit expensive or high-growth RPCs;
- monitor audit-table growth;
- rate-limit authentication and AI endpoints where platform controls are insufficient;
- make idempotency explicit for repeated commands;
- provide administrative recovery for accidental growth without exposing service credentials.

## 13. Documents and privacy

Documents are private by default.

Store metadata needed for provenance and access, not portal passwords or unnecessary personal data.

Use signed access. Validate file size and type. Define retention, removal, export, and account-deletion behaviour before real owner documents are accepted.

Audit metadata policy:

- one shared enforcement point;
- deliberate allowed keys;
- no false comments claiming a TypeScript filter protects SQL writes;
- sensitive and financial values justified by purpose and read-audience parity;
- role changes trigger a privacy review.

## 14. PWA and offline strategy

Validate the online workflow first.

Near term:

- mobile-first responsive UI;
- connectivity status;
- clear failure/retry behaviour;
- safe read-only cache where appropriate.

After validation:

- manifest and icons;
- installability;
- application-shell caching;
- TWA evaluation.

Defer offline writes until commands are idempotent and conflicts are defined per record type. Never present unsynchronised compliance or tax status as confirmed.

## 15. Validation and forms

Use shared schema validation for every external input.

- Client validation improves usability.
- Server/RPC validation is authoritative.
- Query parameters entering security-sensitive calls use allow-lists.
- Monetary and date inputs include locale-safe parsing and adversarial tests.
- Confirmation is required for overwrites and anomalous high-impact values.
- Accessibility includes label association, focus management, errors, keyboard flow, and screen-reader testing.

## 16. Testing and verification gates

Application:

- type check;
- lint;
- unit tests;
- production build;
- route-level integration;
- end-to-end owner workflow.

Database:

- reset from zero;
- migration ordering;
- pgTAP;
- positive and negative tenant cases;
- role and audit parity;
- RPC behaviour;
- deliberate broken-policy test.

Calculations:

- boundary values;
- missing values;
- unit mismatch;
- zero and negative;
- extreme but valid;
- stale baseline;
- corrected records;
- insufficient evidence.

AI:

- structured output validation;
- prompt-injection resistance around uploaded text;
- unsupported-claim refusal;
- missing-evidence behaviour;
- source preservation;
- non-AI fallback.

A verification record states command, environment, commit, result, and assertion count.

## 17. Operational readiness

Before unsupervised use:

- error, loading, and not-found boundaries;
- structured logging without sensitive data;
- observability for failed commands and AI calls;
- backup and recovery understanding;
- rate/usage monitoring;
- privacy notice and data-removal path;
- security review;
- accessibility and low-cost-device test;
- slow-network test.

## 18. Anti-hallucination development protocol

Every AI coding task must begin by reading the controlling documents and inspecting the current tree.

The task prompt must list:

- verified current state;
- files allowed to change;
- exact in-scope behaviour;
- explicit exclusions;
- tests that must run;
- evidence label expected after completion.

Claude Code or another coding agent must not:

- infer missing requirements from future milestones;
- create tables because they are mentioned as eventual concepts;
- mark work complete without executed checks;
- convert hypotheses into requirements;
- upgrade legal claims without primary sources;
- rewrite decision history;
- introduce a universal abstraction before two concrete workflows prove it;
- add AI where deterministic code is sufficient;
- claim a UI exists because types or migrations exist.

Completion report format:

1. files changed;
2. user capability now available;
3. tests actually executed and results;
4. tests not executed and why;
5. remaining evidence status;
6. deviations or new decisions requiring approval.

## 19. Phase 1A exclusions

No full POS, ERP, accounting, payroll, HR, lending, banking, insurance, marketplace, nationwide rules database, direct government filing/payment, autonomous agent, professional marketplace, all-vertical engine, production-grade offline sync, subscription billing, or production launch.
