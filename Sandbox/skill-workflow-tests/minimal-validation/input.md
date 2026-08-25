# Product requirement

Design a test-only 1v1 gift wish list for a mobile social product.

A recipient can select gifts they want and display the list in a 1v1 relationship context. The other user can view the list and initiate sending one of the selected gifts.

## Test status

This is a workflow-routing validation only. All outputs are drafts and must remain in this Sandbox directory. Do not read from or modify any formal project.

## Business goal

Validate whether clearer recipient preferences can reduce gift-selection uncertainty and improve gift initiation in a 1v1 relationship.

## Minimum scope

- Recipient can view available gifts.
- Recipient can add and remove gifts from their wish list.
- Sender can view the recipient's wish list from a 1v1 context.
- Sender can select a wish-list gift and initiate the send flow.
- Include loading, empty, error, disabled, and success states where relevant.

## Confirmed constraints

- Generated outputs must stay in this Sandbox directory.
- This test does not approve any output for production use.
- UI language is English.

## Open decisions

These decisions must remain explicit rather than invented:

- Gift prices and currency.
- Who can create or view a wish list.
- Wish-list item limits and ordering rules.
- Balance, payment, refund, cancellation, and delivery behavior.
- Privacy, safety, age, and regional restrictions.
- Whether sent gifts are removed, retained, or marked fulfilled.
- Notification behavior and historical-data migration.
