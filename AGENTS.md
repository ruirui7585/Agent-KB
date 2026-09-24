# Agent Workspace Rules

## Workspace Root

Default workspace: `/Users/shilv/Agent-Workspace`.
Do not treat `~/.codex/`, Desktop, Documents, Downloads, or other local folders as the project workspace unless the user explicitly specifies them.

## Directory Purpose

| Directory | Purpose | Default Access |
|---|---|---|
| ./Agent-KB/ | Shared knowledge base, skills, templates, examples, global rules | Read-only |
| ./Projects/ | Formal active projects | Read/write inside confirmed project only |
| ./Sandbox/ | Temporary experiments, demos, quick tests | Read/write when explicitly used |
| ./Archive/ | Old or inactive workspace files | Do not read by default |

## Active Knowledge Base

`~/.kb/` points to `/Users/shilv/Agent-Workspace/Agent-KB` and is read-only by default.
Read its `AGENTS.md` for usage rules; use `skills/`, `global-rules/`, `templates/`, and `examples/` only as needed.
Writing requires an explicit request such as “update knowledge base”, “update skill”, “save this rule”, “revise the KB”, or their Chinese equivalents. Archived material is not an active source.

## Priority Order

On first entering a task, load missing applicable rules in this order. Reuse rules already available in the current context; do not restart this sequence on every turn or tool call.

1. Workspace rules:
   - /Users/shilv/Agent-Workspace/AGENTS.md
2. Cross-project execution rules, for file changes, deliverables, or cross-project work:
   - /Users/shilv/Agent-Workspace/COMMON_RULES.md
3. Knowledge base rules, if shared rules, skills, templates, examples, or standards are relevant:
   - ~/.kb/AGENTS.md
4. Missing project-level rules before first accessing project files:
   - /Users/shilv/Agent-Workspace/Projects/<project-name>/AGENTS.md
   - /Users/shilv/Agent-Workspace/Projects/<project-name>/CLAUDE.md, if using Claude Code
5. Relevant skill files under:
   - ~/.kb/skills/<skill-name>/SKILL.md

If project-level rules conflict with workspace rules, project-level rules win only inside that project.

If knowledge base rules conflict with the user’s latest explicit instruction, follow the user’s latest explicit instruction.

### Efficient Markdown Reading

- Before reading, identify the current question, target directory, and missing information. Read to resolve that gap, not to collect all available context.
- Read applicable entry rules completely once. For referenced background, indexes, PRDs, examples, and logs, locate headings or keywords first and read the relevant sections with enough surrounding context. A link or directory listing is not an instruction to load every referenced file.
- Reuse content already loaded or supplied in the conversation. Track the canonical path and sections read within the task; aliases such as `~/.kb/` and `Agent-KB/` must not trigger duplicate reads. Do not create a persistent reading ledger.
- Re-read only when content may have changed, the necessary section was not read, context compaction removed required details, or current validation needs fresh evidence. Check the changed sections or missing facts first; do not replay the entire reading chain.
- Start searches in the known module or document directory. Return matching paths or bounded excerpts before full contents; broaden only when the current scope does not answer the question. Filter large logs and generated data before returning them to the model.
- Load each Skill only when its task or stage applies. Do not preload downstream Skills, examples, templates, or installed mirrors. Codex does not read `CLAUDE.md` unless the task concerns that file or cross-platform consistency; Claude reads its platform-specific entry in addition to the authoritative rules without reloading shared references.
- Stop expanding sources when the target, applicable constraints, required facts, and acceptance criteria are established. Preserve mandatory project rules, safety requirements, and relevant dependencies; efficiency is not permission to skip them.
- Give subagents only their objective, file boundaries, required evidence, and acceptance criteria. Return concise findings with paths and relevant locations, not copies of all source documents.

## Project Selection Rule

- Before editing project files, reuse the exact project path under `/Users/shilv/Agent-Workspace/Projects/` already specified by the user or confirmed in the current context. Ask only when it is missing or ambiguous.
- Read the project entry rules in `Priority Order`, work inside the confirmed project, and keep project-specific rules there.
- Use the active source. If the path, active file, or project scope is unclear, ask before modifying; do not guess or edit across directories.
- Do not modify multiple projects or move files between projects unless the user explicitly asks.

## Default Ignore

Unless the user explicitly points to them, do not read, reference, or modify:

- `Desktop/`, `Documents/`, `Downloads/`, `plugins/`, `~/.codex/`;
- `.git/`, `node_modules/`, `dist/`, `build/`, `.next/`, `.vite/`, `coverage/`;
- directories named `old`, `archive`, `backup`, `legacy`, `broken`, or `checkpoint`;
- date-named directories, for example `2026-04-20/`.

Archive and historical folders are not active sources. Use them only when explicitly asked to inspect, compare, restore, or migrate old versions.

## Before Every Modification

Before making file changes, state:

1. Task type: what kind of change this is
2. Target project: exact project path
3. Allowed files: exact file paths that will be modified
4. Forbidden files: files explicitly excluded from this change
5. Planned changes
6. Validation plan: how the change will be verified

## Execution and Reporting

Follow [COMMON_RULES.md](COMMON_RULES.md) for active sources, in-place edits, duplicate versions, minimal scope, conflict handling, assumptions, `Validation Integrity`, and `Completion Report`.
Report only checks actually performed; for unavailable checks, state the limitation and how the user can verify manually.
For implementation or file edits, use the fields in `Before Every Modification`, followed by commands or edits, and finish with the completion report. For analysis or explanation, answer directly without over-formatting.
Do not delete files or modify knowledge base / `~/.codex/` files without explicit authorization.
When creating a file, explain why it is needed, its exact path, and whether it is active, temporary, or archive.

## User Communication Rules

The user is a product manager and a code beginner. Before commands, code, or edit instructions, state the exact target path; explain the action simply and keep steps sequential. Avoid excessive alternatives. Obtain confirmation before risky deletion, overwrite, or migration.

## Laka Project Routing

`Projects/laka/AGENTS.md` owns Laka product, UI, requirement, source-of-truth, and delivery rules; use the project-loading rule above and do not duplicate Laka facts in this entry.

## Skill Usage Rules

When a task matches a reusable Skill, read `~/.kb/skills/<skill-name>/SKILL.md` before acting and apply only relevant parts.
Report incomplete guidance before proceeding; do not modify a Skill unless explicitly asked. When asked to improve one, update and validate it.

For non-trivial coding, code review, bug-fix, or refactoring tasks, read `~/.kb/skills/karpathy-guidelines/SKILL.md` before planning or editing. Trivial read-only questions and obvious one-line edits may skip it.

## Specialist Rules: Load Only When Triggered

Read the applicable sections before acting on the trigger below. These routed rules are mandatory within their scope; do not preload unrelated sections or downstream Skills.

| Trigger | Required source |
|---|---|
| New product requirement, feature idea, optimization direction, or business problem | [product-rules.md](product-rules.md): 新需求端到端产品协作规则; respect discussion-only requests and confirm direction before formal delivery |
| Product documentation or metric / tracking definitions | [product-rules.md](product-rules.md): Product Documentation Rules |
| Delivering a product HTML prototype from a confirmed Feature Contract | [product-rules.md](product-rules.md): Product Prototype Skill Routing; `pm-delivery-workflow` is the only orchestrator, load each Skill at its stage |
| HTML / UI prototype creation, modification, review, or delivery | [COMMON_UI_RULES.md](COMMON_UI_RULES.md): applicable UI and delivery rules |
| Installing, updating, renaming, moving, or removing a KB Skill | [rule-maintenance.md](rule-maintenance.md): Skill Change Synchronization; review both platform entries before completion |
| User adjusts, corrects, or supplements the same output at least once | Before task completion, read [rule-maintenance.md](rule-maintenance.md): 指令提炼与归类规则 and evaluate whether to retain the feedback |
| Creating or revising permanent instructions | [rule-maintenance.md](rule-maintenance.md): classification, storage, and explicit confirmation gates |

## Sandbox Rules

`Sandbox/` is for explicitly requested experiments. Its files are not formal project sources unless the user explicitly promotes them into `Projects/`. Archive access follows `Default Ignore`.
