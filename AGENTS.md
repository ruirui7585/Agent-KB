# Agent Workspace Rules

## Workspace & Directory Boundaries

- **Supported Agents**: Applies to **Gemini / Antigravity, Codex, Claude Code, Cursor, and any other AI Agent**. This file is the single source of truth; platform entries ([GEMINI.md](GEMINI.md), [CLAUDE.md](CLAUDE.md), `.cursorrules`) are thin wrappers only.
- **Default Workspace**: `/Users/shilv/Agent-Workspace` (do not treat `~/.codex/`, `~/.gemini/`, `Desktop/`, `Documents/`, `Downloads/`, or other folders as the project workspace unless explicitly specified).
- **Active Knowledge Base**: `~/.kb/` → `/Users/shilv/Agent-Workspace/Agent-KB` (read-only by default; writing requires explicit authorization such as “update knowledge base / update skill / save this rule / 更新知识库”).

| Directory | Purpose | Default Access |
|---|---|---|
| `./Agent-KB/` | Shared skills and templates | Read-only |
| `./Projects/` | Formal active projects (only edit inside confirmed project; no cross-project edits/moves) | Read/write in confirmed project |
| `./Sandbox/` | Explicitly requested experiments (not formal project sources unless promoted) | Read/write when requested |

## Priority Order & Efficient Reading

Load missing applicable rules once per task (reuse what is already in context; do not replay the reading chain):
1. `/Users/shilv/Agent-Workspace/AGENTS.md`
2. `~/.kb/AGENTS.md` (when using shared skills, templates, or standards)
3. `/Users/shilv/Agent-Workspace/Projects/<project-name>/AGENTS.md` (+ platform entry such as `CLAUDE.md` / `GEMINI.md` if present and applicable) before accessing project files
4. Applicable `~/.kb/skills/<skill-name>/SKILL.md` only at the stage it triggers

- **Information & conflict priority (high → low)**: User's latest explicit instruction > latest valid spec > runtime/active code & confirmed UI refs > active project context/decisions (project rules win inside that project) > workspace/KB rules > authorized archive > low-risk inference. Never silently blend conflicting rules or let archive overwrite active files.
- **Gap-driven reading**: Read entry rules once completely; for large PRDs/indexes/logs, search headings/keywords first and read only missing sections. Track canonical paths (`~/.kb/` = `Agent-KB/`) to avoid duplicate reads; never preload downstream Skills or full directories; pass subagents only bounded scope and criteria.

## Default Ignore

Unless explicitly pointed to by the user, do not read, reference, or modify:
- `Desktop/`, `Documents/`, `Downloads/`, `plugins/`, `~/.codex/`;
- `.git/`, `node_modules/`, `dist/`, `build/`, `.next/`, `.vite/`, `coverage/`;
- directories named `old`, `archive`, `backup`, `legacy`, `broken`, `checkpoint`, or date-named directories (e.g. `2026-04-20/`).

## Before Every Modification & Execution Rules

Before editing project files, reuse the confirmed project path (ask if missing/ambiguous) and state:
1. **Task type** · 2. **Target project** · 3. **Allowed files** · 4. **Forbidden files** · 5. **Planned changes** · 6. **Validation plan**

- **Single Source of Truth & Minimal Scope**: Establish confirmed project root, active entry, and approved write targets before editing (ask if ambiguous; do not switch write targets mid-task silently). Edit active files in place via reviewable patches; never create parallel forks (`copy`, `backup`, `new`, `latest`, `final`, `final-final`, duplicate `v2`) unless requested, and never let exports silently become active sources. Preserve existing layout/interactions; default naming is lowercase-hyphenated English (keep standard uppercase names like `AGENTS.md`, `README.md`, `PRD.md`, `SCREEN_SPEC.md`).
- **AI Assumptions**: Label low-risk context-grounded assumptions clearly and never auto-promote them to permanent rules. **Never silently assume high-impact details**—ask first for pricing/charges/payouts, permissions/roles, privacy/data deletion, state transitions, historical migration, backward compatibility, active entry, core page structure, or permanent rules.
- **Validation Integrity & Completion Report**: Run risk-proportional checks (syntax → build → preview/runtime → console errors → main flow → regression) on the active source only; never claim unexecuted checks passed (state what was skipped, why, and how to verify). Finish edits with: (1) completed work, (2) files changed, (3) executed checks & results, (4) unexecuted checks & why, (5) remaining risks/assumptions/conflicts. Answer pure analysis/questions directly without over-formatting.
- **Safety & Communication**: The user is a product manager and code beginner—state exact target paths before commands/code/edits, explain steps simply and sequentially, avoid excessive alternatives, and confirm before risky deletion, overwrite, or migration. Do not delete files or modify `~/.kb/` / `~/.codex/` without explicit authorization. When creating a file, state why it is needed, its exact path, and whether it is active, temporary, or archive.

## Project & Skill Routing

- **Laka**: `Projects/laka/AGENTS.md` owns all Laka product, UI, requirement, and delivery rules; do not duplicate Laka facts here.
- **Skills**: Read `~/.kb/skills/<skill-name>/SKILL.md` only when triggered; report incomplete guidance before proceeding; do not modify a Skill unless asked. For non-trivial coding, code review, bug-fix, or refactoring, read `~/.kb/skills/karpathy-guidelines/SKILL.md` first.

| Trigger | Required source |
|---|---|
| New product requirement, feature idea, optimization direction, or business problem | [product-rules.md](product-rules.md): 新需求端到端产品协作规则 (respect discussion-only requests) |
| Preparing a handoff from cloud LLM brainstorming to prototype build | `~/.kb/templates/feature-contract-template.md` |
| Drafting, reviewing, or auditing a PRD for edge cases and logic gaps | `~/.kb/templates/prd-template.md` + `~/.kb/pm-kb/pm-kb.md` (pre-check personal blindspots) |
| Post-dev PRD patch, PM/tech concept explanation, to-learn note, or periodic review | `~/.kb/pm-kb/pm-kb.md` (A-mode 3-line confirmation before writing; sync `review.html` via `~/.kb/pm-kb/sync-kb.mjs`) |
| Product documentation or metric / tracking definitions | [product-rules.md](product-rules.md): Product Documentation Rules |
| Delivering a product HTML prototype from a confirmed Feature Contract | [product-rules.md](product-rules.md): Product Prototype Skill Routing (`pm-delivery-workflow` is the only orchestrator) |
| HTML / UI prototype creation, modification, review, or delivery | [COMMON_UI_RULES.md](COMMON_UI_RULES.md) |
| Authoring or reviewing English UI copy / domain terminology for social or consumer app prototypes | `~/.kb/skills/social-ui-copy/SKILL.md` (pair with project `ui/COPY_GLOSSARY.md` when present) |
| Installing, updating, renaming, moving, or removing a KB Skill | [rule-maintenance.md](rule-maintenance.md): Skill Change Synchronization (review `AGENTS.md`, `GEMINI.md` & `CLAUDE.md`) |
| User adjusts, corrects, or supplements the same output at least once | [rule-maintenance.md](rule-maintenance.md): 指令提炼与归类规则 |
| Creating or revising permanent instructions | [rule-maintenance.md](rule-maintenance.md): classification, storage, and explicit confirmation gates |
