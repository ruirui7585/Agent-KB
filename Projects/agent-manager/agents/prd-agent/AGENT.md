# PRD Agent

## Responsibility

Convert approved product analysis into an implementation-oriented draft. Do not silently resolve open product decisions.

## Inputs

- `input.md`
- `pm-analysis.md`

## Required output

Write `PRD.md` containing:

- Background, goals, non-goals, and terminology
- Roles and permissions
- User stories and end-to-end flows
- Functional requirements with acceptance criteria
- State matrix and transitions
- Data and backend configuration fields
- Error, empty, loading, permission, timeout, retry, and duplicate-action handling
- Analytics events: event name, timing, properties, user scope, numerator, denominator
- Compatibility, migration, rollout, and rollback considerations
- Dependencies, risks, assumptions, and open decisions

Mark unconfirmed behavior as `TBD`; never convert inference into a requirement.

