# Workflow Contract

Load this reference for `M`, `L`, and `XL` tasks or when producing machine-checkable workflow state.

## State Shape

Use version `0.2` for new states. The validator continues to accept existing `0.1` states for compatibility.

```json
{
  "version": "0.2",
  "task": {
    "summary": "One observable product outcome",
    "size": "L",
    "rationale": "Multiple roles, states, and independently testable outcomes",
    "riskLevel": "medium",
    "impactScope": "cross-module"
  },
  "route": ["discover", "align", "spec", "tickets", "execute", "review"],
  "activeSource": {
    "status": "confirmed",
    "sources": ["/project/requirements/active/feature/PRD.md"]
  },
  "reading": {
    "required": ["/workspace/AGENTS.md", "/project/AGENTS.md", "/project/requirements/active/feature/PRD.md"],
    "triggered": ["/project/api/gift-play-schema.md"],
    "deferred": ["/project/research/competitors.md"],
    "forbidden": ["/project/archive"],
    "sensitive": [],
    "receipts": [
      {
        "source": "/project/requirements/active/feature/PRD.md",
        "tier": "L1",
        "reason": "active requirement",
        "mode": "full",
        "status": "read",
        "fingerprint": "sha256-or-version-id"
      }
    ],
    "counterexampleCheck": {
      "status": "pass",
      "candidates": [],
      "resolution": []
    }
  },
  "evidenceGate": ["static", "runtime", "interaction"],
  "budget": {
    "status": "within",
    "note": "Optional exploration remains within the planned budget"
  },
  "unresolvedHighRiskItems": [],
  "gate": {
    "status": "clear",
    "items": [
      {
        "decision": "Who can view the wish list",
        "classification": "draft-safe",
        "handling": "Keep TBD in draft; resolve before production implementation"
      }
    ]
  },
  "confirmedFacts": [],
  "tickets": [],
  "review": {
    "requirement": {"status": "not-run", "evidence": []},
    "product-ui": {"status": "not-run", "evidence": []},
    "engineering": {"status": "not-run", "evidence": []},
    "evidence": {"status": "not-run", "evidence": []}
  }
}
```

## Allowed Values

- `task.size`: `S`, `M`, `L`, `XL`
- `task.riskLevel`: `low`, `medium`, `high`, `critical`
- `task.impactScope`: `local`, `cross-page`, `cross-module`, `cross-system`
- route stages: `discover`, `align`, `spec`, `tickets`, `execute`, `review`, `map-unknowns`
- `activeSource.status`: `confirmed`, `ambiguous`, `stale`, `conflicting`
- read modes: `full`, `targeted`, `index`, `runtime`
- read statuses: `read`, `deferred`, `forbidden`
- counterexample status: `pass`, `fail`, `not-run`
- evidence gate: `static`, `build`, `runtime`, `visual`, `interaction`, `data`
- budget status: `within`, `warning`, `exceeded`
- `gate.status`: `clear`, `needs-user`, `blocked`
- gate classification: `resolved`, `draft-safe`, `implementation-blocking`
- review status: `pass`, `fail`, `not-run`, `blocked`, `not-applicable`

Classify gate items against the current deliverable. Record production-only blockers as `draft-safe` when the authorized artifact can explicitly omit them without implying behavior. Reclassify them before a later production route.

## Route Constraints

- Every route starts with `discover`.
- `S` does not require `spec` or `tickets`.
- `L` includes `align`, `spec`, `tickets`, and `review` in that order.
- `XL` includes `map-unknowns` before `spec`, `tickets`, or `execute`.
- A route containing `execute` ends with `review`.
- Do not execute affected work when the current deliverable contains an `implementation-blocking` item and status is not `clear`.
- A `0.2` route containing `execute` requires a confirmed active source, complete receipts for required and triggered reads, a passing counterexample check, and at least one evidence-gate item.
- High/critical-risk execution includes `align`.
- Cross-module/cross-system execution includes at least one triggered source.
- A sensitive source may be read only when its receipt records explicit authorization.
- A budget warning or overage never excuses an incomplete required or triggered read.

## Ticket Shape

```json
{
  "id": "T01",
  "outcome": "Recipient can add and remove wish-list gifts",
  "scope": ["available gifts", "wish-list state"],
  "nonGoals": ["payment settlement"],
  "acceptance": ["Adding a gift updates the visible list"],
  "evidence": ["browser interaction check"],
  "blockedBy": [],
  "capability": "html prototype",
  "openDecisions": []
}
```

Ticket rules:

- Express the outcome as user-visible behavior.
- Keep acceptance checks observable.
- Name evidence separately from expected behavior.
- Use ticket IDs in `blockedBy`.
- Do not create dependency cycles.
- Do not use layer-only tickets such as “build all database tables” or “make all UI”.

## Evidence Levels

Use the strongest level actually executed:

1. source or syntax inspection
2. static validation
3. build or service readiness
4. page load and console check
5. user-flow interaction check
6. regression or acceptance suite

Never infer a higher level from a lower one.

## Compact Handoff

Pass only:

- goal
- active project and allowed files
- confirmed facts
- draft-safe and blocking decisions
- current ticket
- acceptance checks
- evidence produced
- remaining blocker

Do not repeat full histories or unrelated project context.

For high-risk facts, include the source location and require the receiving isolated agent to revisit the original source. Re-read authority files in every isolated agent session.
