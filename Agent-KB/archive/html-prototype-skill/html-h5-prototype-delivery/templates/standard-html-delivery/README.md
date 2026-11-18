# HTML Product Prototype

This is a reusable native HTML/CSS/JS product prototype delivery template.

## Purpose

Use this template to create a high-fidelity product prototype for PM review, design alignment, frontend handoff, QA acceptance, and screenshot-based iteration.

The prototype is not production code. It is an interactive delivery artifact that documents UI, interaction states, permissions, copy, tracking, and edge cases.

## Local Preview

Open `index.html` directly in a browser, or run a local static server:

```bash
npm install
npm run dev
```

Then open the URL printed by the dev server.

## Structure

- `index.html`: entry file and resource references.
- `css/`: reset, variables, layout, components, and animation styles.
- `js/`: config, mock data, state, utilities, interactions, and app rendering.
- `assets/`: images, icons, videos, fonts, and backgrounds.
- `snippets/`: reusable HTML snippets for reference only.
- `docs/`: requirements, interaction notes, state matrix, permissions, API fields, tracking, copywriting, edge cases, and changelog.
- `screenshots/`: screenshots used for review and regression checks.

## Modification Rules

1. Keep HTML, CSS, JS, assets, and docs responsibilities separated.
2. Do not place large inline CSS, JS, or data blocks inside `index.html`.
3. Use relative paths for all deliverable assets.
4. Update `docs/changelog.md` after each meaningful change.
5. For screenshot-based patches, modify only the explicitly requested area.
6. Keep the left prototype and right annotation editor independent.

## Delivery Notes

Before handoff, complete `DELIVERY_CHECKLIST.md`, capture key screenshots, and confirm the prototype opens without console errors.
