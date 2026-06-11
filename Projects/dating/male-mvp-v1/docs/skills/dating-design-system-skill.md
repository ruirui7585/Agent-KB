# Dating Design System Skill

## 1. Purpose

This skill defines the visual adaptation rules for the Dating HTML prototype.

When using a reference screenshot, Codex must treat the screenshot as layout and information hierarchy reference only. The final UI must adapt to the existing prototype-v2 design system.

Do not directly copy fonts, colors, icons, spacing, or components from the reference screenshot if they conflict with prototype-v2.

## 2. Reference Image Adaptation Rule

Reference image means:
- layout reference
- content priority reference
- interaction structure reference
- component relationship reference

Reference image does not mean:
- copy exact font
- copy exact icon style
- copy exact color palette
- copy exact component radius
- copy exact bottom tab style
- break existing phone frame or global layout

When implementing UI from a reference image:
1. Keep the current iPhone 16 canvas.
2. Keep existing global color variables.
3. Keep existing bottom tab style unless explicitly requested.
4. Keep existing typography scale unless explicitly requested.
5. Match the information structure, not the raw visual style.
6. Do not introduce unrelated visual systems.

## 3. Typography Rules

Use the existing prototype-v2 font stack:
- -apple-system
- BlinkMacSystemFont
- SF Pro Display
- Segoe UI
- sans-serif

Default font rules:
- Page title: 32px-40px, bold
- Section title: 22px-28px, bold
- Card title / name: 22px-32px, bold
- Body text: 14px-16px
- Secondary text: 12px-14px
- Button text: 13px-16px, semibold/bold

Do not randomly introduce very large text from reference screenshots if it breaks the 393px canvas.

## 4. Color Rules

All colors should come from style.css variables whenever possible.

Default Dating palette:
- Primary: purple
- Premium: gold
- Success: green
- Danger: rose/red
- Background: white or soft light background
- Text: dark gray
- Secondary text: gray

Do not introduce random new red, blue, black, or neon colors unless the task explicitly requires it.

## 5. Icon Rules

Do not use random emoji icons for core UI.

Core icons should use a consistent clean line style, preferably inline SVG.

Default icon mapping:
- Discover: compass
- Likes: heart
- Chat: message-circle
- Me: user
- Search: search
- Sort: sliders-horizontal
- Premium: crown
- Coin: coins
- Gift: gift
- Lock: lock
- Unlock: unlock
- Back: chevron-left
- Close: x
- Like: heart
- Pass: x
- Super Like: star

Icon rules:
1. Icons must be visually consistent.
2. Icons must align with text and buttons.
3. Icons must not look like random emoji.
4. If using SVG, keep stroke width consistent.
5. Do not mix filled emoji, outline SVG, and system symbols randomly.

## 6. Avatar Rules

Whenever a UI module needs user avatars, Codex must use realistic MENA / Middle Eastern style portrait photos by default.

Applies to:
- Discover card
- Likes list
- Likes Me list
- Match list
- Chat list
- Profile page
- Avatar stack
- Story / match carousel

Avatar rules:
1. Use realistic portrait photos.
2. Prefer MENA / Middle Eastern appearance and styling.
3. Do not use cartoon avatars.
4. Do not use emoji placeholders.
5. Do not repeat the same avatar too frequently.
6. For locked Likes Me, use blurred real portraits instead of abstract blocks.
7. If an image fails, fallback to a neutral gradient avatar with initials.

All avatar URLs should be centralized in data.js, not hardcoded inside app.js.

## 7. Component Adaptation Rules

When copying a reference UI into prototype-v2:
1. Reuse existing component classes where possible.
2. Adapt to current phone frame size.
3. Do not break bottom tab.
4. Do not cover action buttons.
5. Do not cause horizontal overflow.
6. Do not create new global layout unless required.
7. Do not restyle unrelated pages.

## 8. Toast Rules

All toast behavior must be centralized.

Rules:
1. Toast should show for 3000ms by default.
2. New toast should clear previous toast timer.
3. Toast should disappear automatically.
4. Toast should not block page interaction.
5. Toast should not cover bottom tab or primary buttons.
6. Toast copy should be short and clear.
7. Toast should be triggered through showToast(message, duration = 3000).

Examples:
- 已保存
- 已导出可编辑版
- 已导出只读版
- 图片已解锁
- 金币不足
- 礼物已发送
- 已喜欢
- 已跳过

## 9. Bottom Tab Rules

Default bottom tab:
- Discover
- Likes
- Chat
- Me

Rules:
1. Do not add Match to bottom tab unless explicitly requested.
2. Match can live inside Likes or Chat.
3. Current tab must be highlighted.
4. Other tabs should be gray.
5. Bottom tab must remain visible and not be covered.

## 10. Quality Checklist

After any UI change, verify:
1. iPhone 16 canvas still fits.
2. No horizontal overflow.
3. Bottom tab is visible.
4. Primary buttons are not covered.
5. Avatars are realistic and loaded.
6. Icons are consistent.
7. Toast auto disappears after 3 seconds.
8. Reference image did not override the existing design system.
9. No Guardian / CP / Voice Room / Live Room / LAKA content appears.
