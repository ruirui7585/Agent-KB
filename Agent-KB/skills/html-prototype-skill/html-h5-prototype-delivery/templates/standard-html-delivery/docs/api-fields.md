# API Fields

## Field Inventory

| Field | Type | Example | Description |
| --- | --- | --- | --- |
| id | string | item_001 | Unique item identifier |
| title | string | Primary Journey | Display title |
| status | string | default | UI or business state |

## Mock Data Source

Mock data lives in `js/data.js`.

## Rules

1. Do not hardcode business fields inside rendering functions when they should come from data.
2. Keep naming consistent across data, state, and docs.
