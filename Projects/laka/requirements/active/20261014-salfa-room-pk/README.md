# Salfa Room PK prototype

- Created / last updated: 2026-10-14
- Version: imported 22-screen snapshot
- Type: static App prototype import
- Module: Voice Room / PK
- Document status: Ready for Delivery (prototype import only)
- Product status: Proposed; import does not indicate release approval
- Review entry: [index.html](index.html)
- Scope notes: [PRD.md](PRD.md)
- Visual source: the user-selected Salfa Room PK gallery and its supporting files

## Preview

Open `index.html` to view all 22 screens. Keep this whole folder together when sharing or moving it.

For local preview and the existing project-local annotation service, run from this folder:

```sh
python3 server.py --port 8775
```

Then open <http://127.0.0.1:8775/>. `assets/room-preview.html` is the internal screen renderer; `index.html` is the review entry.

## UI intent

- Goal: import the current prototype into Laka active requirements without redesign.
- Pages: the same 22 screens listed in `index.html`.
- Roles / platform: the existing voice-room PK examples; no new role or platform rules.
- Change: delivery location, entry filename, relative resource paths, and preview-server port option.
- Preserve: screen order, visual layout, text, assets, sample values, rendering, and existing demo logic.
- States: all 22 source-gallery states.
- References / assets: the current user-selected prototype, including its two existing screenshot assets.
- Approval: this import is explicitly requested; product adoption and implementation are not asserted.

## Files and limits

`css/` holds styles; `js/` holds gallery navigation, the existing screen renderer, and the existing annotation editor. `assets/` holds images and the internal renderer document. `annotations.json` retains the original annotation data.

This is a prototype, not production code. Static screens and their resources are the import acceptance scope. Existing standalone demo behavior is preserved, not extended or revalidated as a product implementation. Original annotations may describe earlier iterations and are not newly approved business rules. No Laka shared rules or UI baselines were updated.
