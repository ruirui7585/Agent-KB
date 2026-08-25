# Product Team Agent Manager v0.1

A small, local orchestration layer for turning one product requirement into a sequence of draft deliverables. It preserves the existing manual workflow and writes only inside this project's `runs/` directory.

## What v0.1 does

The default `product-feature` workflow runs four roles in order:

1. PM Agent → `pm-analysis.md`
2. PRD Agent → `PRD.md`
3. Prototype Agent → `prototype/index.html`
4. Review Agent → `review.md`

Each role runs through the installed Codex CLI. A failed step stops the workflow. Every run records status and logs, so the process is inspectable rather than a hidden one-shot prompt.

## Three execution modes

### Direct mode

Keeps the old way of working. It does not invoke agents or write files.

```bash
npm run manager -- direct
```

### Complete workflow

```bash
cp templates/task-input.md task-input.md
# Fill in task-input.md, then:
npm run manager -- run --input task-input.md
```

### Select agents

Runs selected roles in workflow order. Dependencies must be included.

```bash
npm run manager -- run --input task-input.md --agents pm,prd
```

## Safe preview and validation

Preview the plan without invoking Codex:

```bash
npm run manager -- plan --input task-input.md
```

Exercise the complete orchestration without model calls:

```bash
npm run manager -- run --input test/fixtures/sample-input.md --mock
```

## Output location

Each run is isolated under:

```text
runs/<timestamp>-<task-slug>/
├── input.md
├── run.json
├── logs/
├── pm-analysis.md
├── PRD.md
├── prototype/
│   └── index.html
└── review.md
```

Generated files are drafts. v0.1 intentionally has no command that publishes or copies them into another project.

## Current limitations

- No graphical dashboard.
- No automatic publishing into a target project.
- No long-term memory mutation or self-modifying prompts.
- Prototype quality depends on the requirement and the existing HTML prototype skill.
- Model calls require a working, authenticated `codex` command.

