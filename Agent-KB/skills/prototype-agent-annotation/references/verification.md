# Verification

Use this checklist before reporting an annotation task as complete.

## Data Validation

- `annotations.json` exists or the project-specific annotation file was updated.
- JSON parses successfully.
- Every annotation has a unique `id`.
- Every `target.annotationId` is unique in the active HTML.
- No duplicate `data-annotation-id` values were introduced.
- Each selector is unique when using a `data-annotation-id` selector.
- Missing targets are marked or reported instead of ignored.

Run when possible:

```bash
node /Users/shilv/Agent-Workspace/Agent-KB/skills/prototype-agent-annotation/scripts/validate-anchors.mjs --html <path-to-html> --annotations <path-to-annotations-json>
```

## Binding Review

For each generated annotation, check:

- the target is the correct business element
- the target is not a debug or test control
- nested icon clicks bind to a useful parent control when appropriate
- modal and hidden-state annotations are checked in the matching state
- page-level annotations are only used for page-level rules

## UI Review

- Markers render near the intended elements.
- Markers do not block key product text or buttons.
- The annotation panel reads the same data as the markers.
- Clicking a marker focuses the panel item.
- Clicking a panel item locates and highlights the target.
- The annotation panel, buttons, forms, prompts, and save feedback use Chinese.
- Manual add enters element selection mode and opens the new annotation for editing.
- Add, edit, delete, and rebind do not desynchronize markers and panel.

## Prototype Safety

With annotation mode off:

- original buttons still work
- modals, sheets, drawers, tabs, and state controls still work
- page dimensions and visual style are unchanged except for intentional annotation affordances
- no critical console errors appear
- no unrelated product UI was redesigned

## Persistence

- Edited annotations survive refresh or project restart.
- Manually added annotations survive refresh or project restart.
- Deleted annotations do not reappear from stale local state.
- Rebound annotations write the new target back to project files.
- `localStorage` is not the only source of truth.

If any check cannot be run, report exactly what was not verified and why.
