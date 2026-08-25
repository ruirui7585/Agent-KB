---
name: prototype-agent-annotation
description: Agent-led product annotation for high-fidelity HTML prototypes. Use when Codex must read a feature requirement and an existing HTML prototype, automatically generate product annotations, bind them to the right UI elements, add stable anchors when needed, render page markers and a Chinese annotation panel, save annotations to project files, or support human correction through add/edit/delete/rebind. Especially relevant for mobile/front-end product prototypes where the PM wants Agent-generated annotations with lightweight manual correction.
---

# Prototype Agent Annotation

Use this skill to turn a feature requirement into maintainable product annotations on an existing high-fidelity HTML prototype. The primary flow is Agent-led: Codex generates, positions, and saves annotations; the PM reviews and corrects only when needed.

## Core Contract

- Treat annotations as product logic tied to UI elements, not as visual decoration.
- Do not ask the PM to manually create every annotation.
- Preserve the original prototype UI, layout, and interactions.
- Save annotation data to project files so future agents can read and maintain it.
- Human editing is a correction path: add a missed note, edit text, delete a wrong note, or rebind a wrong target.

## Required Reading

Load references only when needed:

- Read `references/agent-annotation-workflow.md` before implementing or updating annotation behavior.
- Read `references/annotation-data-model.md` before creating or changing `annotations.json`.
- Read `references/verification.md` before final validation.

Use `schemas/annotations.schema.json` as the data contract when possible.

Use `scripts/validate-anchors.mjs` to check obvious broken anchors and duplicate `data-annotation-id` values.

Use bundled runtime assets when the target prototype does not already have an annotation UI:

- `assets/annotation-runtime/annotation-runtime.js`
- `assets/annotation-runtime/annotation-runtime.css`

Use helper scripts when appropriate:

- `scripts/inject-runtime.mjs` copies the runtime beside a prototype HTML file and injects CSS/JS tags once.
- `scripts/annotation-server.mjs` serves a local preview root and writes browser edits back to `annotations.json`.

## Workflow

1. Confirm the target project path and active HTML prototype path.
2. Read the project rules first (`AGENTS.md` or equivalent) and obey project boundaries.
3. Read the feature requirement, PRD, or user-provided requirement text.
4. Inspect the active HTML, CSS, and JavaScript enough to understand pages, states, modals, and interactive controls.
5. Create a short annotation plan before editing:
   - affected page or screen
   - feature-level annotations to generate
   - intended target element for each annotation
   - files to modify
   - validation plan
6. Add or reuse stable anchors.
7. Generate or update annotation data.
8. Integrate page markers and an annotation panel if the prototype does not already have them.
9. Add a Chinese correction UI with add, edit, delete, and rebind affordances.
10. Validate anchors, UI behavior, persistence, and non-annotation interactions.

## Runtime Integration

For prototypes that need the bundled runtime, prefer this sequence:

```bash
node /Users/shilv/Agent-Workspace/Agent-KB/skills/prototype-agent-annotation/scripts/inject-runtime.mjs --html <path-to-prototype.html> --annotations annotations.json
node /Users/shilv/Agent-Workspace/Agent-KB/skills/prototype-agent-annotation/scripts/annotation-server.mjs --root <prototype-root> --port 4175 --annotations annotations.json
```

Then open:

```text
http://127.0.0.1:4175/
```

The runtime provides numbered markers, a Chinese right-side annotation panel, add, edit, delete, and rebind. The local server provides the save endpoint used by the browser runtime.

If the project already has a dev server, adapt the same runtime files into that project structure and provide an equivalent save endpoint instead of adding a parallel server.

## Annotation Granularity

Create one annotation per user-visible feature, interaction rule, or state change.

Good:

- "Video call permission" bound to the video-call entry.
- "Wish gift banner" bound to the full wish gift banner.
- "Purchase package selection" bound to the package area or primary purchase button.

Bad:

- One annotation for every user level when one rule covers all levels.
- One annotation for every nested icon, text node, and container.
- Notes bound to the whole page when a specific business element exists.

## Target Binding Rules

Choose the most specific business element that represents the feature:

1. existing `data-annotation-id`
2. existing stable `id` or `data-testid`
3. newly added unique `data-annotation-id`
4. semantic, unique CSS selector
5. DOM structure fallback only when no stable option exists

Never use screen coordinates as the primary target.

When adding a new anchor:

- use lowercase kebab-case
- make it business-readable
- keep it unique in the active prototype
- do not change visual appearance or business behavior

Examples:

```html
data-annotation-id="chat-video-call"
data-annotation-id="wish-gift-banner"
data-annotation-id="guardian-purchase-button"
```

## Minimum Saved Data

Prefer a project-level `annotations.json` for the first version unless the project already has an annotation storage convention.

Each annotation must include:

- stable `id`
- page or screen
- title
- description
- rules array
- target annotation id or selector
- optional context for role, page state, modal, tab, or device
- timestamps

Do not invent business facts that are not in the requirement or confirmable from current project files.

## UI Integration Requirements

The prototype annotation layer should provide:

- visible numbered markers near target elements
- one annotation panel reading from the same annotation data
- click marker to focus the panel item
- click panel item to locate and highlight the target element
- edit annotation text
- add an annotation missed by Agent
- delete annotation
- rebind target when Agent picked the wrong element

Markers must not block core text, controls, or normal product interactions when annotation mode is off.

## Out Of Scope For MVP

Do not expand the first implementation into a general web annotation platform. Skip unless explicitly requested:

- PM-created annotations as the main workflow; keep manual add only as a supplementary correction path
- multi-user accounts or permissions
- comment threads and approval workflows
- realtime Agent listeners, webhooks, or SSE
- SQLite or hosted database storage
- multi-element box selection or freehand drawing
- text range annotations
- React/Vue source line mapping
- Jira, Feishu, or GitHub Issue sync
- plugin architecture
- automatic full PRD generation
- complex automatic anchor recovery

## Final Report

Report:

1. generated or updated annotations
2. files modified
3. protected files not modified
4. anchor validation result
5. prototype behavior validation result
6. remaining risks or unverified areas
