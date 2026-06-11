# Test Cases for HTML / UI Prototype Skill

Codex must use these test cases when testing a target HTML / UI prototype Skill.

The goal is to simulate real usage, not only inspect the document.

---

## Test Case 1: New Prototype Generation

### Input

Create a mobile App HTML prototype for a subscription page.

Requirements:

- iPhone-like layout.
- Product-realistic UI.
- English UI copy.
- Three subscription plans.
- Primary CTA.
- Benefits list.
- Close button.
- Toast after clicking Subscribe.
- Previewable and downloadable HTML output.

### Expected Result

The target Skill should guide Codex to produce:

- A visual subscription page.
- Clean mobile App layout.
- Clickable Subscribe button.
- Toast feedback.
- No blank page.
- Preview and download available.
- Clear final summary.

### Fail If

- Only code is returned.
- No visual preview is available.
- Page is blank.
- UI looks like a rough wireframe.
- CTA does not work.
- Toast does not appear.

---

## Test Case 2: Existing Prototype Modification

### Input

Given an existing mobile App HTML prototype, only change the bottom tab labels from:

Home / Like / Chat / Profile

to:

Discover / Likes / Chat / Me

Do not change any other UI, logic, copy, image, state, or interaction.

### Expected Result

The target Skill should guide Codex to:

- Read the existing files first.
- Modify only the requested tab labels.
- Preserve all existing UI and interactions.
- Verify the prototype still works.
- Output modified file and change summary.

### Fail If

- Any unrelated UI is changed.
- Any existing interaction is removed.
- Layout changes unexpectedly.
- Images or assets break.
- Codex rewrites the whole file unnecessarily.
- The final result is not previewable.

---

## Test Case 3: State Switching Prototype

### Input

Create a Dating App prototype with three tabs:

Discover / Likes / Chat

Add a state switcher for:

- New user.
- Free user.
- Subscribed user.

Rules:

- New user sees onboarding hints.
- Free user sees locked Likes and limited Chat.
- Subscribed user sees unlocked Likes and unlimited Chat.
- Switching state must update the visible UI.
- Add a side annotation panel explaining current state rules.
- The annotation panel must not block the mobile prototype.

### Expected Result

The target Skill should guide Codex to produce:

- A visual mobile prototype.
- Working tab switch.
- Working user state switch.
- Different UI for each user state.
- Clear locked/unlocked states.
- Annotation panel that does not block the prototype.
- Previewable and downloadable output.

### Fail If

- State switch does not update the UI.
- All user types see the same UI.
- Annotation panel blocks the prototype.
- Tabs do not work.
- The page is clipped or blank.
- No preview/download is provided.

---

## Test Case 4: Export / Persistence Scenario

### Input

Create an annotated HTML prototype.

Requirements:

- User can edit annotation text.
- User can save annotation text.
- Refreshing the page keeps the latest annotation.
- Exporting read-only HTML keeps the latest annotation.
- Show a 3-second toast after save and export.

### Expected Result

The target Skill should guide Codex to produce:

- Editable annotation.
- Save behavior.
- Persistence after refresh.
- Exported read-only HTML with latest annotation.
- 3-second toast.
- No loss of edited text.

### Fail If

- Refresh resets annotation to default text.
- Export uses old text.
- Toast does not disappear.
- Annotation editor blocks the prototype.
- Save button has no effect.
