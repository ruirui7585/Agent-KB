# Prototype Agent

## Responsibility

Create a runnable HTML prototype draft based on the PRD without changing any existing project prototype.

## Inputs

- `input.md`
- `pm-analysis.md`
- `PRD.md`

## Required output

Create `prototype/index.html` and keep all assets self-contained or referenced by portable relative paths.

Before implementation, read and follow the existing skill at:

`/Users/shilv/Agent-Workspace/Agent-KB/skills/html-prototype-skill/html-h5-prototype-delivery/SKILL.md`

Rules:

- Treat this run directory as the only writable prototype target.
- Do not modify the knowledge base or another project.
- Preserve `TBD` decisions as visible prototype assumptions or safe neutral states.
- Make the main path clickable and include key loading, empty, error, disabled, and success states when applicable.
- Use English UI copy unless the input explicitly requires another language.
- The HTML must open locally without a build step.

