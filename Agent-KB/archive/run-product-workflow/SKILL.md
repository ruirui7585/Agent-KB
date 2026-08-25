---
name: run-product-workflow
description: Route product, PRD, prototype, implementation, or review work through the smallest reliable workflow while preserving existing specialist Skills. Use when a request may cross product stages, needs scope or approval gates, should be split into independently testable tickets, or needs evidence-based review. Invoke explicitly for the minimum validation version; do not replace direct use of a specialist Skill for a clearly bounded small task.
---

# Run Product Workflow

Use this Skill as a thin orchestrator. Keep existing product, prototype, annotation, test, and project-specific Skills unchanged and call them only when their stage is reached.

## Core Rules

1. Inspect available facts before asking the user.
2. Select the shortest route that can produce a trustworthy result.
3. Keep small, clear tasks on the direct path.
4. Stop only for unresolved decisions that materially change the result or authorization.
5. Allow draft-safe unknowns to remain explicit `TBD`; do not convert them into facts.
6. Split large work into user-visible vertical tickets with acceptance evidence and blocking edges.
7. Review claims against evidence actually produced.
8. Do not write project or knowledge-base files without the authorization required by their active rules.
9. Do not silently modify, replace, or merge existing specialist Skills.
10. Preserve 100% coverage of mandatory rules and active facts; save tokens only on conditional or repeated reading.
11. Treat token budgets as warnings, never as permission to skip required evidence.

## Route the Task

Classify three dimensions independently:

- `S`: one bounded outcome, known target, low-risk decision, and focused validation.
- `M`: one feature or artifact with a few related decisions or states.
- `L`: multiple roles, stages, systems, artifacts, or independently testable outcomes.
- `XL`: the destination or implementation path cannot fit in one reliable session.
- Risk: `low`, `medium`, `high`, or `critical`.
- Impact: `local`, `cross-page`, `cross-module`, or `cross-system`.

Task size measures work volume. Risk and impact override the shortest route. Money, permissions, privacy, state transitions, migration, destructive behavior, publication, compliance, and production data are at least `high` risk. A high- or critical-risk execution must include `align`, even when the visible edit is small.

Choose the route:

- `S`: discover → execute → review.
- `M`: discover → align only if needed → execute → review.
- `L`: discover → align → spec → tickets → execute by ticket → review.
- `XL`: discover → map unknowns; create only research, prototype, clarification, or setup tickets until an `L` route becomes clear.

Read `references/workflow-contract.md` when the task is `M`, `L`, or `XL`, or when producing a workflow state file. Read `references/progressive-reading-contract.md` for `M`, `L`, `XL`, high/critical-risk, cross-module/cross-system work, or whenever read scope is uncertain.

## Read Progressively

For `S + low risk + local impact`, read mandatory authority files, the active target, and the minimum validation source. Do not create reading bureaucracy.

For all other work:

1. Establish the active source and its authority before using it.
2. Build required, triggered, deferred, forbidden, and sensitive read sets.
3. Fully read mandatory authority files and the active facts required by current rules.
4. Expand conditional reading only for a named trigger: conflict, modification, validation, high-risk decision, visual fidelity, dependency, or evidence gap.
5. Before ending discovery, inspect indexes and references for an unread source that could invalidate scope, authority, permissions, data shape, or acceptance.
6. Stop reading when the active source, write boundary, decisions, reuse choice, tickets, and evidence plan are trustworthy.

Do not use fixed file counts, line caps, or token ceilings to truncate required reading. If a budget warning is reached, stop optional exploration first. Report the pressure if required reading must continue.

Reuse a prior read only when its source fingerprint is unchanged. Re-read mandatory authority files in an isolated agent session. Pass ordinary background compactly, but attach source locations for confirmed requirements and require the receiving agent to revisit high-risk rules.

## Apply the Agreement Gate

Before `spec`, `tickets`, or implementation, classify unresolved decisions:

- `resolved`: supported by an active source or confirmed by the user.
- `draft-safe`: may remain `TBD` in a draft without changing external state or misleading implementation.
- `implementation-blocking`: changes permissions, money, privacy, state transitions, migration, destructive behavior, publication, or another high-impact outcome.

Classify relative to the current authorized deliverable, not a hypothetical production system. A payment policy can be `draft-safe` for a test-only prototype that stops at initiation and explicitly omits settlement, while remaining `implementation-blocking` for production payment behavior.

Continue through draft artifacts and non-production prototype behavior when unresolved items can remain explicit without implying the missing rule. Stop only before the current deliverable would encode, exercise, publish, or rely on an `implementation-blocking` decision.

Set the gate to `clear` when every decision affecting the current route is `resolved` or `draft-safe`. Use `needs-user` or `blocked` only when the current requested deliverable cannot proceed safely.

Do not execute when the active source is ambiguous, stale, or conflicting. Invalidate dependent facts, tickets, and reviews when a read source changes after its receipt was recorded.

Ask one decision at a time. Include a recommended answer and its consequence. Do not ask for facts that can be discovered safely from active sources.

## Create Vertical Tickets

For `L` work, create tickets that each deliver one independently observable capability. Do not split by department or technical layer.

Each ticket must include:

- outcome
- scope and non-goals
- acceptance checks
- required evidence
- blocking ticket IDs
- affected specialist Skill or execution capability
- unresolved decisions relevant to that ticket

Reject dependency cycles. Read `references/workflow-contract.md` for the ticket and state contracts.

## Execute Existing Skills

Use the existing specialist Skill at the relevant stage. This router does not duplicate its instructions.

Examples:

- PRD work → the active PRD Skill.
- HTML prototype work → the active HTML and mobile prototype Skills.
- Annotation work → the active annotation Skill selected for the task boundary.
- Test or self-check work → the relevant test Skill.
- Project-specific work → the project rules and project-local Skills.

Pass only the current task state: goal, confirmed decisions, relevant `TBD` items, allowed files, acceptance criteria, dependencies, and evidence. Do not forward the full conversation when a compact state is sufficient.

## Review Evidence

Review four independent axes:

- `requirement`: the agreed outcome, scope, and acceptance criteria are satisfied.
- `product-ui`: flows, states, copy, and user-visible behavior are coherent.
- `engineering`: implementation, safety, compatibility, and failure handling are reliable.
- `evidence`: every completion claim is supported by an executed check or marked unverified.

An overall pass requires all applicable axes to pass. `not-run` is not `pass`. A generated artifact is not proof that its behavior works.

Bind evidence to the deliverable:

- UI/prototype: actual visual references when fidelity matters, page load, console, and representative interaction.
- Code: relevant callers, interfaces, tests, and an applicable static/build/test check.
- Data: metric definition, schema, time window, coverage, and denominator.
- Product document: source trace, confirmed decisions, assumptions, and `TBD` separation.

## Output

For routing-only work, return:

1. task size and rationale
2. selected route
3. confirmed facts
4. unresolved decisions and gate classification
5. specialist Skills to invoke
6. tickets when required
7. validation and evidence plan
8. next user decision, only when blocked

When saving new machine-checkable state, use contract version `0.2` in `references/workflow-contract.md` and validate it with:

```bash
node scripts/validate-workflow-state.mjs <workflow-state.json>
```

Read `references/reuse-map.md` only when auditing how this workflow relates to Matt Pocock's system or the pre-existing local workflow.
