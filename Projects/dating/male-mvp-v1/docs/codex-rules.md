# Codex Rules

## Scope

These rules apply to the Dating prototype project. Changes must be surgical, requested, and limited to the files directly involved in the task.

## File Responsibilities

- `prototype-v2/index.html`: entry structure only. Keep it focused on the HTML shell, root containers, script links, and stylesheet links.
- `prototype-v2/style.css`: styles only. Put visual styling, layout, responsive rules, animation styles, and theme tokens here.
- `prototype-v2/state.js`: state only. Put runtime state, state defaults, state persistence helpers, and state update utilities here.
- `prototype-v2/data.js`: static data only. Put mock users, labels, option lists, constants, and other non-runtime content here.
- `prototype-v2/app.js`: rendering and interaction only. Put DOM rendering, event binding, user interactions, modal behavior, tab behavior, and UI update flow here.
- `legacy/original.html`: historical reference only. Do not modify this file unless the user explicitly asks for changes to it.
- `docs/`: project documentation only. Do not put app runtime code here.

## Required Constraints

- Do not rewrite the whole project.
- Do not merge the split files back into a single HTML file.
- Do not delete existing pages, buttons, modals, dialogs, or the annotation editor.
- Do not modify the bottom Tab navigation unless the user explicitly asks.
- Do not modify the global primary color palette unless the user explicitly asks.
- Do not modify unrelated files.
- Do not refactor working code unless the requested change requires it.
- Do not change file responsibilities to make a quick fix easier.

## Editing Workflow

- Read the relevant files before editing.
- State assumptions when the request could be interpreted more than one way.
- Prefer the smallest change that satisfies the request.
- Keep existing naming, layout structure, and interaction patterns unless the user requests a change.
- Verify the final structure or behavior after editing.
