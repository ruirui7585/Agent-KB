---
name: ui-html-build
description: 基于 Feature Contract 与交付模式（wireframe-only 极简黑白线框 / two-stage 先线框后上色 / high-fidelity 直接上色高保真），全自动生成严格贴合画板白名单的静态 HTML 原型。强化“禁止擅自加戏、色彩高保真省 Token 外联架构、Patch-Only 局部增量微调”约束，不用于生产开发。
---

# UI HTML Build

## 定位、核心铁律与 Token 节约原则

将 Feature Contract 自动转换为静态 HTML 产品原型，**唯一入口为 `index.html`**（禁建 `wireframe.html`、`prototype-v2.html`、`final.html` 或 `delivery.html`，不修改生产代码或接真实 API）。

**事实源优先级**：`用户本轮最新明确确认 > Feature Contract > Agent 执行包 > 项目规范 > 当前有效原型 > 视觉参考 > Agent 默认判断`。

### 铁律一：Strict Scope Lock（禁止擅自加戏）
- **画板白名单唯一原则**：**只绘制** Feature Contract 白名单中明确列出的画板与核心元素。
- **禁止自行补充**：未列出的低频异常板、空态/加载板、未要求的二次确认弹窗、额外统计卡片、演示开关、营销引导或模拟点击流程**一律不画**，仅在 `PRD.md` 或 `TBD` 列表中保留文字说明。
- **违者即 P0 越界**：任何未授权多画的组件或画板在审查中视为 `Scope Creep` 立即删除。

### 铁律二：Patch-Only Iteration（局部增量微调，杜绝全页重写）
- 用户针对已有原型（尤其是高耗 Token 的**色彩高保真原型**）提出修改时，**仅增量编辑被点名的画板、选择器或局部文件**，保持其余画板、排版与既有交互 100% 原封不动；输出时明确说明“修改了哪几处 / 保持不变区域”。

### 铁律三：色彩高保真 Token 控制（把 Token 用在刀刃上）
- **结构期不烧色彩 Token**：先用轻量黑白静态线框跑通结构与边界，再进色彩高保真；
- **外联拆分不内联膨胀**：高保真阶段必须拆分为 `index.html` + `css/style.css` + `js/app.js` + `assets/`（相对路径），禁止把数千行 CSS 或 Base64 图片硬塞进 HTML 导致每次微调反复吞吐巨量 Token；
- **按需双语**：默认按单一目标语言生成（如英文），仅当 `Language = bilingual` 或项目明确要求时才生成双语切换。

---

## 执行前核对

快速核对（无需停下等待人工回复）：交付模式（默认 `wireframe-only` 仅黑白线框；仅明确要求上色时才用 `two-stage` / `high-fidelity`）、Contract 画板白名单与 `Non-Goals`、目标终端画布尺寸（以目标项目 `ui/UI_SYSTEM.md` 为准，移动端通用默认 `393 × 852px`，后台 `1440px`）、视觉来源、唯一 `index.html` 路径。

---

## 移动端画布标准（两阶段共用）

- 每个画板使用独立固定画布，锁定 `width`、`height`、`min-width`、`flex-basis`，禁止百分比缩放或 `transform: scale()`；窄屏由外层评审区滚动或换行。
- 画板编号、名称、角色/状态与对应规则编号（`data-contract-rule`、`data-state`）放在画布外上方，不占设备内容区。

---

## 阶段一：黑白静态线框图（默认基础交付 · 快速看结构）

适用场景：默认 `Mode = wireframe-only`（做完即交付，不上色）或用户主动选择 `two-stage` 的第一步。核心目标：**用干净极简的黑白画板第一时间看清结构、层级、入口与白名单分支**。

- **轻量化实现**：
  - 按 Contract 指定单一语言输出，不额外生成双语文案；
  - 顶部一行 `<nav>` 原生 `#S01` 锚点跳转 + 简短标题（不生成重型 JS 折叠目录或长篇背景卡片）；
  - 不接入 `prototype-annotation` 重型 Runtime 与 `annotations.json`（在画板外下方用 1–3 行写清 `触发 / 条件 / 结果`）；
  - 单文件精简内联 CSS，不写动画、渐变、装饰阴影或业务 JS。
- **视觉规范**：背景 `#FFFFFF`、主文字与主按钮 `#111111`（白字）、次按钮白底黑字灰框、辅助文字 `#666666`、边框 `#D9D9D9`、禁用 `#BFBFBF`；系统无衬线字体；标题 `20/28px` `600`、区块 `16/24px` `600`、正文 `14/22px`、辅助 `12/18px`、`8px` 网格、操作高度 `≥ 44px`。
- **Icon 与状态**：复用项目图标/极简线框 SVG（禁 Emoji、空方框或“Icon”文字）；真实业务文案，不用 `Lorem ipsum`；仅对白名单内产生不同 UI 的角色/状态分支各自独立成板，弹窗/Sheet 静态展开展示。

---

## 阶段二（可选）：色彩高保真静态 HTML + 完整评审层

适用场景：**仅当用户明确要求上色**（`Mode = high-fidelity` 或 `two-stage` 线框与边界确认后升级）。直接在**同一个 `index.html` 原地升级**（保留既有 `data-page-id` 与画板 `id`）。

1. **视觉与外联规范**：
   - 有设计系统或确认视觉参考时称为“高保真原型”，无视觉来源时称为“高完成度概念原型”；复用项目视觉系统、颜色与真实头像/图标，不新增 Contract 外规则或业务点击交互；
   - 样式和脚本分离到 `css/style.css` 与 `js/app.js`，图片存 `assets/`，避免单文件臃肿。
2. **完整评审外壳（高保真启用）**：
   - **演示封面与需求背景**：大/小标题 + 需求背景卡片（Agent 修改未接入时禁用应用按钮）。
   - **左侧固定原型目录**：直读 HTML DOM（`data-page-id` 与画板 `id`），独立于 `annotations.json`，支持整体与分组折叠，关闭标注仍可用。
   - **双语切换**（仅当 `Language = bilingual` 或项目明确要求时启用）：顶部固定 `中文 / English` 切换，覆盖封面、背景、原型、目录和后台，刷新记忆且无混排、不改锚点或画板尺寸。
   - **前后台统一评审**（含后台时）：同一 `index.html` 左侧切换前台与黑白线框后台；仅 `Confirmed` 字段可作正式控件，建议字段明确标识来源，未定义权限默认只读；进后台隐藏标注 UI。
3. **产品标注接入**：仅在本阶段为业务元素添加语义锚点（kebab-case `data-annotation-id` + `data-contract-rule` + `data-state`）并生成 `annotations.json`；Runtime 接入、面板/Marker 规范及双模式约束严格按 `~/.kb/skills/prototype-annotation/SKILL.md` 执行，禁止另写第二套标注。

---

## 自检、异常处理与输出

1. **自检**：
   - **通用必检**：`index.html` 唯一非空、白名单 100% 匹配且 **0 越界加戏**、浏览器实测 `getBoundingClientRect()` 画布宽高锁定、无 404 与控制台报错。
   - **高保真追加必检**：外联 CSS/JS/资源正常（无大块 Base64 内联膨胀）、封面/左侧目录（独立于 JSON）、双语无混排（如启用）、前后台同入口与只读边界，并按 `prototype-annotation` 完成标注层自检。
2. **修复 vs 暂停**：样式/尺寸/白名单漏画或越界加戏/漏翻/锚点或标注联动缺陷 → **直接局部 Patch 修复**；Contract 冲突/缺关键规则/需改动核心结构或旧逻辑/涉及生产代码/同问题超 3 轮 → **暂停并返回 `pm-delivery-workflow`**。

```text
完成状态 / 交付模式 / 目标原型路径 / 白名单画板与未改动范围 / 产品标注（高保真适用）/ 实际验证 / 未验证项 / 遗留风险
```

**禁止**：超出白名单擅自加画板或功能；修改未点名画板（非 Patch-Only）；高保真把海量样式或 Base64 内联进单文件导致后续微调耗费大量 Token；生成 `delivery.html` 或平行 HTML；未验证却声称通过。
