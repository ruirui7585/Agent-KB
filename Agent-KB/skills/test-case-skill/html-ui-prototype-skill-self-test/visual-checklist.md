# Visual Checklist for HTML / UI Prototype Skill

Use this checklist when testing any HTML / UI prototype Skill.

## Scoring

Total score: 100 points.

- Goal clarity: 15.
- Visual output requirements: 25.
- Interaction and state rules: 15.
- Delivery requirements: 15.
- Safety and preservation rules: 15.
- Auto-repair and re-test rules: 15.

## 1. Prototype Output

The target Skill must require:

- Visual HTML prototype output.
- Previewable result.
- Downloadable file.
- No blank page.
- No raw code-only response when a visual prototype is requested.
- Clear instruction for where the generated file should be placed.

## 2. Mobile App Layout

The target Skill must require:

- Mobile-first layout.
- Default iPhone-like viewport unless the user specifies otherwise.
- Safe area awareness.
- Proper bottom navigation spacing.
- No horizontal overflow.
- No clipped major content.
- Main content visible without broken scaling.

## 3. Visual Quality

The target Skill must require:

- Product-realistic UI.
- Clear visual hierarchy.
- Consistent colors.
- Consistent typography.
- Clean spacing.
- High-quality icons.
- High-quality images or stable placeholders.
- No low-quality emoji-only UI unless intentionally requested.
- No obvious wireframe look unless the user requests wireframe.

## 4. Interaction Quality

The target Skill must require:

- Buttons are clickable.
- Tabs can switch.
- Modals can open and close.
- Toast appears and disappears automatically when required.
- State changes update visible UI.
- Back navigation works when included.
- No dead-end interaction unless intentionally designed.

## 5. State Logic

The target Skill must require clear handling for:

- New user.
- Free user.
- Paid or subscribed user.
- Locked and unlocked states.
- Empty and non-empty states.
- Loading state if needed.
- Error state if needed.
- Permission or access differences.

## 6. Annotation / State Panel

If the prototype includes an annotation panel, state switcher, or logic panel, the target Skill must require:

- The panel does not block the main prototype.
- The panel can reflect the selected page or state.
- The panel text is readable.
- The panel does not break mobile preview.
- The panel can be hidden or separated if needed.
- Exported read-only versions should preserve useful notes if required.

## 7. Asset and Path Stability

The target Skill must require:

- Relative paths work.
- CSS and JS files load correctly.
- Images do not break the page.
- Missing assets have fallback behavior.
- GitHub Pages or local preview does not break because of wrong paths.

## 8. Existing Prototype Modification

When modifying an existing prototype, the target Skill must require:

- Read existing files first.
- Identify the requested modification scope.
- Preserve all unrelated UI.
- Preserve all unrelated logic.
- Preserve all existing assets unless replacement is requested.
- Make minimal necessary changes.
- Verify the modified prototype still works.

## 9. Delivery Quality

The target Skill must require:

- Preview link or preview instruction.
- Downloadable file.
- Clear file list.
- Clear change summary.
- Known limitations if any.
- Final verification result.

## Result Thresholds

- 90-100: Excellent if no critical fail item appears.
- 75-89: Pass if no critical fail item appears.
- 60-74: Pass with Issues if no critical fail item appears; repair and re-test required.
- 0-59: Fail.
- Any critical fail item: Fail regardless of score.
