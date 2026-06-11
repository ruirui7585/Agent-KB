# Agent Knowledge Base

## Directory Purpose

| Directory | Purpose | Active |
|-----------|---------|--------|
| `./skills/` | Officially enabled general-purpose skills | Yes |
| `./global-rules/` | Rules that apply across all projects | Yes |
| `./templates/` | File and project templates | Yes |
| `./examples/` | Reference examples and configurations | Yes |
| `./archive/` | Deprecated or superseded KB entries | **No** |

## Location
Knowledge base is located at: `~/.kb/`

## Rules

### For Agents
- You may **read** `./skills/`, `./global-rules/`, `./templates/`, and `./examples/` for context.
- You must **not write** to the KB unless the user explicitly says:
  - "update knowledge base"
  - "update skill"
  - "add to knowledge base"
  - "create a new skill"
  - or equivalent explicit instruction.
- `./archive/` is **never an active rule source**. Do not read from it by default.

### For Humans
- Place new skills under `./skills/<skill-name>/`.
- Place cross-project rules under `./global-rules/`.
- Place templates under `./templates/`.
- Place reference material under `./examples/`.
- Move obsolete entries to `./archive/`.
