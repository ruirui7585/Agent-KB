# Female Operator App MVP

This project is an internal HTML prototype for validating the Female Operator App MVP.

The female app is a staff workspace. Staff operators can manage conversations for multiple backend-configured model profiles, respond from the selected model identity, and use content or call prompts to drive conversion.

## Directory

- `index.html`: Root entry page.
- `prototype/`: Runtime prototype files.
- `annotations/`: Annotation data and rules.
- `docs/`: Product notes, state dictionary, Codex rules, and changelog.
- `exports/readonly/`: Reserved for read-only exports.
- `legacy/`: Reserved for original or archived versions.

## Local Preview

```bash
npm run dev
```

Open `http://127.0.0.1:5174/` and choose Prototype Preview, or open `prototype/index.html` directly.

## Codex Boundaries

- Only edit files inside this project directory.
- Keep runtime prototype files under `prototype/`.
- Do not merge male and female app pages.
- Do not delete the fixed MVP pages or annotation data.
