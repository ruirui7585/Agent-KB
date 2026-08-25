# Agent Annotation Workflow

Use this reference when implementing or updating annotation behavior in an HTML prototype.

## 1. Classify The Requirement

Turn the feature requirement into user-visible annotation units.

One annotation should normally cover one of:

- a feature entry point
- an interaction rule
- a permission or availability rule
- a visible state change
- a modal, drawer, bottom sheet, or toast behavior
- a purchase, entitlement, or backend-configured rule that is visible in the UI

Do not annotate every DOM node. Do not split one product rule into many notes just because it mentions multiple states.

## 2. Locate Candidate Elements

Inspect the active prototype, including:

- visible text
- icon meaning
- button labels
- nearby labels and containers
- existing ids, classes, and data attributes
- runtime state controls
- modals, sheets, drawers, and hidden panels
- click handlers and state-changing JavaScript

Prefer binding to the smallest business container that fully represents the rule. If the user-visible control is an icon inside a button, bind to the button. If the rule describes a full banner, bind to the banner, not to one image inside it.

Avoid binding to:

- the full page unless the rule is page-level
- hidden test controls
- debug panels
- visually similar elements from other states
- layout-only wrappers
- repeated elements when no unique context is available

## 3. Add Stable Anchors

If the correct element lacks a stable anchor, add `data-annotation-id`.

Rules:

- use lowercase kebab-case
- include page or module context when helpful
- keep names stable across visual redesigns
- do not use vague names such as `button-1`, `new-card`, or `final-entry`
- do not add duplicate ids
- do not change classes or styles only for annotation convenience

Example:

```html
<button class="toolbar-action" data-annotation-id="chat-video-call">
```

## 4. Generate Annotation Data

Use the requirement as the source of truth. Include only rules that are explicit in the requirement or confirmed by project files.

If the requirement is ambiguous, use a concise open question inside the annotation only when it is useful to future work. Do not fabricate:

- time limits
- price values
- user levels
- VIP privileges
- backend behavior
- review rules
- analytics definitions

## 5. Integrate The Annotation Layer

If the prototype lacks an annotation layer, add the smallest practical runtime:

- load `annotations.json`
- render numbered markers near targets
- render a side panel
- keep markers and panel in one data store
- use Chinese labels and feedback in the annotation panel
- allow manual add for notes missed by Agent
- allow edit, delete, and rebind
- persist changes through the project's available save path

The bundled runtime is available at:

```text
assets/annotation-runtime/annotation-runtime.js
assets/annotation-runtime/annotation-runtime.css
```

For simple static prototypes, use:

```bash
node /Users/shilv/Agent-Workspace/Agent-KB/skills/prototype-agent-annotation/scripts/inject-runtime.mjs --html <path-to-prototype.html> --annotations annotations.json
node /Users/shilv/Agent-Workspace/Agent-KB/skills/prototype-agent-annotation/scripts/annotation-server.mjs --root <prototype-root> --port 4175 --annotations annotations.json
```

For single-file prototypes, inline the annotation runtime only if that is the project's established pattern. For multi-file prototypes, keep annotation CSS and JavaScript in active source files that match the project structure.

## 6. Manual Correction Flow

Keep Agent generation as the primary workflow. Provide manual add only for a missed annotation:

1. click `新增注释`
2. enter element selection mode
3. click the intended business element
4. create a draft annotation and open its edit form
5. save it through the same file-backed store

For rebind correction:

Rebind is a correction tool, not the main creation flow.

When rebind starts:

1. enter selection mode
2. highlight hovered candidate elements
3. allow choosing the hovered element or a reasonable parent
4. add or reuse a stable anchor
5. update the annotation target
6. keep the annotation content unchanged
7. re-run anchor validation

## 7. Persistence

Use project files as the source of truth.

Recommended first-version files:

```text
annotations.json
annotation.config.json
```

`localStorage` may be used as temporary draft cache, but not as the only storage.

If the browser cannot write files directly, use a local server or project-specific save endpoint. If neither exists, clearly report that persistence was not fully implemented.
