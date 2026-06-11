# Dating Project — Claude Code Entry

## Project Path

`./male-mvp-v1/prototype-v2/` — active prototype (male, MENA market)
`./female-mvp-v1/prototype/` — female-side prototype

## Active Knowledge Base

This project may reference shared knowledge from:

- `../../Agent-KB/skills/html-prototype-skill/`
- `../../Agent-KB/global-rules/`

These are **read-only** during project tasks.

## Project-Specific Context

Read these before modifying prototype files:

- `./male-mvp-v1/docs/codex-rules.md`
- `./male-mvp-v1/docs/skills/dating-html-prototype-skill.md`
- `./male-mvp-v1/docs/skills/mobile-ui-layout-skill.md`
- `./male-mvp-v1/docs/skills/html-h5-prototype-delivery-skill.md`
- `./male-mvp-v1/docs/skills/dating-design-system-skill.md`
- `./agent/` — project-specific agent files

## File Layout (male-mvp-v1)

```
male-mvp-v1/
├── prototype-v2/          # Active prototype (5-file split)
│   ├── index.html         # Entry shell
│   ├── style.css          # Styles
│   ├── state.js           # Runtime state
│   ├── data.js            # Static data
│   └── app.js             # Render + interaction
├── docs/                  # Rules, skills, state dictionary
├── legacy/                # Do not modify
├── prototype-v2_broken_before_restore_20260603_1105/  # Do not read
└── prototype-v2_backup_before_claude_merge/           # Do not read
```

## Forbidden

Unless the user explicitly requests it, Claude must not:

- modify `../../Agent-KB/`
- modify any other project under `../../Projects/`
- modify `../../Sandbox/` or `../../Archive/`
- modify `./legacy/`, `./*backup*/`, `./*broken*/`
- merge prototype-v2 files back into a single HTML
- delete existing pages, tabs, modals, or annotation editor
- change global visual system without explicit request

## Before Modifying

Output a brief plan:
1. **Task type**
2. **Will change**: exact files and nature of change
3. **Will not change**: nearby protected files
4. **Relevant rules or skills to read**
5. **Risk area**: what could break
6. **Validation plan**: how to confirm it works

## After Modifying

1. Files changed
2. One-sentence summary
3. Protected files not changed
4. Verification result
5. Remaining risks
