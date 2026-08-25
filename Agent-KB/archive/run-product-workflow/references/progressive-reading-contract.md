# Progressive Reading Contract

Load this reference for `M`, `L`, `XL`, high/critical-risk, cross-module/cross-system work, or uncertain read scope.

## Purpose

Reduce conditional and repeated reading without reducing mandatory fact coverage. A smaller token bill is useful only when source authority, high-risk decisions, and validation integrity remain intact.

## Reading Sets

### Required

Read before execution:

- workspace and project authority files required by active rules
- the invoked Skill and its required references
- the confirmed active requirement, ticket, source, or target needed for the current deliverable
- sources required to establish permission, high-risk behavior, and validation

Do not replace a rule that explicitly requires a complete read with an index or summary.

### Triggered

Read when a named condition applies:

- task-type source: UI system, interface, schema, metric definition, test entry
- conflict between requirement, implementation, runtime, or user direction
- modification of a referenced module
- visual fidelity, runtime validation, dependency analysis, or evidence gap
- money, permission, privacy, migration, state-machine, destructive, publication, compliance, or production-data behavior

Record the trigger. Do not expand a directory merely because it may be useful.

### Deferred

Keep unread until a trigger appears:

- large implementation details outside the affected surface
- raw screenshots when no visual claim is being made
- deep history, broad logs, unrelated modules, and optional research

### Forbidden

Do not read without explicit authorization or a higher-priority active-source requirement:

- archive, backup, old, legacy, broken, checkpoint, and unrelated experiments
- another project or baseline outside the requested comparison
- paths explicitly excluded by the user or active rules

### Sensitive

Treat credentials, `.env`, production exports, personal data, private logs, browser storage, and authentication material as sensitive. Do not read a sensitive source unless the user authorized that source for this task. Record the authorization in its receipt.

## Risk and Impact Overrides

Risk levels:

- `low`: reversible local behavior with no material external consequence
- `medium`: user-visible state or a contained workflow with recoverable impact
- `high`: money, permissions, privacy, migration, state transitions, destructive behavior, publication, compliance, or production data
- `critical`: irreversible, broad, regulated, security-sensitive, or financially material behavior

Impact levels:

- `local`: one target with no shared consumers
- `cross-page`: several views in one product flow
- `cross-module`: shared components, APIs, schemas, or analytics consumers
- `cross-system`: multiple services, clients, teams, or external systems

High/critical risk and cross-module/cross-system impact override an `S` shortcut. They require alignment, relevant triggered sources, and a passing counterexample check before execution.

## Active Source Status

Classify the active source:

- `confirmed`: unique, current, and consistent enough for this deliverable
- `ambiguous`: more than one plausible source
- `stale`: current behavior or a newer decision may supersede it
- `conflicting`: authoritative sources disagree materially

Do not execute unless status is `confirmed`. Resolve or ask about ambiguity instead of selecting a convenient copy.

## Read Receipt

Use a compact receipt:

```json
{
  "source": "/absolute/path-or-stable-resource-id",
  "tier": "L1",
  "reason": "active requirement",
  "mode": "full",
  "status": "read",
  "fingerprint": "sha256-or-version-id"
}
```

Allowed modes: `full`, `targeted`, `index`, `runtime`.

Allowed statuses: `read`, `deferred`, `forbidden`.

The fingerprint may be a file hash, document revision, query ID, URL plus retrieval time, or another stable version identifier. If it changes, invalidate facts, tickets, handoffs, and review evidence that depend on the old receipt.

Keep receipts small. Do not record timestamps, consumers, or prose summaries unless the task needs them.

## Counterexample Check

Before ending discovery, inspect only active indexes, direct references, imports, and source inventories and ask:

> Could an unread source invalidate the active version, scope, permission, data shape, dependency, or acceptance plan?

Record:

- `pass`: no unresolved candidate can invalidate the route
- `fail`: an unresolved candidate exists
- `not-run`: allowed only before execution

When a candidate exists, read the smallest authoritative source that can resolve it. Stop after two unsuccessful expansions and surface the issue as a blocker instead of scanning indefinitely.

## Cross-Agent Handoff

- Re-read authority files in every isolated agent session.
- Reuse ordinary background through compact state.
- Attach source locations to confirmed requirements.
- Revisit original sources for high-risk rules.
- Never promote AI inference or a previous agent summary into a confirmed fact.
- Preserve runtime version, target, and executed result when handing off evidence.

## Deliverable Evidence Gate

Declare the minimum applicable evidence:

- `static`
- `build`
- `runtime`
- `visual`
- `interaction`
- `data`

Reading coverage and evidence coverage are separate. A source can be fully read while the resulting behavior remains unverified.

## Budget Behavior

Token budgets are soft:

1. Stop optional reading first.
2. Keep mandatory and triggered coverage complete.
3. Report budget pressure instead of silently skipping a source.
4. Do not cap file count or lines when active rules require a complete read.

## Small-Task Shortcut

Use only when all are true:

- task size is `S`
- risk is `low`
- impact is `local`
- active source is confirmed
- no high-risk unresolved item exists

Then read authority files, the active target, and the minimum validation source; do not create tickets or a full receipt ledger.
