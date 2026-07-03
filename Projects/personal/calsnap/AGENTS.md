# FoodMind Project Rules

## Canonical Paths

- Project root: `/Users/shilv/Agent-Workspace/Projects/personal/calsnap`
- Preview root: `/Users/shilv/Agent-Workspace/Projects/personal/calsnap/web`
- Formal local output: `/Users/shilv/Agent-Workspace/Projects/personal/calsnap/web`
- Formal entry file: `/Users/shilv/Agent-Workspace/Projects/personal/calsnap/web/index.html`
- Preview URL: `http://127.0.0.1:4174/`

`web/` is both the active native HTML source and the formal output directory. Do not create duplicate FoodMind project or output folders.

## Required Workflow For Every FoodMind Change

Before editing:

1. State the exact project root.
2. Verify which process owns port `4174`.
3. Verify that the preview process reads from the canonical `web/` directory.
4. State exact allowed files, forbidden files, and validation plan.

After editing:

1. Update cache-busting versions when HTML, CSS, JavaScript, or Service Worker content changes.
2. Run `npm run build`.
3. Confirm `web/build-manifest.json` was regenerated and contains the current file hashes.
4. Run the relevant tests.
5. Confirm `http://127.0.0.1:4174/` serves `web/index.html` with cache disabled.
6. Confirm the local formal entry is synchronized.

Every final implementation report must include:

- Latest preview URL
- Local formal entry path
- Modified files
- Whether `npm run build` succeeded
- Concrete latest-version verification

Do not finish after changing only an intermediate source file. Do not create directories such as `foodmind-copy`, `foodmind-v2`, `final-new`, or similar variants.
