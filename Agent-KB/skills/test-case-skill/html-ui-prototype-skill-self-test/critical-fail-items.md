# Critical Fail Items

If any item below appears when testing a target HTML / UI prototype Skill, the result must be Fail regardless of the total score.

## General Critical Fail Items

1. The target Skill does not define the final visual output.
2. The target Skill does not require a previewable HTML result.
3. The target Skill does not require a downloadable deliverable.
4. The target Skill does not include any test cases.
5. The target Skill does not include pass/fail criteria.
6. The target Skill contains conflicting rules.
7. The target Skill only checks document completeness and does not simulate real prototype output.
8. Codex finds issues but does not repair the target Skill.
9. Codex repairs the Skill but does not re-test it.

## HTML Prototype Critical Fail Items

1. The generated page is blank.
2. The generated page cannot open.
3. CSS or JS paths are broken.
4. Main UI is severely clipped or invisible.
5. Main interactions do not work.
6. Buttons or tabs are unclickable.
7. State switching is required but does not work.
8. The prototype has no mobile App layout.
9. The result is only raw code, not a usable prototype.
10. The UI is obviously far from the user's target effect.

## Modification Critical Fail Items

1. Codex deletes user-approved UI without request.
2. Codex removes existing interactions without request.
3. Codex rewrites unrelated code and introduces new bugs.
4. Codex changes copy, colors, layout, or logic outside the requested scope.
5. Codex fails to compare the modified result against the original behavior.

## Delivery Critical Fail Items

1. No preview path or instruction is provided.
2. No downloadable file is provided.
3. No final verification summary is provided.
4. Known broken behavior is hidden instead of reported.
