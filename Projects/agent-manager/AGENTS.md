# Agent Manager Project Rules

## Scope

This project implements a local Product Team Agent Manager. It is an orchestration layer and must not replace workspace, knowledge-base, or target-project rules.

## Safety boundaries

- Runtime writes are limited to this project's `runs/` directory.
- Target projects and `/Users/shilv/Agent-Workspace/Agent-KB` are read-only context sources.
- Generated artifacts are drafts until a user explicitly promotes them into a target project.
- Never delete, rename, or overwrite target-project files.
- Direct mode remains available; using this manager is optional.

## v0.1 modes

- `direct`: do not orchestrate; print guidance for using the existing direct workflow.
- `workflow`: execute every enabled step in a workflow.
- `select`: execute only named agents, while preserving workflow order.

## Validation

Run `npm test` after changing runtime code or workflow configuration.

