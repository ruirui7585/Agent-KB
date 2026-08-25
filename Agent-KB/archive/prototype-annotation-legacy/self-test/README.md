# Self-Test Instructions

Use this folder to store browser evidence for `prototype-annotation` self-tests.

## Start Local Server

Use a local HTTP server, not `file://`.

```bash
cd /Users/shilv/Documents/Codex/2026-06-09/mobile-app-ui-prototype-skill-skill/work/actual-self-test
python3 -m http.server 4177 --bind 127.0.0.1
```

Test URL:

```text
http://127.0.0.1:4177/prototype-annotation/index.html
```

## Run Browser Test

Open the URL in the browser and verify:

- Page opens without runtime errors.
- Subscribe action shows a toast that disappears automatically.
- Tabs switch correctly.
- Annotation can be saved when empty, very long, with emoji, and with HTML-like text.
- Saved annotation remains after refresh.
- Export generates a downloadable HTML link and includes the latest annotation.
- Annotation panel does not block the phone prototype.

## Screenshot Evidence

Save screenshots under:

```text
/Users/shilv/.codex/skills/prototype-annotation/self-test/evidence/
```

Required screenshots:

- `page-load.png`
- `after-main-action.png`
- `after-state-switch.png`
- `after-export.png`

## PASS / FAIL Rules

- Critical Fail > 0: `FAIL`.
- Major Fail > 2: `FAIL`.
- Minor Fail > 5: `WARNING`.
- Otherwise: `PASS`.

## Auto Repair

Run at most 3 repair rounds:

```text
Test -> Fail -> Analyze failed item -> Patch related file -> Retest -> Update report
```

## Manual Fix Needed

Escalate to a human when:

- The fixture cannot be served through local HTTP.
- Browser policy prevents required validation.
- A framework-specific export mechanism is required but no project runtime is available.
- The same Critical or Major item fails after 3 repair rounds.
