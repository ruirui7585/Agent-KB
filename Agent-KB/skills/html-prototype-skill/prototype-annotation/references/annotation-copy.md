# Product Annotation Copy

## Scope

Annotations explain product behavior, not visual design.

Write about:

- Module purpose
- Field meaning and confirmed data source
- Input or selection rules
- Field name, component type, default value, required status, constraints, and data source
- Action trigger conditions, click result, navigation target, data mutation, and blocking conditions
- Action outcomes
- Prompt, success, failure, and exception behavior
- State transitions
- Permission and business conditions

Do not write about:

- Font sizes, colors, spacing, icons, shadows, or rounded corners
- Layout decoration or visual-design rationale
- Generic component interaction states unless driven by product logic
- Unconfirmed backend behavior

## Business Data Source

`数据来源` answers how the displayed or entered business value is produced or obtained. Use a concise confirmed value such as:

- 用户输入
- 用户选择
- 系统生成
- 系统获取
- 操作变更
- 计算 / 统计

Do not write a PRD module name, document section, `prd`, `observed`, `confirmed`, or `inferred` as `数据来源`. Those belong to annotation evidence and remain recorded separately.

Do not add a separate `选项来源` field. Describe the selected or displayed value's business data source under `数据来源`.

When the business data source cannot be confirmed, render exactly `数据来源：无`. Continue generating the prototype and initial annotations, collect every unresolved data-source field, then ask the user one grouped set of concise questions. Replace `无` only after the user confirms the source.

## Value Definitions

`取值定义` explains the finite fixed business values a field may display or accept. It is field-level product information, not a selector-only property.

Render it for statuses, fixed categories, booleans, fixed results, and system dictionaries wherever they appear, including selectors, tables, detail views, tags, and switches. Do not render it for free text, identifiers, dates, ordinary numbers, people, or other unbounded dynamic data.

When the PRD defines the values, use this structure:

| 可显示值 | 业务含义 |
| --- | --- |
| 待分配 | 工单尚未分配处理人 |
| 处理中 | 处理人正在处理工单 |

Do not add an enum-code column and do not add `选项来源`.

When an applicable field has no PRD-defined values, render exactly `取值定义：无`. Do not replace `无` with implemented options, observed samples, or guesses. Finish the prototype and initial annotations, collect every unresolved value-definition field, then ask the user one grouped set of concise questions. Include observed candidate values only as question context. Replace `无` after the user confirms the definition.

## State Transition Rules

Render `状态流转规则` only when actual business transition rules are defined. Describe the current state, allowed next state, triggering operation, and transition condition. Omit the entire section when no rule exists; do not render an empty section or `状态流转规则：无`.

## Supported Sections

- 模块用途
- 字段说明
- 取值定义
- 数据来源
- 输入限制
- 操作规则
- 状态流转规则
- 提示规则
- 状态说明
- 权限规则
- 异常规则

For field or control annotations, prefer structured label/value rows over paragraphs:

- 字段名
- 类型
- 默认值
- 必填
- 长度限制 / 范围限制 / 格式限制
- 取值定义（仅适用于固定有限值字段）
- 数据来源
- 点击结果 / 跳转目标 / 写入目标
- 显示条件 / 阻断条件

Render only applicable sections. Do not create empty sections to make notes look complete.

## Copy Style

- Use concise product language.
- Prefer concrete rules over generic explanation.
- Keep each bullet independently meaningful.
- Use PRD wording when it is clear.
- Convert field tables into field meaning and input rules.
- Convert interaction flows into operation and state rules.
- Convert exception handling into prompt and exception rules.
- Keep business data source and annotation evidence separate.

## Evidence And Confidence

Set evidence on the summary and on every annotation item:

- `prd`: stated in a PRD or explicit requirements
- `confirmed`: explicitly confirmed by the user
- `observed`: confirmed by code or running interaction
- `inferred`: a necessary but unconfirmed interpretation

Avoid `inferred` rules when a useful annotation can be written from observed behavior alone. Never present inference as a confirmed product rule. A single note may contain items from different sources.

When the user explicitly chooses to include PRD behavior that the prototype does not implement, say that it is planned and currently unavailable, and set `implementationStatus` to `planned-unimplemented`.

## Example

```json
{
  "id": "ticket-filter-note",
  "pageKey": "ticket-list",
  "target": "ticket-filter",
  "kind": "module",
  "title": "工单筛选",
  "summary": "用于缩小当前工单列表的查询范围。",
  "summarySource": "observed",
  "sections": [
    {
      "title": "操作规则",
      "items": [
        {
          "text": "点击搜索后更新列表结果。",
          "source": "observed",
          "evidence": "运行原型中的搜索交互",
          "implementationStatus": "implemented"
        },
        {
          "text": "点击重置后恢复默认筛选条件。",
          "source": "observed",
          "evidence": "运行原型中的重置交互",
          "implementationStatus": "implemented"
        }
      ]
    }
  ]
}
```
