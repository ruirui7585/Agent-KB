# Mobile UI Patterns

Use this file when creating or improving mobile app UI. It is the detailed companion to `SKILL.md` for generic mobile HTML prototypes.

## 1. Default Design System

### Theme: MENA Green Premium

Use by default for social, dating, chat, operator, private unlock, and call invite flows. Adapt only when the user provides a stronger brand direction.

```css
:root {
  --color-primary: #16A36F;
  --color-primary-dark: #0B6B4B;
  --color-primary-soft: #E8F6EF;
  --color-accent-gold: #D8A84E;
  --color-accent-rose: #E96F8C;
  --color-bg: #F7F4EF;
  --color-surface: #FFFFFF;
  --color-surface-soft: #F1F7F3;
  --color-text-primary: #17231F;
  --color-text-secondary: #6C7A73;
  --color-text-muted: #9AA8A1;
  --color-border: rgba(23, 35, 31, 0.10);
  --color-success: #16A36F;
  --color-warning: #F2A93B;
  --color-danger: #E45858;
  --phone-width: 390px;
  --phone-height: 844px;
  --space-page-x: 16px;
  --space-card: 14px;
  --space-section: 18px;
  --height-header: 64px;
  --height-bottom-tab: 72px;
  --height-button: 48px;
  --radius-card: 20px;
  --radius-button: 16px;
  --radius-pill: 999px;
  --radius-sheet: 24px;
  --shadow-card: 0 12px 30px rgba(23, 35, 31, 0.08);
}
```

### Typography

- Page title: 20-24px.
- Header title: 18-20px.
- Section title: 15-17px.
- Body: 13-15px.
- Caption: 11-12px.
- Button: 14-16px.
- Minimum readable body text: 12px.
- Do not scale font size with viewport width.

### Spacing

- Page horizontal padding: 16px.
- Card padding: 12-16px.
- Section gap: 16-20px.
- Button height: at least 44px, usually 48px.
- Tap target: at least 40px, preferably 44px.
- Card radius: 16-24px, usually 20px for this theme.
- Bottom sheet top radius: 24px.

## 2. App Shell

All mobile prototypes should use a phone-shell structure:

```html
<div class="app-shell">
  <div class="phone-frame">
    <main class="app-screen" data-current-page="inbox">
      <header class="app-header"></header>
      <section class="app-content"></section>
      <nav class="bottom-tab"></nav>
      <div class="toast-layer"></div>
      <div class="modal-layer"></div>
    </main>
  </div>
</div>
```

Rules:

- Phone frame is 390x844px by default.
- Content scrolls inside the phone frame.
- Bottom tab is fixed for primary pages and must not cover content.
- Secondary pages have a back button.
- No horizontal overflow.
- Keep `pageId` stable when project state, navigation, annotation, analytics, or saved review notes depend on it.
- Do not delete existing annotation or state panel logic while improving UI.

## 3. Page Patterns

### Pattern A: Mobile Workbench Home

Use for Operator Inbox, Workbench Home, and priority conversation lists.

Structure:

1. Staff identity header.
2. Online status.
3. Metric strip.
4. Filter pills.
5. Actionable conversation cards.
6. Bottom tab.

Must show:

- Current staff.
- Today chats.
- Today revenue.
- Pending replies.
- High-priority conversations.
- Suggested action.

Avoid tables, CRM-style rows, and too many fields per card.

### Pattern B: IM Conversion Chat

Use for Chat Detail, 1v1 chat, operator reply pages, and monetization chat.

Structure:

1. Fixed chat header.
2. User plus current model identity.
3. Payment or free-message status bar.
4. Message stream.
5. Quick action row.
6. Fixed composer.

Must include:

- Message bubbles.
- System notice.
- PrivateUnlockCard.
- CallInviteCard.
- Quick Reply / Photo / Private / Call.
- Send feedback.
- Clear male user, model identity, payment status, free messages left when relevant, and suggested next action.

Avoid plain text message lists, customer-service CRM styling, and private content that looks like normal images.

### Pattern C: Media Send Bottom Sheet

Use for Content Picker, private photo/video send, send preview, and unlock confirm.

Structure:

1. Bottom sheet or send preview panel.
2. Selected content preview.
3. Current conversation context.
4. Model identity.
5. Price / unlock info.
6. Already-sent warning if needed.
7. Primary CTA.
8. Cancel / back.

Must answer:

- What content is selected?
- Who will receive it?
- Which model owns it?
- Has it been sent before?
- What happens after sending?

Avoid empty detail pages, field-only previews, and weak primary buttons.

### Pattern D: Profile / Model Detail

Use for user profile, model detail, and female profile detail.

Structure:

1. Back header.
2. Hero profile card.
3. Bio / tags.
4. Persona notes if relevant.
5. Content pack.
6. Metrics.
7. Read-only notice if backend-configured.

Avoid plain field lists, no identity feeling, and hidden read-only state.

### Pattern E: Content Library

Use for media library, private content library, and script library.

Structure:

1. Header.
2. Filter pills.
3. Content cards / grid.
4. Preview.
5. Type.
6. Model.
7. Price.
8. Sent status.
9. Best scenario.

Avoid file lists, no preview, and public/private content that is visually indistinguishable.

### Pattern F: Me / Operator Center

Use for Me, staff profile, and operator center.

Structure:

1. Profile card.
2. Online / Offline status.
3. Metric cards.
4. Work info.
5. Action list.

Must show:

- Staff identity.
- Current status.
- Today summary.
- Work Status entry.

Avoid settings tables and long field lists.

## 4. Component Rules

### AppHeader

- Use for title, back button, status, and compact actions.
- Secondary pages must have a back button.
- Height is usually 64px plus safe-area handling when fixed.

### BottomTab

- Fixed bottom.
- Icon plus label.
- Active state obvious.
- Must not block content.

### Card

- Rounded 16-24px.
- Padding 12-16px.
- Light shadow or border.
- Clickable card needs tap feedback.
- Do not nest cards inside cards.

### StatusPill

Use for Online / Offline, Free / Paid / VIP, New / Timeout, Private / Locked, Sent / Not sent, and Warning.

Rules:

- Short text only.
- Color-coded.
- Max 3 pills per card.

### Avatar

- Small: 28-32px.
- Medium: 40-48px.
- Large: 64-88px.
- Use realistic images when possible.
- For MENA dating, female avatars should look realistic and culturally suitable.
- Avoid broken, repeated, or low-quality images.

### MetricCard

- One number plus one label.
- Do not turn metric cards into small tables.

### ConversationCard

Must include:

- Male user.
- Current model.
- Relationship/payment status.
- Free messages left if relevant.
- Last message.
- Waiting time.
- Suggested action.

### MessageBubble

- Different style and alignment for two sides.
- System notice is separate.
- Media uses card style.

### PrivateUnlockCard

Must include:

- Private / locked state.
- Content type.
- Price.
- CTA or sent/unlocked state.

### CallInviteCard

- Clearly different from a normal message.
- Shows call type and invite status.

### BottomSheet

- Rounded top corners.
- Clear title.
- Context summary.
- Primary CTA.
- Cancel/back action.
- Sheet content scrolls without hiding the CTA.

### Toast

- Auto-disappears after 3 seconds.
- Specific message, not just "Success".
- Good examples: "Message sent", "Private content added to chat", "Call invite sent", "Status updated", "This content was already sent".

## 5. Social / Dating Rules

UI must show relationship context, not just data. Make clear who the user is, who the current profile/model is, current relationship stage, payment status, free messages left when relevant, suggested next action, private content state, and call invite state.

### Relationship Stages

Use when relevant:

- New Match.
- Ice Breaking.
- Warm Chat.
- Paywall Near.
- Paid User.
- Private Unlocked.
- Call History.
- Silent.
- VIP Care.
- Risk.

Rules:

- List card shows only the most useful stage.
- Detail page can show more.
- Suggested action must match relationship stage.

Examples:

- New Match -> Reply quickly.
- Ice Breaking -> Ask light question.
- Warm Chat -> Send a private moment.
- Paywall Near -> Keep the conversation going.
- Paid User -> Invite call.
- Silent -> Soft recall message.
- VIP Care -> Prioritize reply.

## 6. Natural Monetization Rules

Commercial actions must fit the social context.

Avoid:

- Buy Private Photo.
- Force subscribe.
- Push user to pay.
- Start monetization call.

Prefer:

- Send a private moment.
- Keep the conversation going.
- Invite him to a quick call.
- 1 message left before subscribe prompt.
- Best timing to send private content.

Rules:

- One main CTA per page/panel.
- Private content should not look like a product shelf.
- Paid/VIP users should not see low-level paywall prompts repeatedly.
- Always show price, scope, benefit, and confirmation before a paid/private action.
- Payment/private states must be visually distinct.

## 7. Information Noise Control

Rules:

- One card: max 3 status pills.
- One page/panel: max 1 primary CTA.
- List pages show decision-critical info only.
- Detail pages show full information.
- List pages do not show more than 5 business fields per card.
- Do not sacrifice readability for completeness.

Bad:

`New / Free / GCC / No call / No unlock / High intent / Timeout / Zayna / Online`

Good:

`Warm Chat · Free · 1 msg left`

`Suggested: Send a private moment`

## 8. Anti-patterns and Fixes

- Backend table -> convert rows into cards, statuses into pills, data into MetricCards.
- Field stacking -> group into profile card, metric cards, and sections.
- PRD field dump -> identify the user decision and convert fields into visible hierarchy.
- Chat as text log -> use MessageBubble, SystemNotice, PrivateUnlockCard, CallInviteCard, and fixed composer.
- Picker as blank page -> use BottomSheet / Send Preview with content, context, price, warning, and CTA.
- All buttons same priority -> one primary CTA, secondary actions as outline/ghost.
- Too commercial -> embed paid action into relationship stage and natural wording.
- Identity confusion -> always distinguish Staff, Current Model, and Male User.
- Batch/fake feeling -> use realistic avatars, varied names, natural short copy, and relationship-stage-specific actions.
- Chat looks like CRM/customer service -> add relationship memory, model identity, private/call states, and conversational hierarchy.
- Private content looks like commodity shelf -> add ownership, relationship fit, freshness, preview, price, and send context.
- Broken or low-quality images -> replace with reliable local/generated assets, gradients with initials, or meaningful media cards.
- Non-MVP systems before core path is polished -> cut back to the core path and complete navigation, states, and feedback first.

## 9. Interaction Closed Loops

Every key action must form a visible loop. No silent click, no dead-end page, no blank page.

- Send message -> message appears -> input clears -> toast appears.
- Send private content -> picker opens -> content selected -> returns to chat -> PrivateUnlockCard appears.
- Switch Online -> status updates -> Me page syncs -> toast appears.
- Click conversation -> correct Chat Detail opens -> correct user/model shown.
- Back from secondary page -> returns to the expected previous page with state preserved.
- Payment/unlock -> confirmation -> processing -> success/failure -> visible result or retry path.

## 10. Prototype Annotation Editor

For HTML pages/prototypes, include the Prototype Annotation Editor by default unless the user opts out.

- Use the names `Prototype Annotation Editor` / `原型注释编辑器` and panel title `原型注释`.
- Mark meaningful modules with `.annotatable`, `data-spec-key`, `data-spec-title`, and `data-spec-note`.
- Use `.annotation-panel` and `annotation-mode` hooks.
- Default Annotation Mode to on so selecting modules does not trigger original prototype interactions.
- Make the panel movable and resizable so it does not block the UI.
- Keep `annotationState` as frontend source of truth.
- When durable local editing is required, use `annotations.json` plus simple `GET /api/annotations` and `POST /api/annotations` endpoints.
- Use localStorage only as temporary draft state.
- Exported HTML should embed the latest annotation state and remain usable without a local server.

## 11. Quantitative Acceptance

Must satisfy:

1. Phone container: 390x844px by default.
2. Page side padding: 16px.
3. Body text: at least 12px.
4. Main button height: at least 44px.
5. Tap target: at least 40px.
6. Max 3 status pills per card.
7. Max 1 primary CTA per page/panel.
8. Secondary pages have back button.
9. Core path should take no more than 3 taps where possible.
10. Main page goal visible within first screen.
11. Toast auto-disappears after 3 seconds.
12. Bottom tab does not cover content.
13. No horizontal overflow.
14. No blank pages.
15. Chat composer fixed near bottom.
16. Picker primary CTA visible without searching.
17. Payment/private states visually distinct.
18. List pages do not show more than 5 business fields per card.
19. Existing `pageId` values remain stable when state, annotation, or navigation logic depends on them.
20. Required pages are not deleted unless the user explicitly changes scope.
21. No project-specific absolute path or fixed project name is embedded in the skill.

## 12. Final Self-check

Before finishing, check:

- Does it look like a real mobile app?
- Does it avoid backend/admin style?
- Is the main task clear in 5 seconds?
- Are Staff / Model / User identities clear when relevant?
- Are commercial actions natural?
- Are core paths clickable?
- Are actions closed-loop?
- Are pages non-empty?
- Did any `pageId`, navigation, annotation, or state panel logic break?
- Did the output avoid fixed project names and project-specific paths?

## 13. Delivery Requirements

Every generated or modified mobile HTML prototype must provide:

- A visual HTML prototype file or project, not only a raw code response.
- A previewable result: local file path, local dev server URL, or clear preview instruction.
- A downloadable deliverable: HTML file, prototype folder, export file, or handoff-ready package.
- Clear file placement and file list.
- Relative CSS/JS/image paths that work in local preview and static hosting.
- Final change summary, verification result, and known limitations.
- For existing prototypes, confirmation that unrelated UI, logic, copy, assets, states, interactions, annotations, and export/download behavior were preserved.

## 14. Critical Fail Items

Any item below is Fail regardless of total quality:

- The Skill does not define a final visual mobile HTML prototype output.
- No previewable HTML result is required or provided.
- No downloadable deliverable is required or provided.
- The result is only raw code when a visual prototype was requested.
- The generated page is blank, cannot open, has broken CSS/JS paths, or has broken images without fallback.
- Main UI is severely clipped, horizontally overflowing, or invisible in the 390x844 phone container.
- Main interactions, buttons, tabs, modals, sheets, toasts, or state switching do not work.
- The prototype has no mobile App layout.
- The UI is obviously far from the user's target effect or looks like a rough wireframe/admin dashboard without request.
- Existing prototype modification deletes or changes unrelated UI, logic, copy, colors, layout, assets, page IDs, annotations, export behavior, or interactions.
- Issues are found but not repaired, or repairs are not re-tested.

## 15. Required Self-Test Cases

Use these cases when testing this Skill or a prototype produced by it:

### Test Case 1: New Prototype Generation

Create a mobile App HTML prototype for a subscription page with iPhone-like layout, English copy, three subscription plans, primary CTA, benefits list, close button, toast after clicking Subscribe, previewable output, and downloadable HTML.

Pass only if the result is a visual mobile page, Subscribe is clickable, toast appears, no blank page exists, preview/download are available, and the final summary is clear.

### Test Case 2: Existing Prototype Modification

Given an existing mobile App HTML prototype, only change bottom tab labels from `Home / Like / Chat / Profile` to `Discover / Likes / Chat / Me`.

Pass only if existing files are read first, only the requested labels change, all unrelated UI/logic/copy/images/state/interactions remain unchanged, the prototype still works, and the final result is previewable.

### Test Case 3: State Switching Prototype

Create a Dating App prototype with `Discover / Likes / Chat` tabs and a state switcher for `New user`, `Free user`, and `Subscribed user`.

Pass only if tab switching works, user-state switching changes visible UI, locked/unlocked states are clear, annotation/state panel does not block the prototype, and preview/download are available.

### Test Case 4: Export / Persistence Scenario

Create or preserve an annotated HTML prototype where users can edit annotation text, save it, refresh and keep the latest text, export read-only HTML with latest annotations embedded, and see a 3-second toast after save/export.

Pass only if refresh does not reset annotation text, export does not use stale text, toast disappears, annotation editor does not block the prototype, and save actually changes persisted state.

## 16. Pass / Fail Criteria

- Excellent: no Critical Fail items, all required self-test cases pass, preview/download/export work, visual quality is stable, and report is complete.
- Pass: no Critical Fail items, core mobile prototype cases pass, minor limitations are documented.
- Pass with Issues: no Critical Fail items but visual, interaction, state, delivery, preservation, or report rules are incomplete; repair and re-test.
- Fail: any Critical Fail item, missing preview/download, blank or broken prototype, non-working core interactions, or destructive unrelated changes.

## 17. Auto-Repair And Report

When this Skill or a produced prototype is incomplete, ambiguous, weak, conflicting, or likely to produce poor visual results:

1. Read the relevant Skill/prototype files.
2. Classify issues as P0, P1, or P2.
3. Patch the relevant files directly.
4. Keep the repair focused and preserve useful rules.
5. Remove duplicate or conflicting rules.
6. Re-run the self-test.
7. Report result, score/pass summary, executed test cases, Critical Fail checks, repairs applied, re-test result, files changed, preview/download path, known limitations, and whether it is ready for real Codex use.
