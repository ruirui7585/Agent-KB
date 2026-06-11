---
name: html-ui-prototype-skill-self-test
description: Use when testing and repairing another HTML/UI prototype Skill before Codex uses it for real product work, verifying whether it can generate visual, interactive, previewable, downloadable HTML prototypes and directly repairing weak or conflicting Skill rules.
---

# HTML / UI Prototype Skill Self-Test

Use this Skill to test and repair another HTML / UI prototype Skill before Codex uses it in real product work. The goal is not to check whether the target Skill document looks complete. The real goal is to verify whether Codex can use the target Skill to generate a visual, interactive, previewable HTML prototype that matches the user's expected product effect.

If the target Skill is incomplete, ambiguous, conflicting, or unlikely to produce the expected visual result, Codex must repair the target Skill files directly and then re-run the test. Do not stop at giving suggestions.

## Target Skill Type

This self-test Skill only applies to HTML prototype skills, UI prototype skills, Mobile App prototype skills, product interaction prototype skills, annotated prototype delivery skills, and HTML handoff prototype skills.

Do not use this Skill to test PRD, translation, test case, or general writing skills.

## Final Expected Output

A valid HTML / UI prototype Skill must guide Codex to produce:

1. A visual HTML prototype.
2. A previewable result.
3. A downloadable deliverable.
4. A mobile-first App UI, defaulting to iPhone-like dimensions unless otherwise specified.
5. Clear UI hierarchy.
6. Product-realistic layout and copy.
7. Clickable interactions.
8. Correct state switching.
9. Stable visual behavior after refresh or export if the requirement includes persistence.
10. No accidental deletion of existing user-approved UI or logic.

The final output should look like a usable product prototype, not just a technical demo.

## Self-Test Workflow

1. Read the target Skill files.
2. Identify the target Skill's intended prototype output.
3. Extract all explicit rules.
4. Detect missing, ambiguous, weak, or conflicting rules.
5. Build a visual prototype checklist.
6. Run at least three simulated test cases: new prototype generation, existing prototype modification, and complex interaction/state scenario.
7. Run annotation persistence/export when the target is an annotated or HTML prototype delivery Skill.
8. Score the target Skill.
9. Check all critical fail items.
10. If the result is Fail or Pass with Issues, repair the target Skill files directly.
11. Re-run the test after repair.
12. Repeat until the result is Pass or Excellent.
13. Output a final self-test report.

Read this package in this order: `critical-fail-items.md`, `test-cases.md`, `visual-checklist.md`, `auto-repair-rules.md`, `output-report-template.md`.

## Result Levels

- Blocked: the target Skill cannot be tested because the entry file, goal, structure, or test input is missing. Repair the basic structure before continuing when possible.
- Fail: the target Skill cannot reliably guide Codex to produce the expected visual HTML/UI prototype, or it contains critical issues that make the output unusable.
- Pass with Issues: the target Skill can produce a partially usable result, but some visual, interaction, state, delivery, or repair rules are missing. Codex must repair the Skill and re-test.
- Pass: the target Skill can reliably guide Codex to produce the expected visual prototype with correct structure, interaction, and delivery quality.
- Excellent: the target Skill is reusable, robust, and includes clear rules, visual checks, failure handling, test cases, repair rules, and reporting format.

## Scoring

Total score: 100 points.

- Goal clarity: 15.
- Visual output requirements: 25.
- Interaction and state rules: 15.
- Delivery requirements: 15.
- Safety and preservation rules: 15.
- Auto-repair and re-test rules: 15.

Score mapping: 0-59 Fail, 60-74 Pass with Issues, 75-89 Pass, 90-100 Excellent. Critical fail items override the score. If any critical fail item appears, the result must be Fail.

## Mandatory Checks

Verify that the target Skill includes rules for previewable HTML output, downloadable deliverable, Mobile App visual layout, clear UI hierarchy, clickable interactions, state switching, no blank page, no broken asset paths, no accidental deletion of existing features, no modification outside the user's requested scope, clear file structure, clear output format, clear test cases, clear pass/fail criteria, automatic repair when the Skill is incomplete, and re-test after repair.

## Auto-Repair Requirement

If the target Skill is incomplete, Codex must directly edit the target Skill files. Codex must not only provide advice.

Repair priority:

1. Add or clarify the final prototype goal.
2. Add Must Rules.
3. Add Critical Fail Items.
4. Add visual checklist.
5. Add interaction and state checklist.
6. Add delivery requirements.
7. Add preservation rules.
8. Add test cases.
9. Add output report template.
10. Remove duplicate or conflicting rules.

After repair, Codex must re-run the self-test.

## Preservation Rule

When the target task is to modify an existing HTML prototype, Codex must preserve all user-approved UI, interactions, data, and logic unless the user explicitly asks to change them. If Codex deletes, rewrites, or breaks unrelated existing functionality, the test result must be Fail.

HTML prototypes should include the Prototype Annotation Editor by default unless the user explicitly opts out. Preserve `data-spec-key`, `data-spec-title`, `data-spec-note`, `.annotation-panel`, `.annotatable`, `annotation-mode`, `annotationState`, `annotations.json`, and export-embedded annotation state when present.

## Visual Quality Rule

The prototype must match the user's intended visual effect. A technically valid HTML file is not enough.

Check layout, spacing, typography, color consistency, icon quality, image quality, component hierarchy, mobile viewport fit, interaction feedback, empty states, toast behavior, modal behavior, and state-specific UI changes.

If the visual output is far from the user's target, the result is Fail or Pass with Issues.

## Output

Return a report using `output-report-template.md`. Include final result level, final score, critical fail items found, issues repaired, files modified, test cases executed, remaining human decisions, and whether the target Skill is ready for real Codex use.
