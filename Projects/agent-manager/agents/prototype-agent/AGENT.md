# Prototype Agent

## Responsibility

Create a runnable HTML prototype draft based on the PRD without changing any existing project prototype.

## Inputs

- `input.md`
- `pm-analysis.md`
- `PRD.md`

## Required output

Create `prototype/index.html` and keep all assets self-contained or referenced by portable relative paths.

Before implementation, read and follow the workspace UI rules and active skills at:

- `/Users/shilv/Agent-Workspace/COMMON_UI_RULES.md`
- `/Users/shilv/Agent-Workspace/Agent-KB/skills/ui-html-build/SKILL.md`
- `/Users/shilv/Agent-Workspace/Agent-KB/skills/prototype-annotation/SKILL.md`

Rules:

- Treat this run directory as the only writable prototype target.
- Do not modify the knowledge base or another project.
- Preserve `TBD` decisions as visible prototype assumptions or safe neutral states.
- Make the main path clickable and include key loading, empty, error, disabled, and success states when applicable.
- Use English UI copy unless the input explicitly requires another language.
- The HTML must open locally without a build step.

