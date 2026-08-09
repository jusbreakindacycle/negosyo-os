# Development Workflow

Project-specific branching, tagging, and change-management policy for NegosyoOS PH. Recorded as
[DL-057](DECISION_LOG.md#dl-057).

## `main`

> Latest verified/releasable NegosyoOS PH version.

Rules:

- no normal feature work directly on `main`;
- no experimental work;
- no known broken build;
- no known failing required CI check;
- no force push;
- no casual commits;
- release/version tags originate from verified `main`.

## `develop`

> Integration branch for the next planned product version.

Rules:

- may contain incomplete product scope;
- must remain buildable;
- must not knowingly remain broken;
- changes normally arrive via pull request;
- CI must pass before integration.

Guiding principle: `develop` may be unfinished, but it should not be knowingly broken.

As of this document, `develop` was force-reset locally to `main`'s tip (`9043d50`) because the
previous `develop` held only the pre-Milestone-1 scaffold, already superseded and fully contained
in `main`'s squashed history. The old tip is preserved at `archive/develop-pre-mobile-pivot`
(`2d42ecc`). Updating the *remote* `develop` to match is a destructive ref change and is not
performed automatically — see the final reconciliation report for the exact command.

## Short-lived branches

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

### `feature/*`

One user-facing capability.

```text
feature/stocks-count-entry
feature/stocks-count-history
feature/permits-deadline-reminders
```

### `fix/*`

Normal defect fix targeting the next version.

```text
fix/auth-session-restore
```

### `hotfix/*`

Urgent correction to the currently released/stable `main`.

```text
hotfix/auth-android-crash
```

Flow:

```text
main → hotfix/* → main → develop
```

### `refactor/*`

Internal restructuring without intended product behaviour expansion.

### `test/*`

Test infrastructure or focused regression coverage.

### `docs/*`

Documentation-only work.

### `chore/*`

Tooling, configuration, dependency maintenance.

### `spike/*`

Temporary experiment or investigation. Not presumed production-ready.

### `migration/*`

Large controlled architecture or infrastructure transition.

```text
migration/mobile-foundation
```

## No permanent module branches

Do **not** create permanent branches such as `stocks`, `permits`, `taxes`, `ai`, `auth`,
`dashboard`. Modules belong in product architecture and source organisation; branches represent
finite changes and disappear on merge.

```text
Stocks MVP
├── feature/stocks-priority-items
├── feature/stocks-count-entry
├── feature/stocks-count-history
├── feature/stocks-attention-items
└── feature/stocks-purchase-action
```

## Planning hierarchy

```text
PRODUCT               NegosyoOS PH
  ↓
MILESTONE / MODULE     Stocks MVP
  ↓
ISSUE / CAPABILITY     Record physical stock count
  ↓
BRANCH                 feature/stocks-count-entry
  ↓
PULL REQUEST           feat(stocks): add physical stock count entry
  ↓
develop
  ↓
verified release
  ↓
main + version tag
```

The branch is never the planning artifact. Issues, milestones, and `PROJECT_STATE.md` /
`docs/BUILD_PLAN.md` own broader scope.

## Database change workflow

A feature branch that needs new database structures creates a **new** migration:

```text
supabase/migrations/<timestamp>_create_suppliers.sql
```

CI must be able to create a disposable database, apply migrations from zero, and run the pgTAP
suites including RLS isolation tests. Never edit an already-applied migration to simplify a later
feature — add a new one instead.

## Tag policy

Branches mean *what is changing now*. Tags mean *exactly which immutable historical version this
was*.

```text
v0.1.0-alpha.1   mobile foundation
v0.2.0-alpha.1   auth/onboarding + first operational slice
v0.3.0-alpha.1   Stocks MVP
...
v1.0.0           first production-ready release
```

Never tag a release claiming functionality that was not verified. Historical preservation tags
(e.g. `pre-mobile-pivot-2026-08-09`) are separate from version tags and mark a point in history,
not a release.

## Release branches — not yet

No permanent `release/*` complexity today. A temporary `release/v1.x.x` model may be introduced
later once there are simultaneous production releases and next-version work in flight. Until then:

```text
feature/fix/etc. → develop → verified → main → tag
```

is sufficient.

## Git vs. deployment channels

Do not confuse Git branches with Expo/EAS deployment channels (`development`, `preview`,
`production`). Those are deployment environments. Git branching stays `feature/* → develop → main`
regardless of which channel a build is promoted to. EAS production deployment is out of scope until
a later milestone explicitly authorises it.

## Recommended GitHub branch protections

Not applied automatically by this document — recorded here for the founder to enable.

**`main`:**

```text
pull requests required
required CI checks
no force pushes
no branch deletion
no ordinary direct feature pushes
```

**`develop`:**

```text
pull requests for isolated work
CI required
no force pushes
no branch deletion
```

Because this is currently a single-developer repository, a second-human-approval requirement is
not recommended yet; automated CI checks should remain required regardless.

## AI coding-agent branch safety

Restated in `CLAUDE.md`. Summary: inspect Git state before implementing, never work normal feature
scope directly on `main` or `develop`, use one correctly named short-lived branch per capability,
never combine unrelated capabilities in one branch, never merge/push/delete branches or force-update
refs without explicit authorisation, keep a branch buildable, use additive migrations only, and
report branch name, changed files, tests, database impact, and intended PR target at completion.
