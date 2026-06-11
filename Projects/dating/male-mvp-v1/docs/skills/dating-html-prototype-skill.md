# Dating HTML Prototype Skill

Use this skill when modifying the Dating HTML prototype in `prototype-v2/`. It must be used together with `docs/codex-rules.md` and `docs/state-dictionary.md`.

## 1. Project Scope

This prototype is only for Dating flows: Discover / Swipe, Liked by Me, Likes Me, Match, Chat, Profile, Subscription, Coin Recharge, Paid Gift, Single Photo Unlock, State Panel, and Annotation Panel.

The project does not include Guardian, CP, Nobility, Voice Room, Live Room, Party Room, Guild, Anchor, or Mini-games modules. Do not add state, UI, paywalls, copy, navigation, or placeholder logic for those modules.

## 2. File Boundaries

- `index.html` is the entry structure only.
- `style.css` is styles only.
- `state.js` is state defaults, state updates, derived state, and state helpers only.
- `data.js` is static prototype data only.
- `app.js` is rendering and interaction only.

Do not merge the split prototype files back into one HTML file.

## 3. Core Pages

The supported core pages are Discover, Likes, Chat, and Me/Profile. Likes may contain Liked by Me and Likes Me as secondary tabs. Every patch must preserve these pages unless the user explicitly asks to remove one.

## 4. Monetization Surfaces

Subscription, Coin Recharge, Paid Gift, Single Photo Unlock, and Chat Paywall are the only monetization surfaces in this Dating prototype. Use shared paywall and Bottom Sheet patterns instead of creating unrelated cashier variants.

## 5. State Model

Prototype state must align with `docs/state-dictionary.md`. Do not introduce relationship, room, guild, anchor, nobility, or game states. New state fields require a clear Dating use case and must follow the existing state responsibilities.

## 6. Annotation Panel

The Annotation Panel is a required prototype tool and must evolve as a configuration-driven Dating annotation engine, not a static text card. Do not delete it, hide it permanently, or break module selection. When annotation mode is enabled, selecting annotated modules must not accidentally trigger the original business interaction.

## Annotation Engine Rules

The Annotation Panel / Notes Panel is a configuration-driven Dating prototype annotation and state explanation engine.

1. Annotation Panel is not a static text card.
2. Annotation Panel must be configuration-driven.
3. Page and module configuration must live in `data.js` as `pageConfigs`.
4. `state.js` must hold annotation runtime state, including `annotationPanelStatus`, `activeModuleId`, and `annotationMode`.
5. `app.js` must render the Notes Panel, bind module selection, and apply configured state actions to selected modules.
6. `style.css` must provide Notes Panel, selected module highlight, locked overlay, blur, and skeleton styles.
7. Do not use single-file HTML config blocks or embedded JSON script tags for annotation configuration.

Each `pageConfig` must contain:

- `pageName`
- `modules`
- module selector
- module title
- `notes.business`
- `notes.edgeCases`
- `notes.tracking`
- `states`

Supported module state actions:

- `none`
- `hide`
- `blur_and_lock`
- `skeleton`
- `empty`

The Annotation Panel must:

- List modules for the current page.
- Allow selecting a module.
- Highlight the selected DOM module.
- Show business notes, edge cases, and tracking notes for the selected module.
- Allow switching the selected module state.
- Apply the selected state effect to the selected module.

`currentPage` changes must sync `activeAnnotationPage`. Annotation Panel should be collapsible and should not block core UI by default. Do not delete Annotation Panel unless the user explicitly requests it.

## 7. State Panel

The State Panel is used to switch Dating scenarios and inspect prototype state. Preserve existing controls unless the user explicitly requests changes. Scenario switches must keep `currentPage` and `activeAnnotationPage` synchronized.

## 8. Bottom Tab Rules

Bottom Tab behavior must remain stable. Do not change tab structure, labels, icons, active states, or routing unless the user explicitly asks. The active page must be highlighted and inactive tabs must remain visually secondary.

## 9. Visual System

Use the project's current visual language and primary color. Do not introduce abrupt new colors, new theme systems, or inconsistent component variants during local patch work.

## 10. Implementation Discipline

Make the smallest change that satisfies the request. Read current HTML, CSS, JS, and state before editing. Do not rewrite the project, reformat unrelated code, or refactor working sections unless required for the requested patch.

## 11. Dating Flow Integrity

Core Dating flows must remain usable after every change: swipe cards, view likes, match, enter chat, open subscription paywall, recharge coins, send gifts, unlock a single photo, use the State Panel, and use the Annotation Panel.

## 12. Patch Modification Protocol

When the user requests changes based on a screenshot, an HTML file, an existing page, or the latest prototype version, treat the latest code, latest screenshot, and explicitly marked region as the source of truth for that patch.

- Modify only the module, element, page, or interaction the user explicitly mentions.
- Keep unmentioned pages, components, modals, tabs, paywalls, Bottom Sheets, Annotation Panel, and State Panel unchanged.
- Inspect the current HTML, CSS, and JS structure before editing; do not infer implementation details from screenshots alone.
- Do not proactively restructure pages or move responsibilities across files.
- Do not roll the prototype back to an older version.
- Do not delete existing functionality unless the user explicitly says to delete, remove, or no longer keep it.
- If the user says to continue from the latest version, use the current code as the baseline and preserve everything not mentioned.

## 13. UI Consistency Rules for Patch Work

Patch work must keep the prototype polished on a 393px by 852px mobile canvas.

- Text, spacing, buttons, tags, images, and avatars must fit the mobile canvas without overflow, overlap, broken wrapping, or compressed controls.
- When the user specifies an exact pixel size for a label, title, button, or related UI element, apply it consistently to the same component class.
- Images should render clearly by default. Use blur, lock overlays, or masks only when the Dating flow requires locked content or the user requests it.
- Avatars should use varied realistic lifestyle photos and follow the current shape rules for the page.
- Bottom navigation must highlight the current page and keep other tabs muted.
- Top tabs, underlines, buttons, and tags must visually align with their text.
- When an element is removed, nearby layout must reflow cleanly without leaving dead space or misalignment.
- Colors must prefer the existing project palette and primary color.

## 14. Dating Interaction Regression Rules

Local patches must not break the expected Dating interactions.

- Bottom Tab navigation to Discover, Likes, Chat, and Me must render a non-empty page.
- If the Likes page has Liked by Me and Likes Me secondary tabs, each tab must show matching content after switching.
- During Discover swipe, Like or Pass feedback may appear while dragging or pausing; after the card naturally exits and the next card appears, large feedback marks must not remain.
- Buttons, tabs, Bottom Sheets, modals, close actions, and page switches must remain interactive.
- Subscription, Coin Recharge, Photo Unlock, and Chat Paywall must use the shared Bottom Sheet pattern.
- Every subscription entry point must open the same subscription paywall flow.
- Paid chat, paid gifts, and single photo unlock must route to the coin recharge Bottom Sheet when coins are insufficient.

## 15. Verification Rules

After every patch, verify the affected area and the core shell.

- Check for obvious script errors after editing.
- Confirm Discover, Likes, Chat, and Me do not render blank pages.
- Confirm the changed clicks, tabs, Bottom Sheets, modals, or close actions are still interactive.
- CSS-only patches still require a layout check for overlap, overflow, hidden content, and collapsed sections.
- If `app.js` changes, confirm `renderApp`, `renderCurrentPage`, and the affected `renderXxxPage` functions still execute.
- If `state.js` changes, confirm `updateState` and `syncDerivedState` preserve existing derived state rules.

## 16. Required Response After Patch

After each local patch, respond briefly with:

1. Modified files
2. What changed in one sentence
3. Affected pages
4. Affected `prototypeState` fields
5. Verification result
6. Any risks

Do not include long unrelated explanations in patch completion responses.
