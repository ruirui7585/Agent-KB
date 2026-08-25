# Source Analysis

## Goal

Understand an existing interactive prototype before generating annotations. The prototype may use any frontend stack, and a PRD may or may not be available.

## Input Priority

Use all available evidence, but keep its meaning distinct:

1. Confirmed product requirements or user corrections
2. PRD, requirements, product notes, and explicit rule documents
3. Implemented code, routes, state logic, validation, and event handlers
4. Observable behavior in the running prototype
5. Carefully labeled inference

Do not treat sample text, placeholder data, or a field name alone as proof of a strict product rule.

## Fixed Value Analysis

Identify fixed-value fields by their business meaning, not by their rendered component. A field may require a value definition when it represents a status, fixed category, boolean, fixed result, or system dictionary, whether it appears in a selector, table, detail view, tag, switch, or another component.

Do not create `取值定义` for free text, identifiers, dates, ordinary numbers, people, or other unbounded dynamic data. A person selector is still dynamic data and must not list every person as a fixed value definition.

For each applicable fixed-value field:

1. Check whether the PRD explicitly defines the allowed display values and their business meanings.
2. If defined, use the PRD definition.
3. If the PRD does not define it, render `取值定义：无`, record any implemented or observed values only as context for the follow-up question, and ask the user after the prototype and initial annotations are generated.

Implemented options and observed sample values may help identify an applicable field, but they are not authoritative value definitions without PRD text or explicit user confirmation.

## Inspect Code Projects

Identify:

- Framework and build commands
- Application entrypoints
- Routes and page states
- Components and meaningful business modules
- Form fields, validation, and submission behavior
- Fixed-value field candidates, PRD-defined values, and observed candidate values
- Table filters, actions, sorting, pagination, and selection
- Modal, drawer, popover, and transient-state behavior
- Permission conditions and disabled states
- Existing stable IDs, test IDs, or data attributes

Use existing project conventions. Do not restructure the application merely to add annotations.

## Inspect Running Prototypes

Exercise meaningful workflows:

- Navigate between primary and secondary pages.
- Open dialogs, drawers, menus, and expandable areas.
- Test input, validation, search, reset, sorting, pagination, and state changes.
- Record behavior that can be directly confirmed.

If the running prototype cannot be modified, produce an annotation plan or use external injection when feasible.

After inspection, compare PRD and prototype behavior using `source-reconciliation.md`. Do not finalize annotations for missing or conflicting behavior until the user decides how to handle the affected claims.

## Meaningful Annotation Targets

Annotate product concepts, not visual fragments:

- Page purpose
- Business module
- Field or field group
- Primary or conditional action
- Workflow step
- State, permission, or exception behavior

Avoid annotating decorative icons, spacing, cards with no independent product meaning, and repeated rows that follow the same rule.

## Without A PRD

Annotations may describe:

- Directly observable behavior
- Meaning evident from labels and implemented flows
- Clearly labeled assumptions needed to explain the prototype

Do not invent data sources, permission rules, validation limits, or exception handling that cannot be confirmed.
