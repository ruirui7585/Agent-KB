---
name: prototype-annotation
description: Use when the user asks to plan, write, add, review, or fix product-rule annotations, hotspots, explanation panels, or annotation behavior for a supplied interactive prototype, frontend codebase, HTML file, or locally running prototype.
---

# Prototype Annotation

## Core Rule

Add a non-invasive product-explanation layer to an interactive prototype without changing its product UI, visual system, business state, or existing interactions.

This skill is independently usable. It must not require `platform-admin-prototype`, `@platform/components`, a specific framework, or a prior generation workflow.

## Trigger Boundary

- Use this skill directly when a prototype, codebase, HTML file, or running prototype is supplied and the requested work is annotation-focused.
- Use `$platform-admin-prototype` when the primary request is to create a new PC backend prototype, including a new annotated PC backend prototype.
- Do not rebuild or redesign the base prototype unless the user separately requests that work.
- While legacy prototype skills coexist, invoke this skill explicitly as `$prototype-annotation` to avoid ambiguous annotation routing.

## Supported Inputs

- A standalone HTML file or HTML/CSS/JavaScript project
- A Vue, React, or other frontend project
- A locally running interactive prototype
- A prototype plus PRD, requirements, screenshots, or product notes
- A prototype without PRD, using only observable behavior and clearly labeled inference

If only a screenshot or non-interactive design is available, produce an annotation plan unless the user also asks to build an interactive prototype.

## Mode Selection

Select exactly one primary mode. Ask a short clarification only when the requested deliverable is genuinely ambiguous.

| Mode | Use when | Default deliverable |
| --- | --- | --- |
| `plan-only` | The user asks to analyze targets, design annotations, or provide a plan without code changes | Annotation map, evidence, unresolved questions, and integration recommendation |
| `annotate` | The user asks to add or generate working annotations for a supplied prototype | Integrated annotation layer, annotation data, and verification |
| `review-fix` | The user asks to inspect, verify, optimize, or repair an existing annotation system | Findings first, then fixes and re-verification unless the user asks for review only |
| `content-only` | The user asks only for annotation wording, product explanations, or annotation data | Annotation copy/data with evidence sources; no runtime, anchor, or product-code changes |

`annotate` is the default only when the user explicitly asks to add working annotations. Do not modify code in `plan-only` or `content-only`.

## References To Load

Read only what is needed:

- `references/source-analysis.md`: inspect projects, running prototypes, routes, interactions, and evidence sources.
- `references/source-reconciliation.md`: handle PRD/prototype alignment, missing implementation, conflicts, and user questions.
- `references/annotation-spec.md`: annotation data, anchors, selectors, provenance, and interaction contract.
- `references/integration-patterns.md`: choose HTML, framework-native, or external-injection integration.
- `references/annotation-copy.md`: write concise product-side annotation content.
- `references/verification.md`: verify annotations without regressing the base prototype.

## Shared Preparation

1. Select the primary mode and inspect the supplied code, file, or running prototype.
2. Map meaningful pages, modules, fields, actions, states, and flows. Do not annotate visual decoration.
3. Reconcile PRD and prototype evidence using `references/source-reconciliation.md`. Ask the user about PRD behavior missing from the prototype and any direct conflicts before finalizing affected annotations.
4. Resolve each applicable business data source separately from annotation evidence. Unknown data sources do not block prototype or annotation generation: render `数据来源：无`, collect the unresolved fields, and ask the user in one grouped follow-up after the initial annotations are generated.
5. Identify fields with a finite fixed business-value set independently of their rendered component. Use the PRD's definition when present. When the PRD does not define an applicable field's values, render `取值定义：无`, collect the unresolved fields, and ask the user in one grouped follow-up after the prototype and initial annotations are generated.

## Mode Procedures

- `plan-only`: Produce a compact annotation map with page, context, target, title, sections, item-level evidence, discrepancies, questions, and integration recommendation. Do not change code.
- `content-only`: Generate or revise annotation copy/data with item-level evidence and resolved implementation status. Do not add or change runtime, anchors, or product code.
- `annotate`: Produce the annotation map, select the least invasive integration pattern, add stable anchors or selectors, annotation data, hotspots, and an independent explanation panel, then run dual-mode verification.
- `review-fix`: Inspect the existing annotation system against the supplied requirements and this skill's contracts. Report findings first. Stop after findings when the user requests review only; otherwise fix actionable annotation defects and run dual-mode verification.

## Non-Negotiable Rules

- Annotation mode is optional and must be removable or disableable.
- The base prototype remains the primary product experience.
- Only annotation hotspots open the explanation panel; ordinary product interactions remain unchanged.
- Clicking a note locates and highlights its bound target.
- Closing the annotation panel must not change product state.
- Do not fabricate strict business rules that are not supported by PRD, code, or observable interaction.
- Do not put font, color, spacing, shadow, layout, or other visual-design rationale into product annotation copy.
- Product annotation copy must be structured around fields, component type, defaults, required status, constraints, data sources, action results, navigation targets, and product-logic conditions. Avoid paragraph-only generic explanations.
- `数据来源` means how the displayed or entered business value is produced or obtained, such as user input, user selection, system generation, system acquisition, operation change, or calculation. Never use a PRD module name, document location, or annotation evidence label as the business data source.
- Keep annotation evidence (`prd`, `confirmed`, `observed`, `inferred`) separate and unchanged. Do not add a separate option-source field. When the business data source cannot be confirmed, display `无`, mark it for user confirmation, continue generating unaffected annotations, and ask all unresolved data-source questions together afterward.
- `取值定义` describes the finite fixed business values a field may display or accept, regardless of whether the field appears in a selector, table, detail view, tag, switch, or other component. Populate it from the PRD or explicit user confirmation only. Do not treat sample values or implemented options as the authoritative definition, do not render enum-code columns, and do not add an option-source field.
- Render `取值定义` for applicable fixed-value fields such as statuses, fixed categories, booleans, fixed results, and system dictionaries. Do not render it for free text, identifiers, dates, ordinary numbers, people, or other unbounded dynamic data. If applicable but absent from the PRD, render `无`, collect the field for confirmation, finish the prototype and initial annotations, then ask all unresolved value-definition questions together.
- Render `状态流转规则` only when actual business transition rules are defined. Omit the section entirely when no transition rule exists; never create an empty transition section.
- Browser annotation panels must be draggable by their header and constrained to the visible viewport/prototype canvas.
- Annotation detail sections must expand inline under the selected note item only, with the detail card aligned to the note's sequence-number circle column rather than the title text column. Unselected notes show no detail sections, and expanded content must not repeat the title/component type/summary already shown in the note item.
- Do not force the target project into a specific framework or component system.
- Prefer stable business anchors. Avoid fragile generated classes and positional selectors.
- Do not silently resolve PRD/prototype conflicts or annotate unimplemented PRD behavior as if it exists.
- Do not modify base product behavior merely to make annotation content true.
- When the user chooses to describe unimplemented PRD behavior, label it as planned and currently unimplemented at the affected claim level.

## Completion

- The selected mode's deliverable is complete without requiring another mode first.
- Annotation targets and individual claims are traceable to PRD, confirmed guidance, observed behavior, or labeled inference.
- No unresolved PRD/prototype conflict is silently included as a confirmed annotation.
- For code-changing modes, annotation mode works across relevant pages and transient states without altering normal product interactions.
- For code-changing modes, the base prototype still works with annotation mode disabled and relevant checks pass, or remaining failures are reported.

## HTML / UI Annotation Self-Test And Auto-Repair

This Skill is an annotation-layer Skill for existing or supplied prototypes. It must not create or redesign the base product prototype unless the user explicitly asks. When tested by a generic HTML / UI prototype self-test, evaluate the annotation deliverable in its supported mode and keep the base prototype preservation rule primary.

### Final Expected Output

- `plan-only` / `content-only`: preview-independent annotation map or annotation copy with evidence and unresolved questions.
- `annotate` / `review-fix`: a visual, previewable prototype with a non-invasive annotation layer integrated or repaired.
- Code-changing modes must provide changed files, preview path or verified local URL, final verification summary, and a downloadable/handoff-ready artifact or export instructions when the project supports export.
- Exported or read-only annotated HTML must preserve useful notes and the latest annotation state when export/persistence is required.

### Must Rules

1. Read existing prototype files or inspect the running prototype before changing code.
2. Preserve all unrelated base UI, layout, copy, colors, assets, navigation, product state, event handlers, and interactions.
3. Annotation panel, hotspots, state switcher, or logic panel must not block or break the main prototype.
4. Product controls must remain clickable when annotation mode is disabled; annotation mode must not accidentally trigger product actions.
5. Annotation state changes must visibly update the panel/hotspots and preserve route/state context.
6. For persistence/export tasks, editable annotation text must save, refresh with the latest value, and export read-only HTML with the latest annotation embedded.
7. Save/export actions must provide specific feedback, such as a 3-second toast when requested.
8. Use relative paths and fallbacks so CSS, JS, images, and injected annotation assets do not break preview.

### Do Not Rules

- Do not return only annotation advice when the user requested working annotation integration.
- Do not redesign, rewrite, or simplify the base prototype to make annotation easier.
- Do not delete existing annotation hooks, state, export behavior, product interactions, or user-approved content without request.
- Do not hide broken preview, broken assets, failed persistence, failed export, or base prototype regressions.

### Critical Fail Items

Any item is Fail and must be repaired and re-tested:

- Code-changing mode has no previewable prototype result.
- Code-changing mode has no downloadable/handoff-ready output or export instruction.
- Annotation integration breaks base navigation, buttons, product state, or existing interactions.
- Annotation panel blocks the prototype or makes mobile/desktop preview unusable.
- Save has no effect, refresh loses latest annotation text, or export uses stale/default annotation text when persistence/export is required.
- CSS/JS/assets break after annotation integration.
- Existing user-approved UI, logic, copy, assets, interactions, annotations, or export features are deleted without request.
- Issues are found but not repaired, or repaired but not re-tested.

### Required Self-Test Cases

Run or simulate these cases for code-changing modes:

1. New annotation integration: add a non-invasive annotation layer to a supplied subscription/admin/mobile prototype; verify panel readability, target binding, preview, and handoff output.
2. Existing prototype modification: change only annotation copy or anchors requested by the user; preserve all unrelated product UI, logic, assets, state, and interactions.
3. State switching: verify hotspots and panel content update when product route/state changes and do not block tab/modal/form behavior.
4. Export / persistence: editable annotation text saves, refresh keeps latest text, exported read-only HTML embeds latest annotation, and save/export feedback appears and disappears as required.

### Pass / Fail Criteria

- Excellent: no critical fail items, all applicable annotation cases pass, base prototype works with annotation mode on/off, preview/export verified, and report is complete.
- Pass: no critical fail items, applicable cases pass, minor limitations documented.
- Pass with Issues: no critical fail items but preview, export, persistence, state, or report rules need improvement; repair and re-test.
- Fail: any critical fail item, missing preview/handoff output for code-changing mode, annotation persistence/export regression, or base prototype regression.

### Auto-Repair Rule

If this Skill or its references are incomplete, ambiguous, conflicting, or likely to produce poor annotation behavior, patch the relevant Skill files directly, keep the repair focused, remove duplicate/conflicting rules, and re-run the self-test before reporting completion.

### Self-Test Report Format

Final delivery or review notes must include: result level, score or pass summary, annotation test cases executed, critical fail check, repairs applied, re-test result, changed file list, preview URL or artifact path for code-changing modes, export/download instruction when supported, known limitations, and whether this Skill is ready for real annotation work.

## Self-test Requirement

Every time HTML, JS, CSS, annotation runtime behavior, export behavior, or this Skill's documentation is modified, run the self-test loop before marking the Skill or deliverable ready:

1. Start a local static server. Do not use `file://` as the test entry.
2. Run browser E2E tests against the local `http://127.0.0.1:<port>/` URL.
3. Generate or update `SELF_TEST_REPORT.md`.
4. Save evidence screenshots under `self-test/evidence/`: `page-load.png`, `after-main-action.png`, `after-state-switch.png`, and `after-export.png`.
5. If any test fails, analyze the failed item, patch the related file, and re-test.
6. Run at most 3 automatic repair rounds.
7. Only set `Ready for Codex use: Yes` when the Pass Criteria are satisfied.

Pass Criteria:

- Critical Fail > 0 => `FAIL`.
- Major Fail > 2 => `FAIL`.
- Minor Fail > 5 => `WARNING`.
- Otherwise => `PASS`.
