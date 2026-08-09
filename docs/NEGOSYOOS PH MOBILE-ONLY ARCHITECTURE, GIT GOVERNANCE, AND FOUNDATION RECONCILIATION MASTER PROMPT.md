# NEGOSYOOS PH — MOBILE-ONLY ARCHITECTURE, GIT GOVERNANCE, AND FOUNDATION RECONCILIATION MASTER PROMPT

You are working inside the existing local repository for **NegosyoOS PH**.

This is a controlled architecture and repository-governance correction.

Do not begin normal feature development until this reconciliation is complete.

---

# 0. AUTHORITATIVE FOUNDER DECISIONS

Treat the following as authoritative.

## Product delivery

**NegosyoOS PH is a MOBILE APPLICATION ONLY.**

It is:

* not a web application;
* not a web + mobile platform;
* not PWA-first;
* not a future-native wrapper around a website;
* not Next.js-first.

The intended product client is a native mobile application built with:

* React Native;
* Expo;
* Expo Router;
* TypeScript.

The backend remains Supabase/PostgreSQL unless inspection finds a concrete reason to change a specific part.

## Product purpose

NegosyoOS PH remains a Philippine MSME operating platform organized around:

1. Establish;
2. Comply;
3. Operate;
4. Decide.

Current user-facing language should prefer concrete product areas such as:

* Stocks & Operations;
* Permits & Compliance;
* Taxes & Records.

Do not restore obsolete internal codenames in user-facing UI.

## Development strategy

Do not try to build the entire product at once.

After the mobile foundation is verified, development must proceed through small end-to-end capabilities.

The first major product workflow remains **Stocks & Operations**, but DO NOT implement the Stocks MVP during this reconciliation.

---

# 1. NON-NEGOTIABLE SAFETY RULES

Before editing anything:

* inspect current Git reality;
* inspect repository documentation;
* inspect implementation;
* inspect database migrations/tests;
* inspect remote branch relationships where possible.

Do not assume documentation matches code.

Do not assume the local checkout matches GitHub.

Do not assume `develop` is safe to use.

Do not assume old branches are merged.

Do not:

* `git reset --hard`;
* `git clean -fd`;
* discard uncommitted work;
* force-push;
* rewrite published history;
* delete branches before classifying them;
* modify hosted Supabase data;
* alter production database schema;
* commit automatically;
* push automatically;
* merge automatically;
* delete remote branches automatically.

If uncommitted user work exists, preserve it.

If a requested operation would destroy or overwrite work, stop that operation and report the conflict instead.

---

# 2. PHASE R0 — ESTABLISH LOCAL GIT REALITY

Run and inspect at minimum:

```bash
git status
git branch --show-current
git branch -vv
git log --oneline --decorate --graph --all -30
git remote -v
git fetch --all --prune
git status
```

Then determine:

* current branch;
* current local HEAD;
* `origin/main`;
* `origin/develop`;
* divergence between local and remote refs;
* modified files;
* staged files;
* untracked files;
* stashes, if relevant;
* existing tags;
* current remote branches.

Do not change branches until this baseline is understood.

Record the discovered Git baseline in the final report.

---

# 3. KNOWN REMOTE BRANCH CONTEXT TO VERIFY

The public repository is:

`jusbreakindacycle/negosyo-os`

Recent remote inspection indicated these branches existed:

```text
main
develop
ci/pgtap-verification-gate
patch/audit-sanitization
patch/ci-pipeline
```

Recent inspection also indicated:

* `main` was substantially ahead of `develop`;
* `develop` contained one unique older line of work;
* the branches had diverged;
* therefore the existing `develop` must NOT automatically become the base for the mobile migration.

Treat this only as a lead.

Verify the current state yourself.

---

# 4. CLASSIFY ALL EXISTING LONG-LIVED/LEFTOVER BRANCHES

For every relevant non-main branch, classify it as exactly one of:

### A. ACTIVE AND VALID

Contains deliberate current work that remains relevant.

### B. FULLY MERGED / SUPERSEDED

No unique valuable work remains.

Candidate for later deletion.

### C. UNIQUE VALUABLE WORK

Contains commits or changes not represented in `main` that should be preserved or reconciled.

### D. OBSOLETE WEB-ARCHITECTURE WORK

Contains unique work, but that work belongs to the superseded Next.js/web architecture.

Preserve historical trace where appropriate, but do not migrate obsolete implementation into the mobile product merely because it is unique.

### E. UNKNOWN / NEEDS REVIEW

Do not delete or modify.

For each branch, report:

* divergence relative to `main`;
* unique commits;
* meaningful unique files/changes;
* classification;
* recommended disposition.

Do not delete branches in this task unless explicit authorization is later provided.

---

# 5. PRESERVE THE PRE-MOBILE HISTORY

The repository must retain a clear historical point representing the last pre-mobile architecture.

If safe based on current Git state, recommend creating:

```text
archive/develop-pre-mobile-pivot
```

from the exact existing old `develop` tip before `develop` is rebuilt.

Also recommend a historical tag on the current pre-mobile `main`, for example:

```text
pre-mobile-pivot-2026-08-08
```

Do not invent a different commit.

Use the exact inspected commit.

Do not push the archive branch or tag automatically.

Prepare the commands and report them if remote mutation is not explicitly authorized.

---

# 6. RE-ESTABLISH THE BRANCH MODEL

The intended Git model is:

```text
main
│
│ verified / releasable product
│
└── develop
    │
    │ next integrated version
    │
    ├── feature/*
    ├── fix/*
    ├── refactor/*
    ├── test/*
    ├── docs/*
    ├── chore/*
    ├── spike/*
    └── migration/*
```

The current stale/diverged `develop` must not simply continue indefinitely.

After preserving any unique valuable work, `develop` should eventually be re-established from the current authoritative `main`.

Do not rewrite the remote `develop` automatically.

If updating remote `develop` would require a destructive ref change, prepare an exact safe migration plan for review rather than performing it.

---

# 7. CREATE THE MOBILE MIGRATION WORKSTREAM

Once the Git baseline is safe, the architecture migration must occur on:

```text
migration/mobile-foundation
```

The intended ancestry is:

```text
main
  ↓
develop
  ↓
migration/mobile-foundation
```

However, because the current `develop` may be stale/diverged, do not blindly branch from it.

The correct logical process is:

```text
current authoritative main
        ↓
reconciled develop baseline
        ↓
migration/mobile-foundation
```

If performing the complete branch reconciliation locally is safe, do so locally.

Do not force-update remote refs without explicit authorization.

---

# 8. PERMANENT BRANCHING POLICY

Create:

```text
docs/DEVELOPMENT_WORKFLOW.md
```

This must be project-specific.

Define the following.

## `main`

Meaning:

> Latest verified/releasable NegosyoOS PH version.

Rules:

* no normal feature work directly on `main`;
* no experimental work;
* no known broken build;
* no known failing required CI;
* no force push;
* no casual commits;
* release/version tags originate from verified `main`.

## `develop`

Meaning:

> Integration branch for the next planned product version.

Rules:

* may contain incomplete product scope;
* must remain buildable;
* must not knowingly remain broken;
* changes normally arrive via PR;
* CI must pass before integration.

Use this principle:

> `develop` may be unfinished, but it should not be knowingly broken.

## Short-lived branches

Use:

```text
feature/*
fix/*
hotfix/*
refactor/*
test/*
docs/*
chore/*
spike/*
migration/*
```

Definitions:

### `feature/*`

One user-facing capability.

Examples:

```text
feature/stocks-count-entry
feature/stocks-count-history
feature/permits-deadline-reminders
```

### `fix/*`

Normal defect fix targeting the next version.

Example:

```text
fix/auth-session-restore
```

### `hotfix/*`

Urgent correction to the currently released/stable `main`.

Example:

```text
hotfix/auth-android-crash
```

Hotfix flow:

```text
main
 ↓
hotfix/*
 ↓
main
 ↓
develop
```

### `refactor/*`

Internal restructuring without intended product behavior expansion.

### `test/*`

Test infrastructure or focused regression coverage.

### `docs/*`

Documentation-only work.

### `chore/*`

Tooling, configuration, dependency maintenance.

### `spike/*`

Temporary experiment or investigation.

A spike is not presumed production-ready.

### `migration/*`

Large controlled architecture or infrastructure transition.

Current example:

```text
migration/mobile-foundation
```

---

# 9. DO NOT CREATE PERMANENT MODULE BRANCHES

Do NOT adopt permanent branches such as:

```text
stocks
permits
taxes
ai
auth
dashboard
```

Modules belong in product architecture and source organization.

Branches represent finite changes.

Example:

```text
Stocks MVP
├── feature/stocks-priority-items
├── feature/stocks-count-entry
├── feature/stocks-count-history
├── feature/stocks-attention-items
└── feature/stocks-purchase-action
```

Each branch should eventually merge and disappear.

---

# 10. LARGE MODULES USE MILESTONES/ISSUES, NOT PERMANENT BRANCHES

Document the intended hierarchy:

```text
PRODUCT
NegosyoOS PH

    ↓

MILESTONE / MODULE
Stocks MVP

    ↓

ISSUE / CAPABILITY
Record physical stock count

    ↓

BRANCH
feature/stocks-count-entry

    ↓

PULL REQUEST
feat(stocks): add physical stock count entry

    ↓

develop

    ↓

verified release

    ↓

main + version tag
```

The branch must not become the planning artifact.

Issues/milestones/product documentation own broader scope.

---

# 11. ADD AI CODING-AGENT BRANCH SAFETY TO CLAUDE.md

Update `CLAUDE.md` with explicit repository safety rules.

At minimum:

```text
BRANCH SAFETY

1. Inspect `git status`, current branch, local HEAD, and remote relationship before implementation.
2. Do not begin normal feature work directly on `main`.
3. Do not begin normal isolated feature work directly on `develop`.
4. Determine the intended capability/issue before implementation.
5. Use one appropriately named short-lived branch.
6. Do not combine unrelated capabilities in one branch.
7. Do not merge, push, delete branches, force-update refs, or alter `main` automatically unless explicitly authorized.
8. Leave a branch buildable and testable whenever reasonably possible.
9. Database schema changes require new additive migrations.
10. Never edit already-applied migrations merely to simplify a feature.
11. Report branch name, changed files, tests, database impact, and intended PR target at completion.
12. If the current branch does not match the requested scope, stop implementation and reconcile branch context first.
```

Also add:

> A request such as “add this small feature” is not permission to modify unrelated modules.

---

# 12. READ ALL CONTROLLING PRODUCT/ARCHITECTURE DOCUMENTS

Read completely:

```text
README.md
CLAUDE.md
docs/PROJECT_BLUEPRINT.md
docs/TECHNICAL_FOUNDATION.md
docs/BUILD_PLAN.md
docs/DECISION_LOG.md
```

Also inspect:

```text
package.json
lockfile
complete src tree
tests
.github/workflows
.env.example
.mcp.json
supabase/config.toml
all migrations
all pgTAP tests
generated database types
```

Do not infer repository architecture from README alone.

---

# 13. INSPECT HOSTED SUPABASE READ-ONLY

The intended Supabase project reference is expected to be:

```text
vbmfkfkfpvgezgyahdpb
```

Use the repository-configured read-only Supabase MCP if authenticated.

Compare hosted reality with repository migrations for:

* migration history;
* tables;
* columns;
* enums;
* constraints;
* indexes;
* RLS status;
* policies;
* grants;
* functions/RPCs;
* function security;
* triggers;
* relevant generated TypeScript types;
* security advisors;
* performance advisors where relevant.

Do NOT modify hosted data or schema.

If access is unavailable, state exactly:

```text
HOSTED SUPABASE: NOT VERIFIED
```

and explain what remains unverified.

Repository inspection is not equivalent to hosted verification.

---

# 14. PRESERVE THE GOOD SUPABASE FOUNDATION

Do not throw away valid backend work because the frontend architecture was wrong.

Preserve unless a concrete audit finding requires change:

* PostgreSQL;
* Supabase Auth;
* profiles;
* businesses;
* business memberships;
* audit events;
* business lifecycle fields;
* tracked items;
* daily sales;
* membership-based tenancy;
* Row-Level Security;
* controlled RPC write paths;
* database constraints;
* pgTAP;
* destructive cross-tenant tests;
* migration history;
* generated database types where still accurate.

Security rule remains:

> A user reaches business data through valid business membership and through nothing else.

The active business selected on the phone is UI state.

It must never become authorization.

---

# 15. RECORD THE MOBILE-ONLY FOUNDER DECISION

Append a new decision to:

```text
docs/DECISION_LOG.md
```

Use the next valid decision number.

Decision:

> NegosyoOS PH is a native mobile application only.

This supersedes current delivery assumptions involving:

* Next.js as the client application;
* responsive web delivery;
* SSR application architecture;
* browser-cookie application state;
* PWA delivery;
* TWA delivery;
* web-first/native-later;
* web + mobile.

Do not erase historical decisions.

Preserve history and mark them superseded.

Do not accidentally supersede valid domain decisions.

---

# 16. CREATE THE REQUIRED CONTROL DOCUMENTS

Create or reconcile:

```text
PROJECT_STATE.md
PRODUCT_SPEC.md
RISK_REGISTER.md
TEST_STRATEGY.md
```

These are controlling documents.

They must not be generic.

## PROJECT_STATE.md

Must contain:

* current verified state;
* current unverified state;
* active migration;
* blocking risks;
* current branch/workstream;
* exactly one next allowed engineering task.

## PRODUCT_SPEC.md

Define:

* mobile-only product;
* target user;
* primary problem;
* product pillars;
* MVP boundaries;
* current Stocks-first sequencing;
* what is explicitly out of scope.

## RISK_REGISTER.md

At minimum cover:

* mobile authentication;
* deep links;
* tenant isolation;
* RLS;
* exposed mobile credentials;
* secret handling;
* schema drift;
* low-end-device performance;
* unreliable mobile connectivity;
* stale/offline state;
* privacy;
* sensitive uploaded documents;
* legal/regulatory source staleness;
* AI unsupported claims;
* dependency/supply-chain risk;
* destructive migrations;
* accidental agent Git operations.

For every risk include:

* description;
* likelihood;
* impact;
* mitigation;
* evidence/status;
* owner or responsible layer.

## TEST_STRATEGY.md

Cover:

* unit tests;
* component tests;
* integration tests;
* PostgreSQL tests;
* RLS isolation;
* RPC behavior;
* auth;
* session persistence;
* deep links;
* onboarding;
* business switching;
* mobile routing;
* low-width devices;
* low-end Android behavior;
* poor connectivity;
* accessibility;
* eventual offline behavior;
* CI;
* emulator verification;
* physical-device verification.

Never treat emulator testing as physical-device verification.

---

# 17. RECONCILE ALL EXISTING CURRENT-STATE DOCUMENTATION

Update:

```text
README.md
CLAUDE.md
docs/PROJECT_BLUEPRINT.md
docs/TECHNICAL_FOUNDATION.md
docs/BUILD_PLAN.md
docs/DECISION_LOG.md
docs/DEVELOPMENT_WORKFLOW.md
PROJECT_STATE.md
PRODUCT_SPEC.md
RISK_REGISTER.md
TEST_STRATEGY.md
```

Current authoritative documentation must not describe NegosyoOS PH as:

* a Next.js product;
* a responsive website;
* PWA-first;
* TWA-first;
* web-first;
* web + mobile;
* native-later.

Historical sections may mention previous architecture only when clearly marked superseded.

---

# 18. TARGET MOBILE ARCHITECTURE

The target client foundation is:

```text
React Native
Expo
Expo Router
TypeScript
```

Backend:

```text
Supabase
├── Auth
├── PostgreSQL
├── Row-Level Security
├── RPC / PostgreSQL functions
├── Storage when needed
├── Realtime only when justified
└── Edge Functions for trusted secret-bearing backend work
```

Use current official Expo and Supabase documentation when selecting installation/configuration patterns.

Do not guess dependency versions.

Prefer:

```bash
npx expo install ...
```

for Expo-managed dependencies.

---

# 19. CLIENT SECURITY BOUNDARY

The native application may contain public client configuration such as:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

The mobile bundle must NEVER contain:

* Supabase service-role key;
* database password;
* private API secrets;
* AI provider server secrets;
* privileged administrative credentials;
* confidential integration secrets.

Trusted secrets belong in a backend environment such as:

* Supabase Edge Functions;
* another explicitly approved trusted service.

Never mistake `.gitignore` for runtime secret protection.

A secret embedded in a mobile bundle is considered exposed even if the source `.env` file was never committed.

---

# 20. REMOVE THE SUPERSEDED WEB APPLICATION FOUNDATION

Do not mechanically transform DOM components into React Native components.

Replace the application layer deliberately.

Remove when no longer referenced:

* Next.js;
* `react-dom`;
* `@supabase/ssr`;
* Next.js route handlers;
* Server Actions;
* Next.js server/client split infrastructure;
* browser cookies for active-business state;
* Next.js proxy/middleware infrastructure;
* browser confirmation route;
* shadcn web components;
* Radix web UI dependencies;
* Next-specific lint/config;
* Next font infrastructure;
* PWA/TWA-only implementation;
* web-only assets that no longer serve the product.

Preserve reusable platform-independent:

* TypeScript;
* Zod schemas;
* database types;
* business/domain validation;
* constants;
* calculations;
* audit event definitions;
* Supabase database layer;
* tests that remain logically valid.

Before deleting a utility, determine whether its logic is reusable independent of Next.js.

---

# 21. MOBILE PROJECT STRUCTURE

Prefer feature/domain organization rather than a huge flat screens folder.

A reasonable target may resemble:

```text
app/
  (auth)/
  (onboarding)/
  (app)/
    stocks/
    permits/
    taxes/
    settings/

src/
  components/
  features/
    auth/
    businesses/
    stocks/
    permits/
    taxes/
  lib/
    supabase/
    validation/
    storage/
  hooks/
  types/
  constants/
```

Do not force this exact tree if Expo Router/current repository constraints indicate a better structure.

Document the final chosen architecture.

---

# 22. MOBILE AUTHENTICATION FOUNDATION

Replace SSR/cookie authentication with native session architecture.

Implement only foundation-level auth necessary for verification:

* sign up;
* sign in;
* sign out;
* session persistence;
* restored session on app launch;
* authenticated routing;
* unauthenticated routing;
* email confirmation;
* invalid/expired confirmation handling;
* password recovery if already part of current authentication scope.

Use Expo Router.

Use native deep linking for flows that return from email/browser into the application.

Do not preserve the old Next.js `/auth/confirm` route as the active product architecture.

Validate incoming authentication/deep-link parameters.

---

# 23. BUSINESS ONBOARDING AND TENANCY

Preserve existing database authorization where valid.

Foundation verification should support:

```text
authenticated user
    ↓
business memberships
    ↓
create business through authorized backend path
    ↓
list accessible businesses
    ↓
select active business
    ↓
mobile UI updates
```

The locally selected business ID is only a preference.

Database RLS must remain authoritative.

Manipulating local mobile state must not enable cross-business access.

---

# 24. ACTIVE-BUSINESS STATE

Replace browser cookies with an appropriate native state/persistence solution.

Requirements:

* app can remember appropriate local preference;
* stale/deleted inaccessible business is handled;
* business selection never grants authorization;
* session logout clears sensitive local state as appropriate;
* business switch causes queries to refresh safely.

Do not overengineer global state without need.

Use the smallest appropriate state solution.

---

# 25. THE THREE-ACTIVE-BUSINESS CEILING

The previously identified rule regarding a maximum of three non-closed businesses per owner remains unresolved unless a newer controlling decision supersedes it.

Do not implement this purely in the UI.

If implemented later, enforcement belongs in an authorized database/server path.

During this foundation task:

* identify current state;
* document the requirement;
* classify whether it blocks mobile foundation;
* do not expand scope unnecessarily.

---

# 26. CI RECONCILIATION

Preserve strong database verification.

The current database CI pattern using disposable Supabase and pgTAP is valuable.

Do not weaken it merely because the client becomes mobile.

Mobile CI should eventually include applicable checks such as:

```text
dependency installation from lockfile
lint
TypeScript
unit tests
Expo config/health validation
Metro/Expo export or bundle verification
database migration-from-zero
pgTAP
```

Do not require production Supabase credentials for isolated database CI.

Do not run destructive tests against hosted production.

---

# 27. BRANCH PROTECTION POLICY

Document recommended GitHub protections.

## main

Recommend:

```text
pull requests required
required CI checks
no force pushes
no branch deletion
no ordinary direct feature pushes
```

Because this may be a single-developer repository, do NOT require another human approval unless desired later.

Automated checks should remain required.

## develop

Recommend:

```text
pull requests for isolated work
CI required
no force pushes
no branch deletion
```

Do not modify GitHub branch protection automatically in this task unless explicit authorization exists.

Provide exact recommended settings in the final report.

---

# 28. VERSION/TAG POLICY

Document the purpose of tags.

Branches mean:

> what is changing now.

Tags mean:

> exactly which immutable historical version this was.

Recommended early progression:

```text
v0.1.0-alpha.1   mobile foundation
v0.2.0-alpha.1   auth/onboarding + first operational slice
v0.3.0-alpha.1   Stocks MVP
...
v1.0.0           first production-ready release
```

Do not create release tags claiming functionality that was not verified.

---

# 29. RELEASE BRANCHES — NOT YET

Do not introduce permanent `release/*` complexity today.

A temporary:

```text
release/v1.x.x
```

model may be introduced later when the project has actual distributed production releases and simultaneous next-version work.

Until then:

```text
feature/fix/etc.
        ↓
develop
        ↓
verified
        ↓
main
        ↓
tag
```

is sufficient.

---

# 30. EXPO/EAS DEPLOYMENT IS SEPARATE FROM GIT BRANCHES

Do not confuse Git branches with Expo/EAS channels.

Future deployment may use concepts such as:

```text
development
preview
production
```

Those are deployment environments/channels.

Git remains:

```text
feature/*
    ↓
develop
    ↓
main
```

Document the distinction.

Do not implement production EAS deployment unless required for mobile-foundation verification.

---

# 31. DATABASE CHANGE WORKFLOW FOR FUTURE FEATURES

Document this permanent rule.

Example:

```text
feature/stocks-suppliers
```

needs new database structures.

The branch creates a NEW migration:

```text
supabase/migrations/<timestamp>_create_suppliers.sql
```

CI must be able to:

```text
create disposable database
        ↓
apply migrations from zero
        ↓
run database tests
        ↓
run RLS isolation tests
```

Do not modify existing applied migration files simply because a later feature wants a different schema.

---

# 32. DO NOT BUILD STOCKS YET

This reconciliation stops at a verified mobile foundation.

Do not implement:

* supplier management;
* purchase orders;
* reorder prediction;
* barcode scanning;
* AI stock recommendations;
* Permits workflows;
* Taxes workflows;
* broad reminders;
* document vault;
* payment/billing;
* large offline-sync engine.

The first Stocks slice comes afterward.

---

# 33. MOBILE FOUNDATION ACCEPTANCE GATE

Do not call the mobile migration complete until the following applicable checks are verified.

At minimum:

```text
[ ] application launches
[ ] Expo configuration valid
[ ] routing works
[ ] unauthenticated routing works
[ ] authenticated routing works
[ ] sign up works
[ ] sign in works
[ ] sign out works
[ ] session restores after app relaunch
[ ] deep-link auth flow is correctly configured/tested where executable
[ ] business onboarding works
[ ] business creation uses authorized backend path
[ ] accessible businesses can be listed
[ ] active business can be switched
[ ] local active-business state does not weaken authorization
[ ] cross-business RLS remains effective
[ ] TypeScript passes
[ ] lint passes
[ ] unit tests pass
[ ] database migrations apply from zero
[ ] pgTAP passes
[ ] CI configuration reflects mobile reality
[ ] current documentation reflects mobile reality
[ ] no privileged server secret exists in mobile configuration
```

Where physical-device testing was not performed, mark it:

```text
NOT EXECUTED
```

Do not fabricate verification.

---

# 34. EVIDENCE STATUS

For each important capability use explicit status such as:

```text
PLANNED
IMPLEMENTED
LOCALLY VERIFIED
CI VERIFIED
HOSTED VERIFIED
DEVICE VERIFIED
BLOCKED
SUPERSEDED
```

Never use `VERIFIED` without saying what evidence supports it.

For example:

```text
Authentication implementation: IMPLEMENTED
Authentication emulator test: LOCALLY VERIFIED
Authentication physical Android: NOT EXECUTED
Hosted schema parity: BLOCKED — no authenticated MCP access
```

---

# 35. REQUIRED DOCUMENTATION RESULT

By the end of the reconciliation, the repository should have one coherent hierarchy:

```text
README.md
│
├── PRODUCT_SPEC.md
├── PROJECT_STATE.md
├── RISK_REGISTER.md
├── TEST_STRATEGY.md
│
└── docs/
    ├── PROJECT_BLUEPRINT.md
    ├── TECHNICAL_FOUNDATION.md
    ├── BUILD_PLAN.md
    ├── DEVELOPMENT_WORKFLOW.md
    └── DECISION_LOG.md
```

Avoid duplicate sources of truth.

If two documents overlap, define which one is authoritative for which concern.

---

# 36. EXPECTED POST-RECONCILIATION BRANCH FLOW

After this work, future development should resemble:

```text
main
│
│ v0.1.0-alpha.1
│ verified mobile foundation
│
└── develop
    │
    ├── feature/stocks-priority-items
    │       ↓ PR
    │
    ├── feature/stocks-count-entry
    │       ↓ PR
    │
    ├── feature/stocks-count-history
    │       ↓ PR
    │
    └── feature/stocks-attention-items
            ↓ PR
```

After the complete integrated Stocks MVP is verified:

```text
develop
   ↓
main
   ↓
v0.x.x
```

Exact version numbers must reflect actual completed scope.

---

# 37. EXACT EXECUTION ORDER

Follow this order.

## R0.1 — Git discovery

Inspect local and remote Git state.

Make no destructive changes.

## R0.2 — Branch audit

Classify:

* `develop`;
* `ci/pgtap-verification-gate`;
* `patch/audit-sanitization`;
* `patch/ci-pipeline`;
* any additional branches discovered.

## R0.3 — Preserve historical work

Determine exact archive/tag actions needed.

Do not destroy old `develop`.

## R0.4 — Repository/control-document audit

Read controlling documentation and implementation.

## R0.5 — Hosted Supabase read-only audit

Verify if access exists.

Do not mutate hosted state.

## R0.6 — Record founder decisions

Append mobile-only and workflow decisions without rewriting history.

## R0.7 — Create missing control documents

Create:

* `PROJECT_STATE.md`;
* `PRODUCT_SPEC.md`;
* `RISK_REGISTER.md`;
* `TEST_STRATEGY.md`;
* `docs/DEVELOPMENT_WORKFLOW.md`.

## R0.8 — Establish safe branch context

Ensure migration work resides on:

```text
migration/mobile-foundation
```

based on the reconciled current baseline.

## M0.1 — Replace web project foundation

Remove obsolete Next.js client architecture.

Create Expo/React Native foundation.

## M0.2 — Rebuild Supabase client architecture

Native session storage.

Mobile-safe environment variables.

No privileged secrets.

## M0.3 — Native routing/auth

Expo Router.

Protected routes.

Deep-link-ready auth.

## M0.4 — Restore business onboarding/tenancy

Reuse valid database primitives.

## M0.5 — Reconcile tests and CI

Mobile client tests + preserved database security tests.

## M0.6 — Verification

Run everything locally executable.

## M0.7 — Documentation truth pass

Ensure documentation describes what actually exists.

## M0.8 — Stop

Do not begin Stocks.

Return final report.

---

# 38. EXACTLY ONE NEXT ALLOWED TASK AFTER COMPLETION

If and only if the mobile foundation passes the required acceptance gate, set the next allowed engineering task to the first small end-to-end Stocks capability.

Do not authorize the entire Stocks module at once.

A suitable candidate is:

> Implement the first end-to-end priority tracked-item workflow for the mobile application.

The exact next task must be chosen based on the reconciled product state.

`PROJECT_STATE.md` must contain exactly one next allowed engineering task.

---

# 39. FINAL REPORT FORMAT

At completion, return:

## A. Git baseline

* starting branch;
* local HEAD;
* remote HEAD;
* working-tree status;
* divergence discovered.

## B. Branch audit

For every relevant branch:

* purpose;
* divergence;
* unique work;
* classification;
* recommended disposition.

## C. Historical preservation

* archive branch recommendation;
* pre-mobile tag recommendation;
* exact commit SHA for each;
* actions actually performed;
* actions not performed.

## D. Mobile founder decision

* exact decision-log entry added;
* previous decisions superseded.

## E. Documentation

List:

* created;
* modified;
* superseded;
* deleted.

## F. Architecture migration

List:

* Next.js/web pieces removed;
* reusable logic retained;
* Expo/mobile architecture added.

## G. Supabase

Report separately:

* repository migration state;
* local database verification;
* hosted structural verification;
* anything not verified.

## H. Authentication

Report:

* session persistence;
* routing;
* deep-link setup;
* sign-up/sign-in/sign-out;
* test evidence.

## I. Tenancy

Report:

* business membership behavior;
* business creation;
* switching;
* RLS;
* cross-business isolation evidence.

## J. CI/tests

Provide exact commands and results.

Do not summarize failures as success.

## K. Secrets/security

Confirm whether any privileged secret was found in mobile-delivered configuration.

## L. Branching policy

Confirm:

* `main` purpose;
* `develop` purpose;
* short-lived naming policy;
* hotfix flow;
* release/tag policy;
* recommended GitHub protections.

## M. Remaining risks

Only meaningful unresolved risks.

## N. Evidence matrix

Use explicit statuses.

## O. Exactly one next allowed engineering task

One task only.

---

# 40. DEFINITION OF SUCCESS

This task succeeds when NegosyoOS PH has moved from:

```text
A web-first Next.js repository with ambiguous branch history
```

to:

```text
A clearly governed mobile-only software project
with:

React Native + Expo + TypeScript
        ↓
Supabase/PostgreSQL
        ↓
membership-based RLS and controlled RPCs

plus:

main = verified/releasable
develop = next integrated version
short-lived branches = isolated capabilities
migrations = additive schema history
CI = application + database verification
documentation = current source of truth
```

Do not optimize for speed by skipping governance or verification.

Do not expand product scope while performing the migration.

Preserve valid engineering work.

Remove only superseded application architecture.

Leave the repository in a state where the next developer or AI coding agent can determine:

1. what the product is;
2. what is currently working;
3. what is verified;
4. what branch should be used;
5. what must not be changed;
6. what the next single engineering task is.