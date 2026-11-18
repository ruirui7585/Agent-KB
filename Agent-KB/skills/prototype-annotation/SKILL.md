---
name: prototype-annotation
description: 为现有 HTML 或前端原型生成、接入、审查和修复产品标注。根据 Feature Contract、PRD 或已确认需求自动生成产品规则与状态标注，使用稳定锚点绑定页面元素，支持图片附件，并区分本地可写编辑模式与公网只读评审模式；适用于独立 HTML、React、Vue 或本地运行原型，不负责重新设计原型或定义产品规则。
---

# Prototype Annotation

## 定位与边界

为现有原型增加可关闭、可维护、可追溯的产品说明层。默认由 Agent 自动生成标注内容与位置，人工编辑仅用于纠错；标注层严禁改变原型布局、视觉、业务状态或原有交互。

- **负责**：自动生成与修复产品标注、添加/复用稳定锚点、维护 `annotations.json`、接入统一 Runtime（Marker / 固定右侧主面板 / 标注浮窗 / 图片附件）及双模式验证。
- **不负责**：创建或重做基础原型、修改 Contract/业务事实、用标注弥补缺失产品功能、评论审批流或接入第二套标注 Runtime。

**事实源优先级**：`用户本轮明确确认 > Feature Contract / PRD > 项目规范 > 当前代码和可观察行为 > Agent 推断`。PRD 与原型冲突时记录差异并暂停受影响标注；不影响的继续生成。

开始前确认唯一原型路径、Contract/PRD、页面状态范围、运行模式（本地编辑 / 公网评审）及允许/禁止修改文件，并先声明：`任务类型 / 目标原型路径 / 允许修改 / 禁止修改 / 需要保持不变 / 验证方法`。

---

## 执行流程与锚点规范

1. 读取项目规则、需求及原型 HTML/CSS/JS，按“用户可感知的产品能力/规则/权限/状态/异常”拆分标注（不按 DOM 节点或纯等级机械拆分）。
2. 为页面容器设置唯一 `id`、`data-page-id`（小写 kebab-case）、`data-page-name`；为最小完整业务元素设置唯一业务语义 `data-annotation-id`（及 `data-contract-rule`、`data-state`）。**禁止使用屏幕坐标、生成类名、深层 DOM 路径或 `nth-child` 作为主锚点**。
3. 生成或更新 `annotations.json`，首次接入自带 Runtime（已有则增量修复）。

---

## 数据结构与内容要求

项目级 `annotations.json` 为产品标注**唯一事实源**；`localStorage` 仅存显示状态、当前页面、内容/状态类型与选中项，严禁保存标注正文、面板位置或尺寸。

- **必填逻辑**：每条标注回答“什么条件触发 → 系统如何判断 → 用户看到什么结果 → 如何验收”，`context` 必填 `ruleId`、`triggerCondition`、`expectedOutcome`、`acceptanceCriteria`，按需补充 `contractSection / judgmentLogic / dataSource / valueConstraint / permissionCondition / exceptionBehavior / ruleVersion / decisionRef`。
- **状态标注**：每个独立状态画板至少有一条状态标注（位于对应 `data-state` 画板内），必含 `pageState`（与目录/画板标题一致）、`state`（`normal | empty | loading | error | disabled | success | failure | completed | permission`）和 `visibleWhen`；说明该状态下可用与不可用操作，已包含上述字段的规则标注直接复用，不重复建 Marker。Contract 未定义状态条件时标记 `needs-review` 并返回需求流程。
- **图片附件（`images`）**：每项含项目相对路径 `src`（文件存 `.prototype-annotations/uploads/`）、必填非空 `alt` 及可选 `caption`；**禁止 Base64、本机绝对路径、远程 URL 或 `data:`**；加载失败时展示 `alt`。移除引用不删物理文件；公网模式只展示图片、不显示上传/替换/移除入口。
- **禁止内容**：无产品价值描述（“这是一个按钮”）、不可验收描述（“优化体验”）、字体颜色间距等纯视觉说明、为填字段编造规则。

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
      "images": [{ "src": ".prototype-annotations/uploads/insufficient-balance.png", "alt": "余额不足提示 Sheet 参考图", "caption": "余额不足反馈" }],
      "target": { "annotationId": "insufficient-balance-sheet" },
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
> `category` 枚举：`background | scenario | page-flow | state | permission | edge | acceptance`。

---

## Runtime 接入、界面边界与双模式

### 1. 默认资源与命令
资源：`assets/annotation-runtime/annotation-runtime.js`、`assets/annotation-runtime/annotation-runtime.css`、`schemas/annotations.schema.json`。已有开发服务时复用该服务并提供等价保存接口；单文件原型仅在明确要求时内联 Runtime。
```bash
node ~/.kb/skills/prototype-annotation/scripts/inject-runtime.mjs --html <prototype.html> --annotations annotations.json
node ~/.kb/skills/prototype-annotation/scripts/annotation-server.mjs --root <prototype-root> --port 4175 --annotations annotations.json
node ~/.kb/skills/prototype-annotation/scripts/validate-anchors.mjs --html <prototype.html> --annotations <annotations.json>
```

### 2. 界面布局与联动行为
- **与左侧目录分工**：左侧原型目录由 `ui-html-build` 生成，直读 HTML DOM；标注右侧主面板**不得生成页面目录或按页面筛选**，只提供“内容标注 / 状态标注”切换，且关闭标注后左侧目录与标题继续可见可用。
- **固定右侧面板**：固定在 HTML 最右侧、**不可拖动或缩放**，显示时占用独立评审空间、隐藏时释放空间，且绝不改变或缩放移动端固定画板尺寸。
- **Marker 渲染**：所有未停用且目标可见的标注**自动显示 Marker**（不依赖目录/筛选/“定位”）；必须保持等宽等高圆形（`border-radius: 50%`、横向 `padding: 0`，显式覆盖宿主 `button` 全局样式以免双位编号撑成长条）；不可见目标不显示 Marker；路由/滚动/DOM 变化后自动刷新位置。
- **主面板与浮窗联动**：点击 Marker 后主面板切换类型并展开对应条目，同时高亮目标并在**原型画板右侧、主面板左侧**展示唯一标注浮窗（不覆盖画板或主面板）。点击浮窗内部保持，点击外部或关闭按钮关闭并清除高亮；只有选中项展开。
- **隐藏字段**：主面板和浮窗详情隐藏 `ruleId`、`contractSection`、`acceptanceCriteria`、`device`、`viewport` 5 个内部字段，`annotations.json` 与编辑表单继续保留。
- **隐藏与恢复**：点击“隐藏标注”后隐藏 Marker、主面板、浮窗、高亮与编辑入口，仅保留小型“显示标注”按钮；再次显示时恢复原页面、类型和选中项，不修改页面状态或 JSON。

### 3. 双运行模式
- **本地编辑模式**（仅本地 HTTP 且保存/图片上传接口可用时启用）：主面板与浮窗内“手动修改”复用同一表单与保存接口，支持新增、编辑、删除、重新绑定和图片上传，真实写回 `annotations.json`（保存失败明确提示，不可仅写缓存）；浮窗可提供“Agent 修改”自然语言入口，未接真实 Agent 时必须标为交互演示、禁用应用按钮且不持久化。`file://` 仅作基础查看，不得声明为完整标注入口。
- **公网评审模式**（Vercel 等公网环境）：仅支持浏览、Marker、浮窗查看、隐藏恢复与图片浏览；隐藏全部新增、Agent 修改、手动修改、删除、重绑与图片上传入口，不发送任何写请求（如用户要求公网编辑，须先具备鉴权、持久化存储、权限控制与修改记录）。

---

## 验证清单与最终输出

运行 `validate-anchors.mjs` 并在浏览器实测：
1. `annotations.json` 可解析且标注/页面/锚点 ID 唯一；每个独立状态画板具备匹配 Contract 的状态标注与 `data-state`；
2. 图片附件相对路径有效、有非空 `alt`、无 Base64/绝对路径/外链，公网无上传入口；
3. 右侧主面板固定不可拖放且无页面目录，切换显隐不影响画板固定尺寸；左侧目录独立可用；
4. 所有可见目标自动显示圆形等宽 Marker（`padding-left/right: 0`，不被全局 button 撑长）；
5. Marker、主面板、目标高亮、右侧浮窗联动及外部点击关闭正常；5 个内部字段在详情隐藏而在编辑表单保留；
6. 刷新恢复显示状态/页面/类型/选中项；本地写回 `annotations.json` 有效（未接 Agent 时应用禁用），公网只读无写请求；
7. 标注开关两种模式下原型原有交互零退化、无 404 及控制台阻断错误。

```text
完成状态 / 目标原型路径 / 运行模式 / 本地编辑入口 / 公网评审入口 / 公网是否支持编辑 / 标注数量和页面 / 修改文件 / 保持不变 / 数据与锚点验证 / 图片附件验证 / 隐藏与恢复验证 / 目录与定位验证 / 编辑保存验证 / 原型回归验证 / 未验证项 / 遗留风险
```
