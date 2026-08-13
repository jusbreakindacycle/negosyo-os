# AI Execution and Routing Protocol

Canonical source for choosing **how much** reasoning and execution capability a task needs.
Recorded as [DL-062](DECISION_LOG.md#dl-062). `CLAUDE.md` carries the short version that applies to
every task; this document carries the classification tables, which are read when the classification
is not obvious.

Three separate questions, three separate authorities. They must not be merged:

| Question | Authority |
| --- | --- |
| **What** is the agent allowed to do? | `CLAUDE.md` and the authority chain in `README.md` |
| **How much** capability does this task need? | this document |
| **Whether** to adopt additional capability at all | `docs/CLAUDE_SKILLS_POLICY.md` |

## 1. What this protocol is, and what it is not

It **is** an execution-routing, escalation, de-escalation, and mode-selection framework. It helps
the founder pick a configuration before work starts, and it tells the agent how to behave inside
whatever configuration it was actually given.

It is **not** a mechanism for changing a model or an effort level. **No repository file can make
Claude Code or any other AI environment switch its own model, effort, or execution mode.** Where an
environment exposes a control, the founder uses it. Where it does not, the protocol still governs
depth of investigation, when to stop, and when to ask — which is most of its value.

It **authorises nothing.** It never permits a commit, push, branch, pull request, merge, deployment,
hosted database write, or destructive operation; those come only from `CLAUDE.md` branch safety and
explicit founder authorisation, in every mode without exception. It never relaxes the evidence
protocol, the completion-report format, the migration rules, or the tenancy rules. It never
overrides `PROJECT_STATE.md`'s single next allowed engineering task.

## 2. Capability register

Routing may only rely on capabilities that have actually been observed in the active environment.
Each row carries a label from the repository's evidence protocol (`README.md`). A
`RESEARCH_REQUIRED` row must not be assumed to exist.

| Capability | Status | Basis |
| --- | --- | --- |
| Model tiers `haiku` · `sonnet` · `opus` · `fable` selectable for a delegated subagent | `VERIFIED` | Exposed as an explicit model parameter by the agent-delegation tool in Claude Code, 2026-08-13 |
| Model selection for the main session | `IMPLEMENTED_UNVERIFIED` | A `/model` control exists in Claude Code; which tiers a given account and surface may select was not enumerated |
| Effort vocabulary `low · medium · high · xhigh · max` | `VERIFIED` for the code-review surface | These exact levels are accepted by the repository's review tooling. Whether the same vocabulary applies to ordinary sessions on every surface was not confirmed |
| "Extra High" as a named level distinct from `xhigh` | `RESEARCH_REQUIRED` | Used in founder-facing conversation; not observed as a distinct value in this environment |
| "Ultracode" as a named effort level | `RESEARCH_REQUIRED` | Not observed in this environment. Do not route to it |
| Multi-agent cloud review (`/code-review ultra`) | `VERIFIED` as **founder-triggered only** | Billed, and the agent cannot launch it. It may be recommended, never invoked |
| Availability differences between CLI, IDE extension, desktop, and web | `RESEARCH_REQUIRED` | Not enumerated. Confirm in the active surface before relying on a tier |

When an environment does not offer a recommended configuration, say so and route to the closest
available one. Do not silently pretend the recommendation was met.

## 3. Classify before starting

Assess all twelve. Any single high-risk answer governs the tier — risk does not average out.

1. **Complexity** — how many interacting parts.
2. **Ambiguity** — how much of the requirement is unstated or contradictory.
3. **Architectural impact** — does this decide a shape that later work inherits.
4. **Reversibility** — how expensive is undoing it after it ships.
5. **Security implications** — authentication, secrets, `SECURITY DEFINER`, grants, exposure.
6. **Database and data-integrity implications** — migrations, enums, constraints, backfills.
7. **Tenancy and authorisation implications** — anything touching `business_memberships`, RLS, or
   the rule that a person reaches a business through membership and nothing else.
8. **Backwards compatibility** — existing rows, existing callers, already-applied migrations.
9. **Repository scope** — one file, one module, or several unrelated areas.
10. **Dependency and integration complexity** — hosted services, CI, generated artefacts, tooling.
11. **Hidden-complexity risk** — how likely it is that investigation changes the picture.
12. **Whether extended autonomous iteration is appropriate** — is the path clear enough that
    unattended multi-step work would converge rather than compound a mistake.

## 4. Routing

> **Governing principle: use the smallest sufficient configuration that can reliably complete the
> task without sacrificing architectural, security, or data-integrity quality.**

Maximum effort and extended execution are never defaults. Over-routing wastes budget and buries the
real signal; under-routing produces confident work built on a misunderstanding.

| Tier | Typical work | Model | Effort | Mode |
| --- | --- | --- | --- | --- |
| **Mechanical** | Obvious, narrow, low-risk: a documentation typo, a repetitive transformation, a bounded change with explicit acceptance criteria | Haiku 4.5 | High | Implementation |
| **Normal engineering** | Approved multi-file implementation, moderate debugging, bounded refactoring, routine test fixes, work where the architecture is already settled | Sonnet | High | Implementation |
| **Complex** | Repository audits, difficult debugging, several interacting systems, unclear requirements that must be resolved before code | Opus | Extra High | Plan/Audit |
| **High-consequence** | Architecture, lifecycle and state design, database and migration strategy, security and RLS, tenancy, conflicting requirements, backwards compatibility, adversarial review | Opus | Max | Plan/Audit |
| **Extended execution** | An approved, sufficiently clear multi-step implementation that genuinely benefits from unattended iteration | Fable, or the settled-architecture tier | `xhigh` and above where supported | Extended Execution |

Two rules that override the table:

- Anything touching **migrations, RLS, tenancy, grants, `SECURITY DEFINER`, or an already-applied
  migration** is high-consequence regardless of how small the diff looks.
- **"Agentic" does not mean "better."** Long-horizon execution suits clear paths, not unresolved
  ones. Where the architecture is unsettled, extended execution multiplies a wrong decision instead
  of catching it.

## 5. Escalation — mandatory when investigation changes the picture

A task that looked small is not permitted to keep an obviously insufficient execution strategy
merely because of how it was first described.

```
TRIGGER  →  RECLASSIFY  →  ESCALATE MODEL/EFFORT IF NEEDED  →  REASSESS SCOPE
         →  STOP FOR APPROVAL IF THE ARCHITECTURE OR RISK PROFILE CHANGED
```

Triggers include: discovering a migration is required; discovering RLS, grants, or tenancy are
involved; finding that legacy rows behave differently; finding an existing test asserts the
behaviour being changed; finding two controlling documents disagree; finding that the fix requires
an already-applied migration to change.

**Worked example, from this repository.** A task arrives as *"fix the onboarding redirect."*
Investigation finds lifecycle-state interactions, legacy businesses created under an older flow,
multi-business switching, a `business_status` enum with no write path, session restoration, and
backwards-compatibility consequences. That is no longer a redirect bug; it is a lifecycle and
architecture problem. It escalates from Normal engineering to High-consequence, moves from
Implementation to Plan/Audit mode, and **stops for founder approval** — because the risk profile
changed, not because the work got longer.

Escalation is a reason to think harder. It is **never** permission to widen scope, and it never
overrides `PROJECT_STATE.md`'s single next allowed engineering task.

## 6. De-escalation — mandatory to prevent permanent overkill

```
INVESTIGATE AT HIGHER CAPABILITY  →  SETTLE ARCHITECTURE  →  OBTAIN APPROVAL
                                  →  DE-ESCALATE IMPLEMENTATION WHERE SAFE
```

Opus at Max effort may be the right way to decide a lifecycle model. Once that model is approved and
the remaining work is mechanical, implementation may move to a more execution-oriented model and a
lower effort level.

**The verification floor does not move.** De-escalation lowers reasoning capability, never rigour.
At every configuration, without exception:

- evidence labels are applied honestly and never upgraded silently (DL-049);
- tests actually executed are reported separately from tests not executed, with reasons;
- a security or isolation assertion is evidence only once its negative case has been observed
  failing for the intended reason (DL-026, DL-053);
- branch safety in `CLAUDE.md` applies in full;
- the nine-point completion report in `CLAUDE.md` is produced.

If de-escalating would put any of those at risk, do not de-escalate.

## 7. Execution modes

### Plan / Audit Mode

Use when the architecture is unresolved, requirements conflict, repository state is unknown,
migrations may be required, or a high-consequence decision needs approval.

```
AUDIT  →  ANALYSE  →  PLAN  →  PRESENT DECISIONS  →  STOP FOR APPROVAL
```

Conflicts between controlling documents are surfaced, never silently resolved.

### Implementation Mode

Use when the architecture is approved, the scope is explicit, and implementation authority has been
granted.

```
IMPLEMENT  →  TEST  →  FIX  →  RETEST  →  VERIFY  →  REPORT
```

### Extended Execution Mode

Use only when the scope is approved, the execution path is sufficiently clear, and multi-step work
genuinely benefits from unattended iteration.

```
AUDIT/UNDERSTAND  →  PLAN  →  IMPLEMENT  →  TEST  →  DIAGNOSE  →  FIX
                  →  RETEST  →  VERIFY  →  REPORT
```

It never overrides repository rules on commits, pushes, pull requests, merges, deployments, hosted
database writes, or destructive operations. It stops and asks on any escalation trigger in §5.

**This is a development execution mode, not a product feature.** `CLAUDE.md`, `docs/BUILD_PLAN.md`,
`docs/PROJECT_BLUEPRINT.md`, and `docs/TECHNICAL_FOUNDATION.md` all exclude **autonomous AI agents**
from Phase 1A. That exclusion is about what NegosyoOS ships to an owner. It says nothing about how
development work is carried out, and this mode does not weaken it.

## 8. Where this sits in the overall flow

```
PROJECT / REPOSITORY INSTRUCTIONS   (CLAUDE.md + the authority chain)
        ↓
CURRENT REPOSITORY STATE            (PROJECT_STATE.md + the actual tree)
        ↓
TASK CLASSIFICATION                 (§3)
        ↓
MODEL / EFFORT / MODE RECOMMENDATION (§4, declared to the founder)
        ↓
AUDIT OR IMPLEMENTATION             (§7, escalating or de-escalating per §5 and §6)
        ↓
VERIFICATION                        (the floor in §6)
        ↓
REPORT                              (the nine-point report in CLAUDE.md)
        ↓
EXPLICIT AUTHORISATION FOR COMMIT / PUSH / PR / MERGE
```

For high-consequence work the existing discipline is the outer loop and is unchanged:

```
AUDIT → ANALYSE → PLAN → USER REVIEW → EXPLICIT APPROVAL → CREATE BRANCH
      → IMPLEMENT → TEST → VERIFY → REPORT → USER AUTHORISATION FOR COMMIT / PUSH / PR
```

## 9. Review

Update the capability register in §2 whenever a model tier, effort level, or execution mode is
observed appearing or disappearing in the active environment, and record the observation that
justified the change. A capability is not added to the register because it was announced somewhere;
it is added when it has been seen working here.
