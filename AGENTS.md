# Agent Workspace Rules

## Workspace Root

Workspace root:

/Users/shilv/Agent-Workspace

This workspace is the default working area for agents.

Do not treat ~/.codex/, Desktop/, Documents/, Downloads/, or random local folders as the active project workspace unless the user explicitly says so.

## Directory Purpose

| Directory | Purpose | Default Access |
|---|---|---|
| ./Agent-KB/ | Shared knowledge base, skills, templates, examples, global rules | Read-only |
| ./Projects/ | Formal active projects | Read/write inside confirmed project only |
| ./Sandbox/ | Temporary experiments, demos, quick tests | Read/write when explicitly used |
| ./Archive/ | Old or inactive workspace files | Do not read by default |
| ./AGENTS.md | Workspace rules for Codex and other agents | Read |
| ./CLAUDE.md | Workspace rules for Claude Code | Read |
| ./README.md | Human-readable workspace overview | Read |

## Active Knowledge Base

The active knowledge base is:

~/.kb/

~/.kb/ points to:

/Users/shilv/Agent-Workspace/Agent-KB

Use the knowledge base for shared context:

- ~/.kb/AGENTS.md — knowledge base usage rules
- ~/.kb/skills/ — reusable agent skills
- ~/.kb/global-rules/ — global product/design/development rules
- ~/.kb/templates/ — reusable project and document templates
- ~/.kb/examples/ — reference examples
- ~/.kb/archive/ — deprecated or backup KB files

The knowledge base is read-only by default.

Do not write to ~/.kb/ unless the user explicitly says:

- update knowledge base
- update skill
- save this rule
- revise the KB
- 写入知识库
- 更新知识库
- 更新 skill
- 保存规则

## Priority Order

When starting a task, read rules in this order:

1. Workspace rules:
   - /Users/shilv/Agent-Workspace/AGENTS.md
2. Knowledge base rules, if shared rules, skills, templates, examples, or standards are relevant:
   - ~/.kb/AGENTS.md
3. Project-level rules before touching project files:
   - /Users/shilv/Agent-Workspace/Projects/<project-name>/AGENTS.md
   - /Users/shilv/Agent-Workspace/Projects/<project-name>/CLAUDE.md, if using Claude Code
4. Relevant skill files under:
   - ~/.kb/skills/<skill-name>/SKILL.md

If project-level rules conflict with workspace rules, project-level rules win only inside that project.

If knowledge base rules conflict with the user’s latest explicit instruction, follow the user’s latest explicit instruction.

## Project Selection Rule

Before modifying any project file, identify the target project path.

A valid project path should be under:

/Users/shilv/Agent-Workspace/Projects/

Example:

/Users/shilv/Agent-Workspace/Projects/dating/

If the user does not specify the project, ask for confirmation before editing files.

Do not modify multiple projects in one task unless the user explicitly asks.

## Default Ignore

Do not read, reference, or modify files under these paths unless the user explicitly points to them:

- Desktop/
- Documents/
- Downloads/
- plugins/
- ~/.codex/
- .git/
- node_modules/
- dist/
- build/
- .next/
- .vite/
- coverage/
- Any directory named old
- Any directory named archive
- Any directory named backup
- Any directory named legacy
- Any directory named broken
- Any directory named checkpoint
- Any date-named directory, for example 2026-04-20/

Archive folders are not active sources.

Only use archive, backup, legacy, broken, or checkpoint folders when the user explicitly asks to inspect, compare, restore, or migrate old versions.

## Before Every Modification

Before making file changes, state:

1. Task type: what kind of change this is
2. Target project: exact project path
3. Allowed files: exact file paths that will be modified
4. Forbidden files: files explicitly excluded from this change
5. Validation plan: how the change will be verified

Do not make changes if the target project path is unclear.

Do not make changes if there are multiple possible active files and the active file cannot be determined.

## File Modification Rules

When modifying files:

1. Prefer editing existing active source files.
2. Do not create duplicate project copies unless the user explicitly asks.
3. Do not overwrite files without knowing whether they are active.
4. Do not move files between projects unless the user explicitly asks.
5. Do not delete files unless the user explicitly asks.
6. Do not modify knowledge base files unless explicitly authorized.
7. Do not modify .codex system files unless explicitly authorized.

When creating a new file, explain:

- why the file is needed
- where it will be created
- whether it is active, temporary, or archive

## User Communication Rules

The user is a product manager and a code beginner.

When giving terminal commands, code snippets, or file edit instructions:

1. First state the exact path.
2. Then provide the command or code.
3. Explain briefly what the command does.
4. Keep steps sequential.
5. Avoid giving too many alternatives at once.
6. Stop and ask for confirmation before any risky delete, overwrite, or migration command.

Bad:

bash npm run dev 

Good:

Path:

/Users/shilv/Agent-Workspace/Projects/<project-name>/

Command:

bash cd /Users/shilv/Agent-Workspace/Projects/<project-name>/ npm run dev 

## Project Work Rules

For project work:

1. Confirm the project path.
2. Read project-level AGENTS.md or CLAUDE.md if it exists.
3. Work only inside the confirmed project directory.
4. Use the active source directory, not backup or legacy directories.
5. If multiple similar files exist, identify the active file before editing.
6. If the current active version is unclear, ask the user before changing files.
7. Keep project-specific rules inside the project folder.

Project-level files may include:

- AGENTS.md
- CLAUDE.md
- README.md
- docs/
- prototype/
- src/
- tests/

## Skill Usage Rules

When a task matches a reusable skill, read the corresponding skill before acting.

Skill location:

~/.kb/skills/

Common skill categories may include:

- HTML / UI prototype skill
- mobile app UI prototype skill
- product requirement skill
- test case skill
- self-check skill

When using a skill:

1. Read the skill file first.
2. Apply only the relevant parts.
3. Do not modify the skill unless the user explicitly asks to update it.
4. If the skill is incomplete, report the gap before proceeding.
5. If the user asks to improve a skill, update the skill and validate it.

## HTML / UI Prototype Rules

When working on HTML or UI prototypes:

1. Identify the active prototype path first.
2. Do not use files from legacy, backup, broken, or archive folders unless explicitly asked.
3. Preserve existing interactions unless the user asks to remove them.
4. Avoid creating a new HTML file when the user expects the existing file to be updated.
5. If updating an existing local preview, confirm the exact file path.
6. For mobile prototypes, default to high-fidelity mobile UI.
7. Use English UI copy by default unless the user asks for Chinese.
8. For social, dating, or MENA-facing products, use realistic MENA-style female avatars when avatar assets are needed.
9. Verify that the page opens without blank screen.
10. Verify that main click paths still work.
11. Verify that the browser console has no critical errors.

## Product Documentation Rules

When producing product documents, prefer clear PM deliverables:

- PRD
- user flow
- state matrix
- edge cases
- backend configuration fields
- test cases
- analytics events
- toast copy
- acceptance criteria

For metrics and tracking, define:

- event name
- trigger timing
- properties
- user scope
- denominator
- numerator
- deduplication rule
- time window
- relation to msg_id, reply_to_msg_id, or session id when relevant

## Testing Rules

When modifying code or prototype files, run the most relevant validation available.

Preferred validation order:

1. Syntax check
2. Build check
3. Local preview check
4. Console error check
5. Main user-flow check
6. Regression check for previously fixed issues

If validation cannot be run, clearly state:

- what was not verified
- why it could not be verified
- how the user can verify it manually

## Sandbox Rules

Use ./Sandbox/ for experiments only.

Files in ./Sandbox/ are not active project files unless the user explicitly promotes them into ./Projects/.

Do not use Sandbox files as source of truth for formal project work.

## Archive Rules

Use ./Archive/ and ~/.kb/archive/ only for deprecated, backup, or superseded files.

Agents must not read archive folders by default.

Archive files are not active rules, active source files, or active project files.

Only inspect archive files when the user explicitly asks to:

- compare old versions
- restore a previous version
- migrate useful content
- inspect backup files

## Output Format for Implementation Tasks

For implementation or file-editing tasks, structure the response as:

1. Target path
2. Task type
3. Allowed files
4. Forbidden files
5. Planned changes
6. Validation plan
7. Commands or edits

For analysis or explanation tasks, answer directly and do not over-format.

## Final Rule

When uncertain about a path, active file, or project scope, ask before modifying.

Never guess and modify files across directories.
