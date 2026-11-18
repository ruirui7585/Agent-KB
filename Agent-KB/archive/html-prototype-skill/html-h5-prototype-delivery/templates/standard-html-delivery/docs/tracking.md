# Tracking

## Event Table

| Event Name | Trigger | Params | Expected Result |
| --- | --- | --- | --- |
| page_view | Page rendered | page_key | Page exposure tracked |
| cta_click | Primary CTA tapped | page_key, cta_id | User intent tracked |

## Notes

Tracking should describe product intent, not only technical implementation.

## Review Checklist

- Event names are stable.
- Trigger timing is clear.
- Params are documented.
- Success and failure events are considered.
