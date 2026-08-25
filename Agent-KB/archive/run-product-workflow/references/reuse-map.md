# Reuse Map

Use this reference only for provenance or workflow audits.

## Reuse Levels

- `Exact`: behavior intentionally matches an upstream procedure.
- `Adapted`: the core loop is retained with local boundaries or outputs changed.
- `Inspired`: the idea influenced a locally designed mechanism.
- `Independent`: pre-existing local capability.
- `Excluded`: reviewed but intentionally omitted.

## Minimum Validation Version

| Local capability | Level | Implementation note |
| --- | --- | --- |
| Shortest reliable route | Inspired | Adds `S/M/L/XL` paths so small tasks avoid the full workflow. |
| Agreement gate | Adapted | Retains consensus-before-implementation while allowing explicit draft-safe `TBD` items. |
| Vertical tickets and blocking edges | Adapted | Adds acceptance evidence, write boundaries, and specialist-Skill mapping. |
| Four-axis review | Inspired | Extends Spec/Standards review into requirement, product/UI, engineering, and evidence axes. |
| Existing PRD, prototype, annotation, and test Skills | Independent | Preserved and invoked as specialist capabilities. |
| Automatic `CONTEXT.md` and ADR writes | Excluded | Local authorization and project-boundary rules take precedence. |
| Issue tracker state machine | Excluded | Not required for the minimum validation version. |
| Automatic commits or publication | Excluded | Requires separate explicit authorization. |
| Full Wayfinder and handoff system | Excluded | Deferred until the minimum route demonstrates value. |

## Source Boundary

The minimum version reimplements the workflow in local language and contracts. It does not copy upstream Skill files. Concepts were evaluated against the current `mattpocock/skills` repository and adapted to the local workspace's permission, project, and validation rules.

The pre-existing specialist Skills remain the source of truth for their domains. This router owns only selection, gates, ticket structure, compact state transfer, and evidence aggregation.
