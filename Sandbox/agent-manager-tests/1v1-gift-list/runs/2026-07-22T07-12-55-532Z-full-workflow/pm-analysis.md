# PM Analysis: Test-Only 1v1 Gift Wish List

## Draft Status

This is a draft analysis for Agent Manager workflow validation only. It is not approved for production use and must remain inside the Sandbox run directory.

## Problem Statement

### Confirmed Facts

In a mobile social product, gift senders in a 1v1 relationship context may face uncertainty when choosing which gift to send. The proposed test feature lets a recipient select gifts they want and display that wish list in the 1v1 relationship context so the other user can view the list and initiate sending one of the selected gifts.

### Inferences

The product problem is likely that gift sending can be blocked or delayed when the sender is unsure what the recipient would value. A visible recipient-curated wish list may reduce decision friction and increase confidence before gift initiation.

## Target Users and Scenarios

### Confirmed Facts

- Recipient: manages a personal gift wish list.
- Sender: views the recipient's list during a 1v1 relationship interaction and chooses a gift.
- Platform: mobile social product.
- UI language: English.

### Inferences

- Recipient scenario: the recipient browses available gifts, selects preferred gifts, and updates the list over time.
- Sender scenario: the sender is interacting with the recipient in a 1v1 relationship context, opens or sees the recipient's wish list, selects a listed gift, and initiates the send flow.
- The feature is intended for a relationship-based interaction rather than a broad public gift registry.

## User Value and Business Goal

### Confirmed Facts

- User value for recipients: recipients can communicate gift preferences directly.
- User value for senders: senders can view the recipient's selected gifts and initiate gift sending with less uncertainty.
- Business goal: validate whether clearer recipient preferences can reduce gift-selection uncertainty and improve gift initiation in a 1v1 relationship.

### Inferences

- Recipient value may include feeling better understood and having more control over desired gifts.
- Sender value may include faster gift choice, higher confidence, and fewer abandoned gift attempts.
- Business value may come from higher gift initiation rate, improved conversion from gift browsing to send initiation, and potentially stronger 1v1 engagement.

## Scope and Non-Goals

### In Scope for This Test

- Recipient can view available gifts.
- Recipient can add gifts to their wish list.
- Recipient can remove gifts from their wish list.
- Sender can view the recipient's wish list from a 1v1 context.
- Sender can select a wish-list gift and initiate the send flow.
- Loading, empty, error, disabled, and success states should be considered where relevant.
- Outputs are limited to product analysis, PRD, locally runnable HTML prototype, and review report.

### Non-Goals and Out of Scope

- Production launch approval.
- Changes to Laka or any other formal project.
- Real payment, balance, refund, cancellation, or delivery implementation.
- Final compliance, privacy, safety, age, or regional policy decisions.
- Final pricing, currency, permission, state-machine, migration, or notification decisions.

### Open Scope Boundaries

- Gift prices and currency are TBD.
- Who can create or view a wish list is TBD.
- Wish-list item limits and ordering rules are TBD.
- Whether sent gifts are removed, retained, or marked as fulfilled is TBD.
- Notification behavior and historical-data migration are TBD.

## Primary User Flow

### Recipient Flow

1. Recipient opens the wish list management entry point.
2. System loads available gifts and current wish-list selections.
3. Recipient views available gifts.
4. Recipient adds one or more gifts to the wish list.
5. System confirms the added state.
6. Recipient removes a gift if they no longer want it listed.
7. System confirms the removed state and updates the visible list.

### Sender Flow

1. Sender enters or is already in a 1v1 relationship context with the recipient.
2. Sender opens or views the recipient's gift wish list.
3. System loads the recipient's selected gifts.
4. Sender selects one gift from the wish list.
5. Sender initiates the existing or future send flow for that gift.
6. System shows a success, disabled, loading, empty, or error state as relevant.

### Confirmed vs. Inferred

- Confirmed: add, remove, view, select, and initiate send are required.
- Inferred: the send flow may be an existing downstream flow, but its payment and completion behavior is not defined in the input and should remain TBD.

## Functional Breakdown

### Recipient Wish List Management

- Show available gifts.
- Show current wish-list state.
- Add a gift to the wish list.
- Remove a gift from the wish list.
- Prevent duplicate add actions for the same gift, if duplicate items are not allowed. This is an inference and should be confirmed.
- Show empty state when no gifts are available or no gifts are selected.
- Show loading state while gifts or selections are being fetched.
- Show error state when available gifts or wish-list state cannot be loaded or saved.
- Show success state after add or remove actions.

### Sender Wish List Viewing

- Provide access to the recipient's wish list from a 1v1 relationship context.
- Show the recipient's selected gifts.
- Show empty state if the recipient has no selected gifts.
- Show loading state while the wish list is being fetched.
- Show error state if the wish list cannot be loaded.
- Show disabled state when a gift cannot be selected or send initiation is unavailable.

### Gift Send Initiation

- Allow sender to select a gift from the recipient's wish list.
- Allow sender to initiate the send flow for the selected gift.
- Show loading state during send initiation.
- Show success state after send initiation succeeds.
- Show error state if send initiation fails.
- Do not define payment, balance, refund, cancellation, delivery, fulfillment, or post-send list updates until requirements are confirmed.

### Data and State Concepts

- Available gift catalog.
- Recipient wish-list items.
- 1v1 relationship context.
- Selected gift for send initiation.
- UI states: loading, empty, error, disabled, success.

## Success Metrics

### Primary Metrics

- Gift initiation rate from 1v1 wish-list view
  - Numerator: number of sessions or users where the sender initiates sending a gift from the recipient's wish list.
  - Denominator: number of sessions or users where the sender views the recipient's wish list in a 1v1 context.

- Gift-selection uncertainty reduction proxy
  - Numerator: number of senders who initiate a gift send after viewing the wish list without opening additional gift browsing surfaces, if such events exist.
  - Denominator: number of senders who view the recipient's wish list.
  - Note: direct uncertainty measurement would require survey, hesitation-time, or behavioral proxy definitions that are not confirmed.

### Supporting Metrics

- Recipient wish-list creation rate
  - Numerator: number of eligible recipients who add at least one gift to their wish list.
  - Denominator: number of eligible recipients exposed to the wish-list management entry point.

- Wish-list add success rate
  - Numerator: number of successful add actions.
  - Denominator: number of add attempts.

- Wish-list remove success rate
  - Numerator: number of successful remove actions.
  - Denominator: number of remove attempts.

- Sender wish-list engagement rate
  - Numerator: number of senders who select a gift from the recipient's wish list.
  - Denominator: number of senders who view the recipient's wish list.

- Send initiation success rate
  - Numerator: number of successful send initiation events from a wish-list gift.
  - Denominator: number of send initiation attempts from a wish-list gift.

### Guardrail Metrics

- Wish-list load error rate
  - Numerator: number of failed wish-list load attempts.
  - Denominator: total wish-list load attempts.

- Gift catalog load error rate
  - Numerator: number of failed available-gift load attempts.
  - Denominator: total available-gift load attempts.

- Disabled or unavailable gift selection rate
  - Numerator: number of visible wish-list gifts that cannot be selected or sent.
  - Denominator: number of visible wish-list gifts.

## Risks, Dependencies, Assumptions, and Open Questions

### Risks

- Sender may interpret the wish list as an obligation rather than a helpful preference signal.
- Recipient may expect all selected gifts to be available, sendable, and priced consistently, but availability and pricing are TBD.
- If visibility rules are unclear, wish-list exposure could create privacy or safety issues.
- If sent-gift behavior is unclear, recipients and senders may misunderstand whether an item remains desired after a send.
- Gift catalog availability, disabled states, or pricing changes could make the list feel unreliable.

### Dependencies

- Available gift catalog source.
- Wish-list storage and retrieval mechanism.
- 1v1 relationship context entry point.
- Gift send initiation flow.
- UI state handling for loading, empty, error, disabled, and success states.
- Analytics events for view, add, remove, select, and send initiation.

### Assumptions

- The feature is test-only and draft-only.
- The sender and recipient are already in a valid 1v1 relationship context before sender viewing occurs.
- A gift send flow exists or will be represented as a downstream initiation step for this workflow.
- The prototype can model payment-related steps as TBD without implementing real payment behavior.
- English UI copy is acceptable for this test.

### Open Questions

- Pricing and currency: What prices should be displayed, if any, and in which currency?
- Permissions: Who can create a wish list, who can view it, and are there role, relationship, block, or privacy restrictions?
- Compliance: Are there regional, age, safety, privacy, or content restrictions for wish-list creation, viewing, or gifting?
- Limits and ordering: How many gifts can be added, and how should the wish list be sorted?
- Availability: What happens if a selected gift becomes unavailable, disabled, removed, or price-changed?
- Payment and balance: What balance, payment, top-up, refund, cancellation, and failure behaviors apply after send initiation?
- Delivery and fulfillment: What does it mean for a gift to be delivered or completed?
- Post-send state: After a gift is sent, is the gift removed, retained, duplicated, or marked as fulfilled?
- Notifications: Should recipients or senders receive notifications for add, remove, view, selection, send initiation, send success, or failure events?
- Migration: Are there existing gift preferences or historical gift data that need to be migrated or displayed?
- Abuse prevention: Are there anti-spam, harassment, pressure, or reporting requirements for wish-list exposure?
- Experiment design: What population, duration, and comparison baseline should be used to validate impact?
