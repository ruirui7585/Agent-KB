# Mobile UI Layout Skill for Dating HTML Prototype

## 1. Purpose

This skill defines the shared mobile UI master layout for the Dating HTML prototype.

All pages must be built on the same prototype master, instead of regenerating independent page structures.

The goal is to keep layout, navigation, overlays, state panel, annotation panel, and cashier behavior consistent across Discover, Likes, Match, Chat, Me, and Profile.

## 2. Required Master Layout

Every page must inherit the same master layout:

1. iPhone 16 canvas
2. Global color variables
3. Top Header
4. Bottom Tab
5. Page Router
6. State Panel
7. Annotation Panel
8. Toast
9. Modal
10. Bottom Sheet
11. Cashier / Paywall Sheet

Do not rebuild these modules separately for each page.

## 3. iPhone 16 Canvas

The prototype canvas must use:

- Width: 393px
- Height: 852px
- Portrait mobile layout
- No horizontal overflow
- Natural vertical scrolling inside page content
- Bottom Tab always visible
- Safe area respected
- Rounded phone frame when previewed on desktop

The canvas should live in index.html only as:
- .prototype-shell
- .phone-frame
- #app

Actual pages must be rendered by app.js.

## 4. Global Color Variables

All colors must come from style.css variables.

Default Dating theme:
- Primary: purple
- Premium: gold
- Success: green
- Danger: rose/red
- Background: white or soft light background
- Text: dark gray / secondary gray

Do not introduce random new colors in page-specific CSS unless requested.

## 5. Top Header

All main pages should use a consistent top header structure.

Header may include:
- Page title
- Subtitle / status summary
- Back button
- Balance / Premium entry
- Me/profile entry

Do not create unrelated header systems for each page.

## 6. Bottom Tab

Default bottom tabs:

- Discover
- Likes
- Chat
- Me

Rules:
1. Bottom Tab must stay visible on main pages.
2. Current page must be highlighted.
3. Other tabs should be inactive/gray.
4. Do not add Match as a bottom tab unless explicitly requested.
5. Match should usually live inside Likes or Chat as a secondary entry.
6. Do not add Party, Live, Rooms, Feed, Wallet, Recharge, Guardian, or CP tabs.

## 7. Page Router

All page switching must be controlled by:

- prototypeState.currentPage
- goToPage(page)
- renderCurrentPage()

Do not create separate HTML files for each page.
Do not directly manipulate browser navigation unless requested.

## 8. State Panel

State Panel is for PM review.

It should allow switching important prototype states such as:
- subscriptionStatus
- likesMePermissionStatus
- coinBalance / balanceStatus
- photoUnlockStatus
- paidMessageStatus
- matchStatus

Rules:
1. State changes must call updateState().
2. Page UI must refresh after state changes.
3. State Panel must not be removed unless explicitly requested.
4. State Panel should not block core UI interactions.

## 9. Annotation Panel

Annotation Panel is for PM / design / dev handoff.

Rules:
1. Annotation content must come from data.js annotations.
2. activeAnnotationPage must sync with currentPage.
3. When currentPage changes, annotation content must update.
4. Annotation Panel must not be removed unless explicitly requested.
5. It should explain business logic, interaction logic, edge cases, and monetization rules.

## 10. Toast

Toast is used for lightweight feedback:

Examples:
- Liked
- Passed
- Super Like sent
- Photo unlocked
- Gift sent
- Not enough coins

Rules:
1. Toast should not block interaction.
2. Toast should appear above Bottom Tab.
3. Toast should not replace Modal or Bottom Sheet for important decisions.

## 11. Modal

Modal is used for high-attention feedback:

Examples:
- Match success
- Payment success
- Unlock success
- Gift success

Rules:
1. Modal must use modalStatus.
2. Modal should be easy to close.
3. Do not create multiple inconsistent modal systems.

## 12. Bottom Sheet

Bottom Sheet is used for temporary actions and monetization.

Allowed sheet types:
- subscription_paywall
- coin_recharge
- photo_unlock
- gift_panel
- chat_paywall

Rules:
1. All sheets must be controlled by bottomSheetStatus.
2. Sheet height should usually be around 60%-70% of the phone height.
3. Clicking the mask should close the sheet unless it is a blocking payment confirmation.
4. Do not create page-specific custom paywall popups outside the shared Bottom Sheet system.

## 13. Cashier / Paywall Sheet

All monetization entry points must reuse the same paywall/cashier structure.

Covered scenarios:
- Subscription purchase
- Coin recharge
- Paid chat unlock
- Gift purchase
- Single photo unlock

Rules:
1. Subscription entry must open subscription_paywall.
2. Coin shortage must open coin_recharge.
3. Photo unlock must open photo_unlock.
4. Gift panel must open gift_panel.
5. Paid chat must open chat_paywall or coin_recharge.
6. Do not create multiple unrelated cashier styles.

## 14. Page Composition Rule

Each page should only own its unique content area.

Shared modules should not be duplicated:
- Header pattern
- Bottom Tab
- State Panel
- Annotation Panel
- Toast
- Modal
- Bottom Sheet
- Cashier

When creating a new page, only add:
- renderXxxPage()
- page-specific CSS section
- page-specific data if needed
- page-specific annotations if needed

## 15. File Responsibility

- index.html: root shell only
- style.css: shared layout + page styles
- state.js: page and business state
- data.js: mock data, packages, gifts, annotations, tracking events
- app.js: render functions and interactions

Do not mix responsibilities.

## 16. Verification Checklist

After modifying UI layout, verify:

1. index.html still loads style.css, state.js, data.js, app.js.
2. renderApp still executes.
3. Bottom Tab still switches pages.
4. Discover / Likes / Chat / Me are not blank.
5. Bottom Sheet opens and closes.
6. State Panel still updates UI.
7. Annotation Panel syncs with currentPage.
8. No Guardian / CP / Voice Room / Live Room / Party Room content appears.
