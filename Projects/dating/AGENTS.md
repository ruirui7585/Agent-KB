# Dating Project — Codex Entry

## Project Path

`./male-mvp-v1/prototype-v2/` — active prototype (male, MENA market)
`./female-mvp-v1/prototype/` — female-side prototype

## Active Knowledge Base

This project may reference shared knowledge from:

- `../../Agent-KB/skills/html-prototype-skill/`
- `../../Agent-KB/global-rules/`

These are **read-only** during project tasks. Do not modify them unless the user explicitly says "update knowledge base" or "update skill".

## Project-Specific Rules

This project has its own skill files in `./male-mvp-v1/docs/skills/`:

- `dating-html-prototype-skill.md`
- `mobile-ui-layout-skill.md`
- `html-h5-prototype-delivery-skill.md`
- `dating-design-system-skill.md`

And project rules in:

- `./male-mvp-v1/docs/codex-rules.md`
- `./agent/` — project-specific agent files

Read these before modifying prototype files.

## File Layout (male-mvp-v1)

```
male-mvp-v1/
├── prototype-v2/          # Active prototype
│   ├── index.html         # Entry shell only
│   ├── style.css          # All visual styles
│   ├── state.js           # Runtime state
│   ├── data.js            # Static data and config
│   ├── app.js             # Render and interaction
│   └── assets/            # Images, avatars, photos
├── docs/                  # Documentation and rules
├── legacy/                # Historical reference — do not modify
├── prototype-v2_broken_before_restore_20260603_1105/  # Crash backup — do not read
└── prototype-v2_backup_before_claude_merge/           # Merge backup — do not read
```

## Forbidden

Unless the user explicitly requests it, Codex must not:

- modify `../../Agent-KB/`
- modify `../laka/` or any other project
- modify `../../Sandbox/`
- modify `../../Archive/`
- modify `./legacy/`, `./*backup*/`, `./*broken*/`, `./*restore*/`
- merge prototype-v2 files back into a single HTML
- delete existing pages, tabs, modals, or annotation editor
- change global visual system without explicit request

## Before Modification

State:
1. Task type
2. Target files (relative to this project root)
3. Files excluded
4. Relevant rules or skills to read
5. Risk areas
6. Validation plan

## After Modification

1. Modified files
2. Protected files not modified
3. Verification result
4. Remaining risks
