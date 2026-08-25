# Annotation Data Model

Use this reference before creating or changing annotation data.

## Recommended File

Use a project-level `annotations.json` unless the project already has a different active annotation convention.

```json
{
  "version": "1.0",
  "updatedAt": "2026-07-14T00:00:00Z",
  "annotations": []
}
```

## Annotation Shape

```json
{
  "id": "ann-chat-video-call",
  "page": "chat",
  "title": "Video call permission",
  "description": "Shows the video call entry after the conversation is accepted.",
  "rules": [
    "S/A/B level users can start a video call.",
    "C/D level users see an unavailable-level prompt."
  ],
  "target": {
    "annotationId": "chat-video-call",
    "selector": "[data-annotation-id=\"chat-video-call\"]"
  },
  "context": {
    "userRole": "male",
    "pageState": "accepted"
  },
  "status": "active",
  "createdAt": "2026-07-14T00:00:00Z",
  "updatedAt": "2026-07-14T00:00:00Z"
}
```

## Required Fields

- `id`: stable unique annotation id
- `page`: page, screen, route, or prototype section
- `title`: short feature name
- `description`: concise product logic
- `rules`: explicit display, interaction, permission, state, or exception rules
- `target`: binding information
- `updatedAt`: ISO timestamp

## Target Object

Prefer:

```json
{
  "annotationId": "chat-video-call",
  "selector": "[data-annotation-id=\"chat-video-call\"]"
}
```

Fallback selectors are allowed, but must be unique in the active page. Coordinates should not be used as primary binding.

## Context Object

Use context only when it changes how the annotation applies.

Common fields:

- `userRole`
- `userState`
- `pageState`
- `componentState`
- `modal`
- `tab`
- `device`
- `viewport`

Avoid over-modeling. A blank or small context object is fine when the rule is generally applicable.

## Status

For MVP, keep status simple:

- `active`
- `needs-review`
- `orphaned`
- `deprecated`

Use `orphaned` when the target cannot be found after page changes.

## Do Not Store As Facts

Do not encode uncertain assumptions as confirmed rules. If something is not specified or confirmed by source files, either omit it or mark it as a question in the annotation description.
