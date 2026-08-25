# Verification

## Base Prototype First

Disable annotation mode and verify the original prototype before reviewing annotations:

- Existing navigation and page state still work.
- Product controls remain clickable.
- Forms, filters, tables, dialogs, drawers, and transient states behave as before.
- Layout, scroll behavior, and responsive sizing have not changed.

If the base prototype regresses, fix that before continuing.

## Annotation Mode

Enable annotation mode and verify:

- Hotspots appear only for visible targets on the current page or state.
- Clicking a hotspot opens the correct note.
- Clicking a note scrolls to and highlights the correct target.
- Expand/collapse and panel close work.
- Dragging the panel header moves the explanation panel and keeps it inside the current viewport or prototype canvas.
- Structured details expand inline directly under the selected note item; switching notes moves the detail section to the newly selected note.
- Unselected notes show no detail sections.
- Expanded detail does not render a detached detail area below the full note list.
- Expanded detail does not repeat the selected note title, component type, or summary already shown in the note item.
- Expanded detail cards align to the selected note's sequence-number circle column, not the title text column.
- Closing the panel does not change product state.
- Route, modal, drawer, resize, and scroll changes refresh hotspot positions.
- Hotspots and the panel do not block important product controls.
- Missing targets fail gracefully without breaking the prototype.

## Content Review

- Every note has a meaningful business target.
- Every summary and item matches its stated evidence source.
- Inference is labeled at the claim level.
- Planned but unimplemented claims are explicitly labeled and were included only after user confirmation.
- PRD behavior missing from the prototype and direct conflicts have explicit user decisions or remain excluded from finalized annotations.
- Empty sections are omitted.
- No visual-design instructions appear in product annotation copy.
- Every target classifies the component type before listing fields or actions.
- Field and control notes use structured rows for field name, component type, default value, required status, constraints, value definition, business data source, and write target when applicable.
- Action notes use structured rows for trigger condition, click result, navigation or open target, data mutation, and blocking condition when applicable.
- Disabled, hidden, or visible states are mentioned only when caused by product logic, permissions, status, or data conditions.
- Every `数据来源` value describes how the business value is produced or obtained; it never contains a PRD module name, document location, or annotation evidence label.
- No separate `选项来源` field is rendered.
- Unknown or conflicting business data sources display `无`, do not block initial annotation generation, and are collected into one grouped user-confirmation list.
- `取值定义` appears for finite fixed-value fields regardless of whether they are rendered as selectors, table cells, detail values, tags, switches, or other components.
- `取值定义` does not appear for free text, identifiers, dates, ordinary numbers, people, or other unbounded dynamic data.
- PRD-defined value definitions are used as written; no enum-code column is rendered.
- Applicable fields without a PRD-defined value set display `取值定义：无`, do not use implemented or observed values as confirmed definitions, and are collected into one grouped user-confirmation list after the prototype and initial annotations are generated.
- Observed candidate values appear only as context in unresolved questions.
- `状态流转规则` appears only when actual business transition rules are defined and is omitted entirely otherwise.
- Annotation evidence remains recorded separately as `prd`, `confirmed`, `observed`, or `inferred`.

## Mode Completion

- `plan-only`: annotation map, discrepancies, questions, and integration recommendation are complete; no code changed.
- `content-only`: annotation copy/data and item-level evidence are complete; no runtime, anchor, or product code changed.
- `annotate`: working annotation integration and dual-mode verification are complete.
- `review-fix`: findings are reported first, requested or actionable annotation defects are fixed, and both modes are re-verified.

## Technical Verification

For code-changing modes, run the project's available build, typecheck, lint, and tests. Add focused tests for annotation data mapping or interaction state when the project supports them.

For a browser-accessible prototype changed in `annotate` or `review-fix`, test with annotation mode both disabled and enabled.
