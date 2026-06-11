# Source Reconciliation

## Goal

Compare PRD or requirement claims with the supplied prototype before writing final annotations. Never hide meaningful differences.

## Decision Rules

| Situation | Action |
| --- | --- |
| PRD and prototype agree | Annotate normally and cite the PRD or confirmed source. |
| PRD defines behavior that the prototype does not implement | Pause only the affected annotation and ask the user how it should be described. Do not present the behavior as implemented. |
| PRD and prototype directly conflict | Pause only the affected annotation and ask the user which behavior is authoritative. |
| Prototype implements behavior not defined by PRD | Annotate as `observed` when useful; do not invent missing product rationale. |
| User explicitly resolves a difference | Use `confirmed` for the resolved claim and record the decision. |

Continue processing unaffected modules while waiting for clarification when feasible. Group related discrepancies into one concise question instead of interrupting repeatedly.

## Unknown Data Sources

Business data-source uncertainty is handled without blocking initial prototype or annotation generation:

1. Determine whether PRD, user guidance, code, or observable behavior confirms how the value is produced or obtained.
2. If confirmed, write the actual business source, such as `用户输入`, `用户选择`, `系统生成`, `系统获取`, `操作变更`, or `计算/统计`.
3. If unknown or conflicting, render `数据来源：无`; do not guess and do not use the PRD module or annotation evidence as the source.
4. Collect all unknown or conflicting data-source fields into one grouped question list after the initial annotations are generated.
5. After the user defines a source, update the affected annotation and record the supporting claim as `confirmed`.

The rules in this section apply only to the `数据来源` field. Other meaningful PRD/prototype conflicts continue to follow the decision rules above unless another section defines a narrower exception.

## Unknown Value Definitions

`取值定义` uncertainty also does not block initial prototype or annotation generation:

1. First determine whether the field is an applicable finite fixed-value field, such as a status, fixed category, boolean, fixed result, or system dictionary.
2. If the PRD defines the allowed display values and business meanings, use the PRD definition.
3. If the PRD does not define them, render `取值定义：无`; do not promote implemented options, observed samples, or guessed values into the definition.
4. Collect all unresolved value-definition fields into one grouped question list after the prototype and initial annotations are generated.
5. Include observed candidate values in the question only as context, not as confirmed definitions.
6. After the user defines the values, update the affected annotation and record the supporting claims as `confirmed`.

If a PRD-defined value set differs from the prototype, use the PRD definition as the annotation content, record the prototype difference as an implementation discrepancy, and ask how to handle the implementation difference without replacing the PRD definition with observed options.

This exception applies only to unresolved `取值定义`. Do not render this section for fields that do not have a finite fixed business-value set.

## Required User Questions

For PRD behavior missing from the prototype, explain the difference and ask whether to:

1. Describe it as planned but currently unimplemented.
2. Omit it from annotations.
3. Treat the prototype as incomplete and handle product implementation separately.

For direct conflicts, show the PRD behavior and observed prototype behavior, then ask which one should be used. Do not choose silently.

If the user chooses to describe a planned but unimplemented rule, mark each affected claim with `implementationStatus: 'planned-unimplemented'` and state that it is not available in the current prototype.

## Discrepancy Record

Keep unresolved differences separate from finalized annotation content:

```ts
interface AnnotationDiscrepancy {
  id: string;
  target: string;
  type: 'prd-not-implemented' | 'conflict';
  prdClaim?: string;
  observedBehavior?: string;
  status: 'needs-user-decision' | 'resolved';
  resolution?: string;
}
```

In `plan-only`, include unresolved discrepancies in the deliverable. In code-changing modes, do not finalize affected annotation claims until the user resolves them.
