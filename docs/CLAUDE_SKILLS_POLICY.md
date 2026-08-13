# Claude Code Skills & Plugin Adoption Policy

**Applies to:** any repository built solo by the founder using AI-directed development.
**Status:** Active policy. Adopted for this repository by [DL-061](DECISION_LOG.md#dl-061).
**First written:** 2026-08-13, in response to a batch of "AI Business Skills" Instagram
carousels (accounts `ibraviz.ai`, `swiperightai`) proposing ~35 third-party Claude
skills/plugins across Developers, Design, Marketing, Social, Finance, Legal, and Research
departments.

A sibling copy of this policy exists in the founder's other repository. The two share the
portable parts — the posture, the adoption test, and the review cadence — but each carries
only its own repository's decisions, so they are not byte-identical. This is a standing
policy, not a one-time recommendation — append new rows when new skill claims appear; do
not delete prior entries (same discipline as `docs/DECISION_LOG.md`).

This file governs **whether** an additional capability should be adopted. It does not
govern how much reasoning or execution capability a task needs — that is
`docs/AI_EXECUTION_PROTOCOL.md` — and it does not govern what the agent is allowed to do,
which is `CLAUDE.md` and the authority chain in `README.md`.

---

## 1. Why this file exists

"Skill/plugin" content on social media is almost always produced by growth or
info-product accounts, not by the tool maintainers. The volume of items shown (35 across
7 unrelated business departments) is a sales-bundle format, not a needs assessment of any
specific codebase. Treat every such post as **marketing content to be filtered**, not a
checklist to be installed wholesale. Installed skills also run with Claude's tool/shell
permissions inside a session — an unreviewed skill is a supply-chain surface, not a
free upgrade.

## 2. Default posture

**Skip by default.** A third-party skill or plugin is only adopted when all three hold:

1. It closes a **verified gap** in this project's actual stack or workflow — not a
   generic "AI business" capability.
2. It does **not duplicate** governance already enforced by this repo's `CLAUDE.md` /
   `DECISION_LOG.md` / branch-safety rules, or a capability already available as a
   built-in Anthropic skill (docx, pdf, pptx, xlsx, frontend-design, skill-creator are
   already available without installing anything).
3. Its maintainer can be checked before it is granted access — recognized org
   (`anthropics`, `supabase`, `vercel-labs`, `remotion-dev`, `greensock`) vs. an
   unverified personal repo. Read the full `SKILL.md` before enabling; a skill can
   instruct arbitrary tool use.

## 3. What governs current repository state

`PROJECT_STATE.md` governs what is true in this repository right now, and this file does
not restate it. The one skills-relevant fact — which skills and plugins are actually
enabled — lives in `.claude/settings.json` and is recorded in
[DL-061](DECISION_LOG.md#dl-061).

## 4. Review of the 2026-08 carousel batch

| Item | Department shown | Verdict | Reason |
|---|---|---|---|
| Skill-Creator (`anthropics/skills`) | Research | **Consider** | Legitimate — official Anthropic repo. Only real use case here: package this project's own house rules (read-first order, evidence labeling, one-command-at-a-time PowerShell rule, Manila-timezone rule) into a portable custom skill reusable across the founder's repositories. |
| Context7 | Developers | **Consider** | Legitimate, widely adopted. Genuine fit: Expo ~57 / React Native 0.86 / React 19.2 move fast enough that version-mismatched docs are a real, recurring risk already seen in this project's own version-pinned dependencies. |
| Agent-Browser (`vercel-labs`) | Research | **Consider, low priority** | Legitimate org. Only relevant if scoped to automate the manual second-Supabase-project SQL Editor step used for pgTAP verification (Docker unavailable locally). Read-only/verify scope only — never write access to a production project. |
| Claude-HUD | Research | **Consider, low priority** | Nice-to-have visibility during long unattended Claude Code runs. Not essential — `PROJECT_STATE.md` already serves as the after-the-fact audit trail. |
| Graphify | Research | **Consider, low priority** | Could visualize relationships across a 700–1,000+ line decision log. Nice-to-have, not a gap. |
| Superpowers (`obra`) | Developers | **Reject** | This project's own `CLAUDE.md` / `DECISION_LOG.md` already enforce a stricter, project-specific version of "plan → verify → one task at a time" — including branch safety, evidence labeling, and an explicit "exactly one next allowed engineering task" gate. A generic third-party version is weaker and risks conflicting instructions. |
| gstack, MCP Builder, Webapp Testing, Claude-Mem | Developers | **Reject** | gstack/MCP Builder: no external integrations currently needed. Webapp Testing: there is no web client here to test — the product is native-only (DL-056). Claude-Mem: memory is already handled by the DECISION_LOG/PROJECT_STATE pattern, which is more auditable than a black-box memory plugin. |
| Ponytail, Caveman, I-HAVE-ADHD, Codex | Vibe-code | **Reject** | These are output-style preferences (terser answers, direct-first formatting) or a second paid agent (Codex) — configure response style directly instead of installing a skill for it; adds nothing a plugin needs to provide. |
| frontend-design, web-artifacts, canvas-design, algorithmic-art, slack-gif, Hyperframes, Emil, GSAP | Design | **Reject — wrong platform** | These are browser/web-only tools (Tailwind React web components, browser CSS/GSAP animation, PNG/PDF canvas output, video-from-webpage). This client is not a web app; GSAP and browser-only JS do not run inside React Native/Expo. |
| ui-ux-pro-max, Taste-Skill, Impeccable | Design | **Reject** | NegosyoOS has its own design direction. Generic palette/typography generators don't add anything an already-decided system needs. |
| All of Marketing (seo-audit, programmatic-seo, ai-seo, cro, ad-creative, mktg-psychology) | Marketing | **Reject — wrong department** | Zero relevance to building or shipping this mobile app. |
| All of Social (social, copywriting, content-strategy, video, pillar-content, email-sequences) | Social | **Reject — wrong department** | Same as above. |
| All of Finance (dcf-model, 3-statements, lbo-model, comps-analysis, pricing, pitch-deck) | Finance | **Reject — wrong department** | A business-registration and operations assistant — like HOA due-tracking, the other domain this policy has been applied to — is not an investment-banking financial model; nothing here maps to this codebase. |
| All of Legal (contract-review, nda-triage, legal-risk, compliance, docx, sql-queries) | Legal | **Reject** | docx is already a built-in Anthropic skill, not something to install separately. The rest is generic corporate-legal tooling, not Philippine HOA (RA 9904) or MSME-specific — and `sql-queries` risks encouraging ad-hoc queries that bypass this project's additive-migration-only discipline. |
| Humanizer, Social-Media-Skills, Remotion, MarketingSkills, Last30Days, Find-Skills | Research/Vibe/Marketing | **Reject** | Content-marketing and AI-detection-evasion tooling, unrelated to shipping software. Find-Skills is a meta-discovery tool made redundant once a short adopted list exists (this file). |

## 5. Standing decisions (as of 2026-08-13)

- **Adopted for this repository:** `supabase` and `postgres-best-practices` from the
  official `supabase/agent-skills` marketplace, already enabled in `.claude/settings.json`
  and recorded retroactively in [DL-061](DECISION_LOG.md#dl-061). They pass §2: official
  maintainer, a real gap on a Supabase/RLS/migration-heavy stack, no duplication of
  governance enforced here.
- **Consider, not urgent:** Skill-Creator and Context7, per §4.
- **Rejected:** everything else listed in §4, for the stated reasons.

## 6. Review cadence

Re-run the checklist in §2 whenever a new "AI skills" carousel or listicle appears.
Append new rows to §4/§5 with the date reviewed. Never delete prior rows — this file is
a log, not a snapshot.
