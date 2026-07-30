# NegosyoOS PH Project Blueprint

| Field | Current state |
| --- | --- |
| Product name | NegosyoOS PH — temporary working name |
| Repository | Single active product repository |
| Phase | Phase 1A — Foundation Prototype |
| Product structure | One application, two bounded domains |
| Coding | Authorised for the narrow prototype |
| First operational vertical | Not selected |
| Commercial validation | Not established |
| Final architecture | Not approved |
| Final pricing | Not approved |

## 1. Product thesis

NegosyoOS PH is one mobile-first, AI-assisted application intended to help Philippine MSME owners:

1. establish and register a business;
2. understand and maintain permits, tax-readiness tasks, and other external obligations;
3. operate the business with better visibility and control;
4. detect shortages, discrepancies, missed tasks, and avoidable losses;
5. make bounded, evidence-supported decisions;
6. delegate selected work to properly authorised representatives;
7. preserve documents, receipts, and decision history; and
8. obtain qualified professional assistance only when genuinely needed.

The service principle is:

> Software and AI assistance by default. Bring your own representative when preferred. Qualified professionals only when needed.

## 2. One product, two bounded domains

### 2.1 Start & Comply

This domain handles the business’s external lifecycle:

- business registration;
- barangay and LGU processes;
- zoning or locational requirements;
- sanitary and fire-safety requirements;
- BIR registration and tax-readiness organisation;
- government assessments and official receipts;
- temporary, conditional, and final permits;
- renewals;
- amendments;
- branches;
- authorised representatives;
- business retirement or closure.

Detailed agency requirements are not universal product facts. They must be attached to an official source, jurisdiction, business context, effective date, and evidence status.


### 2.1.1 BMBE certification and incentives

BMBE means Barangay Micro Business Enterprise under Republic Act No. 9178. It is a special certification or incentive status potentially available to qualified micro enterprises, not an alternative to the broader MSME classification.

The Start & Comply domain should eventually support BMBE as a time-bound business certification and incentive status, not as a separate legal entity type.

The product may organise:

- owner-provided business activity;
- self-reported asset snapshot;
- land excluded from the statutory asset computation;
- possible professional-services exclusion;
- DTI or Negosyo Center application status;
- Certificate of Authority number;
- issuing office;
- issue date;
- expiry date;
- renewal status;
- supporting documents;
- BIR treatment confirmation;
- applicable and non-applicable benefit records;
- unresolved conflicts requiring professional review.

The system may display **Potentially eligible — pending official confirmation** when a screening profile appears to fit.

It must not display **BMBE qualified**, **tax exempt**, or an equivalent definitive status without recorded official evidence and any required BIR confirmation.

BMBE status must not be treated as replacing ordinary business, LGU, BIR, invoicing, recordkeeping, employee, or industry-specific requirements.

### 2.1.2 Enterprise classification model

NegosyoOS must represent these dimensions separately:

- legal form;
- enterprise size;
- certification and incentive status;
- tax registration and treatment;
- operating model;
- customer model.

Examples:

- a Mandaluyong café may be a micro enterprise and may separately hold BMBE certification;
- a Pasig car-tint installer may be a micro or small service business regardless of whether it serves individuals or companies;
- an air-conditioning contractor serving banks and corporations may still itself be an MSME.

A registered BMBE is generally also within the MSME sector, but not every MSME is a BMBE. BMBE should therefore be modelled as an additional certification and benefit status, not as a competing size category.


### 2.2 Operate & Decide

This domain handles internal daily operational control:

- stock, supplies, and materials;
- purchases and receiving;
- suppliers and price changes;
- customer jobs or orders where relevant;
- operational cash outflows;
- expected-versus-actual comparison;
- shortages and discrepancies;
- bounded action recommendations;
- owner decisions;
- outcome verification;
- supporting receipts and documents.

Its intended loop is:

> Capture essential movements → compare expected and actual → expose shortages and discrepancies → recommend a bounded action → record the owner decision → verify the outcome.

### 2.3 Shared platform

Shared capabilities may include:

- user identity;
- business and branch profiles;
- memberships and roles;
- authorised representatives;
- document vault;
- evidence metadata;
- notifications;
- audit history;
- AI-assistance surfaces;
- subscriptions;
- multi-business switching;
- offline capture and synchronisation.

Shared data does not erase domain boundaries.

## 3. Product boundaries

The application must not:

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

## 4. User and service model

### Owner self-service

The default user completes ordinary tasks with software and AI guidance.

The system should explain:

- what the task is;
- why it may apply;
- the supporting evidence;
- what remains unknown;
- documents to prepare;
- questions to ask;
- result to record;
- next bounded action.

### Owner-appointed representative

The owner may assign a specific task to a family member, employee, bookkeeper, accountant, partner, liaison, or other properly authorised person.

The system may track:

- principal;
- representative;
- agency or counterparty;
- authorised actions;
- exclusions;
- authorisation document;
- effective and expiry dates;
- ID and signature requirements;
- notarisation or SPA requirements;
- revocation;
- action history.

AI cannot become the representative.

### Optional professional escalation

A lawyer, CPA, accountant, bookkeeper, or other qualified person may be engaged when a task requires professional judgment, certification, signing, representation, dispute handling, or high-risk review.

A case manager is not mandatory for normal use.

## 5. AI-assisted roles

Potential product surfaces:

- Registration Navigator
- Tax Compliance Guide
- Legal Information Guide
- Document Review Assistant
- Government Liaison Guide
- Operations Analyst
- Evidence Reviewer

For high-impact outputs, show:

1. what the source says;
2. what it does not say;
3. applicable inference;
4. conflicts;
5. unknowns;
6. bounded next action;
7. evidence source and version.

## 6. Reference evidence cases

### 6.1 Pasig car-tint installation services

**Firsthand user observation**

The founder assisted a friend whose car-tint installation services business is located in Pasig City. The founder continued part of the registration or permit process as a representative after the friend had completed unknown earlier steps.

Known observations:

- Pasig business-registration or permit processing;
- assessed amount of ₱5,123.50;
- temporary sanitary-permit paperwork;
- BFP-related instructions;
- poor owner-to-representative handoff;
- unclear completed and pending stages;
- unclear fee composition;
- apparent 90-day temporary permit;
- unclear reasons for sanitary and fire requirements.

Unknown:

- exact classification;
- declared premises;
- official fee components;
- exact permit basis;
- current case status.

The system must never explain the ₱5,123.50 without the actual assessment and receipt.

**Prototype use:** Create a generic compliance case with tasks, evidence, fees, document links, temporary-validity dates, and representative handoff. Do not encode Pasig-specific rules as nationwide rules.

### 6.2 DUO BREW — Mandaluyong City

**Operator-reported evidence**

- No POS.
- Uses spreadsheets.
- Primarily operated by a husband and wife.
- Difficulty knowing what ingredients and supplies remain.
- Difficulty deciding what to buy and how much.
- Outflows appear closely connected to inventory and purchasing.

**Analyst inference**

> Uncertain stock → uncertain purchase need → reactive buying → unpredictable outflows → shortage, overbuying, or unexplained-spending risk.

**Prototype use:** Build a priority-item count, purchase-need, outflow, receipt, receiving, and discrepancy flow.

DUO BREW is not a confirmed pilot and does not select CaféOS.

### 6.3 Air-conditioning services business

**Firsthand user observation**

The founder’s cousin operates an air-conditioning installation, cleaning, and repair services business. Its clients are mostly corporate organisations and banks.

The size of those clients does not determine the service provider’s own enterprise-size classification.

**Analyst hypotheses pending interview**

Possible workflows include:

- corporate client and contact records;
- client branches and service sites;
- service requests;
- quotations;
- work orders;
- technician scheduling;
- air-conditioning unit and equipment history;
- parts and materials;
- installation, cleaning, and repair stages;
- preventive-maintenance schedules;
- job-completion photos, reports, and client acceptance;
- invoices;
- accounts receivable;
- collections;
- recurring maintenance contracts.

These workflow details are not yet operator-confirmed.

**Prototype use:** Preserve this as a structurally different, job-centred B2B service reference case for later validation after the inventory-centred DUO BREW flow. Do not build the full air-conditioning workflow during the initial Phase 1A milestones.


## 7. Operational vertical hypotheses

The carried-forward candidate set is:

1. LaundryOS
2. WaterStationOS
3. FoodBusinessOS
4. CaféOS
5. CarinderiaOS
6. BakeryOS
7. RetailOS
8. RiceStoreOS
9. MotorShopOS
10. ParkingOperationOS
11. SalonOS
12. HardwareOS / ConstructionSupplyOS

None is selected.

Compare candidates using:

- pain frequency;
- problem cost;
- decision clarity;
- data availability;
- encoding burden;
- speed to value;
- ability and willingness to pay;
- access to owners and records;
- competition;
- solo-builder feasibility;
- hardware or integration burden;
- usefulness for testing a structurally different second workflow.



## 7.1 Operating and customer profiles

The product should not assume that every MSME is consumer-facing or store-based.

Possible profiles include:

- owner-operated B2C establishment;
- home-based or mobile service;
- inventory-centred retail or food business;
- job-centred service contractor;
- B2B supplier or contractor serving corporations and banks;
- mixed goods-and-services business;
- growing team or multi-site business.

The customer’s size and the business owner’s enterprise size are separate facts.

## 8. Inventory versus jobs and orders

Long-term direction: support businesses that manage physical items, customer work, or both.

The final operational architecture remains unresolved.

Do not begin with a universal inventory-and-job engine.

Prototype concrete flows first:

- inventory-centred DUO BREW reference flow;
- later a structurally different job-centred reference flow, with the air-conditioning services case as a leading discovery candidate.

Then determine what is genuinely reusable.

## 9. POS and affordability

Do not assume every business has or needs a POS.

Support may include:

- manual capture;
- spreadsheet import;
- daily POS summaries;
- CSV import;
- later integrations.

The product should recommend the least costly setup that reliably solves the actual problem.

Consider:

- capital;
- cash flow;
- transaction volume;
- staff;
- locations;
- cost of current errors;
- existing systems;
- maintenance;
- franchise restrictions;
- connectivity;
- device capability;
- willingness to pay.

## 10. Phase 1A prototype scope

### In scope

Shared:

- application shell;
- authentication;
- owner profile;
- business profile;
- business membership;
- domain-switching dashboard;
- document metadata and secure upload;
- audit event baseline.

Start & Comply reference slice:

- create compliance case;
- add requirement or task;
- assign owner or representative;
- record evidence status;
- record official or unknown fee;
- attach receipt or document;
- record temporary or expiry date;
- view timeline and next action;
- run a non-binding BMBE eligibility screening;
- record BMBE Certificate of Authority details when available;
- track BMBE expiry and renewal;
- record whether claimed BIR treatment is unconfirmed, document-supported, or professionally reviewed;
- surface a warning when BMBE treatment and an 8% income-tax selection appear inconsistent.

Operate & Decide reference slice:

- create priority tracked item;
- record stock count;
- propose purchase need;
- owner approves, changes, or rejects;
- record purchase outflow;
- attach receipt;
- record receiving;
- calculate expected-versus-actual quantity;
- create discrepancy and bounded action;
- record outcome.

### Out of scope

- nationwide requirement database;
- automatic BMBE certification or tax-exemption activation;
- direct BIR or LGU filing;
- automatic tax return preparation;
- full bookkeeping;
- complete POS;
- payroll;
- all twelve vertical packs;
- advanced AI automation;
- native mobile application;
- multi-branch complexity;
- paid professional marketplace;
- subscription billing;
- final offline write synchronisation.

## 11. Success criteria

The prototype succeeds when:

- one owner can create and access only their authorised business;
- a user can understand and switch between both domains;
- the compliance reference slice preserves tasks, evidence, fee source, temporary validity, handoff, and bounded BMBE status tracking without claiming automatic eligibility or exemption;
- the operations reference slice connects count, purchase decision, outflow, receipt, receiving, discrepancy, action, and result;
- every exposed table is protected by tested RLS;
- documents are private by default;
- the interface is usable on a low-cost Android-sized viewport;
- no screen implies guaranteed compliance, legal advice, tax certification, or confirmed market validation.
