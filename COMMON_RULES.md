# Cross-Project Common Rules

## Purpose and Scope

This file defines execution rules shared by every active project under:

`/Users/shilv/Agent-Workspace/Projects/`

Project-specific product facts, business rules, UI baselines, page inventories, ports, commands, and delivery paths must remain in the corresponding project directory.

If this file conflicts with the user's latest explicit instruction, follow the user's latest instruction. If a project-level rule conflicts with this file, the project-level rule wins only inside that project.

## Single Source of Truth

Before reading files for implementation or making changes, establish:

1. The confirmed active project root.
2. The task domain and relevant file type.
3. The active source or entry file.
4. The exact write target or explicitly approved set of write targets.

Each task domain must have one active source of truth. If multiple plausible active versions exist and the current version cannot be determined from project rules or runtime evidence, stop and ask the user to select the active version.

Do not guess which duplicate, copy, export, or historical version is active.

## No File Forks or Duplicate Versions

Do not create parallel project or file versions unless the user explicitly requests a separate version or export.

Avoid names such as:

- `copy`
- `backup`
- `new`
- `latest`
- `final`
- `final-final`
- `v2` when it only duplicates the active version

Prefer in-place edits to the confirmed active source. Do not switch the write target during a task without explaining why and obtaining confirmation when the change affects scope.

Exports, release artifacts, and user-requested snapshots are allowed when their purpose and status are explicit. They must not silently become the new active source.

## Information Priority and Conflict Handling

When information conflicts, use this default priority:

1. The user's latest explicit instruction for the current task.
2. The latest valid requirement or specification for the active task.
3. Current runtime evidence, active code, and user-confirmed UI references.
4. Active project context and confirmed project decisions.
5. Current workspace common rules.
6. Historical or archived material that the user explicitly authorized for reference.
7. AI inference.

When a conflict is discovered:

- Use the higher-priority source.
- Do not silently combine incompatible rules.
- Report material conflicts in the delivery summary.
- Do not promote a temporary task decision into a permanent project or workspace rule.
- Do not use historical material to overwrite an active version.

## Minimal and Scoped Modification

Make the smallest change that fully satisfies the request.

- Read the relevant active source before editing.
- Modify only the approved files and requested modules.
- Preserve existing file responsibilities, naming patterns, interactions, and layout unless the request requires a change.
- Do not rewrite an entire project to implement a local change.
- Do not refactor working code only for convenience.
- Do not delete existing files, pages, components, states, or interactions without explicit authorization.
- Do not modify unrelated UI, configuration, documentation, or project files.
- Prefer patch-based, reviewable changes over full-file regeneration.

Multi-file changes are allowed when the requested implementation genuinely crosses file responsibilities, but every write target must be declared before modification.

## Naming Rules

Unless a project has a stronger established convention:

- Use lowercase English for ordinary file and directory names.
- Separate words with hyphens.
- Avoid spaces and Chinese names in technical paths.
- Avoid ambiguous lifecycle words such as `new`, `latest`, and `final-final`.
- Preserve standard uppercase names where they are established entry points or specifications, such as `AGENTS.md`, `README.md`, `PRD.md`, and `SCREEN_SPEC.md`.
- Do not rename existing active paths solely to enforce this convention unless the user requests a migration.

## AI Assumptions

AI may use a reasonable low-risk default when it is necessary to continue, provided that the assumption:

- is based on available project context;
- uses the lowest-risk interpretation;
- is clearly identified in the result;
- is not presented as a confirmed fact;
- is not automatically written into permanent rules or shared context.

Do not silently assume high-impact details, including:

- pricing, charges, commissions, or payouts;
- user permissions, access rights, or role authority;
- compliance, privacy, or data-deletion behavior;
- state-machine transitions;
- historical-data handling or migration;
- backward compatibility;
- the active entry file or canonical version;
- core page structure;
- permanent cross-project or project-level rules.

If a high-impact detail cannot be established from active sources, ask the user before implementing it.

## Validation Integrity

Run validation in proportion to the type and risk of the change. Prefer this order when applicable:

1. Syntax or static check.
2. Build check.
3. Local preview or runtime check.
4. Console and blocking-error check.
5. Main user-flow check.
6. Regression check for affected existing behavior.

Validation must use the confirmed active source and preview, not a duplicate, backup, export, or historical version.

Never claim that a build, preview, browser check, test, or interaction was completed unless it was actually executed. If validation could not be run, state:

- what was not verified;
- why it was not verified;
- what evidence was checked instead;
- how the user can verify it manually when useful.

## Completion Report

After an implementation task, report at minimum:

1. What was completed.
2. Files created, modified, moved, or deleted.
3. Validation that was actually executed and its result.
4. Validation that was not executed and the reason.
5. Remaining risks, assumptions, conflicts, or unresolved items.

Do not finish with only a generic statement such as "completed."
