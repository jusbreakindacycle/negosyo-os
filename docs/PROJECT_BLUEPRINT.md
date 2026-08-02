# NegosyoOS PH Project Blueprint

**Version 2.0 — supersedes v1 in full.** Replace `docs/PROJECT_BLUEPRINT.md` with this file.

| Field | Current state |
| --- | --- |
| Product name | NegosyoOS PH — temporary working name (DL-009) |
| Project type | **Commercial venture.** Subscription revenue, Google Play distribution |
| Repository | Single active product repository |
| Phase | Phase 1A — Foundation Prototype |
| Product structure | One application, two engines, one shared data spine |
| Coding | M0 and M1 complete; authorised for Milestone 2 (Stocks) |
| First operational vertical | Coffee shop reference case (franchisee-operated) |
| Commercial validation | **Not established.** Zero confirmed peso figures |
| Final architecture | Not approved |
| Final pricing | Not approved |

---

## 1. What NegosyoOS is

> NegosyoOS helps a small Filipino business owner know three things: **what to buy, what to file, and how much they owe.**

Everything below is detail.

The product serves owners who have no point-of-sale system, no bookkeeper on staff, and no reliable way to know whether they are losing money. It does not require them to buy hardware, hire anyone, or change how they sell.

Service principle, carried forward from v1:

> Software and AI assistance by default. Bring your own representative when preferred. Qualified professionals only when needed.

---

## 2. The three features

| Internal name | User-facing name | The owner's question it answers |
|---|---|---|
| Operate & Decide | **Stocks** | *Ano bibilhin ko, magkano, kailan?* |
| Start & Comply | **Permits** | *Ano kailangan kong ayusin, kailan ang deadline?* |
| Tax readiness | **Taxes** | *Magkano kaya babayaran ko?* |

**Never show internal names in the interface.** "Start & Comply" and "Operate & Decide" are project codenames. The user sees Stocks, Permits, Taxes.

Tax readiness is not a third engine. It is the **intersection** of the other two: operations captures the money data, compliance knows the deadlines, tax is what falls out. This is the reason the two domains belong in one application rather than two.

---

## 3. The data spine

The owner enters data once. Three outputs come from it.

```
INPUT  (daily, target under 30 seconds)
├── Gross sales — one number per day
├── Purchases and expenses, with receipt
└── Stock counts (weekly, priority items only)
             │
        ┌────┴────┐
        ▼         ▼
     STOCKS    PERMITS
        │         │
        └────┬────┘
             ▼
           TAXES
```

**The single daily gross-sales figure is load-bearing.** It is not a POS. It unlocks percentage tax, the 8% option comparison, the ₱3M VAT threshold monitor, and sales-driven demand forecasting. Without it, the product cannot compute anything tax-related.

---

## 4. Two modes

The application changes shape based on where the business is in its lifecycle. This is not two apps; it is one app with two entry experiences.

### 4.1 Setup mode — before the business opens

Only the registration path is visible.

```
Day 12 of about 28
✅ DTI name registered
✅ Lease signed
🔴 Barangay clearance — blocked: location sketch not uploaded
⏳ Mayor's permit — after barangay
⏳ BIR registration — after mayor's permit
Nagastos na: ₱4,280
```

Stocks and Taxes display as *"Mabubuksan kapag bukas na ang tindahan mo."*

**During the 2–4 week permit wait, the owner builds their item list and supplier list.** This is dead time they are already spending. By opening day their tracking is configured and they have a daily habit.

### 4.2 Running mode — after the business opens

All three features appear. The registration case moves to history with documents preserved.

### 4.3 Graduation

Marking the mayor's permit as issued switches the mode:

> *"Congrats — bukas na ang negosyo mo. Ihanda natin yung stocks mo."*

An earned moment, not a settings toggle. It is also the natural conversion trigger from free to paid, since it coincides with the business beginning to earn.

### 4.4 Schema consequence

`businesses` requires `status` — `draft | registering | operating | closed` — and a nullable `legal_name`. A business in setup mode has no registered name yet, which is why the registered name is separate from the everyday `name` the owner already uses.

`businesses` was created in M1 and already carries `name`. These two columns therefore arrive by **`ALTER TABLE` in M2, not in a fresh `CREATE`**: `name` is kept exactly as it is, `legal_name` is added nullable, and `status` defaults to `operating` so the rows that already exist remain correct.

---

## 5. Architectural split

The single most important structural decision in the product.

| | Permits (Start & Comply) | Stocks (Operate & Decide) |
|---|---|---|
| Shape | **Horizontal** — one model, all business types | **Vertical** — one model per archetype |
| Composition | ~80% common trunk, ~20% industry tail | ~20% shared primitive, ~80% specific |
| Applies to | Every business without exception | Configured per business type |
| Commodity risk | High — Negosyo Centers give the information free | Low — no free alternative exists |
| Pricing consequence | Free tier | Paid tier |

**No business type is out of scope for Permits.** A parking operator needs DTI/SEC → barangay clearance → mayor's permit → BIR → January renewal exactly like a carinderia. v1 deferred parking entirely; that was wrong.

---

## 6. The shared primitive: Reconciliation Ledger

Not "inventory." Inventory is one instance of a general pattern: *something expected versus something actual.*

| Business | Goes out | Should come back | The leak |
|---|---|---|---|
| Coffee shop | Ingredients | Sales | Spoilage, stockout |
| Carinderia | Cooked food | Same-day sales | Spoilage — worst of the set |
| Rice retail | Sacks | Kilos sold | Over-scooping, spillage, moisture |
| Laundry | Customer items | Same items, claimed | Lost or unclaimed items |
| Water refilling | Containers | Containers returned | Unreturned containers = capital loss |
| Parking | Tickets | Cash | Uncollected, unticketed |
| Aircon services | Completed jobs | Payment | Unbilled work, aged receivables |

One engine, seven configurations. This replaces the "Par Ledger" framing from earlier drafts, which only covered physical stock.

---

## 7. Three doors

Same requirement graph, three entry points.

| Door | Who | Enters at | Mode |
|---|---|---|---|
| 1 | Pre-registration owner with capital deployed | Choice of legal form | Setup |
| 2 | Already-registered MSME | January renewal calendar | Running |
| 3 | Informal enterprise considering formalising | Choice of legal form, BMBE as incentive | Setup |

Door 2 is the largest: roughly 1.24 million registered establishments nationwide, 99.6% of them MSMEs (DTI/PSA 2024), against approximately 49,000 new SEC company registrations in all of 2025. Door 2 also has a fixed annual deadline, which makes January the acquisition window.

---

## 8. What each feature actually sells

### 8.1 Permits — the statutory clock

The defensible feature is not a checklist. It is **RA 11032 enforcement.**

RA 11032 §5 sets legally enforceable maximum processing times from the date of complete application submission: **3 working days** for simple transactions, **7** for complex, **20** for highly technical. §9 provides that where an agency misses the deadline without written notice of cause, the applicant may submit a formal written request to the agency head demanding issuance of the deemed-approved document, with the submission receipt attached, escalating to ARTA or the Civil Service Commission on refusal.

What the software does that a counter clerk does not:

1. Records the date of complete submission, with the receipt as evidence
2. Classifies the transaction into the 3 / 7 / 20 bucket
3. Counts working days automatically
4. Alerts the moment the statutory deadline passes
5. Generates the formal demand letter

Plus the **dependency chain** — telling an owner at 9pm that tomorrow's barangay trip is wasted because the lease is unsigned. A Negosyo Center lists requirements; it does not track blockers in real time.

### 8.2 Stocks — the buying decision

Primary output is a purchase recommendation, **not** a variance report:

> *Beans: about 3 days left. Order 8 kg — that's your usual week.*

Variance is secondary, shown only after a baseline exists:

> *Last week you used 17 kg. Usual is 11 kg.*

**Ordering rationale:** an owner who has never measured a loss will not believe a loss report. They will believe a stockout prediction, because they can verify it on Thursday. Trust first, loss figures second.

### 8.3 Taxes — readiness, not filing

Reference facts, current as of 2026:

- Percentage tax is **3%** of quarterly gross sales for non-VAT businesses under the ₱3M threshold, filed on BIR Form 2551Q. The 1% CREATE rate applied only July 2020 – June 2023 and has reverted.
- Individuals under the ₱3M VAT threshold may elect **8%** on gross sales in excess of ₱250,000, in lieu of graduated rates and percentage tax.
- Crossing **₱3,000,000** in annual gross sales makes VAT registration mandatory and voids the 8% option.
- The ₱500 Annual Registration Fee was abolished effective 22 January 2024 (RA 11976, RR 7-2024). BIR Form 0605 is no longer filed for it, and the COR (Form 2303) no longer requires annual renewal.

**The ₱3M threshold monitor is the highest-value, lowest-effort compliance feature in the product.** A growing business crosses ₱3M in October and learns from an accountant in April, after months of incorrect filings. A running total with a warning at ₱2.5M is trivial to build and high-stakes.

**Hard boundary — organise and estimate, never assert and file:**

✅ *"Gross sales this quarter: ₱612,400. At 3%, percentage tax would be about ₱18,372. Confirm with your accountant before filing."*
❌ *"You owe ₱18,372. File 2551Q now."*

The first is decision support. The second is regulated tax practice.

The **8% versus graduated comparison** is a legitimate paid feature — most micro owners do not know which is cheaper, and the answer depends on their expense ratio, which the purchase records already capture. It must be framed as an estimate for discussion, never as an election.

---

## 9. AI role and help model

### 9.1 Do not build a knowledge base

Rejected. A searchable article library requires hundreds of articles, constant maintenance as rules change, duplicates freely available search results, and does not match how owners behave. Owners get stuck on a specific step and want help at that step.

### 9.2 Build in-context help

An *"Ano ito?"* affordance beside the item that confused them. Two sentences about that exact thing. No articles, no search box.

### 9.3 The AI rule

> **AI explains. AI does not decide.**

✅ *"This is Barangay Clearance. Kailangan mo ito bago ka makapag-apply sa City Hall."*
❌ *"You owe ₱18,372. File it now."*

AI is invisible plumbing behind in-context help, not a tab, mascot, or chat bubble. **Do not lead public-facing description with AI.** Owners buy *"alam mo na kung ano bibilhin,"* not "AI-powered platform."

For high-impact outputs, continue to show: what the source says; what it does not say; the applicable inference; conflicts; unknowns; the bounded next action; and the evidence source and version.

---

## 10. Product boundaries

Carried forward from v1 §3 unchanged. The application must not:

- claim to be a government platform;
- guarantee permit, tax, or registration outcomes;
- invent an explanation for an official fee;
- treat verbal guidance as stronger than written official evidence;
- automatically declare a business fully compliant;
- automatically determine every taxpayer obligation;
- automatically declare an expense deductible;
- present operational records as registered accounting books;
- present AI as a lawyer, CPA, government officer, or legal representative;
- normalise fixers, facilitation payments, unofficial gifts, or unreceipted government charges;
- treat all LGUs or MSMEs as having identical processes.

Additional boundary: **the product does not advise what business to start.** Setup mode begins after that decision is made.

---

## 11. Reference cases

### 11.1 Coffee shop — DUO BREW, Mandaluyong (selected first vertical)

Franchisee-operated: they own the store, equipment, lease, staff, and P&L; they license the brand and buy supplies from the franchisor.

**Confirmed by operator:**
- **The franchisee decides their own order quantities.** (Critical — a real decision exists for software to support.)
- No POS.
- Buying method is *"kung anong makita nilang kaonti."*
- Two-sided trap: understock → drinks unavailable; overstock → *sayang*.
- Operated by two adults with a 15-year-old helping occasionally.

**Not obtained:** any peso figure for monthly loss.

**Franchise is a feature subset, not a special case.** A franchisee makes *fewer* decisions than an independent shop, not stranger ones — supplier, price, and catalog are fixed; quantity and timing remain theirs. Building for the subset means nothing is wasted when expanding to independents. Building the reverse would produce supplier-comparison features that are dead weight for franchisees.

**Distribution advantage:** every branch of the same brand shares SKUs, pack sizes, order windows, and lead times. One item list serves every branch nationwide, which directly attacks the data-debt constraint in §12.

**Counting must work for whoever is free** — including the 15-year-old. Large tap targets, numeric keypad, under two minutes.

### 11.2 Car-tint installation services — Pasig

Founder acted as representative during part of the permit process.

**Confirmed:** owns his premises, so no rent; requirements were complete, so one City Hall trip; assessed ₱5,123.50; temporary sanitary paperwork; BFP instructions; apparent 90-day temporary permit.

**Null results:** no dead-rent cost applies to him, and he had no idea what advance knowledge of the steps would have saved.

**Important qualifier:** he was prepared partly *because the founder helped him*. He cannot serve as evidence for unassisted registrants.

The system must never explain the ₱5,123.50 without the actual assessment and receipt.

### 11.3 Air-conditioning services — B2B

Corporate and bank clients. Client size does not determine the provider's own enterprise size.

**Not yet interviewed.** Hypothesised workflows — quotations, work orders, technician assignment, equipment history, parts, completion evidence, invoicing, receivables, preventive-maintenance contracts — remain unconfirmed. Preserved as the job-centred validation case after the inventory-centred flow is field-tested.

---

## 12. Data debt constraint

An already-operating business arrives with existing stock, suppliers, and no baseline count. **Onboarding must never require entering a full inventory.** The system onboards 8–12 priority items only. If first-run setup exceeds 20 minutes, the notebook wins.

New owners in Setup mode have **zero data debt**, because onboarding happens during the permit wait. This is a structural advantage unique to Door 1.

---

## 13. Evidence status

| Claim | Status | Source |
|---|---|---|
| Franchisee decides order quantity | **Confirmed** | DUO BREW operator |
| Buying method is eyeballing what looks low | **Confirmed** | DUO BREW operator |
| Two-sided trap: stockout vs. sayang | **Confirmed** | DUO BREW operator |
| No POS | **Confirmed** | DUO BREW operator |
| Peso value of monthly loss | **No figure given** | — |
| Car-tint owner has no rent | **Confirmed** | Friend |
| He was prepared; one trip | **Confirmed** | Friend |
| Value of knowing steps in advance | **"Wala siyang ideya"** | Friend |
| 3 / 7 / 20 clock and deemed-approved remedy | **Confirmed** | RA 11032 §5, §9 |
| Percentage tax 3%, 8% option, ₱3M threshold | **Confirmed** | NIRC as amended; BIR |
| ARF abolished, COR permanent | **Confirmed** | RA 11976, RR 7-2024 |
| ~1.24M registered establishments, 99.6% MSME | **Confirmed** | DTI/PSA 2024 |
| Unprepared registrants lose days | **No evidence** | — |
| Cousin has unbilled completed work | **Not yet asked** | — |
| MOQ / pack size forces overbuying | **Hypothesis** | — |
| Existing competitors already solve this | **Never checked** | — |

**Two confirmed null results.** Neither interviewee produced a peso figure. This must remain visible and must not be quietly dropped from future revisions.

---

## 14. Open problems

**A — Interview 1B (DUO BREW), outstanding**
1. Minimum order quantity, and whether it exceeds weekly usage
2. Whether pack sizes can be split
3. Order window and lead time
4. Cost of a rush order on stockout
5. Whether the franchisor already provides an ordering system — if so, that is the real incumbent
6. Whether the franchise agreement restricts third-party tools
7. Referral to one independent shop for comparison

**B — Cousin interview, not started**
8. Pesos in completed-but-unbilled work
9. Standard payment terms from bank and corporate clients
10. Whether preventive-maintenance renewals are being missed

**C — Requires someone not yet met**
11. Whether an unprepared registrant actually loses days. One referral needed.

**D — Documents in hand but not supplied**
12. Composition of the ₱5,123.50 Pasig assessment — how much is standardisable versus LGU-specific

**E — Never researched**
13. **Competitor landscape.** The founding critique was that many companies already do this. Never verified. Unknown: what existing PH MSME inventory and compliance apps cost, who uses them, why owners abandon them.
14. Whether franchisors would block, tolerate, or welcome a third-party tool used by franchisees

**F — Founder decisions**
15. Final name — `NegosyoOS PH` remains unscreened (DL-009)
16. Google Play billing rate and its effect on the pricing floor

---

## 15. Build order

Corrected on 2026-08-02 against the actual state of the repository. Authentication and tenancy were completed ahead of Stocks and are retained rather than rebuilt, so there is no later migration of data behind real ownership to perform. See DL-025.

| Milestone | Content | Status |
|---|---|---|
| **M0** | Repository and application scaffold | ✅ Complete |
| **M1** | Auth, tenancy, RLS, audit spine | ✅ Complete |
| **M2** | Stocks: items, counts, deliveries, **daily gross sales**, reorder forecast, days-to-stockout. Variance secondary. | Next |
| **M3** | Permits: registration path generator with the RA 11032 clock built in. Setup mode. | |
| **M4** | Document vault (required for submission receipts the clock depends on) | |
| **M5** | Taxes: ₱3M threshold monitor, percentage-tax estimate, 8% vs. graduated comparison | |
| **M6** | Deadline and renewal engine; PWA baseline; TWA packaging for Play Store | |
| **M7** | Field-test preparation | |

Stocks is built on the real authentication and tenancy delivered in M1. Every Stocks table uses the established membership-based RLS pattern; no development shortcut stands in for a real membership.

### Why the statutory clock is not M1

The RA 11032 clock is legally grounded rather than hypothesis-grounded and produces value on day one with no baseline period. It is the better *feature*.

But it is **episodic** — it fires only while an application is pending, roughly once a year. A tool opened once a year cannot sustain a monthly subscription. This is the identical argument that removed BMBE from the paid tier and must be applied consistently.

The buying assistant is weaker per use but used weekly. **Subscriptions live on habit, not sharpness.**

---

## 16. Pricing hypothesis

Not approved. Billing out of scope until after M7.

| Tier | Contains | Logic |
|---|---|---|
| Free | Registration path, Setup mode, deadline reminders, RA 11032 clock, BMBE path | Government channels provide the underlying information free. Competing against free is unwinnable. |
| Paid | Buying assistant, variance, cost history, price-change alerts, tax readiness, ₱3M monitor | No free alternative exists. |

Setup mode functions as a free trial that costs nothing to provide, with opening day as the natural conversion trigger.

**Unit economics to hold in view:** at ₱399/month net of Google Play's cut, approximately 90 paying subscribers replace a ₱30,000 monthly salary. The target is ninety paying owners, not "users."

---

## 17. Kill criteria

- If no interviewed owner names a peso figure for a loss, stop. Two have already failed to.
- If three owners see the reorder recommendation and none finds it useful, the buying assistant is not solving a felt problem.
- If an owner reads a generated registration plan and says they could have gotten it free at a Negosyo Center, the dependency and clock logic is too shallow.
- If no owner will pay after M7, ship free as portfolio work — but decide it deliberately.

Because this is a commercial venture, these are operative, not documentation.

---

## 18. Risks

1. **No peso figure ever materialises.** Two owners have failed to produce one.
2. **The franchisor already provides an ordering system**, removing the wedge for the selected vertical.
3. **The competitor gap is real.** Never checked.
4. **eGovPH and eBOSS close the compliance gap.** Government is building in this lane; Permits has a shelf life.
5. **Solo-builder capacity.** Three features, seven milestones, one person, while job hunting.

Risk 5 is the most probable and the least discussed.

---

## 19. Success criteria

The prototype succeeds when:

- one owner can create and access only their authorised business;
- **an owner discovered a loss or a blocked step they did not already know about;**
- the Stocks flow connects count, delivery, daily sales, reorder recommendation, and verified outcome;
- the Permits flow preserves tasks, evidence, fee source, temporary validity, handoff, and statutory deadline without claiming guaranteed outcomes;
- every exposed table is protected by tested RLS;
- documents are private by default;
- the interface is usable on a 360px Android viewport;
- no screen implies guaranteed compliance, legal advice, tax certification, or confirmed market validation.

---

## 20. Compliance caveat

Every requirement, fee, deadline, rate, and form reference in this document is a **reference statement, not a legal guarantee.** LGU processes differ, RDO practice differs, and rules change. Each requirement node carries `official_source`, `effective_date`, and `verified_date` for this reason. §10 boundaries apply without exception.
