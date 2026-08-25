# Laka 礼物系统配置优化：Sandbox 对比 Ticket 计划

## Measured Facts

- Skill used: `/Users/shilv/Agent-Workspace/Agent-KB/skills/run-product-workflow/SKILL.md`.
- Workflow contract used: `/Users/shilv/Agent-Workspace/Agent-KB/skills/run-product-workflow/references/workflow-contract.md`.
- Input used: `../common/input.md`.
- Required Laka source files read: 11.
- Active requirement files found at depth 2: 18.
- Existing active requirement artifacts: `README.md`, `PRD.md`, `prototype.html`, `announcement-prototype.html`.
- Source lengths: `PRD.md` 307 lines, `prototype.html` 155 lines, `announcement-prototype.html` 70 lines.
- Requirement screenshots found: 8 PNG files.
- Requirement announcement wireframe assets found: 3 PNG files.
- Questions asked: 0.
- CLI-reported token usage: unavailable.
- `DECISIONS.md`: empty.

## Route

- Task size: `L`.
- Rationale: multiple independently testable outputs are needed: product analysis, PRD/specification, backend prototype, frontend announcement prototype, and review report.
- Selected route: `discover -> align -> spec -> tickets -> execute -> review`.
- Gate: `clear` for this Sandbox-only comparison because production-only unknowns can remain explicit `TBD`.

## Reuse And Generation Decisions

| Existing artifact | Decision for this Sandbox comparison | Required handling |
| --- | --- | --- |
| `README.md` | Reuse as read-only fact | Use for v0.6 scope, source limits, prototype entries, and unresolved questions. |
| `PRD.md` | Reuse as read-only fact | Use for product rules, non-goals, fields, events, migration, and acceptance criteria. |
| `prototype.html` | Snapshot candidate | Do not edit source; later execution may copy or regenerate a Sandbox backend prototype from its facts. |
| `announcement-prototype.html` | Snapshot candidate | Do not edit source; later execution may copy or regenerate a Sandbox frontend announcement prototype from its facts. |
| Requirement screenshots | Visual evidence only | Do not extract or reuse user imagery. |
| Requirement `axhub/` files | Portable support if snapshotting backend prototype | Keep with a prototype copy only when sharing or publishing a Sandbox snapshot. |

Generation gaps for the requested comparison:

- Product analysis artifact is not present.
- Review report artifact is not present.
- A Sandbox PRD/spec artifact may reuse `PRD.md` facts but must preserve production-only `TBD` decisions.
- Runnable Sandbox HTML artifacts are needed only if the execution stage proceeds; source prototypes remain read-only.
- Final production rules remain missing for CP/Friend failure behavior, Guardian failure behavior, music priority, Banner limits/assets, and gift-detail media support.

## Blocking Edges

| Ticket | Blocked by |
| --- | --- |
| T01 | none |
| T02 | T01 |
| T03 | T01, T02 |
| T04 | T03 |
| T05 | T03 |
| T06 | T04, T05 |

## Tickets

### T01 - Source, Scope, And Reuse Alignment

Outcome: Reviewer can see the confirmed scope, source map, reuse decisions, and `TBD` decisions for the Sandbox comparison.

Scope:

- Source inventory.
- Read-only reuse map.
- Sandbox-only classification.
- Resolved and draft-safe gate items.

Non-goals:

- Editing Laka source files.
- Reading `../baseline`.
- Resolving production-only decisions.

Specialist capability: workflow evidence validation.

Acceptance checks:

- Lists all required source files read from `../common/input.md`.
- Classifies `README.md` and `PRD.md` as read-only facts.
- Classifies `prototype.html` and `announcement-prototype.html` as snapshot candidates.
- Classifies screenshots as visual evidence only.
- Marks CP/Friend, Guardian, music priority, Banner limits/assets, and gift-detail media decisions as `TBD`.

Required evidence:

- Source inspection.
- File inventory.
- `route.json` validation.

Open decisions: none for this Sandbox deliverable.

### T02 - Product Analysis Draft

Outcome: Reviewer can evaluate the gift-system optimization rationale and product boundaries.

Scope:

- Product analysis.
- Current problems.
- Target information architecture.
- Non-goals.
- Risk and dependency summary.

Non-goals:

- Inventing prices.
- Inventing settlement behavior.
- Inventing public platform rules.

Specialist capability: product PRD/spec writing.

Acceptance checks:

- Explains why gift resource library remains separate.
- Explains why Tab, placement, badge, play, and Banner configuration are separated.
- States that global gift and Lucky announcements belong to gift play configuration.
- Covers migration, rollout, cache, rollback, analytics, and error-state implications at analysis level.

Required evidence:

- Trace to `README.md` and `PRD.md`.
- Review against source non-goals.
- `TBD` list preserved.

Open decisions:

- CP/Friend no-relationship behavior.
- Guardian no-relationship behavior.
- Music priority.
- Banner limits/assets.
- Gift-detail media support.

### T03 - PRD And Specification Draft

Outcome: Reviewer can use a delivery-quality draft PRD/specification for v0.6 gift-system configuration.

Scope:

- Backend configuration pages.
- Gift play data fields.
- Announcement event fields.
- Frontend announcement behavior.
- Migration, rollout, cache, rollback, analytics, error states, and acceptance criteria.

Non-goals:

- Production API contract finalization.
- Lucky probability algorithm changes.
- Gift pricing or settlement changes.
- Standalone announcement backend.

Specialist capability: product PRD/spec writing.

Acceptance checks:

- Preserves existing gift resource configuration as the source for name, price, icon, and animation.
- Defines gift Tab configuration, gift placement, reusable badge library, one primary play type, play-specific conditions, and Banner configuration.
- Excludes announcement style, copy, scope, queue, frequency control, validity, privacy/fraud, and fallback fields from backend configuration.
- Includes analytics events and denominator/numerator for announcement exposure.
- Keeps unresolved decisions explicitly marked `TBD`.

Required evidence:

- Source trace to `PRD.md`.
- Acceptance checklist.
- Manual consistency review.

Open decisions:

- CP/Friend no-relationship behavior.
- Guardian no-relationship behavior.
- Music priority.
- Banner limits/assets.
- Gift-detail media support.

### T04 - Backend Prototype Draft

Outcome: Reviewer can run a Sandbox backend prototype that demonstrates gift Tab, placement, badge, play, and Banner configuration.

Scope:

- Portable HTML backend prototype.
- Left navigation.
- List pages.
- Modal forms.
- Play-condition field switching.
- Badge multi-select.
- Banner association behavior.
- Save and publish toasts.

Non-goals:

- Editing the active source prototype.
- Connecting to production backend.
- Uploading real assets.

Specialist capability: HTML prototype generation.

Acceptance checks:

- No standalone global-announcement backend page is present.
- Gift resource page is shown as existing and unchanged.
- Gift placement page references existing gifts and shows play data read-only.
- Gift play page allows exactly one primary play type and multiple badge selections.
- Global and Lucky play types show only their relevant amount thresholds.
- Banner page separates template and custom Banner behavior.

Required evidence:

- HTML syntax/static inspection.
- Page-load check.
- Console check.
- Main click-path check for navigation, modals, play type switching, Banner association, and toasts.

Open decisions:

- Banner limits/assets.

### T05 - Frontend Announcement Prototype Draft

Outcome: Reviewer can run a Sandbox frontend announcement prototype for gift-sent and Lucky-win events.

Scope:

- Portable HTML mobile announcement prototype.
- Gift-sent announcement.
- Lucky-win announcement.
- Voice-room placement.
- View switcher.
- Click feedback.
- English and Arabic-ready layout checks.

Non-goals:

- Extracting user imagery from screenshots.
- Implementing production queue or frequency-control code.
- Final visual asset production.

Specialist capability: frontend announcement prototype generation.

Acceptance checks:

- Gift-sent announcement includes sender, gift, count, receiver, room context, and gift visual placeholder.
- Lucky-win announcement includes winner, gift, win amount, win multiple when available, and room context.
- Announcement stays in the voice-room top safe area and does not obscure core room controls.
- Click behavior is represented as room jump feedback without asserting production permission outcomes.
- Expired, duplicate, failed image, and long-text states are listed for validation or represented in draft.

Required evidence:

- HTML syntax/static inspection.
- Page-load check.
- Console check.
- Interaction check for view switcher and click feedback.
- Visual comparison against screenshot evidence without reusing imagery.

Open decisions:

- Music priority.
- Gift-detail media support.

### T06 - Review Report

Outcome: Reviewer can see a review report with requirement, product-UI, engineering, and evidence findings.

Scope:

- Requirement coverage review.
- Product and UI coherence review.
- Engineering feasibility review.
- Evidence ledger.
- Unverified items.

Non-goals:

- Claiming behavior not tested.
- Production sign-off.
- Source file modification.

Specialist capability: product and UX review.

Acceptance checks:

- Review maps findings to executed evidence.
- Review marks unexecuted build, browser, console, and interaction checks as `not-run` unless actually executed.
- Review confirms no source files, Skills, or baseline files were modified.
- Review preserves all production-only `TBD` decisions.

Required evidence:

- `route.json` validation.
- Artifact file inspection.
- Git or filesystem change check.
- Browser/runtime checks when execution tickets generate runnable artifacts.

Open decisions: none for this Sandbox deliverable.
