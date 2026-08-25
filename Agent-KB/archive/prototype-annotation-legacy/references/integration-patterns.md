# Integration Patterns

## Selection Rule

Choose the least invasive approach that fits the existing project. Preserve the project's framework, architecture, styling, and interaction model.

## Default Deliverables

| Available input | Default `annotate` deliverable |
| --- | --- |
| Editable source project | Modify the existing project, add an isolated annotation module, and verify it. |
| Editable standalone HTML | Produce an annotated self-contained HTML file and preserve the original when appropriate. |
| Running prototype plus source | Modify source and verify against the running prototype. |
| Running URL without source | Produce annotation data/specification plus an injectable runtime when technically feasible. |
| Prototype cannot be modified or injected | Produce a `plan-only` annotation map and clearly state the blocker. |

`plan-only` and `content-only` never modify the supplied prototype.

## Standalone HTML

For a single HTML file or static HTML/CSS/JavaScript project:

- Add stable `data-prototype-anchor` attributes where safe.
- Keep annotation data separate from product markup when practical.
- Add an isolated hotspot overlay and explanation panel.
- Scope annotation CSS to a unique prefix.
- Keep the output self-contained when the original prototype is self-contained.

## Vue

Prefer a small isolated module under the project's existing source structure:

```text
prototype-annotations/
├── annotation-data.ts
├── PrototypeAnnotationLayer.vue
├── PrototypeAnnotationPanel.vue
└── usePrototypeAnnotations.ts
```

Mount one top-level annotation layer. Do not wrap or replace product components solely to add hotspots.

## React

Prefer a small isolated module:

```text
prototype-annotations/
├── annotation-data.ts
├── PrototypeAnnotationLayer.tsx
├── PrototypeAnnotationPanel.tsx
└── usePrototypeAnnotations.ts
```

Mount one top-level annotation layer and use stable anchors or selectors.

## Other Frontend Stacks

Follow the same architecture:

- Framework-native state only when it reduces integration risk.
- One isolated top-level annotation layer.
- Annotation data separated from product behavior.
- Stable anchors or existing selectors.
- No dependency on a specific product component library.

## External Injection

Use external injection when the prototype can run but should not be structurally modified:

- Load an isolated annotation runtime after the application.
- Bind to existing stable selectors.
- Keep all state and styling inside the injected layer.

External injection is unsuitable when selectors are unstable or application security prevents injection. In those cases, produce an annotation plan or add explicit anchors to source code.

## Hard-To-Annotate Targets

Treat the following as constrained environments:

- Cross-origin iframes
- Closed or inaccessible Shadow DOM
- Canvas-only interfaces
- Cross-origin pages without editable source
- Virtualized or generated DOM without stable selectors

Do not generate fragile positional selectors to claim support. Prefer one of:

1. Add a stable anchor in editable source.
2. Bind to a stable outer container and annotate the broader module.
3. Produce an annotation plan with the limitation documented.
4. Ask the user for an editable source or supported integration point when required for the requested deliverable.

## Overlay Positioning

Prefer a top-level overlay that measures targets with `getBoundingClientRect()` and updates on:

- Scroll
- Resize
- Route or page changes
- Modal and drawer open/close
- Expand/collapse and other layout changes

This avoids clipping by tables and containers with `overflow: hidden`.

## Collision Rule

If an annotation hotspot would obstruct a product control, move the hotspot around the target boundary or annotate the containing business module instead. Never disable or relocate the product control for annotation convenience.
