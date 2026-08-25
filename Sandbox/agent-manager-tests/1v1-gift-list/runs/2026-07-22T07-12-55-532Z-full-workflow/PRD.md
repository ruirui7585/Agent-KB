# PRD: Test-Only 1v1 Gift Wish List

## Draft Status

This PRD is a draft artifact for Agent Manager workflow validation only. It is not approved for production use and must remain inside the Sandbox run directory.

## 1. Background

In a mobile social product, a sender in a 1v1 relationship context may hesitate when choosing which gift to send because the recipient's preferences are unclear. This test feature lets a recipient select gifts they want and display that wish list in a 1v1 relationship context. The other user can view the list and initiate sending one selected gift.

The business goal is to validate whether clearer recipient preferences can reduce gift-selection uncertainty and improve gift initiation in a 1v1 relationship.

## 2. Goals

| ID | Goal | Success signal |
|---|---|---|
| G1 | Let recipients express desired gifts in a visible wish list. | Recipient can add at least one available gift to their list. |
| G2 | Let senders view recipient-selected gifts from a 1v1 context. | Sender can load and view the recipient's wish list. |
| G3 | Let senders initiate sending from a wish-list gift. | Sender can select a listed gift and reach send initiation. |
| G4 | Validate whether the wish list improves gift initiation. | Gift initiation rate from wish-list views can be measured. |

## 3. Non-Goals

- Production launch approval.
- Changes to Laka or any other formal project.
- Real payment, balance, refund, cancellation, delivery, or fulfillment implementation.
- Final pricing, currency, compliance, privacy, safety, age, or regional policy decisions.
- Final notification behavior or historical-data migration.
- Final decision on whether sent gifts are removed, retained, or marked as fulfilled.

## 4. Terminology

| Term | Definition |
|---|---|
| Recipient | The user who manages a personal gift wish list. |
| Sender | The other user who views the recipient's wish list in a 1v1 relationship context and initiates a gift send. |
| 1v1 relationship context | The product context where two users have an existing one-to-one relationship or interaction. Exact eligibility rules are TBD. |
| Available gift | A gift shown to the recipient as selectable for the wish list. Price, currency, and availability rules are TBD. |
| Wish-list item | A gift selected by the recipient for display to the sender. |
| Send initiation | The sender action that starts the downstream gift send flow. Payment, balance, refund, cancellation, and delivery behavior are TBD. |

## 5. Roles and Permissions

| Role | Confirmed permissions | TBD permissions and constraints |
|---|---|---|
| Recipient | View available gifts; add gifts to wish list; remove gifts from wish list. | Who is eligible to create a wish list; relationship, age, region, privacy, block, safety, or compliance restrictions. |
| Sender | View the recipient's wish list from a 1v1 context; select a wish-list gift; initiate send flow. | Who can view the list; whether blocked, reported, restricted, or non-relationship users are excluded. |
| System/Admin | Provide gift catalog, wish-list state, and send initiation service. | Backend ownership, moderation controls, operational tooling, and admin override behavior. |

## 6. User Stories

| ID | Role | User story | Priority |
|---|---|---|---|
| US1 | Recipient | As a recipient, I want to browse available gifts so I can choose what I would like to receive. | P0 |
| US2 | Recipient | As a recipient, I want to add gifts to my wish list so the other user can see my preferences. | P0 |
| US3 | Recipient | As a recipient, I want to remove gifts from my wish list so outdated preferences are no longer shown. | P0 |
| US4 | Sender | As a sender, I want to view the recipient's wish list in a 1v1 context so I can choose with less uncertainty. | P0 |
| US5 | Sender | As a sender, I want to select a listed gift and initiate sending so I can act on the recipient's preference. | P0 |

## 7. End-to-End Flows

### 7.1 Recipient Wish List Management

1. Recipient opens the wish-list management entry point.
2. System loads available gifts and current wish-list selections.
3. Recipient views available gifts and current selected state.
4. Recipient adds one gift to the wish list.
5. System saves the selection and shows the gift as selected.
6. Recipient removes a selected gift.
7. System saves the removal and updates the displayed wish-list state.

### 7.2 Sender Wish List View and Send Initiation

1. Sender enters a 1v1 relationship context with the recipient.
2. Sender opens or views the recipient's gift wish list.
3. System loads recipient-selected gifts.
4. Sender selects one gift from the list.
5. Sender taps the send action for that gift.
6. System initiates the downstream gift send flow.
7. Payment, confirmation, balance, refund, cancellation, delivery, and post-send wish-list changes remain TBD.

### 7.3 Edge and Recovery Flows

| Scenario | Expected behavior |
|---|---|
| Available gifts are loading | Show loading state; disable add/remove until data is ready. |
| Wish list is loading | Show loading state; disable send initiation until data is ready. |
| No available gifts | Show empty state for recipient; no add action is available. |
| Recipient has no selected gifts | Sender sees an empty wish-list state; send-from-wish-list action is unavailable. |
| Load fails | Show error state with retry. |
| Save add/remove fails | Keep prior confirmed state; show error and allow retry. |
| Send initiation fails | Keep selected gift visible; show error and allow retry. |
| Gift unavailable or disabled | Show disabled state and prevent selection/send initiation. Availability rules are TBD. |

## 8. Functional Requirements and Acceptance Criteria

| ID | Priority | Scenario | Requirement | Acceptance criteria | Notes |
|---|---|---|---|---|---|
| FR1 | P0 | Recipient opens management view | System must load available gifts and recipient's current wish-list selections. | Given recipient opens the view, when data loads successfully, then available gifts and selected states are displayed. | Entry point location is TBD. |
| FR2 | P0 | Recipient views catalog | System must display available gifts with enough information to identify each gift. | Given available gifts exist, when the view loads, then each gift is visible and selectable unless disabled. | Price and currency are TBD. |
| FR3 | P0 | Recipient adds gift | Recipient must be able to add an available gift to the wish list. | Given a gift is available and not already selected, when recipient taps add, then system saves it and shows selected state. | Duplicate-item rules are TBD; default UI should prevent repeated taps during request. |
| FR4 | P0 | Recipient removes gift | Recipient must be able to remove a selected gift from the wish list. | Given a gift is selected, when recipient taps remove, then system saves removal and no longer shows it as selected. | Post-remove ordering rules are TBD. |
| FR5 | P0 | Sender opens recipient list | System must load the recipient's selected gifts from the 1v1 context. | Given sender is in a valid 1v1 context, when the list is opened, then recipient-selected gifts are displayed. | Valid 1v1 permission rules are TBD. |
| FR6 | P0 | Sender selects wish-list gift | Sender must be able to select one visible, available wish-list gift. | Given a gift is visible and enabled, when sender taps it, then it becomes the selected gift for send initiation. | Multi-select behavior is TBD; current scope covers one gift. |
| FR7 | P0 | Sender initiates send | Sender must be able to initiate the send flow for a selected wish-list gift. | Given a gift is selected, when sender taps send, then system starts send initiation and shows loading/success/error state. | Downstream payment and delivery are TBD. |
| FR8 | P0 | Loading states | System must show loading states for catalog, wish-list, add/remove, and send initiation requests. | Given an async request is pending, when user views the surface, then relevant actions are disabled until completion. | Loading duration thresholds are TBD. |
| FR9 | P0 | Empty states | System must show empty states for no available gifts and no recipient wish-list items. | Given no data exists, when the relevant view loads, then an empty state appears and unavailable actions are hidden or disabled. | Empty-state copy is implementation/prototype-level. |
| FR10 | P0 | Error and retry | System must show error states and retry affordances for failed load and action requests. | Given a request fails, when the error is shown, then user can retry without losing prior confirmed state. | Retry limits are TBD. |
| FR11 | P1 | Disabled gifts | System must prevent selection or sending of disabled/unavailable gifts. | Given a gift is disabled, when sender or recipient views it, then the primary action is disabled and state is visible. | Source of disabled state is TBD. |
| FR12 | P1 | Duplicate action handling | System must prevent duplicate submissions while add/remove/send-initiation is pending. | Given a request is pending, when user taps the same action repeatedly, then only one request should be submitted. | Idempotency key behavior is TBD. |
| FR13 | P1 | Success state | System must confirm successful add, remove, and send initiation actions. | Given an action succeeds, when the response returns, then the UI reflects the new state and does not show stale pending state. | Toast vs inline confirmation is TBD. |

## 9. State Matrix and Transitions

### 9.1 Recipient Wish List Management

| State | Entry condition | Allowed actions | Transition on success | Transition on failure |
|---|---|---|---|---|
| Initial | View opened | Start loading | Loading | Error |
| Loading | Catalog or wish-list request pending | None; actions disabled | Loaded with items or Empty | Error |
| Loaded with items | Catalog loaded and at least one gift available | Add, remove, refresh | Saving add/remove or Loaded with updated state | Error with prior confirmed state |
| Empty catalog | Catalog loaded with no available gifts | Refresh | Loading | Error |
| Empty wish list | Catalog exists but recipient has selected no gifts | Add, refresh | Saving add | Error with prior confirmed state |
| Saving add | Add request pending | Disable same gift action | Loaded with updated selected state | Error with prior confirmed state |
| Saving remove | Remove request pending | Disable same gift action | Loaded with updated selected state | Error with prior confirmed state |
| Error | Load or save failed | Retry, back/close | Loading or prior loaded state | Error |

### 9.2 Sender Wish List View

| State | Entry condition | Allowed actions | Transition on success | Transition on failure |
|---|---|---|---|---|
| Initial | Sender opens list from 1v1 context | Start loading | Loading | Error |
| Loading | Wish-list request pending | None; send disabled | Loaded with items or Empty | Error |
| Empty | Recipient has no selected gifts | Refresh, back/close | Loading | Error |
| Loaded with items | Wish list loaded with one or more gifts | Select enabled gift, refresh | Gift selected | Error |
| Gift selected | Sender selected one enabled gift | Initiate send, change selection | Send initiating | Error |
| Send initiating | Send initiation request pending | Disable send and duplicate taps | Send initiated | Error with selected gift retained |
| Send initiated | Send initiation succeeds | Continue to downstream flow | TBD | TBD |
| Error | Load or send initiation failed | Retry, back/close | Loading or prior selected state | Error |

## 10. Data and Backend Configuration Fields

### 10.1 Data Objects

| Object | Field | Type | Required | Description | Status |
|---|---|---|---|---|---|
| Gift | gift_id | string | Yes | Stable gift identifier. | Required |
| Gift | display_name | string | Yes | Gift name shown in English UI. | Required |
| Gift | image_url | string | TBD | Gift image or icon source. | TBD |
| Gift | price_amount | number | TBD | Gift price. | TBD |
| Gift | price_currency | string | TBD | Gift currency. | TBD |
| Gift | availability_status | enum | Yes | available, disabled, unavailable. | Required |
| Gift | disabled_reason | string | TBD | Reason shown or logged when unavailable. | TBD |
| WishListItem | wish_list_item_id | string | Yes | Stable wish-list row identifier. | Required |
| WishListItem | recipient_user_id | string | Yes | Owner of the wish-list item. | Required |
| WishListItem | gift_id | string | Yes | Gift selected by recipient. | Required |
| WishListItem | created_at | timestamp | Yes | Add time. | Required |
| WishListItem | updated_at | timestamp | TBD | Last update time. | TBD |
| WishListItem | sort_order | number | TBD | Item ordering. | TBD |
| WishListItem | fulfillment_status | enum | TBD | Whether sent gifts are retained, removed, or marked fulfilled. | TBD |
| 1v1Context | context_id | string | Yes | Identifier for the relationship/session context. | Required |
| 1v1Context | sender_user_id | string | Yes | Viewing/sending user. | Required |
| 1v1Context | recipient_user_id | string | Yes | Wish-list owner. | Required |
| SendInitiation | initiation_id | string | TBD | Identifier for send initiation. | TBD |
| SendInitiation | gift_id | string | Yes | Gift selected for send initiation. | Required |
| SendInitiation | source | enum | Yes | Must include wish_list. | Required |

### 10.2 Backend Configuration

| Config | Purpose | Value |
|---|---|---|
| wish_list_enabled | Enable or disable the test feature. | TBD |
| eligible_user_scope | Defines which users can create/view wish lists. | TBD |
| max_wish_list_items | Limit selected gifts per recipient. | TBD |
| wish_list_sort_rule | Ordering of selected gifts. | TBD |
| duplicate_gift_policy | Whether the same gift can appear more than once. | TBD |
| unavailable_gift_policy | Behavior when a selected gift becomes unavailable. | TBD |
| post_send_item_policy | Remove, retain, or mark item after send. | TBD |
| analytics_enabled | Enable event logging for experiment measurement. | TBD |
| retry_policy | Retry limit and backoff for load/save/send initiation. | TBD |

## 11. Error, Empty, Loading, Permission, Timeout, Retry, and Duplicate Handling

| Handling type | Requirement | Acceptance criteria |
|---|---|---|
| Loading | Show visible loading state for catalog, wish-list, save, and send initiation requests. | User can distinguish pending state and cannot trigger duplicate action. |
| Empty catalog | Recipient sees that no gifts are available. | Add action is unavailable. |
| Empty wish list | Sender sees that recipient has no selected gifts. | Send-from-wish-list action is unavailable. |
| Error | Show error state for failed load, add, remove, or send initiation. | Prior confirmed state remains intact; retry is available where relevant. |
| Permission | If user lacks access, prevent wish-list view or management. | Exact permission rules and copy are TBD. |
| Timeout | Treat timeout as request failure. | Timeout duration and retry policy are TBD. |
| Retry | Allow retry for failed load and failed action requests. | Retry limit, backoff, and idempotency are TBD. |
| Duplicate action | Disable action while request is pending. | Multiple taps on same pending action do not create multiple visible results. Backend idempotency is TBD. |
| Disabled gift | Prevent add/select/send when a gift is disabled or unavailable. | User sees disabled state; detailed reason display is TBD. |

## 12. Analytics Events

All events are draft requirements for measurement. Final event naming conventions, logging pipeline, and privacy rules are TBD.

| Event name | Timing | Required properties | User scope | Numerator | Denominator |
|---|---|---|---|---|---|
| wish_list_manage_view | Recipient management surface is displayed after initial request starts or succeeds. | recipient_user_id, context_id TBD, load_status, gift_count, selected_count | Recipient | Recipients who view management surface | Eligible recipients exposed to entry point |
| gift_catalog_load_result | Catalog load completes. | recipient_user_id, status, gift_count, error_code if failed | Recipient | Failed or successful catalog loads | Total catalog load attempts |
| wish_list_item_add_tap | Recipient taps add on a gift. | recipient_user_id, gift_id, selected_count_before | Recipient | Add attempts | Management surface views |
| wish_list_item_add_result | Add request completes. | recipient_user_id, gift_id, status, error_code if failed, selected_count_after | Recipient | Successful add actions | Add attempts |
| wish_list_item_remove_tap | Recipient taps remove on a gift. | recipient_user_id, gift_id, selected_count_before | Recipient | Remove attempts | Management surface views with selected items |
| wish_list_item_remove_result | Remove request completes. | recipient_user_id, gift_id, status, error_code if failed, selected_count_after | Recipient | Successful remove actions | Remove attempts |
| wish_list_view | Sender wish-list surface is displayed from 1v1 context. | sender_user_id, recipient_user_id, context_id, item_count, load_status | Sender | Senders who view wish list | Eligible sender 1v1 contexts with wish-list entry exposure |
| wish_list_gift_select | Sender selects a visible wish-list gift. | sender_user_id, recipient_user_id, context_id, gift_id, item_count | Sender | Senders who select a gift | Senders who view wish list |
| wish_list_send_initiate_tap | Sender taps send for selected wish-list gift. | sender_user_id, recipient_user_id, context_id, gift_id | Sender | Send initiation attempts | Gift selections |
| wish_list_send_initiate_result | Send initiation request completes. | sender_user_id, recipient_user_id, context_id, gift_id, status, error_code if failed | Sender | Successful send initiations | Send initiation attempts |
| wish_list_error_view | Error state is displayed. | user_id, role, context_id TBD, surface, operation, error_code | Recipient or Sender | Error views | Related operation attempts |

## 13. Metrics

| Metric type | Metric | Definition | Expected direction | Notes |
|---|---|---|---|---|
| Primary | Gift initiation rate from 1v1 wish-list view | Numerator: successful `wish_list_send_initiate_result`; denominator: `wish_list_view` by sender. | Increase | Exact user/session deduplication window is TBD. |
| Primary | Gift-selection uncertainty reduction proxy | Numerator: senders who initiate from wish list without opening additional gift browsing surfaces; denominator: senders who view wish list. | Increase | Requires existing browsing events or new instrumentation; direct uncertainty measurement is TBD. |
| Secondary | Recipient wish-list creation rate | Numerator: recipients with at least one successful add; denominator: eligible recipients exposed to management entry. | Increase | Eligibility is TBD. |
| Secondary | Sender wish-list engagement rate | Numerator: `wish_list_gift_select`; denominator: `wish_list_view`. | Increase | Deduplicate by sender/context TBD. |
| Secondary | Add success rate | Numerator: successful add results; denominator: add attempts. | Stable/high | Backend error classification TBD. |
| Secondary | Remove success rate | Numerator: successful remove results; denominator: remove attempts. | Stable/high | Backend error classification TBD. |
| Guardrail | Wish-list load error rate | Numerator: failed wish-list loads; denominator: total wish-list load attempts. | No increase | Alert threshold TBD. |
| Guardrail | Catalog load error rate | Numerator: failed catalog loads; denominator: total catalog load attempts. | No increase | Alert threshold TBD. |
| Guardrail | Disabled/unavailable gift selection rate | Numerator: visible gifts that cannot be selected or sent; denominator: visible wish-list gifts. | Monitor | Availability policy TBD. |

## 14. Compatibility, Migration, Rollout, and Rollback

| Area | Requirement or consideration | Status |
|---|---|---|
| Compatibility | Mobile social product UI in English. | Confirmed |
| Compatibility | Platform-specific differences, app version support, and device support. | TBD |
| Migration | Existing gift preferences or historical gift data migration. | TBD |
| Migration | Behavior for existing wish-list data if feature is disabled. | TBD |
| Rollout | Test-only rollout scope, population, duration, and baseline. | TBD |
| Rollout | Feature flag or backend config should be available to control exposure. | TBD |
| Rollback | Ability to hide entry points and prevent new add/send initiation from wish list. | TBD |
| Rollback | Treatment of already-created wish-list data after rollback. | TBD |

## 15. Dependencies

- Gift catalog source that can return available/disabled/unavailable gifts.
- Wish-list storage and retrieval API.
- 1v1 relationship context and eligibility check.
- Downstream gift send initiation flow.
- Frontend surfaces for recipient management and sender viewing.
- Analytics logging for view, add, remove, select, send initiation, and error events.
- Product decisions on permissions, pricing, limits, ordering, availability, post-send state, notifications, and compliance.

## 16. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Sender interprets wish list as pressure or obligation. | May reduce relationship comfort or cause negative sentiment. | TBD: UX wording and visibility controls. |
| Privacy or safety rules are undefined. | Users may see lists they should not access. | Keep permission rules TBD; do not launch without policy decision. |
| Pricing or availability changes make the list unreliable. | Sender may fail to send selected gifts. | Show disabled/unavailable states; final policy TBD. |
| Post-send state is unclear. | Recipient and sender may misunderstand whether gift is still desired. | Mark behavior TBD until decision is made. |
| Analytics cannot isolate wish-list impact. | Test may not validate business goal. | Define event coverage and experiment scope before real rollout. |
| Duplicate taps create duplicate requests. | May cause data inconsistency or repeated send attempts. | Disable pending actions; backend idempotency TBD. |

## 17. Assumptions

- This is a draft-only validation artifact.
- The sender and recipient are already in a valid 1v1 context before sender viewing occurs; exact validation rules are TBD.
- A downstream gift send flow exists or can be represented as send initiation for this test.
- UI language is English.
- The prototype and review outputs will remain inside the Sandbox run directory.

## 18. Open Decisions

| Decision | Impact | Owner | Status |
|---|---|---|---|
| Gift prices and currency | Affects gift cards, sender confidence, and payment handoff. | Product/Monetization TBD | TBD |
| Who can create a wish list | Affects eligibility, privacy, and rollout. | Product/Policy TBD | TBD |
| Who can view a wish list | Affects 1v1 access control and safety. | Product/Policy TBD | TBD |
| Wish-list item limits | Affects UX, storage, and moderation. | Product/Engineering TBD | TBD |
| Wish-list ordering rules | Affects recipient expression and sender browsing. | Product TBD | TBD |
| Balance, payment, refund, cancellation, and delivery behavior | Affects downstream send flow and compliance. | Product/Payments TBD | TBD |
| Regional, age, safety, privacy, and compliance restrictions | Affects eligibility and launch scope. | Policy/Legal TBD | TBD |
| Post-send item behavior | Affects list state after send initiation or completion. | Product TBD | TBD |
| Notification behavior | Affects engagement and privacy. | Product TBD | TBD |
| Historical-data migration | Affects compatibility and rollback. | Engineering/Product TBD | TBD |
| Experiment design | Affects validation of business goal. | Product/Data TBD | TBD |

