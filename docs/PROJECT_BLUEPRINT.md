# NegosyoOS PH Project Blueprint

**Version 3.1 — supersedes Project Blueprint v2.0/v3.0's delivery model only, per DL-056. Historical decisions remain in `DECISION_LOG.md`.**

**Mobile-only since 2026-08-09.** NegosyoOS PH is delivered as a native mobile application
(React Native, Expo, Expo Router) — see [DL-056](DECISION_LOG.md#dl-056). Every other decision
in this document (product thesis, the three product areas, reference cases, validation framework)
is unaffected.

| Field | Current state |
| --- | --- |
| Product name | NegosyoOS PH — temporary working name |
| Product type | Commercial hypothesis; not yet commercially validated |
| Phase | Phase 1A — Foundation and first validated workflow |
| Product structure | One native mobile application, three user-facing product areas, one shared action model |
| Current code | Mobile foundation reconciliation in progress; Supabase/PostgreSQL tenancy foundation and partial Stocks database work carried over unchanged — see `PROJECT_STATE.md` |
| First operational reference | DUO BREW coffee-shop purchasing and availability problems |
| First job-centred reference | B2B air-conditioning services; not yet interviewed |
| AI | Assisted self-service; visible summaries and guided help are allowed |
| Human support | Owner-appointed representatives and qualified professionals when needed |
| Final pricing | Not approved |
| Production readiness | Not established |

## 1. Product thesis

### Public-facing statement

> NegosyoOS PH helps Philippine MSME owners establish and maintain their businesses, meet compliance obligations, control daily operations, and make better decisions through affordable AI-assisted self-service, with human support available when needed.

### Full internal positioning

> NegosyoOS PH helps Philippine micro, small, and medium enterprise owners—including qualified BMBEs, owner-operated establishments, service contractors, and growing B2B businesses—establish and maintain their businesses, meet compliance obligations, control daily operations, and make better decisions through affordable AI-assisted self-service, with authorised representatives and qualified professionals available when needed.

NegosyoOS PH is not only an inventory calculator, permit checklist, or tax calculator. It is an owner action system that organises business facts, identifies what needs attention, explains why, and guides the next bounded action.

## 2. The three user-facing product areas

| Product area | Main question | Typical actions |
| --- | --- | --- |
| **Stocks & Operations** | What needs attention, purchasing, scheduling, or follow-up? | Buy, count, receive, prevent waste, prepare job materials, follow up work or payment |
| **Permits & Compliance** | What must be prepared, submitted, renewed, evidenced, or followed up? | Gather, upload, submit, assign, renew, clarify, escalate |
| **Taxes & Records** | What must be recorded, reviewed, estimated, or filed? | Complete records, review period, estimate, verify eligibility, prepare for professional or official filing |

Taxes may consume shared financial records, but it is not allowed to assume that the Stocks interface or inventory data is a complete tax record. Permits, Stocks, and Taxes share business identity, evidence, tasks, deadlines, documents, permissions, and action presentation; they retain separate domain rules.

Internal technical package names may remain in code. Internal codenames must not appear in public-facing UI.

## 3. The shared action model

Every domain should answer the same sequence:

1. **What needs attention?**
2. **Why does it matter?**
3. **What facts support it?**
4. **What information is missing or stale?**
5. **What is the safest next action?**
6. **Who is authorised to do it?**
7. **What did the owner decide?**
8. **What happened afterward?**

An action item is not merely a notification. It contains:

- business and domain;
- issue or opportunity;
- priority and timing;
- factual basis;
- source and freshness;
- uncertainty or missing data;
- recommended bounded action;
- required confirmation;
- responsible person;
- decision and outcome.

The dashboard is the owner’s action centre. It may group items into:

- **Today**
- **Upcoming**
- **Waiting on someone**
- **Needs review**
- **Completed recently**

The dashboard is a read-and-act surface over domain-owned workflows. It must not become an unbounded universal business engine.

## 4. AI-assisted self-service

AI may be visible in the dashboard and guided workflows. It may:

- summarise current action items;
- explain a requirement or calculation in plain English or Taglish;
- organise tasks;
- ask for missing information;
- draft a purchase list, checklist, reminder, follow-up message, or question for a professional;
- highlight inconsistent or unusual information;
- recommend professional review when the situation exceeds self-service boundaries.

AI must not:

- become the source of a legal requirement, fee, deadline, tax rate, stock quantity, or permission;
- invent missing facts;
- silently mark a task complete;
- directly write high-impact records without confirmation and server-side authorisation;
- choose a tax option;
- declare compliance, eligibility, approval, deductibility, or exemption;
- file, sign, pay, or act as a representative;
- hide uncertainty behind confident language.

Standing rule:

> **Deterministic rules and recorded evidence determine. AI explains, organises, and assists. The owner or authorised human decides.**

The product must remain usable when AI is unavailable.

## 5. The evidence spine

The universal spine is not one daily sales number. It is a set of evidence-labelled business facts.

Possible inputs include:

- business identity and lifecycle status;
- memberships and authority;
- priority items, quantities, units, supplier cadence, lead time, and pack constraints;
- purchase, receiving, waste, unavailability, and outcome events;
- sales and receipts when relevant;
- customer jobs, materials, completion evidence, invoices, and collections when a job-centred workflow is validated;
- requirements, tasks, official sources, submissions, fees, receipts, dates, and statuses;
- taxpayer registration facts and period completeness.

Each material fact should carry, where applicable:

- source;
- actor;
- recorded date;
- effective period;
- last verified date;
- evidence status;
- confidence or completeness;
- correction history.

Daily gross sales is important for sales-based tax estimates and may improve some demand models. It is not required before the product can help with low-stock attention, purchase lists, supplier planning, waste, forgotten purchases, or job-material readiness.

## 6. The real operational problem

The first operational problem is valid even when an owner cannot calculate a precise peso loss.

Evidence may include a recent recurring incident:

- an ingredient or supply ran out;
- too much stock was bought;
- product spoiled or was wasted;
- a purchase was forgotten;
- an item was unavailable to a customer;
- the owner was uncertain before visiting or messaging a supplier;
- a job was delayed because materials were missing;
- completed work was not invoiced or collected.

The product should first make the next decision easier and more reliable. Financial impact may be measured later when the data exists.

A null answer to “How many pesos did you lose?” is evidence that the loss is unmeasured—not proof that the operational pain does not exist.

## 7. Users and operating profiles

NegosyoOS PH may serve:

- owner-operated B2C establishments;
- home-based and mobile services;
- inventory-centred food or retail businesses;
- service contractors;
- B2B suppliers or contractors serving large organisations;
- mixed goods-and-services businesses;
- growing teams and later multi-site businesses.

Customer size does not determine the owner’s enterprise-size classification.

Model separately:

- legal form;
- enterprise size;
- BMBE or other certification/incentive status;
- tax registration and treatment;
- operating model;
- customer model.

A qualified or certified BMBE remains part of the MSME sector; BMBE is not a competing enterprise-size category.

## 8. Lifecycle and service modes

The product must support both new and existing businesses.

### Establishing

The owner is registering, preparing, or formalising the business. The dashboard prioritises requirements, blockers, evidence, costs, assignments, and next steps.

### Operating

The owner is running the business. Stocks, operational actions, records, renewals, and tax-readiness items may be active.

### Changing

The business may amend registrations, add a branch, change activities, assign representatives, or change tax/operating facts.

### Closing

The product may eventually organise retirement or closure tasks and preserve the decision/evidence history.

A mayor’s permit is one important status event, but it must not be assumed to be the only legitimate trigger for an operating business. Existing registered businesses and informal businesses need different entry paths. Lifecycle status must be explicit and server-authorised if it controls access or billing.

Service modes:

- owner-managed self-service;
- owner-appointed representative;
- optional professional review or service;
- hybrid.

AI cannot become the legal representative.

## 9. Product-area direction

### 9.1 Stocks & Operations

First promise:

> Help the owner know what may run out, what should be bought or prepared, why, and what to do next.

Start with 8–12 priority items. Do not require a full inventory.

Before enough history exists, use owner-configured warning levels, supplier schedule, lead time, and current quantity. After sufficient compatible history exists, add transparent estimates such as days-to-stockout.

A recommendation must show:

- item and quantity context;
- facts used;
- usual range or baseline, if any;
- missing information;
- confidence;
- owner controls to confirm, change, snooze, or reject;
- later outcome.

Do not present an exact reorder quantity as certain when usage, units, lead time, pack size, or minimum order quantity are missing.

For job-centred businesses, the corresponding problem may be materials, scheduled work, completion evidence, invoicing, receivables, and collections. Do not implement a universal inventory-and-jobs engine before a real second workflow is validated.

### 9.2 Permits & Compliance

First promise:

> Help the owner see what is done, blocked, missing, due, evidenced, assigned, and next.

Every rule or requirement must be attached to:

- jurisdiction;
- agency;
- business context;
- official source;
- effective date;
- last verification date;
- evidence status.

Do not encode one LGU’s process as a nationwide rule.

RA 11032 processing periods and automatic-approval consequences are conditional. The product must record completeness, official transaction classification, payment, applicable Citizen’s Charter, and other conditions. Time passing alone must not produce “approved.” Initial alerts should recommend review or escalation. Legal demand templates require qualified review before release.

### 9.3 Taxes & Records

First promise:

> Help the owner understand record completeness, approaching obligations, bounded estimates, and what must be confirmed before filing.

Tax outputs require taxpayer-specific facts and current rules. The system must distinguish:

- business or taxpayer type;
- VAT/non-VAT status;
- tax registrations;
- elected or certified treatments;
- filing period;
- data completeness;
- rule effective date;
- estimate versus official liability.

A sales threshold monitor or percentage-tax estimate must show assumptions and incomplete periods. The product does not elect a tax treatment or prepare, sign, submit, or pay a return in Phase 1A.

## 10. Reference cases and evidence

### DUO BREW — Mandaluyong

Operator-confirmed:

- no POS;
- uses spreadsheets;
- operator decides order quantities;
- purchasing is based on what appears low;
- understock means unavailable products;
- overstock means *sayang*;
- a small family team may perform counting.

Not established:

- exact peso loss;
- supplier constraints and lead time;
- whether a franchisor tool already solves the problem;
- willingness to maintain the habit;
- willingness to pay.

This supports a narrow purchasing/availability experiment, not a completed market selection.

### Car-tint installation services — Pasig

Firsthand observations include a permit process, assessed amount, temporary paperwork, instructions, and representative handoff. The exact fee composition and legal basis remain unknown unless the official assessment and receipts are examined.

This supports a generic evidence-and-handoff workflow. It does not support nationwide Pasig rules or a universal claim about registration pain.

### Air-conditioning services — B2B

Known: serves corporate and bank clients.

Hypotheses pending interview include quotations, work orders, scheduling, equipment history, materials, completion proof, invoicing, accounts receivable, collections, and preventive maintenance.

No job-centred requirement is approved for implementation until the operator interview.

## 11. Validation framework

Validation measures behaviour and outcomes, not only verbal enthusiasm.

For each workflow, test:

- recent concrete incidents;
- frequency;
- current workaround;
- missing information at decision time;
- recording burden;
- whether the owner returns without founder prompting;
- whether the recommendation changes a decision;
- whether the outcome can be checked;
- trust and comprehension;
- willingness to pay after value is experienced.

### Revised kill criteria

Stop or redesign a workflow when:

- three accessible target operators cannot describe a recurring concrete incident;
- operators refuse or repeatedly abandon the minimum data habit;
- the workflow requires more setup or maintenance than the current workaround;
- three operators receive realistic recommendations and none finds them useful;
- the product cannot explain a recommendation from traceable facts;
- a compliance feature merely reproduces a free checklist without useful dependency, evidence, handoff, or next-action value;
- no owner is willing to pay after a supervised working prototype demonstrates value.

Failure to name an exact peso loss is **not** by itself a kill criterion.

## 12. Commercial model

Commercial validation is not established.

Possible free/paid boundaries remain hypotheses. Do not present price, trial, subscription, Google Play distribution, or conversion timing as settled.

The paid value is more likely to come from recurring decision support and reduced uncertainty than from static information already available from government or free sources.

Before billing work:

- demonstrate repeated use;
- measure recording burden;
- test willingness to pay;
- research competitors;
- calculate support and infrastructure costs;
- decide whether app-store distribution is necessary.

## 13. Evidence-status protocol

Use these labels in documents, issues, pull requests, AI prompts, and capability matrices:

- `VERIFIED`
- `IMPLEMENTED_UNVERIFIED`
- `DOCUMENTED_ONLY`
- `PLANNED`
- `RESEARCH_REQUIRED`
- `OUT_OF_SCOPE`
- `SUPERSEDED`

Rules:

1. Never upgrade a label silently.
2. Link verification to a test run, field observation, or primary source.
3. A source must support the exact claim, not a nearby claim.
4. Current legal rules require an effective date and last-reviewed date.
5. Unknowns remain visible.
6. AI-generated prose is never itself evidence.
7. A passing test that does not reach the intended guard is not evidence.
8. A database table is not a user workflow.
9. A user workflow is not a validated market.
10. A founder decision is not a fact about users.

## 14. Current Phase 1A scope

### In scope

- authentication and business tenancy;
- priority-item purchasing/availability workflow;
- minimal action dashboard;
- evidence-labelled facts and corrections;
- owner decisions and outcomes;
- secure document vault;
- one generic permit/compliance case;
- bounded tax-readiness estimates after required facts exist;
- visible, bounded AI summaries and explanations;
- supervised mobile field testing.

### Out of scope

- nationwide authoritative rules database;
- direct filing, signing, payment, or portal automation;
- universal automatic-approval claims;
- unreviewed legal demand letters;
- automatic certification, exemption, or tax-option activation;
- full bookkeeping, accounting, POS, ERP, payroll, or HR;
- lending, banking, insurance, investment, or marketplace products;
- professional marketplace;
- all vertical packs;
- full B2B job engine before discovery;
- production-grade multi-branch support;
- autonomous agents;
- unrestricted general chatbot;
- complex offline writes;
- final, store-ready, production-hardened native app (the client itself is native from the start per DL-056; what is out of scope here is production polish — offline sync, app-store release hardening — not the native architecture);
- subscription billing and final price;
- production launch.

## 15. Red-team questions

Before approving a feature, answer:

1. What real owner incident does this prevent or simplify?
2. What is the cheapest current alternative?
3. What minimum data must the owner maintain?
4. What happens when the data is missing, wrong, stale, or contradictory?
5. Can one typo create a high-impact recommendation?
6. Is the system explaining a rule or inventing one?
7. Could a user bypass a paid or permission boundary through the API?
8. Does the audit trail expose more than the underlying record?
9. Is the feature useful without AI?
10. Does the feature work for a low-cost phone and unstable connection?
11. Are we generalising from one café or one LGU?
12. Are we building documentation instead of a testable workflow?
13. What evidence would make us stop?
14. Is a qualified professional legally or practically required?
15. What will the owner do differently after seeing this output?

## 16. Current build order

1. Documentation and claim repair.
2. Database pgTAP in CI and security regression proof.
3. First end-to-end Stocks action slice.
4. Real operator habit and usefulness test.
5. Secure document vault.
6. Generic Permits action slice with strict source conditions.
7. Taxes and records slice with completeness and eligibility controls.
8. Unified dashboard expansion and bounded AI assistance.
9. Supervised field test and operational hardening.
10. Packaging, distribution, and billing only after validation.

## 17. Success criteria

Phase 1A succeeds when:

- tenant isolation is verified continuously;
- one operator can maintain a small priority list without a full inventory;
- the system surfaces a real purchase/availability issue from traceable facts;
- the operator understands why it appeared and can act or dismiss it;
- the outcome is recorded and can be checked;
- a compliance case preserves source, evidence, blockers, handoff, and next action without guaranteeing approval;
- a tax estimate exposes completeness, assumptions, and professional-confirmation boundaries;
- the dashboard remains useful without AI;
- AI improves comprehension without changing the underlying rule result;
- the interface works on a 360px Android viewport;
- no screen or document presents planned work as implemented or implementation as market validation.
