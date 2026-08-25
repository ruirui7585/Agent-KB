---
name: prototype-annotation
description: 为现有 HTML 或前端原型生成、接入、审查和修复产品标注。根据 Feature Contract、PRD 或已确认需求自动生成产品规则与状态标注，使用稳定锚点绑定页面元素，支持图片附件，并区分本地可写编辑模式与公网只读评审模式；适用于独立 HTML、React、Vue 或本地运行原型，不负责重新设计原型或定义产品规则。
---

# Prototype Annotation

## 定位

为现有原型增加可关闭、可维护、可追溯的产品说明层。

默认由 Agent 完成标注内容、位置和数据生成，人工编辑只用于纠错。标注层不得改变原型布局、视觉、业务状态或原有交互。

本 Skill 可以独立使用，也可以由 `ui-html-build` 调用：

```text
Feature Contract / PRD
→ 识别产品规则
→ 绑定业务元素
→ 生成 annotations.json
→ 接入标注 Runtime
→ 双模式验证
```

## 职责边界

负责：

- 自动生成和修复产品标注；
- 添加或复用稳定锚点；
- 生成和保存 `annotations.json`；
- Marker、内容/状态标注列表、固定右侧面板和标注浮窗；
- 隐藏、恢复、定位、编辑、删除和重新绑定；
- 添加、展示、替换和移除标注图片附件；
- 验证标注层与原型互不干扰。

不负责：

- 创建或重做基础原型；
- 修改 Feature Contract、权限、金额、奖励、周期等产品事实；
- 用标注修复基础产品功能；
- 评论线程、审批流、多用户协作或外部任务系统同步；
- 同时接入两套标注 Runtime。

统一使用本 Skill 自带 Runtime，不调用其他标注 Skill。

## 执行前确认

开始前确认：

- 唯一有效的原型路径；
- Feature Contract、PRD 或用户已确认需求；
- 页面、状态、弹窗和权限范围；
- 标注运行环境及模式：本地编辑或公网评审；
- 原型现有框架、页面目录和交互；
- 允许修改和必须保持不变的文件。

修改前输出：

```text
任务类型：
目标原型路径：
允许修改：
禁止修改：
需要保持不变：
验证方法：
```

目标路径不明确、存在多个有效原型或产品事实冲突时暂停确认。

## 事实源

按以下顺序使用事实：

```text
用户本轮明确确认
> Feature Contract / PRD
> 项目规则
> 当前代码和可观察行为
> Agent 推断
```

- 最终产品规则只能来自用户确认或 Feature Contract / PRD。
- 代码和可观察行为只能用于核对实现差异，不得替代产品规则。
- 推断不得写成最终产品事实。
- PRD 与原型冲突时，记录差异并暂停受影响标注；不影响的标注继续生成。

## 执行流程

1. 读取项目规则、需求、原型 HTML、CSS 和 JavaScript。
2. 识别页面、业务模块、字段、操作、状态、权限和异常。
3. 按用户可感知的产品能力拆分标注，不按 DOM 节点拆分。
4. 为每条标注选择最小且完整的业务元素。
5. 复用或添加稳定锚点和页面标识。
6. 生成或更新 `annotations.json`。
7. 原型没有标注层时接入自带 Runtime；已有标注层时增量修复，不重复接入。
8. 按运行模式验证隐藏、目录、定位、编辑保存能力和原型原有行为；公网评审模式不验证写入。

## 标注粒度

一条标注只对应一个用户可感知的：

- 产品能力；
- 交互规则；
- 权限规则；
- 状态变化；
- 异常或边界处理。

不要为每个图标、文字节点或装饰容器创建标注。能够由一条规则完整表达时，不按用户等级或状态机械拆分。

## 状态标注

每个独立状态画板必须至少有一条状态标注，正常、空、加载、错误、禁用、成功、失败、完成和权限受限状态按实际 Contract 覆盖，不强行补齐不适用状态。

状态标注必须说明：

- `pageState`：Contract 中的页面状态名称，与演示目录和画板标题一致；
- `state`：状态类型，优先使用 `normal | empty | loading | error | disabled | success | failure | completed | permission`；
- `visibleWhen`：进入或显示该状态的条件；
- `triggerCondition`：触发状态变化的用户动作或系统事件；
- `expectedOutcome`：该状态下用户看到的内容和可用、不可用操作；
- `acceptanceCriteria`：可直接验证的状态验收条件。

组件局部变化时再填写 `componentState`；权限状态填写 `permissionCondition`，异常状态填写 `exceptionBehavior`。已有规则标注包含上述内容时直接复用，不为同一画板重复创建只写“这是某状态”的 Marker。

Contract 未定义状态名称、进入条件或操作差异时不得编造，标记 `needs-review` 并返回需求流程补充规则。

## 图片附件

标注可以附加参考图、截图或视觉证据，但图片不能代替产品规则、状态说明和验收文字。

- `images` 为可选数组，每项包含项目相对路径 `src`、必填替代文字 `alt` 和可选说明 `caption`；
- 图片保存在项目内 `.prototype-annotations/uploads/`，`annotations.json` 只保存相对路径，不保存 Base64；
- 禁止使用本机绝对路径、`file://`、远程 URL、`data:` 或不受控 SVG；
- 图片内容必须与该标注直接相关，不附加装饰图或重复页面已有内容；
- 本地编辑模式允许上传、预览、替换和移除引用；移除引用不自动删除物理文件；
- 公网评审模式只展示图片，不显示上传、替换或移除入口；
- 图片加载失败时必须显示 `alt`，不能留下空白占位。

## 页面与锚点

页面容器使用：

```html
<section
  id="page-gift-detail"
  data-page-id="gift-detail"
  data-page-name="礼物详情页">
</section>
```

业务元素使用：

```html
<div
  data-annotation-id="insufficient-balance-sheet"
  data-contract-rule="FR-012"
  data-state="insufficient-balance">
</div>
```

要求：

- `data-page-id` 和 `data-annotation-id` 使用小写英文 kebab-case；
- 名称表达业务语义并在原型内唯一；
- 标注的 `pageId` 必须与页面 `data-page-id` 一致；
- 优先使用 `data-annotation-id`，其次使用稳定 `id` 或 `data-testid`；
- 不使用屏幕坐标、生成类名、深层 DOM 路径或 `nth-child` 作为主锚点；
- 添加锚点不得改变页面视觉或业务行为。

## 标注内容

标注必须回答：

```text
什么条件触发
→ 系统如何判断
→ 用户看到什么结果
→ 如何验收
```

每条标注必须包含：

- `ruleId`：对应 Feature Contract 规则编号；
- `triggerCondition`：触发条件；
- `expectedOutcome`：预期结果；
- `acceptanceCriteria`：可验证的验收条件。

有明确来源时再填写：

- `contractSection`；
- `judgmentLogic`；
- `dataSource`；
- `valueConstraint`；
- `permissionCondition`；
- `exceptionBehavior`；
- `ruleVersion`；
- `decisionRef`。

状态画板必须额外填写 `pageState`、`state` 和 `visibleWhen`。

禁止：

- “这是一个按钮”“这里展示内容”等无产品价值描述；
- “优化体验”等不可验收描述；
- 字体、颜色、间距、阴影等视觉说明；
- 为填满字段编造规则。

## 数据结构

项目级 `annotations.json` 是产品标注的唯一事实源：

```json
{
  "version": "1.0",
  "updatedAt": "2026-08-11T00:00:00Z",
  "annotations": [
    {
      "id": "ann-insufficient-balance",
      "pageId": "gift-detail",
      "page": "礼物详情页",
      "category": "edge",
      "title": "余额不足处理",
      "description": "余额不足时阻止赠送并引导充值。",
      "rules": ["不进入赠送成功状态"],
      "images": [
        {
          "src": ".prototype-annotations/uploads/insufficient-balance.png",
          "alt": "余额不足提示 Sheet 参考图",
          "caption": "用于说明余额不足时的页面反馈"
        }
      ],
      "target": {
        "annotationId": "insufficient-balance-sheet"
      },
      "context": {
        "ruleId": "FR-012",
        "triggerCondition": "用户确认赠送且余额不足",
        "expectedOutcome": "展示余额不足 Sheet",
        "acceptanceCriteria": "赠送未提交且充值入口可见"
      },
      "status": "active",
      "createdAt": "2026-08-11T00:00:00Z",
      "updatedAt": "2026-08-11T00:00:00Z"
    }
  ]
}
```

`category` 只使用：

```text
background | scenario | page-flow | state | permission | edge | acceptance
```

`localStorage` 只能保存标注层显示状态、当前页面、内容/状态类型和当前选中项，不得保存产品标注正文。面板固定在右侧，不保存位置和尺寸。浏览器保存失败时必须明确提示，刷新后以 `annotations.json` 为准。

## 标注列表与原型目录边界

- 原型页面与画板目录由 `ui-html-build` 生成，直接读取 HTML 的页面和画板结构，独立负责查看与定位；
- 标注 Runtime 不生成页面目录，不按 `pageId` 隐藏标注，也不承担原型页面导航；
- 主面板只提供“内容标注 / 状态标注”类型切换，并在类型内按产品语义展示标注；
- 所有未停用且目标当前可见的标注自动显示 Marker，不要求先选择目录或点击“定位”；
- 点击 Marker 后在主面板中展开对应标注，但不改变左侧原型目录或隐藏其他页面；
- 隐藏标注层时，左侧原型目录、大标题、小标题和页面锚点继续可见、可定位。

## 运行模式

### 本地编辑模式

仅在本地 HTTP 预览且保存接口可用时启用。支持查看、定位、隐藏恢复、新增、主面板编辑、浮窗内手动编辑、删除、重新绑定和图片上传，并写回 `annotations.json`。主面板与浮窗复用同一表单、保存接口和事实源。浮窗可以提供“Agent 修改”入口；真实 Agent 未接入时必须明确标记为交互演示、禁用应用操作且不得写入标注数据。进入该模式前必须验证保存与图片上传接口；不可用时不得显示为可正常编辑。

### 公网评审模式

用于 Vercel 等公网静态托管环境。仅支持查看、Marker、标注浮窗、隐藏恢复和图片浏览。必须隐藏主面板和浮窗中的新增、Agent 修改、手动修改、删除、重新绑定、图片上传及其他写入操作，不发送保存或上传请求。

`file://index.html` 只用于基础页面查看，不得描述为完整标注入口。

如用户明确要求公网编辑，必须先具备身份验证、持久化存储、权限控制和修改记录；不得直接开放匿名编辑。

## Runtime 行为

标注层默认显示，并满足：

- Marker 与标注面板读取同一份数据；
- 所有未停用且目标当前可见的标注自动显示 Marker，不受主面板内容/状态筛选影响；
- 点击 Marker 后，主面板自动切换到对应类型，展开并滚动到对应标注，同时高亮目标并显示标注浮窗；
- 标注浮窗位于原型画板右侧、固定主面板左侧；同一时间只显示一个，且不得覆盖原型画板或主面板；
- 浮窗与主面板详情读取同一条标注，展示标题、说明、适用的产品上下文、规则和图片；
- 详情展示隐藏 `ruleId`、`contractSection`、`acceptanceCriteria`、`device` 和 `viewport`，但这些字段继续保留在 `annotations.json` 和编辑表单中；
- 点击浮窗外任意 HTML 区域或关闭按钮时关闭浮窗并清除目标高亮；点击浮窗内部不关闭；
- 本地编辑模式在浮窗提供“手动修改”，并复用主面板表单和保存接口；取消返回详情；
- 浮窗可提供“Agent 修改”自然语言入口；未接真实 Agent 时只能显示明确的演示预览、影响字段和“待确认”状态，应用按钮必须禁用，不得调用模型接口或持久化提示词；
- 点击主面板标注仍可定位并高亮目标；
- 只有选中标注展开详情，未选中项保持收起；
- 主面板固定在 HTML 最右侧，不允许拖动或缩放；显示时使用独立评审栏，不覆盖原型，隐藏时释放右侧空间；
- 固定面板不得改变移动端画板尺寸或对画板做响应式缩放；空间不足时由外层评审区滚动或换行；
- 刷新后恢复显示状态、当前页面、内容/状态类型和选中项；
- 路由、滚动、缩放、弹窗和 DOM 变化后刷新 Marker 与浮窗位置；
- 不可见目标不显示 Marker；
- Marker、浮窗和主面板不得遮挡关键产品操作；
- 图片在标注详情内按原比例缩放展示，不能撑破面板；加载失败显示替代文字。

点击“隐藏标注”后：

- 隐藏 Marker、面板、高亮、选择提示和编辑入口；
- 隐藏已打开的标注浮窗和浮窗编辑状态；
- 保留一个小型“显示标注”按钮；
- 不改变原型页面、产品状态或 `annotations.json`；
- 再次显示时恢复之前的页面、类型和选中项，面板仍固定在最右侧。

## 人工纠错

以下能力只在本地编辑模式开放：

支持：

- 手动编辑标注内容；
- 在主面板或标注浮窗内编辑同一条标注；
- 通过 Agent 修改入口描述预期内容；只有真实 Agent 桥接、预览确认和保存接口均可用时才允许应用；
- 删除错误标注；
- 新增 Agent 遗漏的标注；
- 重新绑定错误目标。

人工新增只是补漏，不是默认生产方式。新增和重新绑定优先选择已有稳定锚点；使用临时选择器时必须提示其稳定性风险。

所有修改通过同一保存接口写回 `annotations.json`。保存失败时不得伪装成功，也不得仅写入浏览器缓存。

## Runtime 接入

默认资源：

```text
assets/annotation-runtime/annotation-runtime.js
assets/annotation-runtime/annotation-runtime.css
schemas/annotations.schema.json
```

独立 HTML 可使用：

```bash
node /Users/shilv/Agent-Workspace/Agent-KB/skills/prototype-annotation/scripts/inject-runtime.mjs --html <prototype.html> --annotations annotations.json
node /Users/shilv/Agent-Workspace/Agent-KB/skills/prototype-annotation/scripts/annotation-server.mjs --root <prototype-root> --port 4175 --annotations annotations.json
```

项目已有开发服务时，复用项目服务并提供等价保存接口，不再启动平行服务。单文件原型只有在项目明确要求时才内联 Runtime；默认保持 `index.html` 为唯一展示入口，CSS、JS 和 JSON 作为运行资源。

## 验证

至少验证：

1. `annotations.json` 可以解析，字段和规则来源有效；
2. 标注 ID、`data-page-id` 和 `data-annotation-id` 唯一；
3. 每个独立状态画板至少对应一条状态标注：`pageState` 与 Contract、演示目录一致，`state` 表达正确状态类型，`visibleWhen` 说明显示条件，标注目标位于对应 `data-state` 画板内；
4. 图片附件使用项目相对路径，文件可以加载，`alt` 非空，JSON 中不存在 Base64、本机绝对路径或远程 URL；
5. Marker 与主面板读取同一份 `annotations.json`，原型目录独立读取 HTML 页面和画板；
6. 标注主面板不存在页面目录或页面筛选，左侧原型目录可以独立定位全部静态画板；
7. 当前可见目标的 Marker 自动出现，且不依赖主面板内容/状态筛选或“定位”；
8. 点击内容或状态 Marker 后，主面板切换并展开正确条目，浮窗与目标高亮正确；
9. 浮窗位于原型和固定主面板之间，不覆盖任何画板或主面板；点击内部保持，点击外部关闭；
10. 主面板固定在 HTML 最右侧且不可拖动、不可缩放；打开和隐藏均不改变固定画板尺寸；
11. 隐藏后 Marker、浮窗、面板、高亮和编辑入口全部消失，原型页面不变；再次显示后恢复页面、类型和选中项；
12. 本地编辑模式下，主面板和浮窗手动编辑复用同一保存接口，编辑、删除、重新绑定和图片引用写回 `annotations.json`，刷新后仍然有效；
13. 未接真实 Agent 时，“Agent 修改”必须标记为交互演示，应用按钮禁用，`annotations.json` 不变；
14. 公网评审模式下，主面板和浮窗的所有写入、Agent 修改与图片上传入口均隐藏且不发送保存或上传请求；
15. 详情不展示五个内部字段，但 JSON 与编辑表单仍保留；
16. 标注关闭和开启两种模式下，原型原有交互均未退化；
17. 本地资源无关键 404，控制台无阻断性错误。

运行锚点校验：

```bash
node /Users/shilv/Agent-Workspace/Agent-KB/skills/prototype-annotation/scripts/validate-anchors.mjs --html <prototype.html> --annotations <annotations.json>
```

无法执行的验证必须说明原因和人工验证方法，不得声称已经通过。

## 最终输出

```text
完成状态：
目标原型路径：
运行模式：本地编辑 + 公网评审 / 仅本地编辑 / 仅公网评审
本地编辑入口：
公网评审入口：
公网是否支持编辑：
标注数量和页面：
修改文件：
保持不变：
数据与锚点验证：
图片附件验证：
隐藏与恢复验证：
目录与定位验证：
编辑保存验证：
原型回归验证：
未验证项：
遗留风险：
```
