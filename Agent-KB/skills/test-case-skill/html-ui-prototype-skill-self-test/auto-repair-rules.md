# Auto Repair Rules for HTML / UI Prototype Skill

When the target HTML / UI prototype Skill is incomplete, ambiguous, weak, or likely to produce poor visual results, Codex must repair the target Skill files directly.

Do not only give suggestions.

## Repair Workflow

1. Read all target Skill files.
2. Identify missing or weak sections.
3. Classify each issue as P0, P1, or P2.
4. Edit the relevant Skill file directly.
5. Keep the repair focused.
6. Do not rewrite the whole Skill unless the structure is unusable.
7. Remove duplicate or conflicting rules.
8. Re-run the self-test.
9. Output the repair report.

## Priority Levels

### P0: Must Fix

Fix immediately before the target Skill can be used.

- Missing final visual goal.
- Missing preview requirement.
- Missing downloadable output requirement.
- Missing test cases.
- Missing pass/fail standard.
- Missing critical fail items.
- Missing preservation rule for existing prototype modification.
- Conflicting rules.
- No auto-repair requirement.
- No re-test requirement.

### P1: Should Fix

Fix to make the Skill stable and Codex-friendly.

- Weak visual quality standard.
- Weak interaction standard.
- Weak state logic requirement.
- No asset path stability rule.
- No output report format.
- No file structure requirement.
- No error fallback rule.

### P2: Nice to Improve

Improve after the Skill already passes.

- Add more examples.
- Add more edge cases.
- Improve wording.
- Reduce duplicated instructions.
- Add optional advanced patterns.

## Required Repair Sections

If missing, add these sections to the target Skill:

1. Final Expected Output.
2. Must Rules.
3. Do Not Rules.
4. Visual Quality Checklist.
5. Interaction Checklist.
6. State Logic Checklist.
7. Existing Prototype Preservation Rules.
8. Delivery Requirements.
9. Critical Fail Items.
10. Test Cases.
11. Self-Test Report Format.

## Re-Test Requirement

After every repair, Codex must re-run the test.

The repaired Skill cannot be marked as Pass unless:

1. The previous issue is fixed.
2. No new critical fail item appears.
3. The target Skill can guide Codex to produce the expected visual prototype.
