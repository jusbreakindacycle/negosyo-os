# Decision Log

Append only. Do not rewrite historical entries to make later decisions appear inevitable.

---

## DL-001 — One unified product and repository

**Date:** 2026-07-31
**Status:** Approved founder decision

NegosyoOS PH proceeds as one application, one owner account, and one active repository.

The previous standalone BusinessOS repository is retired as an active project after preserving its important principles and evidence in this repository.

This does not approve final branding or production architecture.

---

## DL-002 — Two bounded domains

**Date:** 2026-07-31
**Status:** Approved founder decision

The unified product contains:

- Start & Comply
- Operate & Decide

Both belong to the same application. Their rules, decisions, and professional boundaries remain distinguishable.

---

## DL-003 — Phase 1A foundation-prototype coding

**Date:** 2026-07-31
**Status:** Approved founder decision

Coding may begin for a narrow foundation prototype.

The prototype includes shared foundations and one small reference workflow in each domain.

This does not establish market validation, a production launch, or the final release scope.

---

## DL-004 — Prototype technical stack

**Date:** 2026-07-31
**Status:** Selected for prototype implementation

Use:

- Next.js App Router;
- TypeScript;
- Tailwind CSS;
- shadcn/ui;
- Supabase PostgreSQL, Auth, Storage, and RLS;
- responsive PWA-first delivery.

Use one application repository, not a monorepo.

The stack may be revisited after prototype and field evidence.

---

## DL-005 — Self-service-first service model

**Date:** 2026-07-31
**Status:** Approved founder direction

The default service is owner self-service with software and AI assistance.

Owners may appoint representatives for specific transactions.

Qualified professionals are optional escalation where necessary.

A mandatory case manager is not part of normal use.

---

## DL-006 — First operational vertical remains unselected

**Date:** 2026-07-31
**Status:** Approved project constraint

The twelve carried-forward operational candidates remain hypotheses.

The DUO BREW reference workflow does not select CaféOS.

Vertical selection requires comparative evidence.

---

## DL-007 — Inventory versus jobs and orders remains unresolved

**Date:** 2026-07-31
**Status:** Open product and architecture question

The operations domain should eventually accommodate physical items, customer work, or both.

The prototype will not create a universal engine.

A concrete inventory-centred flow will be built first, followed later by a structurally different job-centred flow before extracting shared architecture.

---

## DL-008 — Minimal documentation rule

**Date:** 2026-07-31
**Status:** Approved repository-governance decision

The repository uses a small set of controlling documents.

Do not create one Markdown file per task, feature, screen, or discussion.

Update the controlling files when a durable decision changes.

---

## DL-009 — Working names only

**Date:** 2026-07-31
**Status:** Working names

The following are temporary:

- NegosyoOS PH
- PermitFlow PH
- BusinessOS
- Start & Comply
- Operate & Decide

Final naming requires separate research and approval.

---

## DL-010 — BMBE model added to Start & Comply

**Date:** 2026-07-31
**Status:** Approved product constraint

BMBE is modelled as a time-bound business certification and possible incentive status within Start & Comply.

The application may provide preliminary eligibility screening, evidence organisation, Certificate of Authority tracking, expiry and renewal reminders, and BIR-treatment status tracking.

The application must not automatically certify eligibility, issue a Certificate of Authority, activate an income-tax exemption, or imply that BMBE removes all other registrations, taxes, records, invoices, labour obligations, or LGU requirements.

BMBE certificate status and each claimed legal, tax, labour, financing, training, or local-government effect must be represented separately.


---

## DL-011 — Enterprise classification and reference cases corrected

**Date:** 2026-07-31
**Status:** Approved founder clarification

MSME is the broad enterprise-size classification covering micro, small, and medium enterprises.

BMBE is not an alternative to MSME or a separate market outside MSMEs. It is a special certification or incentive status potentially available to qualified micro enterprises.

Legal form, enterprise size, BMBE status, tax treatment, operating model, and customer model must be represented separately.

The real-world discovery cases are corrected and expanded:

- DUO BREW is located in Mandaluyong City;
- the car-tint installation services business is located in Pasig City;
- the air-conditioning installation, cleaning, and repair business is a B2B service case serving mostly corporations and banks.

The size of a client does not determine the service provider’s own enterprise-size classification.

The air-conditioning case is preserved as a potential job-centred validation workflow, but its detailed requirements remain pending operator interview.

---

## DL-025 — Milestone order corrected against actual repository state

**Date:** 2026-08-02
**Status:** Approved founder decision

Entries DL-012 to DL-024 were never recorded in this file. DL-025 is used as directed; the gap is left rather than renumbered, because this log is append-only and rewriting it to look continuous would misrepresent its history.

### What was actually in the repository

A planning document circulated before this entry described the repository as containing only the `main` branch and the Milestone 0 scaffold, and treated authentication, tenancy, and Stocks as work still to be sequenced. That description was inaccurate. The verified state on 2026-08-02 was:

| Branch | Head | Contents |
|---|---|---|
| `main` | `373bb01` | `chore(release): promote Milestone 0 scaffold to main` |
| `develop` | `2d42ecc` | `feat: scaffold NegosyoOS PH application (#1)` |
| `feature/milestone-1-auth-tenancy` | `1ea2338` | `wip: implement Milestone 1 pending database verification` |

Two details are recorded precisely, because both were stated loosely before:

- `373bb01` does exist and is the head of `main`. It is a single-parent promotion commit, not a merge commit; its parent is `3cafdcc`.
- `2d42ecc` is the squashed work commit of PR #1, but it sits on `develop` and is **not** an ancestor of `main`.

The Milestone 1 branch held working sign-up, sign-in, session handling, business onboarding, a business switcher, four migrations, membership-based RLS, an audit spine, and three pgTAP suites: roughly 1,530 lines under `src/`, 560 lines of unit tests, 340 lines of migrations, and 790 lines of database tests.

### Decision

Authentication and tenancy were completed ahead of Stocks. They are **retained, not rebuilt**, and the milestone numbering is corrected to match what exists rather than the order originally imagined:

**M0** scaffold (complete) · **M1** auth and tenancy (complete) · **M2** Stocks · **M3** Permits with the RA 11032 clock and Setup mode · **M4** document vault · **M5** Taxes · **M6** deadlines, PWA, and TWA packaging · **M7** field test.

The earlier plan to build Stocks first and migrate its data behind real ownership later is therefore void. There is no data to migrate; ownership already exists.

### Consequences

1. **Stocks is built on real authentication.** Every Stocks table uses the membership-based RLS pattern established in `20260731125356_create_businesses_and_memberships.sql`. No development-only business identifier is introduced, and no shortcut stands in for a real membership.
2. **`businesses` is altered, not created.** It already exists with `name`, which is kept as-is. A nullable `legal_name` and a `status` enum — `draft | registering | operating | closed`, defaulting to `operating` for existing rows — arrive in a new migration.
3. **RLS is verified, not asserted.** See DL-026.

---

## DL-026 — Milestone 1 RLS verified against a real Supabase instance

**Date:** 2026-08-02
**Status:** Approved project constraint

Milestone 1 was committed as `wip: implement Milestone 1 pending database verification`. The pgTAP suites had never been executed anywhere: the linked project `NegosyoOS PH Development` held zero migrations and zero tables.

The four migrations were applied to that project and all three suites were run against it. The first run failed 40 of 127 assertions. Every failure was a defect in the **tests**, not in the schema:

- **34 failures — pgTAP overload ambiguity.** With four untyped string literals, `col_type_is('public', 'profiles', 'id', 'uuid')` binds to `col_type_is(table, column, type, description)` rather than the schema-qualified form, so it searched for a column named `profiles` on a table named `public` and reported `Column public.profiles does not exist`. The same collision affected `col_not_null`, `col_is_null`, `col_has_default`, `col_is_pk`, `has_index`, and `has_trigger`. Fixed by giving every such call an explicit description, which selects an arity where only the schema-qualified overload exists.
- **1 failure — catalogue text.** `set search_path = ''` is stored as `search_path=""` on this instance and as `search_path=` elsewhere. The assertion now compares the decoded setting.
- **5 failures — leaked session in the test itself.** `set_config(..., true)` is local to the *transaction*, not the statement. The no-session assertion called the RPC directly, so the previous caller's claims were still installed, `auth.uid()` returned that user, and the call created a business. The guard was never exercised. Routing the call through the helper with a null user blanks `request.jwt.claims` first.

The third item is the one that mattered. It was an assertion that reported a passing security guard while testing nothing. A separate probe confirmed the guard itself is correct: with claims genuinely absent, `create_business_with_owner` raises `42501 auth_required` as both `postgres` and `authenticated`, and writes nothing.

After the fixes, **all 127 assertions pass** — 82 schema, 24 cross-business isolation, 21 RPC behaviour.

**Standing rule:** a passing RLS test is only evidence if the negative case has been observed to fail for the intended reason. An assertion that cannot distinguish "the guard fired" from "the guard was never reached" is not a test. Milestone 1 is not marked complete on the strength of tests that have never run.

**Known environment limitation:** Docker is not installed on the founder's machine, so `supabase db reset` and `supabase test db` cannot run locally, and CI does not yet execute the pgTAP suites. Verification currently runs against the linked development project. Restoring a local or CI path for these suites is an open task.

---

## DL-027 — Coffee shop selected as the first reference case; DL-006 partially superseded

**Date:** 2026-08-02
**Status:** Approved founder decision

This supersedes **only the first clause** of DL-006, that the first operational vertical remains unselected. `docs/PROJECT_BLUEPRINT.md` v2.0 §11.1 names the coffee shop reference case as selected, which contradicted an approved project constraint. The contradiction is resolved here rather than left standing in the prose of two documents.

**Evidence relied on** — Operator-reported evidence, DUO BREW, Mandaluyong City:

- the franchisee decides their own order quantities;
- there is no POS;
- buying is done by eye — *"kung anong makita nilang kaonti."*

The first point is the one that decides it. A franchisee who is told what to order has no decision for software to support. A franchisee who chooses quantity and timing does.

### What remains binding

DL-006's second clause is **not** superseded and remains in force: **the DUO BREW workflow does not select CaféOS.**

Selecting a reference case is choosing what to build against. It is not narrowing the product to cafés. Specifically:

- Permits stays horizontal and applies to every business type without exception (DL-032);
- no café-specific vocabulary, column, or hard-coded item enters the shared spine;
- coffee-shop specifics belong in seed data and per-business configuration, never in table names or engine names;
- the twelve carried-forward operational candidates remain hypotheses, and comparative evidence is still required before any *market* is selected.

Read as a licence to build vertical-only software, this entry is being read wrongly.

Franchise is a feature subset, not a special case: a franchisee makes *fewer* decisions than an independent shop, not stranger ones. Supplier, price, and catalogue are fixed; quantity and timing remain theirs. Nothing built for the subset is wasted when expanding to independents.

### Still unconfirmed

DUO BREW produced no peso figure for monthly loss (DL-038), and whether the franchisor already supplies an ordering system remains open. If it does, it is the real incumbent for this reference case.

---

## DL-028 — Three user-facing feature names

**Date:** 2026-08-02
**Status:** Approved founder decision

The owner sees three features, each named for the question it answers:

| Internal codename | User-facing name | The owner's question |
|---|---|---|
| Operate & Decide | **Stocks** | *Ano bibilhin ko, magkano, kailan?* |
| Start & Comply | **Permits** | *Ano kailangan kong ayusin, kailan ang deadline?* |
| Tax readiness | **Taxes** | *Magkano kaya babayaran ko?* |

`Start & Comply` and `Operate & Decide` are project codenames retained for code organisation, documentation, and domain boundaries. **They must never appear in the interface.** They are internal names, and an owner who sees them learns nothing.

This governs feature naming only. DL-009 continues to govern the product name, which remains unscreened.

---

## DL-029 — Tax readiness is an intersection, not a third engine

**Date:** 2026-08-02
**Status:** Approved founder decision

Taxes is not a third domain. It is the intersection of the other two: operations captures the money data, compliance knows the deadlines, and tax is what falls out of both.

This is the structural reason the two domains belong in one application rather than two. Split them and the tax output cannot be produced by either half.

Consequences:

- no third domain package is created; Taxes is a read-side consumer;
- it reads operational figures and compliance dates through explicit, typed service boundaries, never by importing another domain's internals;
- it owns no primary input of its own, and must not acquire one;
- it is delivered in M5, after both sources of its data exist.

The boundaries in DL-010 and the product rules stand: organise and estimate, never assert and file.

---

## DL-030 — Daily gross sales is a required input

**Date:** 2026-08-02
**Status:** Approved product constraint

The owner records **one number per day**: total gross sales. This is load-bearing, not optional telemetry.

It unlocks percentage-tax estimation, the 8% versus graduated comparison, the ₱3,000,000 VAT threshold monitor, and sales-driven demand forecasting for Stocks. Without it the product cannot compute anything tax-related, and the reorder forecast loses its demand signal.

**It is not a POS and must never become one.** No line items, no products sold, no transaction log, no receipt printing. The design target is under 30 seconds a day.

The trade-off is accepted deliberately: a single self-reported figure is coarse and unverifiable. Requiring an itemised sales feed would be more accurate and would also lose the owner, who has no POS and did not ask for accounting software. Coarse data that is actually entered beats precise data that is not.

Constraints that follow:

- the figure is owner-reported and must be presented as such;
- these records are not registered accounting books and must never be called that;
- a missing day is a normal state and must be visible as missing, never silently interpolated into a total that is then used for a tax figure.

The daily-sales table is the first slice of M2 after tracked items.

---

## DL-031 — Setup mode and Running mode

**Date:** 2026-08-02
**Status:** Approved founder decision

The application changes shape according to where the business sits in its lifecycle. One application with two entry experiences, not two applications.

**Setup mode** — before the business opens. Only the registration path is visible: ordered steps, blockers, evidence, running cost. Stocks and Taxes are shown as deferred — *"Mabubuksan kapag bukas na ang tindahan mo."* — rather than hidden, so the owner knows they exist.

**Running mode** — after the business opens. All three features appear, and the registration case moves to history with its documents preserved.

**Graduation.** Marking the mayor's permit as issued switches the mode. It is an earned moment, not a settings toggle. It is also the natural free-to-paid conversion trigger, because it coincides with the business beginning to earn.

Product reason for Setup mode: during the 2–4 week permit wait the owner builds their item and supplier lists. That is dead time they are already spending, and it means a Door 1 business reaches opening day with tracking configured, a daily habit formed, and zero data debt.

**Schema consequence.** Mode is derived from `businesses.status` — `draft | registering | operating | closed` — and is not a separate flag; two sources of truth for the same state will drift. `legal_name` is nullable and separate from the everyday `name`, because a business in Setup mode has no registered name yet. Both arrived by `ALTER TABLE` in M2 rather than a fresh `CREATE`, since `businesses` already existed from M1 (migration `20260802094500_add_business_legal_name_and_status.sql`).

---

## DL-032 — Permits is horizontal, Stocks is vertical; parking reinstated

**Date:** 2026-08-02
**Status:** Approved founder decision

The most important structural decision in the product. The two engines have different shapes and must not be forced into one.

| | Permits | Stocks |
|---|---|---|
| Shape | **Horizontal** — one model, all business types | **Vertical** — one configuration per archetype |
| Composition | ~80% common trunk, ~20% industry tail | ~20% shared primitive, ~80% specific |
| Applies to | Every business without exception | Configured per business type |
| Commodity risk | High — Negosyo Centers give the same information free | Low — no free alternative exists |
| Pricing consequence | Free tier | Paid tier (DL-037, unapproved) |

**Parking is reinstated.** v1 deferred parking operators entirely. That was wrong and is reversed here. A parking operator needs DTI or SEC registration, barangay clearance, a mayor's permit, BIR registration, and the January renewal exactly as a carinderia does. **No business type is out of scope for Permits.**

What varies by business type is the Stocks configuration, never access to Permits. A business whose Stocks archetype has not been built yet still gets the full Permits engine.

Practical consequence for M2 and M3: Permits schema and rules carry no business-type branching in the trunk, and Stocks does not attempt to serve every archetype at once.

---

## DL-033 — Reconciliation Ledger supersedes the Par Ledger framing

**Date:** 2026-08-02
**Status:** Approved founder decision

"Par Ledger" described physical stock levels only, which is one instance of a more general pattern: *something goes out, something should come back, and the gap is the leak.*

| Business | Goes out | Should come back | The leak |
|---|---|---|---|
| Coffee shop | Ingredients | Sales | Spoilage, stockout |
| Carinderia | Cooked food | Same-day sales | Spoilage — worst of the set |
| Rice retail | Sacks | Kilos sold | Over-scooping, spillage, moisture |
| Laundry | Customer items | Same items, claimed | Lost or unclaimed items |
| Water refilling | Containers | Containers returned | Unreturned containers are capital loss |
| Parking | Tickets | Cash | Uncollected, unticketed |
| Aircon services | Completed jobs | Payment | Unbilled work, aged receivables |

One pattern, seven configurations. The name is adopted because "inventory" cannot describe the last three rows, and a product that ships an inventory table will never grow into them.

**This is a naming and modelling frame, not authorisation to build a universal engine now.** DL-007 stands unchanged: build the concrete inventory-centred flow first, then a structurally different job-centred flow, and only then extract whatever is genuinely shared. Reconciliation Ledger names what may eventually be extracted. It does not license extracting it before two real instances exist.

---

## DL-034 — BMBE moves to Milestone 3 and the free tier

**Date:** 2026-08-02
**Status:** Approved founder decision

Placement only. **Every guardrail in DL-010 stands unchanged and unweakened.**

BMBE is one path inside Permits, delivered in M3. It is not a headline feature, not a separate engine, and not a market.

It sits in the free tier for two reasons:

1. The same information is available free from DTI and Negosyo Centers. Competing against free is unwinnable.
2. It is **episodic** — screening, certification, renewal — not weekly. This is the identical argument that keeps the RA 11032 statutory clock out of the paid tier, and it must be applied consistently rather than selectively to whichever feature is currently in favour.

The application still must not certify eligibility, issue or imitate a Certificate of Authority, activate an income-tax exemption, count land toward the statutory asset ceiling, or imply that BMBE removes other registrations, taxes, records, invoices, labour obligations, or LGU requirements.

---

## DL-035 — No knowledge base; in-context help instead

**Date:** 2026-08-02
**Status:** Approved founder decision

A searchable article library is **rejected**. It would require hundreds of articles, need constant maintenance as rules change, duplicate freely available search results, and mismatch how owners behave: an owner does not browse a help centre, they get stuck on one specific step and want help at that step.

What is built instead is an *"Ano ito?"* affordance beside the thing that confused them, giving two sentences about that exact thing. No articles, no search box, no separate content system.

Consequences: help text lives next to the field or step it explains and is versioned with it; there is no content-management surface to build or staff; and no screen sends the owner away from their task to find an answer.

---

## DL-036 — AI explains; AI does not decide

**Date:** 2026-08-02
**Status:** Approved founder decision

> **AI explains. AI does not decide.**

Correct: *"This is Barangay Clearance. Kailangan mo ito bago ka makapag-apply sa City Hall."*
Wrong: *"You owe ₱18,372. File it now."*

AI is invisible plumbing behind in-context help (DL-035) — not a tab, a mascot, or a chat bubble. **Do not lead any public-facing description with AI.** Owners buy *"alam mo na kung ano bibilhin,"* not "AI-powered platform."

For high-impact outputs, continue to show: what the source says; what it does not say; the applicable inference; conflicts; unknowns; the bounded next action; and the evidence source with its version. Evidence labels are never upgraded silently.

This is consistent with the standing domain boundaries and does not relax them: no automatic tax conclusion, no automatic eligibility determination, no automatic declaration of compliance, and no presentation of AI as a lawyer, CPA, or government officer.

---

## DL-037 — Pricing hypothesis, not approved

**Date:** 2026-08-02
**Status:** Proposal — not approved

Recorded so the reasoning is not lost, and explicitly **not** approved.

| Tier | Contains | Logic |
|---|---|---|
| Free | Registration path, Setup mode, deadline reminders, RA 11032 clock, BMBE path | Government channels give the same information free |
| Paid | Buying assistant, variance, cost history, price-change alerts, tax readiness, ₱3M monitor | No free alternative exists |

Setup mode functions as a trial that costs nothing to provide, with opening day (DL-031) as the natural conversion trigger.

Unit economics held in view: at ₱399 per month net of Google Play's cut, roughly 90 paying subscribers replace a ₱30,000 monthly salary. The target is ninety paying owners, not "users." That is arithmetic on an unapproved price, not a forecast.

Billing is out of scope until after M7 and is not built in Phase 1A. While this remains a proposal, no screen, document, or public claim may present a price, a tier boundary, or a trial period as settled.

---

## DL-038 — Field evidence: two interviews complete, both null on peso figures

**Date:** 2026-08-02
**Status:** Firsthand user observation — confirmed null result

Two operator conversations are complete. Confirmed from them:

- DUO BREW, Mandaluyong: franchisee decides order quantities; no POS; buys by eye; two-sided trap of stockout against *sayang*; operated by two adults with a 15-year-old helping occasionally.
- Car-tint installation, Pasig: owns his premises so no rent; requirements were complete, so one City Hall trip; assessed ₱5,123.50; temporary sanitary paperwork; BFP instructions; apparent 90-day temporary permit.

**Both interviews produced no peso figure. Neither owner could name what the problem costs them.**

- DUO BREW gave **no figure at all** for monthly loss from spoilage, stockout, or overbuying.
- The car-tint owner, asked what advance knowledge of the steps would have saved him, answered ***"wala siyang ideya."***

A second qualifier on the car-tint case: he was prepared partly *because the founder helped him*, so he is not evidence about unassisted registrants.

These are null results and they stay visible. They must not be dropped, summarised away, or replaced with a confirmed-adjacent phrasing in any future revision of any document.

What this means operationally: **the loss the product is built to prevent is assumed, not measured.** Kill criterion 1 is live — if no interviewed owner names a peso figure for a loss, stop. Two have already failed to. The next interview is the test, not a formality.

Paired with DL-039.

---

## DL-039 — Competitor landscape never researched

**Date:** 2026-08-02
**Status:** Unknown

The founding critique of this project was that many companies already do this. **It has never been checked.** Not checked and inconclusive — never attempted.

Unknown:

- what existing Philippine MSME inventory and compliance applications cost;
- who actually uses them;
- why owners abandon them, if they do;
- whether the DUO BREW franchisor already provides an ordering system, which would remove the wedge for the reference case selected in DL-027;
- whether franchisors would block, tolerate, or welcome a third-party tool used by their franchisees.

No document, screen, or pitch may state or imply that no adequate alternative exists, that the space is empty, or that this is a gap in the market. None of that is known. This is Risk 3 and it is unmitigated.

Recorded as its own entry, separate from DL-038, so it cannot be folded into a general evidence caveat and quietly diluted.

**Numbering note:** the v2 decisions listed eleven topics across the twelve entries DL-028 to DL-039. Field evidence is deliberately split into two entries rather than compressing eleven into eleven and renumbering, because this log is append-only and the competitor gap earns its own line.

---

## DL-040 — The `(app)` route group is explicitly dynamic

**Date:** 2026-08-02
**Status:** Approved implementation decision

`src/app/(app)/layout.tsx` declares `export const dynamic = "force-dynamic"`. Every route in that group depends on the request's session, so none of them can be statically prerendered.

**Root cause, recorded because the fix is not self-explanatory.** The group was already dynamic in practice, but only by accident. `createClient()` reads `cookies()`, and that read is what marks a route dynamic. `getSupabaseEnv()` runs on the line immediately before it. On a machine that has the Supabase variables the cookie read happens and the route is inferred dynamic; on one that does not — CI, which has no `.env.local` — the environment check throws first, the dynamic signal is never emitted, and the build fails while prerendering a page that was never meant to be static.

So the failure was not a missing environment variable. It was a route whose dynamism depended on the order of two statements inside a helper it does not control. Swapping those two lines back would break it again, silently, at build time only.

**Standing rule:** a route that must be dynamic declares that it is dynamic. Do not rely on a runtime API call buried in a helper to infer it.

**The `(auth)` group was checked and needs no equivalent.** `(auth)/layout.tsx`, `/sign-in`, and `/sign-up` are synchronous components with no Supabase client, no cookie read, and no session dependency. They are genuinely static and should stay prerendered; adding `force-dynamic` there would cost render time for nothing.

---

## DL-041 — The business day is Manila's, and a wrong day is deleted rather than zeroed

**Date:** 2026-08-02
**Status:** Approved founder decision

Two decisions about `daily_sales`, delivered by migration `20260802113000_create_daily_sales.sql` under DL-030. Both are recorded because both look like defects to a reader who does not know why they are there.

### "Today" means today in Manila

The default date for a recorded day comes from `private.manila_today()`, which evaluates `(now() at time zone 'Asia/Manila')::date` inside the RPC. It is **not** `current_date`, and it is **not** a `CHECK` constraint on the table.

The database clock is UTC. Manila is UTC+8 with no daylight saving, so between 16:00 and 23:59 UTC — midnight to 08:00 in Manila — the UTC date is still yesterday by the owner's calendar. An owner cashing up at 1am and entering the day's take would have it filed under the previous date, and would have no reason to suspect it. That is eight hours of every day, not an edge case, and the misfiled figure flows into a quarterly gross that feeds a percentage-tax estimate.

**Do not "correct" this to UTC.** A future reader will see a hardcoded timezone in a shared spine and reach for the portable-looking fix. This is a Philippines-only product; a UTC default is not more correct here, it is wrong for a third of the clock. If that ever stops being true, `private.manila_today()` is the single place that changes, and a per-business timezone column is the change to make.

It is a function rather than a `CHECK` constraint for two reasons. Postgres forbids a non-immutable function inside a check constraint, so the constraint could not be written at all; and a date bound frozen into the schema would block the legitimate case of an owner backfilling last week's notebook. The forward-date rejection therefore lives in the RPC, where it can compare against a live value.

### A wrong day is deleted, not zeroed

`public.delete_daily_sales()` exists, is `SECURITY DEFINER`, and writes an audit event carrying both the date and the amount it removed.

Deletion is offered here and deliberately not offered for tracked items, which are retired by an `is_active` flag instead. The difference is dependants. An item has them — counts and purchases already refer to it — so its history has to stay readable. A day of sales has none.

The alternative, editing the amount to zero, was rejected. A zero row asserts that the business opened that day and took nothing. That is a false record rather than a correction, and it would sit in the data as a real trading day forever. A figure filed under the wrong date permanently inflates the quarterly gross behind a tax estimate and the ₱3,000,000 VAT threshold position, so the row goes.

The audit event is what makes deletion safe to offer: after the statement returns, it is the only remaining evidence of the figure. Both values in its metadata are read from the deleted row and are never supplied by the caller.

Re-entering a day that already exists is a **correction**, not an error. The RPC upserts and audits it as `daily_sales.corrected`, carrying the replaced figure. An owner who typed 12,750.50 and meant 45,000.00 must not meet a unique-violation message, and the quarter must not count both figures.

### Verification status

**Pending verification.** The migration is applied to the linked development project and sixteen structural checks pass against it: RLS enabled, one member-only `SELECT` policy and no write policy, no write grant to `authenticated`, no privilege at all for `anon`, both RPCs `SECURITY DEFINER` with an empty `search_path`, and neither taking a user id. Three negative cases were observed failing for the intended reason against the live API as `anon` — `permission denied` for the table, for `record_daily_sales`, and for `delete_daily_sales`.

The behavioural half of `supabase/tests/database/05_daily_sales.test.sql` has **not** run. pgTAP is not installed on the linked project, installing it needs write DDL that the read-only MCP connection refuses, and `supabase test db` needs Docker, which is still not installed (DL-026). The positive paths — the upsert correction, the delete, the audit metadata, and cross-business isolation with real rows — are written but unverified. Under the standing rule in DL-026 they are not evidence until they have run.

---

## DL-042 — The daily-sales screen must confirm before replacing a recorded day

**Date:** 2026-08-02
**Status:** Approved founder decision

`public.record_daily_sales()` upserts on `(business_id, sales_date)`. DL-041 records why, and that decision stands: re-entering a day is a correction, not an error, and an owner who typed 12,750.50 and meant 45,000.00 must not meet a unique-violation message or end up with two rows the quarter counts twice.

The database cannot tell those two cases apart. A deliberate correction and a mistyped date arrive as the same call, with the same signature, and both succeed. Separating them is the interface's job, and it is the only place it can be done.

### The requirement

Where a figure already exists for the target date, the screen must ask before writing. It must never overwrite silently.

> May naitala na kayo para sa araw na ito: ₱5,000. Palitan ng ₱5,500?

Both figures appear, so the owner is confirming a specific replacement rather than agreeing to an abstraction. The check is a read of `public.daily_sales` for that business and date, which a member is already permitted to make under `daily_sales_select_member` — no new grant, policy, or RPC is needed.

The confirmation applies to backdated entry as much as to today, and matters more there. A wrong date is a typing error, and typing errors happen where a date is typed.

### The risk being bought off

A mistyped date silently replaces a legitimate day's takings. The lost figure flows out of the quarterly gross that feeds the percentage-tax estimate and the ₱3,000,000 VAT threshold position, and nothing in the product looks wrong afterwards. The audit trail makes it recoverable — `daily_sales.corrected` carries `previous_gross_amount` — but recovery requires somebody to notice, and the owner has no reason to. The surprise is the defect, not the loss.

### What this is not

This is **not** a database constraint, and must not become one. A rule forbidding an overwrite would break the correction path DL-041 requires. The RPC keeps upserting; the screen does the asking.

Scope: a **UI requirement for the Milestone 2 Stocks screens**, recorded now and deliberately not implemented now. No daily-sales interface exists yet; `src/types/database.ts` is currently the only place in `src/` that mentions the table.

---

## DL-043 — Financial values stay in audit metadata, and the read audience is coupled by test

**Date:** 2026-08-03
**Status:** Approved founder decision

A proposed patch would have stripped `gross_amount` from `daily_sales.deleted` and `previous_gross_amount` from `daily_sales.corrected`, on the reading that audit metadata was leaking financial data. That patch is rejected, and the premise behind it does not survive inspection.

### There is no leak today

`audit_events` grants `select` to `authenticated` under `audit_events_select_business_member`. `daily_sales` grants `select` to `authenticated` under `daily_sales_select_member`. Both resolve through `private.is_business_member()`. **The audience is identical.** Anyone who can read the audit metadata can already read `gross_amount` straight from the table.

The only values the audit rows hold that are not otherwise readable are the figure a correction replaced and the figure a deleted day carried. Those are not an oversight; they are the entire reason the rows exist. `20260802113000_create_daily_sales.sql` says so where it defines the delete path: after the statement returns, the audit row is the only remaining evidence of the figure. Redacting it would have destroyed DL-041's recovery path and DL-042's, and closed no exposure in exchange.

Nor do these values fall under the rule on `public.audit_events.metadata` — *never write a password, token, TIN, or other personal data.* A day's gross sales is business data every member of that business can already see.

### There is a latent one

The equality of audience is an accident of the schema as it stands, not an invariant anything enforces. `public.business_role` is an enum of exactly one value, and `20260731125356_create_businesses_and_memberships.sql` names admin, staff, representative, and viewer as roles arriving in the milestone that needs them. `private.is_business_member()` is blind to role by design.

The first of those roles to land will very likely narrow who may read a business's takings — an owner will not want a counter person browsing every day's figures. Narrowing `daily_sales_select_member` alone would leave `audit_events` as a way around it, and a wider way than the table: not just current figures, but every figure ever entered, corrected, or removed, with who did it and when.

### The decision

1. **No redaction.** Both payloads stay as they are.
2. **No migration, and no role predicate now.** A role model that does not exist yet cannot be guessed at; adding one would be the premature abstraction this project avoids.
3. **The coupling becomes a tested invariant.** `supabase/tests/database/02_rls_isolation.test.sql` asserts that the businesses a member reads through `audit_events` are exactly those they read through `daily_sales`. It passes trivially today. It fails the day the two policies drift, and its assertion text names the remedy so the person who trips it does not need this entry to understand what to do.
4. **Standing rule for `metadata`.** It carries identifiers and context. A value belongs there only where the value is not otherwise readable by that audience and the audit row is the last evidence of it — which is what makes the two daily-sales fields legitimate rather than exceptional. Every audited table added afterwards inherits both the rule and the parity assertion.

Placing the assertion in `02_rls_isolation.test.sql` rather than the daily-sales file is deliberate. This is a platform rule about the audit trail that happens to be observable through `daily_sales` today; in the slice file, the author who adds the next audited table would never see it.

**Pending verification.** Docker is still not installed, so the assertion has not run locally (DL-026). CI on the pull request is the first execution, and under DL-026 this is not evidence until that run is observed passing.
---

## DL-044 — Product positioning covers establishment, compliance, operations, and decisions

**Date:** 2026-08-03
**Status:** Approved founder decision

The public-facing positioning is:

> NegosyoOS PH helps Philippine MSME owners establish and maintain their businesses, meet compliance obligations, control daily operations, and make better decisions through affordable AI-assisted self-service, with human support available when needed.

The fuller internal positioning additionally names qualified BMBEs, owner-operated establishments, service contractors, growing B2B businesses, authorised representatives, and qualified professionals.

This supersedes any wording that narrows the product only to owners without a POS or bookkeeper, or only to discovering whether they are losing money. Those remain possible user conditions, not the product definition.

---

## DL-045 — One shared action model drives the dashboard

**Date:** 2026-08-03
**Status:** Approved founder decision

Stocks, Permits, and Taxes remain the three user-facing product areas. Their common pattern is:

> What needs attention → why it matters → what information is missing → what to do next → owner decision → outcome.

The authenticated dashboard is the owner’s action centre. It may show Today, Upcoming, Waiting, Needs review, and recently completed items.

The dashboard aggregates domain-produced actions. It does not erase domain boundaries or become a universal write engine. Stocks, Permits, and Taxes retain their own authoritative records, calculations, rules, and commands.

---

## DL-046 — Exact peso loss is not required to validate operational pain

**Date:** 2026-08-03
**Status:** Approved founder decision; supersedes the first kill criterion in Project Blueprint v2.0

An owner’s inability to calculate an exact peso loss does not invalidate a recurring operational problem.

Valid evidence may be a concrete recent incident involving stockout, overbuying, spoilage, forgotten purchasing, customer embarrassment, supplier uncertainty, missing job materials, unbilled work, or another observable operational consequence.

Peso impact remains useful when available. It is not a prerequisite for discovery or for building the smallest test.

The revised kill condition is behavioural: stop or redesign when accessible target operators cannot describe recurring incidents, will not maintain the minimum data habit, or find realistic action recommendations useless.

The two previously recorded null peso answers remain historical evidence and must not be deleted. Their interpretation changes: they show that loss is unmeasured, not that the pain is absent.

---

## DL-047 — Daily gross sales is a conditional input, not the universal data spine

**Date:** 2026-08-03
**Status:** Approved founder decision; supersedes contrary blueprint and README statements

The universal product spine is evidence-labelled business facts, not one daily gross-sales value.

Daily gross sales is required for sales-based tax estimates and may support some demand models. It is not required for all Stocks actions. The product can help with low stock, purchase lists, supplier timing, waste, forgotten purchases, and job-material readiness using other relevant inputs.

Taxes may consume shared financial records through explicit interfaces, but must not depend on the Stocks UI or treat operational records as complete tax records.

Any calculation using daily sales must show period coverage, missing days, corrections, rule version, and assumptions.

---

## DL-048 — AI may be visible in the dashboard, but it does not become authority

**Date:** 2026-08-03
**Status:** Approved founder decision; partially supersedes DL-036

The rule “AI explains; AI does not decide” remains approved.

The sentence in DL-036 limiting AI to invisible plumbing is superseded. AI may be visible through dashboard summaries, guided explanations, missing-information questions, and drafting assistance.

AI is not required to be a mascot, unrestricted chatbot, or separate tab. A conversational surface is optional and not approved merely by this decision.

Deterministic rules and recorded evidence create obligations, calculations, priorities with legal deadlines, and authorised commands. AI may organise and explain those outputs. The owner or authorised human confirms high-impact actions.

The product must remain usable without AI.

---

## DL-049 — Evidence-status labels and anti-hallucination protocol are mandatory

**Date:** 2026-08-03
**Status:** Approved founder decision

The controlling labels are:

- `VERIFIED`
- `IMPLEMENTED_UNVERIFIED`
- `DOCUMENTED_ONLY`
- `PLANNED`
- `RESEARCH_REQUIRED`
- `OUT_OF_SCOPE`
- `SUPERSEDED`

A decision is not an implementation. A migration is not a user workflow. A written test is not verified until it executes the intended path. A working workflow is not commercial validation. AI-generated prose is not evidence.

Legal, regulatory, tax, fee, deadline, eligibility, and market claims require a source appropriate to the claim. Current rules require an effective date and last-reviewed date. Missing evidence remains visible as unknown or research required.

Coding agents must report tests actually run separately from tests not run. They must not upgrade an evidence label silently.

---

## DL-050 — Milestone 2 is a partial database foundation, not a shipped buying assistant

**Date:** 2026-08-03
**Status:** Approved corrective decision

The commit title “Milestone 2 — Stocks: tracked items, daily sales, and the buying assistant” overstates the user capability at commit `6321534`.

At the reviewed state, the repository contains lifecycle, tracked-item, and daily-sales database work but no user-facing Stocks route, end-to-end purchase workflow, reorder calculation, or buying-assistant logic.

Milestone 2 remains in progress. Completion requires an end-to-end operator workflow and executed verification, not only migrations, generated types, documentation, or written tests.

Future commit and milestone descriptions should name either the user capability delivered or the exact implementation layer, never a planned feature that remains absent.

---

## DL-051 — Phase 1A has explicit red-team and out-of-scope gates

**Date:** 2026-08-03
**Status:** Approved founder decision

Every feature proposal must answer:

1. What real incident does this address?
2. What minimum data and habit does it require?
3. What happens when the data is missing, stale, wrong, or contradictory?
4. What high-impact error can one typo cause?
5. Is the product generalising from one operator, one franchise, or one LGU?
6. Is AI adding comprehension or manufacturing authority?
7. Can permissions or paid boundaries be bypassed through the API?
8. Is the feature useful without AI?
9. What evidence would stop the work?
10. Does this belong in the current narrow release?

Phase 1A explicitly excludes full POS, ERP, accounting, payroll, HR, banking, lending, insurance, professional marketplace, nationwide authoritative rules, direct government filing or payment, autonomous agents, all vertical packs, a full B2B jobs engine before discovery, complex offline writes, final native packaging, subscription billing, and production launch.

---

## DL-052 — Permit and tax outputs require applicability conditions, not headline rules

**Date:** 2026-08-03
**Status:** Approved corrective decision

The product must not treat RA 11032 as a universal countdown that automatically produces approval or a demand letter. Completeness, required fees, official transaction classification, the applicable Citizen’s Charter, and other statutory or sector-specific conditions must be recorded or remain unknown.

Initial deadline output is a review/escalation prompt, not “approved.” A legal demand template is deferred until its trigger and wording receive qualified review.

Tax outputs similarly require taxpayer-specific eligibility, registration facts, period completeness, and current primary-source rules. The product may estimate and warn. It must not elect, certify, assert final liability, file, sign, or pay.

This decision narrows the v2 blueprint descriptions of the statutory clock and tax intersection without removing Permits or Taxes from the product.

---

## DL-053 — The database suites run in CI, and have been observed failing when tenant isolation breaks

**Date:** 2026-08-04
**Status:** Approved engineering result

The database-verification portion of Phase gate B is complete. The gate as a whole is not; see the closing section.

### What now runs

`.github/workflows/ci.yml`, job `test-database`, on every push to `main` or `develop` and every pull request into them:

| Item | Value |
|---|---|
| Environment | disposable Supabase local stack on a GitHub-hosted `ubuntu-latest` runner, destroyed with the runner |
| Supabase CLI | 2.111.0, pinned rather than `latest` |
| Credentials | none — no linked project, no service-role key, no secret read by any job |
| Migrations | all seven applied from zero by `supabase db reset --local --no-seed`, in a step of its own |
| Suites | `01_schema`, `02_rls_isolation`, `03_create_business_rpc`, `04_tracked_items`, `05_daily_sales` |
| Expected count before execution | 239 — a static source estimate, reported for comparison and not evidence |
| Observed count in CI | **239 assertions, 5 files, `Result: PASS`** |
| Green run | `694c843` — https://github.com/jusbreakindacycle/negosyo-os/actions/runs/30829590044 |

The job fails when the tests fail, when the harness reports failing assertions but exits zero, when no executed count can be parsed from the output, or when fewer suites run than the repository holds. The last two exist because a gate that quietly reports nothing is indistinguishable from a gate that passed.

The CLI is pinned for the same reason: a verification gate whose toolchain moves without a commit is not repeatable.

### The regression proof

DL-026 established that a passing RLS test is evidence only once the negative case has been observed failing for the intended reason. That rule had never been applied to the CI job itself, and a green job is equally consistent with a suite whose assertions cannot fail.

On a throwaway branch — `proof/rls-regression-20260803`, since deleted — a CI-only fixture replaced the `USING` clause of `daily_sales_select_member` with `true`, in the disposable database only, after `supabase db reset` and before the suites. No migration was edited: `20260802113000_create_daily_sales.sql` remained byte for byte what `main` holds. The policy kept its name, so the `policies_are()` shape assertion still passed. What turned the job red was behaviour, not a name.

Five assertions were predicted to fail, recorded before the run. Exactly those five failed, and no others:

| Suite | Assertion | have → want |
|---|---|---|
| 02 | a member reads audit history for exactly the businesses whose sales they can read … | `[1111…]` → `[1111…, 2222…]` |
| 02 | the same holds for the second owner … | `[2222…]` → `[1111…, 2222…]` |
| 02 | owner A sees only their own takings … | `4820.00, 7310.50` → `4820.00` |
| 05 | an outsider sees none of another business's takings | `0.00, 9800.00, 45000.00` → `[]` |
| 05 | the outsider cannot see that day … | `n = 1` → `n = 0` |

Red runs: https://github.com/jusbreakindacycle/negosyo-os/actions/runs/30830423113 (counts: 02 failed 3/28, 05 failed 2/50) and https://github.com/jusbreakindacycle/negosyo-os/actions/runs/30831767471 (the same five, named, with diagnostics).

The diagnostics are the substance. Each names a business id or a peso figure that became readable across a tenant boundary, so the assertions were reached and failed because the guard was gone — not because something errored earlier. The DL-043 audit-parity tripwire, written to fail "the day the two policies drift" and until now only ever passing trivially, is among the five. It has been seen doing its job.

One incidental observation: the fixture sat under `supabase/tests/`, so the test runner also picked it up as a sixth file. It contributed no assertions and ran after all five suites, so it is not what broke them. A future fixture of this kind belongs outside the test directory.

The branch was deleted once the evidence was recorded, and its commits are not ancestors of `main` or `develop`. Deleting a branch does not erase GitHub's record of the commits; the claim made here is only that the intentional regression never reached a product branch or the permanent migration history.

### Three assertions were repaired before any of this counted

Executing a suite is not the same as trusting it. Three assertions could not fail for the reason their descriptions gave:

1. **`05`, the future-dated day.** The guard derived tomorrow from the session clock — `(now() + interval '1 day')::date` — which is the UTC date plus one. Between 16:00 and 23:59 UTC, midnight to 08:00 in Manila, that equals Manila's *today*, which `record_daily_sales()` accepts. The assertion would have gone red for eight hours of every day for a reason unrelated to the guard. Tomorrow now comes from `private.manila_today()`, evaluated as `postgres`, matching the pattern the rest of the file already used.

2. **`04`, an outsider editing another business's item**, and **3. `05`, an outsider deleting another business's day.** Both resolved the target id *inside the outsider's own session*, where RLS hides the row. The subselect returned null, the RPC took its missing-row branch, and `not_a_member` was raised without the membership check ever being asked about a real record. Both passed while testing nothing — the same defect DL-026 found, in the slices added since.

Each now resolves the id as `postgres` and passes it as a literal, with preconditions asserting that the row exists, belongs to the other business, and is invisible to the outsider; the absent-row and bad-argument cases are asserted separately, so "no such row", "real row, wrong tenant", and "bad argument" remain distinguishable. The repair was load-bearing: one of the five failures in the proof above lands on a precondition that did not exist before it.

No policy, grant, function, or migration was weakened to make anything pass.

### What this does not establish

- **Phase gate B is not complete.** Its three application items — an authenticated business-creation cap, an OTP `type` allow-list before `verifyOtp`, and the build-time font download — were out of scope for this work and remain open.
- **Nothing ran against the hosted Supabase project.** Every result above comes from a disposable local stack on a CI runner.
- Docker is still absent from the founder's machine (DL-026), so the suites still cannot be executed locally. CI remains the only place they run.
- A verified database is not a user-facing workflow. Milestone 2 remains a database foundation with no Stocks screens (DL-050).

---

## DL-054 — The hosted project structurally matches the repository for everything the repository owns

**Date:** 2026-08-04
**Status:** Approved engineering result

A read-only catalogue audit compared the hosted Supabase project `vbmfkfkfpvgezgyahdpb` against the repository baseline `7b59a18` on `main`, with a clean working tree matching `origin/main`.

### What matched

| Compared | Result |
|---|---|
| Migration history | Seven repository migrations, seven hosted migration-history entries, same versions and same names |
| Tables | The six repository-owned tables, with RLS enabled on each |
| Columns, constraints, indexes, enums | Structurally matching |
| Functions | The nine repository-owned functions present with matching signatures |
| Function bodies | All nine matched during the audit |
| Policies | Structurally matching |
| Grants | Repository-owned grants only: the `anon` and `authenticated` grant state on repository-owned objects matches what the migrations declare. Hosted `service_role` ACLs are outside this comparison and are recorded separately in DL-055 |
| Triggers | Structurally matching |
| Generated TypeScript types | No schema-derived drift observed during this audit. The committed types were compared against the hosted catalogue; they were not regenerated |

The nine repository-owned functions are `private.handle_new_user`, `private.is_business_member`, `private.manila_today`, `private.set_updated_at`, `public.create_business_with_owner`, `public.create_tracked_item`, `public.delete_daily_sales`, `public.record_daily_sales`, and `public.update_tracked_item`.

As of this 2026-08-04 audit, no migration was required and no type regeneration was required. Nothing was regenerated during the audit or during the documentation work that records it, and no change after 2026-08-04 has been checked.

### How the audit was performed

Read-only, through the configured read-only Supabase MCP. No hosted write, no DDL, no DML, no migration application, and no type generation occurred.

### Evidence labels

```text
Repository-owned hosted structural parity: VERIFIED through the 2026-08-04 read-only catalogue audit.
Hosted runtime RLS behavior: IMPLEMENTED_UNVERIFIED.
```

### What this does not establish

- This is not a claim that the hosted project is identical to the repository in every platform-managed respect. The audit compared what the repository owns. Platform-managed schemas, extensions, roles, and mechanisms outside the repository migrations were not asserted to match, and at least one hosted-only object exists (DL-055).
- The parity claim about grants covers repository-owned grants only. The hosted `service_role` ACLs and the hosted-only RLS-auto-enable objects are excluded from it, and both are recorded as `RESEARCH_REQUIRED` in DL-055.
- No repository pgTAP suite was run against the hosted project. The 239 assertions of DL-053 ran on a disposable local stack in CI, and nothing in this audit executed a policy at runtime.
- Structural parity is not behavioural parity. Hosted runtime RLS behaviour remains `IMPLEMENTED_UNVERIFIED`.

---

## DL-055 — Phase gate B implementation and governance decisions

**Date:** 2026-08-04
**Status:** Approved founder decision

Seven decisions follow from the 2026-08-04 hosted audit (DL-054) and the completed database verification (DL-053).

### Governance of the two hosted findings

1. Hosted `public.rls_auto_enable()` and the `ensure_rls` event trigger are left unchanged for now.
2. The currently observed hosted `service_role` grants are left unchanged for now.
3. Both hosted findings are recorded as `RESEARCH_REQUIRED` for long-term governance.

No hosted or repository change to `rls_auto_enable`, `ensure_rls`, or `service_role` grants is currently approved.

#### `rls_auto_enable` and `ensure_rls`

Observed: a `ddl_command_end` event trigger named `ensure_rls`, owned by `postgres`, calling `public.rls_auto_enable()`, a `SECURITY DEFINER` function with `search_path=pg_catalog`.

> The hosted security advisor reports that API roles retain function-execution privilege. Actual invocation through the Data API was not tested and remains unverified.

The mechanism is:

- hosted-only;
- consistent with a Supabase-documented RLS-auto-enable mechanism;
- absent from the repository migrations and from local CI, where a grep of the tree returns no occurrence of either name;
- of provenance not established — whether it was created by the platform, by a dashboard action, or by an earlier manual statement was not determined by this audit;
- unchanged pending governance research.

No claim is made here about how a future platform action would treat it. In particular, this decision does not assert that a migration would necessarily be removed by a future platform reset.

#### `service_role` grants

The repository migrations neither grant nor revoke anything to `service_role`. The hosted grants observed on the repository-owned tables are therefore outside repository-owned grants and outside what DL-054 asserts as matching. They stay as observed until the governance research is done.

### Three implementation decisions, not yet implemented

4. `next/font/google` is replaced with a system-font stack in a later implementation task, removing the build-time dependence on an externally downloaded font.
5. An explicit OTP runtime allow-list is added in a later implementation task, derived only from the authentication flows NegosyoOS actually supports and from the `token_hash` and `type` contract of the `/auth/confirm` route, and applied before `verifyOtp` is called.
6. A provisional ceiling of at most **three businesses whose status is not `closed` per authenticated owner** is enforced in a later implementation task.
7. The three-business ceiling is an abuse-control rule. It is not pricing, not packaging, and not a subscription tier, and it must not be presented to an owner as one.

### Status

The OTP allow-list, the font replacement, and the business ceiling are `DOCUMENTED_ONLY`. They are decided and designed; no code implements them.

Phase gate B remains open until all three are implemented and verified. The database-verification portion of the gate closed on 2026-08-04 (DL-053); the gate as a whole did not.

---

## DL-056 — NegosyoOS PH is a native mobile application only

**Date:** 2026-08-09
**Status:** Approved founder decision

NegosyoOS PH proceeds as a **native mobile application only**, built with React Native, Expo, Expo Router, and TypeScript. It is not a web application, not a web-plus-mobile platform, not PWA-first, not TWA-first, and not a future-native wrapper around a website.

The backend remains Supabase/PostgreSQL. Nothing about this decision changes tenancy, RLS, migrations, or any domain rule (DL-027 through DL-052 and the evidence-status protocol are untouched).

### What this supersedes

Named individually, so nothing is superseded by implication:

- **DL-004**, delivery and client clauses only: "responsive PWA-first delivery" and the Next.js/Tailwind/shadcn client stack are superseded. DL-004's backend selections (Supabase PostgreSQL, Auth, Storage, RLS) and its one-repository decision are **not** superseded and remain in force.
- `docs/TECHNICAL_FOUNDATION.md`'s header-table *Delivery*, *Framework*, *UI*, and *Authentication* rows (responsive web app, Next.js App Router, Tailwind + shadcn/ui, Supabase Auth with SSR) are superseded by the mobile equivalents recorded in that document's next revision.
- `docs/TECHNICAL_FOUNDATION.md` §14, "PWA and offline strategy" — TWA evaluation and web-manifest packaging are superseded; the underlying principle (validate the online workflow before investing in offline writes) is not.
- The `/auth/confirm` web route as the active authentication architecture is superseded by DL-058.

### What is not superseded

Every domain decision (product thesis, the three product areas, the shared action model, the AI boundary, BMBE modelling, evidence-status protocol, tenancy rule, all Phase 1A exclusions) carries forward unchanged. A person still reaches a business through `business_memberships` and nothing else; the locally selected business remains UI state, never authorisation.

### Consequence

`docs/PROJECT_BLUEPRINT.md`, `docs/TECHNICAL_FOUNDATION.md`, `README.md`, `CLAUDE.md`, and `docs/BUILD_PLAN.md` are updated in the same change that records this decision, so no controlling document continues to describe NegosyoOS PH as a web or PWA/TWA product. `PRODUCT_SPEC.md` and `PROJECT_STATE.md` are added as the current-state documents this decision is tracked against going forward.

---

## DL-057 — Branch model, naming policy, and AI-agent Git safety rules

**Date:** 2026-08-09
**Status:** Approved founder decision

The Git branching model, tag policy, and database-change workflow are recorded in `docs/DEVELOPMENT_WORKFLOW.md`, created by this decision. Summary:

- `main` is the latest verified/releasable version; `develop` is the next integration target; short-lived branches (`feature/*`, `fix/*`, `hotfix/*`, `refactor/*`, `test/*`, `docs/*`, `chore/*`, `spike/*`, `migration/*`) carry finite, isolated changes and disappear on merge.
- No permanent module branches (`stocks`, `permits`, `taxes`, `ai`, `auth`, `dashboard`, or similar). Modules live in source organisation and in milestones/issues, not in long-lived branches.
- Database changes are always additive migrations; an already-applied migration is never edited to suit a later feature.
- `CLAUDE.md` is updated with a twelve-point BRANCH SAFETY block governing how an AI coding agent must behave in this repository: inspect Git state first, never do normal feature work directly on `main` or `develop`, one capability per branch, no unrequested merges/pushes/branch deletions/force-updates, keep branches buildable, and report branch name, changed files, tests, and database impact at completion.

### Disposition of the pre-existing branch tangle

A full audit (`git cherry`, ahead/behind counts, and line-level content diffs, all against `main`) found that every non-`main` remote and local branch either duplicates work already squash-merged into `main`, or — for the old `develop` — held only the pre-Milestone-1 scaffold that `main`'s history already supersedes. No branch held unique valuable work. None was deleted by this decision; disposition recommendations are recorded in the mobile-foundation reconciliation report, and any deletion requires separate founder approval.

`develop` was reset locally to `main`'s tip. The prior tip is preserved at `archive/develop-pre-mobile-pivot`, and `main`'s pre-pivot tip is tagged `pre-mobile-pivot-2026-08-09`.

---

## DL-058 — Mobile authentication uses a typed six-digit email OTP

**Date:** 2026-08-09
**Status:** Approved founder decision

The native application authenticates a new sign-up by emailing a six-digit one-time code, typed into an in-app verify screen, rather than a deep link. This was chosen over a deep-link flow because it needs no scheme/intent handling, works identically on a cheap Android device and a flaky network, and needs no redirect allow-list at all — the OTP allow-list below is a stronger and simpler control than validating a URL.

### The contract, checked against the installed library and current documentation, not assumed

`@supabase/auth-js` 2.111.0 (installed) and the current Supabase JavaScript reference both show `verifyOtp` for a typed emailed code as:

```ts
const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
```

This is **`type: 'email'`**, not `'signup'`. `resend`, by contrast, only accepts `'signup' | 'email_change'` for an email target — so resending uses `'signup'` while verifying uses `'email'`. These are genuinely different values for two different calls, and code must not unify them.

`EmailOtpType` is `'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email' | (string & {})`. The `(string & {})` member means TypeScript enforces nothing about this value — any string type-checks. This is exactly the gap DL-055 identified for the web `/auth/confirm` route.

### What changes from DL-055's design

DL-055 designed the allow-list against the web route's `token_hash`/`type` query-string contract. That route is retired (DL-056). The allow-list moves into the native verify path and is derived the same way DL-055 required — from the authentication flows this product actually supports — but the concrete value differs: `['email'] as const`, checked before every `verifyOtp` call, since the confirmation flow is the only one implemented. `'recovery'` is added only when password recovery ships, not preemptively.

Sending the emailed code requires the hosted confirmation-email template to use `{{ .Token }}` in place of the current confirmation-link template. This is a founder action outside the code, recorded in the mobile-foundation reconciliation report.

---

## DL-059 — Disposition of the three DL-055 Phase gate B items under mobile

**Date:** 2026-08-09
**Status:** Approved founder decision

DL-055 left three Phase gate B application items `DOCUMENTED_ONLY`. The mobile pivot changes how two of them are satisfied and leaves the third exactly where it was:

1. **`next/font/google` removal** — resolved by removal of Next.js itself (DL-056). There is no build-time font download to eliminate in a React Native application, so the system-font-stack design in DL-055 is superseded by mooting rather than by implementing it. Marked `SUPERSEDED` in `docs/BUILD_PLAN.md`.
2. **OTP runtime allow-list** — carried forward into the native verify path exactly as designed in principle, with the concrete allow-list value now `['email']` per DL-058. Marked as implemented once M0.4 lands and device-verified once M0.6 confirms it.
3. **Three-business ceiling** — **unchanged and still `DOCUMENTED_ONLY`.** This decision does not implement it. It becomes `PROJECT_STATE.md`'s single next allowed engineering task, `feature/business-creation-ceiling`, to be built as its own short-lived branch with an additive migration and pgTAP coverage, before any Stocks work begins.

Phase gate B is therefore not fully closed by the mobile-foundation migration: two of its three items are resolved or in progress, and the ceiling remains open on its own branch.

---

## DL-060 — Business onboarding is realigned to the lifecycle, and graduation becomes owner-declared until Permits exists

**Date:** 2026-08-13
**Status:** Approved founder decision

### What prompted it

An audit of the merged mobile client against the controlling documents found that the interface never caught up to the lifecycle the database already models:

- `create_business_with_owner` accepts only a name and does not set `status`, so every business created through the application takes the column default `operating`. Confirmed on the hosted project the same day: the single existing business row has status `operating`. Nobody chose that, and nobody was asked.
- `listMyBusinesses` selects `id, name`. `status` never reaches the client, so no mode could be derived even if it were set correctly.
- No Setup-mode or Running-mode branching exists anywhere in `app/`.
- No business-context column exists — nature of business, operating model, customer model, existing systems are all absent, as `20260731125356` deliberately left them.

This is the gap DL-031 described in 2026-08-02 and nothing has closed since. A lifecycle that only the database knows about is not a lifecycle.

### The four decisions

**1. Sequencing is unchanged, then extended.** `feature/business-creation-ceiling` still comes first, exactly as `PROJECT_STATE.md` and DL-059 item 3 require; it closes the last open Phase gate B application item and needed no new decision. `feature/business-onboarding-lifecycle` follows it. This **pulls Setup mode forward** out of Milestone 4, where `docs/BUILD_PLAN.md` had placed it alongside the Permits slice. Milestone 2C Stocks work is still not authorised, and this decision does not authorise it.

**2. Branches are cut from `main`'s current tip.** `migration/mobile-foundation` is merged (PR #14, `8bdbbd2`), so no further work happens on it, and nothing is branched from the pre-merge state. `origin/develop` remains stale at the pre-Milestone-1 scaffold and is not used as a base until it is reconciled.

**3. Lifecycle and registration are separate dimensions.** `businesses.status` continues to carry where the business is in its own life — `draft | registering | operating | closed` — and a **separate** registration-status fact records how far formal registration has got.

One column cannot carry both. Two of the four owner-facing onboarding choices — "I'm already operating" and "I'm already operating informally" — both describe a business that is operating; what differs is whether registration is complete. Collapsing them onto one enum value would either lose the distinction or, worse, encode an unregistered business as a compliance state it has not reached. This is the same "model separately" rule `docs/PROJECT_BLUEPRINT.md` already applies to legal form, enterprise size, BMBE status, and tax treatment.

Business *context* — nature of business, operating model, customer model, existing tools — is **not** built in that branch. No workflow reads it yet, and creating columns because future documentation mentions them is the premature abstraction this project avoids. It arrives with the first workflow that consumes it.

**4. Graduation is owner-declared and audited, for now.** DL-031 made "the mayor's permit marked issued" the trigger that moves a business from Setup mode to Running mode. Permits does not exist and is two milestones away, so a business created as `draft` today would have no way out of Setup mode at all — the flow would be a trap.

Until Permits ships, the owner may declare the transition themselves. It is written through a `SECURITY DEFINER` RPC, never a table grant, and it writes an audit event carrying `previous_status` and `next_status` — keys `src/lib/audit/events.ts` already allow-lists.

**This supersedes only the trigger clause of DL-031**, and only while Permits is absent. Everything else in DL-031 stands: mode is still derived from `businesses.status` and never from a second flag, `legal_name` stays nullable and distinct from `name`, and graduation stays an earned moment rather than a settings toggle. When Permits ships, the permit-issued event becomes a trigger alongside the owner's declaration; it does not replace it, because informal operators who will never file for a mayor's permit still need to reach Running mode.

An owner-declared transition is a statement about operating reality, not a compliance claim. It must never be rendered as one, and it certifies nothing.

### What this does not authorise

- No Stocks screen, reorder logic, or purchase list. Milestone 2C's gate is unchanged.
- No Permits or Taxes implementation.
- No business-type classification system, and no AI-suggested classification. Both were discussed; neither is approved here.
- No general `UPDATE` grant on `public.businesses` to `authenticated`. The status write path is one RPC with one legal transition set, or it is nothing.
- No change to tenancy: a person still reaches a business through `business_memberships` and nothing else.

---

## DL-061 — Skills and plugin adoption policy adopted; the two active Supabase skills recorded

**Date:** 2026-08-13
**Status:** Approved founder decision

### What is adopted

`docs/CLAUDE_SKILLS_POLICY.md` becomes a standing **process authority** for this repository. It is
subordinate to every document in the authority chain in `README.md`. It recommends; only an entry in
this log adopts. It was written outside this repository and reviewed here before being committed —
it is not treated as a higher authority than the repository's own governance.

Its default posture is **skip**. A skill or plugin is adopted only when it closes a verified gap in
this project's actual stack or workflow, does not duplicate governance already enforced by
`CLAUDE.md` / this log / branch safety or a capability already built in, and comes from a maintainer
who can be checked before being granted access. The point the repository had nowhere else: an
installed skill runs with the session's tool and shell permissions, so an unreviewed skill is a
supply-chain surface, not a free upgrade.

### The gap this closes, recorded retroactively

`.claude/settings.json` has enabled `supabase@supabase-agent-skills` and
`postgres-best-practices@supabase-agent-skills`, from the official `supabase/agent-skills`
marketplace, **with no decision entry authorising them**. That was found by the audit that produced
this entry, not by the policy document.

Judged against the policy's own test, both pass: the maintainer is the official Supabase
organisation; the gap is real on a Supabase, RLS, and migration-heavy stack; and neither duplicates
governance enforced here. **They stay enabled, and are now recorded.** No other skill or plugin is
adopted. The rejections and "consider" candidates listed in the policy are recommendations only and
authorise nothing.

### What was removed from the committed copy, and why

The file arrived as a cross-repository policy naming the founder's other project. Committing another
repository's internals into this one's permanent history is not something to do as a side effect, so
two things were removed before it was tracked:

1. Its "Verified current state" comparison table. Its NegosyoOS column duplicated `PROJECT_STATE.md`,
   which governs what is currently true here and had already drifted from it; its other column
   described a different repository.
2. Two standing recommendations addressed entirely to that other repository.

Both are preserved in that repository's own copy of the policy, confirmed by the founder before
removal. Every adoption principle, every verdict in the review table, and every stated reason were
retained; six rows were rewritten only to strip the other project's identity, brand values, and
decision identifiers while keeping the verdict and reasoning intact. Two incidental references to
HOA and RA 9904 were deliberately kept, because they are live reasoning about whether a skill
applies, not repository internals.

The consequence is recorded plainly: the two copies are **no longer byte-identical**, and the file's
own claim that they were has been corrected rather than left standing.

### Naming

The filename `docs/CLAUDE_SKILLS_POLICY.md` is retained deliberately, against this repository's
subject-naming convention, because a sibling copy exists elsewhere under the same name. Any rename
must be coordinated across both repositories rather than done in one.

---

## DL-062 — AI execution and routing protocol adopted as a subordinate process authority

**Date:** 2026-08-13
**Status:** Approved founder decision

### What is created

`docs/AI_EXECUTION_PROTOCOL.md`, the canonical source for choosing how much reasoning and execution
capability a task needs: task classification, model/effort/mode routing, escalation, de-escalation,
and the three execution modes.

It follows the shape DL-057 established for `docs/DEVELOPMENT_WORKFLOW.md` — canonical detail in
`docs/`, a condensed block in `CLAUDE.md`, no instruction duplicated in two places. DL-008's
minimal-documentation rule is not breached: that rule forbids a Markdown file per task, feature,
screen, or discussion, and this is a durable cross-cutting process policy of the same kind DL-057
already created.

### The honest limit, stated in the document itself

**No repository file can make Claude Code or any other AI environment change its own model, effort,
or execution mode.** The protocol is advisory to the founder, who sets whatever the active
environment exposes, and self-regulating for the agent, which controls depth of investigation, when
to stop, and when to ask.

For the same reason the protocol applies this repository's evidence protocol to itself: every model
tier, effort level, and execution mode it names carries a status label, and a `RESEARCH_REQUIRED`
capability may not be routed to. At the time of writing, `haiku`/`sonnet`/`opus`/`fable` are
`VERIFIED` as selectable for a delegated subagent; the effort vocabulary `low · medium · high ·
xhigh · max` is `VERIFIED` for the review surface only; "Extra High" as a distinct level and
"Ultracode" are `RESEARCH_REQUIRED` and are not routed to; and the multi-agent cloud review is
founder-triggered and billed, so it may be recommended and never invoked by the agent.

### Governing principle

> Use the smallest sufficient configuration that can reliably complete the task without sacrificing
> architectural, security, or data-integrity quality.

Maximum effort and extended execution are never defaults. Two rules override the routing table:
anything touching migrations, RLS, tenancy, grants, `SECURITY DEFINER`, or an already-applied
migration is high-consequence however small the diff looks; and "agentic" does not mean "better" —
long-horizon execution suits clear paths, not unresolved ones.

### What it is subordinate to

The protocol authorises nothing. It never permits a commit, push, branch, pull request, merge,
deployment, hosted database write, or destructive operation; those come only from `CLAUDE.md` branch
safety and explicit founder authorisation, in every mode. It never relaxes the evidence protocol
(DL-049), the negative-case rule (DL-026, DL-053), the completion-report format, the additive-
migration rule, or the tenancy rule. It never overrides `PROJECT_STATE.md`'s single next allowed
engineering task: escalation on discovering hidden complexity means stop and return to the founder,
not widen scope. De-escalation lowers reasoning capability and never the verification floor.

### Naming, and the exclusion it must not be confused with

The third execution mode is named **Extended Execution Mode**, not "autonomous mode".
`CLAUDE.md`, `docs/BUILD_PLAN.md`, `docs/PROJECT_BLUEPRINT.md`, and `docs/TECHNICAL_FOUNDATION.md`
all exclude **autonomous AI agents** from Phase 1A. That exclusion governs what NegosyoOS ships to a
business owner; it says nothing about how development work is carried out. A one-clause
clarification was added to the exclusion bullet in `CLAUDE.md` only — the operative instruction file,
where the ambiguity would actually reach an agent. The identical phrasing in the build plan,
blueprint, and technical foundation was deliberately left unchanged, because clarifying one sentence
in four documents is not a minimal change, and the protocol carries the same distinction in its own
text.

### Scope

This is a documentation change. It touches no product code, no Supabase file, no migration, no test,
and no CI configuration, and it does not modify `PROJECT_STATE.md`. It neither consumes nor reorders
the next allowed engineering task, `feature/business-onboarding-lifecycle` (DL-060), which is
unaffected.
