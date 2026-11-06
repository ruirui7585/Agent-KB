# Room PK — prototype import scope

Status: Draft scope record. Product status: Proposed. Updated: 2026-10-14.

## Objective and source

Import the current user-selected Salfa Room PK HTML gallery into Laka active requirements. Preserve the current visual output and supporting assets. This record describes the import only; it does not replace a production PK PRD or establish new business rules.

## Included screens

- 01. PK Entry
- 02. Duration
- 03. Finding Teams
- 04. Live PK
- 05. Score Up
- 06. Big Gift
- 07. Lead Change
- 08. Countdown Zoom
- 09. Final Sprint
- 10. Restart
- 11. End Options
- 12. Home Screen
- 13. 12-Seat PK
- 14. Switch to Blue Team
- 15. Turn Off PK
- 16. Reset PK
- 17. PK System Messages
- 18. 90% vs 10%
- 19. PK History
- 20. 2v2 PK
- 21. 8v8 PK
- 22. 8v8 — 6 per Row

## Delivery and review

Use `index.html` as the review entry. The gallery retains its existing screen-preview links and embedded static views. All resources are local relative paths. Screens, styles, renderer logic, sample data, and existing annotation data are carried over from the source.

## Non-goals

No new business interactions, APIs, analytics, permissions, score-settlement rules, or product-baseline updates. No changes to the source package or unrelated Laka requirements.

## Acceptance

- All 22 gallery screens display from the imported directory.
- Required HTML, CSS, JavaScript, images, and annotations load locally.
- Styles, screen renderer, and images match the source snapshot.
- The package can be moved as a complete folder without source-directory dependencies.

## Implementation questions outside this import

Production PK behavior and implementation readiness require a separate confirmed specification. Existing source annotations and sample data remain prototype references, not newly approved product rules.
