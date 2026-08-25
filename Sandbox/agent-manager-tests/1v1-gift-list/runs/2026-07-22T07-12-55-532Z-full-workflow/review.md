# Review: Test-Only 1v1 Gift Wish List

## Overall Readiness Score

**Score: 62 / 100**

Rationale: The draft is strong enough for an internal concept review and Agent Manager workflow validation. It covers the core recipient and sender flows, preserves the input's intentionally undecided items as TBD, and provides a locally runnable prototype with loading, empty, error, disabled, and success states. It is not ready for engineering implementation, production experimentation, or release planning because access control, compliance, pricing, downstream gift-send behavior, experiment design, and several backend contracts remain unresolved. A score is not approval to publish.

## Blocking Issues

- **Blocker**: Permission and eligibility rules are undefined. The PRD marks who can create or view a wish list, relationship eligibility, block/report restrictions, age, region, privacy, safety, and compliance as TBD. This blocks any real implementation because exposing a personal wish list in a 1v1 context has privacy and safety implications.
- **Blocker**: Downstream send flow boundary is too vague for engineering handoff. The PRD stops at send initiation, but does not define the required handoff contract to payment, balance, confirmation, delivery, cancellation, refund, or failure handling. Even if downstream behavior remains out of scope, the initiation API contract and failure states need a minimum definition.
- **Blocker**: Experiment design is not defined. The business goal is to validate uncertainty reduction and gift initiation lift, but population, baseline, exposure rules, duration, deduplication, and success thresholds are all TBD. Without this, the test cannot prove or disprove the stated business goal.
- **High**: Pricing and currency are omitted by design, but gift sending decisions usually depend on value and affordability. The prototype shows "Price TBD"; this is acceptable for draft status but blocks sender-confidence validation.

## Product Gaps

- **High**: Recipient motivation and social pressure are under-specified. The PRD notes sender obligation risk, but does not define UX copy, visibility controls, opt-out, or ways to prevent the list from feeling coercive.
- **High**: Wish-list ownership and visibility settings are missing. Users may need controls for hiding the list, removing it from specific relationships, or limiting display to active relationships only.
- **High**: Item limits and ordering are TBD. This affects recipient expression, sender scanning, storage, and abuse prevention.
- **Medium**: No entry point is defined for either recipient management or sender viewing. The PRD correctly marks recipient entry point as TBD, but the prototype assumes tabs rather than a realistic mobile navigation context.
- **Medium**: Post-send item behavior is unresolved. Retain, remove, mark fulfilled, or allow repeated gifts each imply different user expectations and analytics interpretation.
- **Medium**: No notification policy is defined for list edits, views, selection, send initiation, or send success.
- **Low**: Gift catalog content is represented with sample names only. That is fine for workflow validation, but not enough for realistic UX testing.

## Engineering Feasibility Risks

- **Blocker**: Backend ownership and API contracts are not sufficiently specified. Required services include gift catalog, wish-list storage, 1v1 eligibility, and send initiation, but endpoint shape, request/response contracts, authorization checks, and error codes are missing.
- **High**: Idempotency is only marked TBD. Duplicate add/remove/send initiation behavior needs backend-level protection, not only disabled frontend buttons.
- **High**: Availability and price changes are not defined. A gift can become disabled, unavailable, removed, or repriced after the recipient adds it; the system needs a clear policy for display, send blocking, and stale data.
- **High**: Feature flag and rollback behavior are incomplete. The PRD mentions feature configuration, but does not define what happens to existing wish-list data after rollback or feature disablement.
- **Medium**: Data model lacks lifecycle fields needed for auditing and recovery, such as deleted_at, created_by, last_visible_at, source surface, and fulfillment transition timestamps.
- **Medium**: Timeout, retry, and backoff are TBD. These need minimum defaults before implementation to avoid inconsistent client behavior.

## State, Permission, and Edge-Case Gaps

- **Blocker**: Permission denial states are not represented in the prototype. The PRD mentions permission handling, but the prototype only displays a notice that eligibility is TBD.
- **High**: Blocked, reported, muted, restricted, deleted, suspended, underage, region-restricted, or non-relationship users are not covered by state matrices.
- **High**: Concurrent modification is not addressed. Sender may view a wish-list gift while the recipient removes it or while the catalog disables it.
- **High**: The difference between "empty catalog" and "empty wish list" is blurred in the prototype controls. Recipient empty mode says no available gifts, while the toolbar also supports clearing selected gifts.
- **Medium**: Partial failure is not covered. Catalog may load while wish-list state fails, or wish-list state may load while gift details fail.
- **Medium**: Offline or network-reconnect behavior is not defined.
- **Medium**: Save failure recovery says prior state is preserved, but the PRD does not define whether optimistic updates are allowed.
- **Low**: Accessibility states are basic. The prototype has some semantic labels, but does not fully cover focus return after modal close or keyboard operation for all interactive states.

## Analytics and Measurement Gaps

- **Blocker**: No experiment framework is defined. Required decisions include control group, treatment exposure, eligible population, randomization unit, holdout rules, duration, minimum detectable effect, and decision thresholds.
- **High**: Deduplication rules are TBD for primary and secondary metrics. Metrics need user scope, session/context scope, numerator, denominator, deduplication rule, and time window.
- **High**: The uncertainty-reduction proxy depends on existing gift-browsing events, but those dependencies are not confirmed.
- **High**: Exposure events are incomplete. The PRD needs a distinct entry exposure event before `wish_list_view` and `wish_list_manage_view` to measure funnel eligibility.
- **Medium**: Error taxonomy is not defined. Analytics events include `error_code`, but there is no standard error-code list for permission, catalog, save, availability, send initiation, timeout, or downstream failure.
- **Medium**: Guardrail thresholds are TBD. Load error rate, disabled selection rate, and negative sentiment/reporting impact need explicit thresholds.
- **Medium**: Privacy constraints for logging user IDs, gift IDs, and relationship context IDs are TBD.

## PRD-to-Prototype Inconsistencies

- **High**: PRD includes permission handling, but the prototype does not include a permission-denied state or access-blocked flow.
- **High**: PRD requires error and retry for failed add/remove/send initiation, but the prototype mainly simulates generic error mode and successful retry; it does not demonstrate action-specific save/send failure while preserving prior state.
- **Medium**: PRD separates recipient no-available-gifts and sender no-selected-gifts empty states; the prototype has state controls but also uses "Clear selected" inside recipient management, which can confuse empty catalog vs empty wish list.
- **Medium**: PRD says disabled gifts should prevent add/select/send. The prototype does this visually, but disabled action click behavior cannot be tested because disabled buttons do not fire the disabled toast path.
- **Medium**: PRD lists analytics events, but the prototype does not expose event names, event logs, or measurement instrumentation for review.
- **Low**: PRD describes a 1v1 relationship context, while the prototype uses a two-tab role switcher. This is acceptable for a local draft, but not representative enough for user testing.

## Assumptions Requiring User Confirmation

- **Blocker**: Confirm who is eligible to create a wish list and who can view it.
- **Blocker**: Confirm relationship, block, report, mute, privacy, age, region, and compliance restrictions.
- **Blocker**: Confirm the downstream send-initiation contract and where this feature stops.
- **High**: Confirm gift prices, currency display, and whether price changes affect existing wish-list items.
- **High**: Confirm item limits, duplicate policy, and ordering/sort rules.
- **High**: Confirm whether sent gifts are retained, removed, or marked fulfilled.
- **High**: Confirm experiment population, baseline, success threshold, and measurement window.
- **Medium**: Confirm notification behavior for add, remove, view, selection, send initiation, send success, and failure.
- **Medium**: Confirm whether existing gift preferences or history need migration.
- **Medium**: Confirm rollback behavior for existing wish-list data.

## Recommended Next Actions

1. **Blocker**: Resolve permission, privacy, safety, age, region, block/report, and 1v1 eligibility rules before any implementation planning.
2. **Blocker**: Define the send-initiation API boundary, including request payload, response states, idempotency key, downstream handoff, and error codes.
3. **Blocker**: Define experiment design: target population, control/treatment logic, exposure event, success threshold, duration, deduplication, and measurement window.
4. **High**: Decide pricing and currency display policy, including what happens when price or availability changes after an item is added.
5. **High**: Decide wish-list item limit, duplicate policy, ordering, and post-send item behavior.
6. **High**: Add permission-denied, action-failure, stale/unavailable, and concurrent-change scenarios to the PRD state matrix and prototype.
7. **High**: Complete analytics specs with event trigger timing, required properties, denominator source, deduplication rules, error taxonomy, and privacy constraints.
8. **Medium**: Define realistic recipient and sender entry points in the 1v1 product surface.
9. **Medium**: Add feature flag, rollback, and data-retention behavior for test shutdown.
10. **Low**: Improve prototype review fidelity with visible event logs and separate controls for empty catalog, empty wish list, load error, save error, send error, and permission denied.
