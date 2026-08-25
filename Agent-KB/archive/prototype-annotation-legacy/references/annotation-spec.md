# Annotation Specification

## Data Shape

Use a framework-neutral annotation model:

```ts
interface PrototypeAnnotation {
  id: string;
  pageKey?: string;
  target: string;
  selector?: string;
  context?: {
    route?: string;
    container?: string;
    state?: string;
    visibleWhen?: string;
  };
  kind: 'page' | 'module' | 'field' | 'action' | 'state';
  title: string;
  summary: string;
  summarySource: 'prd' | 'confirmed' | 'observed' | 'inferred';
  sections: Array<{
    title: string;
    items: Array<{
      text: string;
      source: 'prd' | 'confirmed' | 'observed' | 'inferred';
      evidence?: string;
      implementationStatus?: 'implemented' | 'planned-unimplemented';
    }>;
  }>;
}
```

Render only non-empty sections. Use `planned-unimplemented` only after the user explicitly chooses to describe PRD behavior that the prototype does not implement.

Keep unresolved business data-source questions outside finalized annotation claims:

```ts
interface AnnotationDataSourceQuestion {
  id: string;
  pageKey?: string;
  target: string;
  fieldName: string;
  currentDisplay: '无';
  question: string;
  status: 'needs-user-confirmation' | 'resolved';
  resolution?: string;
}
```

Unknown data sources do not block initial annotation generation. Render `数据来源：无`, collect these records, and ask the user in one grouped follow-up after generating the prototype and initial annotations.

Keep unresolved fixed-value definitions outside confirmed product claims:

```ts
interface AnnotationValueDefinitionQuestion {
  id: string;
  pageKey?: string;
  target: string;
  fieldName: string;
  currentDisplay: '无';
  observedCandidates?: string[];
  question: string;
  status: 'needs-user-confirmation' | 'resolved';
  resolution?: Array<{
    displayValue: string;
    businessMeaning: string;
  }>;
}
```

For an applicable fixed-value field, use the PRD's value definition when present. If the PRD does not define it, render `取值定义：无`, collect a question record, finish the prototype and initial annotations, then ask the user in one grouped follow-up. The rendered `无` is an unresolved placeholder, not a confirmed product claim.

## Target Binding

Prefer a stable business anchor:

```html
<section data-prototype-anchor="ticket-filter">...</section>
```

The annotation `target` matches the anchor value. If modifying markup is not appropriate, use an existing stable selector such as an ID or `data-testid`. Use `context` to distinguish routes, containers, dialogs, drawers, and transient states.

Avoid generated class names, `nth-child`, deep DOM paths, and text-only selectors.

## Interaction Contract

- Annotation mode has an explicit on/off state.
- The annotation layer must not change product state or trigger product actions.
- Only clicking a hotspot opens the explanation panel.
- Clicking normal product modules does not open the panel.
- Notes support expand/collapse when they contain multiple sections.
- In the explanation panel, render structured details inline under the selected note item. The detail card's left boundary should align with the selected note's sequence-number circle column rather than the title text column, so the detail area expands left under the whole note. Unselected notes must not show their detail sections. Do not render a separate detached detail area below the full list, and do not repeat the selected note title, component type, or summary inside the expanded detail because those are already visible in the note item.
- The explanation panel must be draggable when shown in a browser prototype. Use the panel header as the drag handle, keep movement within the current viewport/prototype canvas, and preserve the dragged position across page changes while annotation mode remains enabled.
- Clicking a note scrolls to and highlights its target.
- Closing the panel does not change product state.
- Route and state changes update the visible hotspot set.
- Hidden modal or drawer targets do not show hotspots until visible.
- An annotation is active only when its route, container, state, and visibility context match.

## Visual Independence

The annotation layer is a prototype-review tool, not part of the product design system:

- Render hotspots and highlights in a top-level overlay when practical.
- Do not change product layout to make room for annotations.
- Keep the explanation panel neutral and readable.
- Do not reuse a business drawer when that would confuse product behavior with annotation behavior.
- Keep hotspots clear of important controls.

## Product Logic Annotation Fields

Annotation content must describe product logic only. Do not annotate UI appearance.

`数据来源` describes how the business value is produced or obtained. Valid confirmed descriptions include `用户输入`, `用户选择`, `系统生成`, `系统获取`, `操作变更`, and `计算/统计`. A PRD module name, document section, evidence label, or annotation source is not a business data source.

Keep annotation evidence in the existing `summarySource`, item `source`, and `evidence` fields. Do not render a separate option-source field. If the business data source cannot be confirmed from PRD, user guidance, code, or observable behavior, render `数据来源：无` and add it to the grouped data-source question list.

First classify each business field independently of its component. Render `取值定义` when the field has a finite fixed business-value set:

- Applicable: statuses, fixed categories, booleans/switch values, fixed results, and system dictionaries.
- Not applicable: free text, identifiers, dates, ordinary numbers, people, and other unbounded dynamic data.
- Known from PRD: list `可显示值` and `业务含义`.
- Missing from PRD: render exactly `取值定义：无`, collect it for grouped user confirmation, and do not infer from sample or implemented values.
- Do not render an enum-code column or a separate option-source field.

Then classify the rendered component type and render only applicable structured fields:

- 信息展示 / 表格 / 图表：字段名、字段类型、默认值或空值规则、是否必填或只读、数据来源、适用时的取值定义、统计口径。
- 文本输入 / 数字输入 / 文本域：字段名、组件类型、默认值、必填、长度/范围/格式限制、数据来源、提交后的写入目标。
- 下拉选择 / 日期选择 / 级联 / 树选择：字段名、组件类型、默认值、必填、适用时的取值定义、联动规则、数据来源。
- 上传：字段名、组件类型、默认值、必填、数量/格式/大小限制、数据来源、提交后的写入目标。
- 按钮 / 链接 / 行操作 / 批量操作：按钮名称、触发条件、点击结果、跳转目标或打开的弹窗/抽屉、写入或更新的数据、失败/阻断条件。
- 开关 / 复选框：字段名、组件类型、默认值、取值定义、开启/关闭后的业务影响、依赖字段、数据来源。
- 状态流转规则：仅当实际业务流转规则存在时，展示当前状态、可切换状态、触发操作、切换条件、日志/通知写入规则和阻断条件。没有规则时省略整个模块。

Do not list generic visual states such as hover, focus, pressed, color, spacing, shadow, icon style, or typography. Only mention disabled/hidden/visible state when it is caused by product logic, permissions, status, or data conditions.

## Annotation Plan Shape

Before implementation, produce a compact map:

```text
Page: ticket-list
- target: ticket-filter
  kind: module
  title: 工单筛选
  context: route=/tickets
  summarySource: observed
  sections: 模块用途, 操作规则
```

The plan is also a valid deliverable when the user asks for annotation content without code changes.
