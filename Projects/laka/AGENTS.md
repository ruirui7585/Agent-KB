# Laka Project Agent Instructions

> Version: 2.0 (Deduplicated & Aligned)
> Last Updated: 2026-11-18
> Encoding: UTF-8
> Primary Language: Chinese
> Project: Laka

---

## 1. 文件目的与规则继承

本文件是 **Laka** 项目的统一 AI 执行协议（适用于 Antigravity、Codex、Claude Code、Cursor、ChatGPT 等所有环境）。

- **继承关系**：本项目继承工作区根目录的 [AGENTS.md](../../AGENTS.md)、[COMMON_RULES.md](../../COMMON_RULES.md)、[COMMON_UI_RULES.md](../../COMMON_UI_RULES.md) 与 [product-rules.md](../../product-rules.md)（包含单一事实源、禁止产生文件分支、最小范围增量修改、AI 假设禁区、验证完整性与完成报告要求）。本文件仅定义 **Laka 专属**的目录规范、上下文读取路由、前后台交付标准与知识归档流程，不重复抄写工作区通用条款。
- **核心要求**：Laka 是持续运营的长期项目。所有新需求默认继承 Laka 既有产品背景、公共业务规则、历史产品决策、当前需求状态和真实产品 UI 基线，不得要求用户重复提供已存在于项目文件中的内容。

---

## 2. 语言与命名规范

1. **文档与界面语言**：
   - 产品背景、业务规则、PRD、后台字段解释、决策原因、验收标准：**中文为主**；
   - 文件名、目录名、状态值、字段名、代码标识、接口字段：**小写英文**（单词间用连字符 `-`，无空格、无中文目录名、无 `new` / `latest` / `final` 等模糊后缀）；
   - App 前台界面文案：**默认使用英文**（必要时在英文术语首次出现时补充中文解释）。
2. **固定公共文件保留大写名称**：
   `AGENTS.md`、`PROJECT_CONTEXT.md`、`DECISIONS.md`、`REQUIREMENTS_INDEX.md`、`CHATGPT_CONTEXT.md`、`UI_SYSTEM.md`、`SCREEN_SPEC.md`、`README.md`、`PRD.md`。

---

## 3. 项目根目录（`PROJECT_ROOT`）与环境边界

1. **多设备路径兼容**：
   - 家庭电脑：`/Users/judy/Agent/Projects/laka`
   - 公司电脑：`/Users/shilv/Agent-Workspace/Projects/laka`
   - 以上为同一项目在不同设备上的副本。执行任务时以当前打开的 Laka 根目录为 `PROJECT_ROOT`（通过 `pwd` 及根目录特征文件识别），**项目正式文档与代码内部一律使用相对于 `PROJECT_ROOT` 的相对路径**，禁止硬编码本机绝对路径，也禁止在不存在的历史路径下自动新建副本。
2. **网页版 / 无法访问本地文件系统的环境**：
   - 不得声称已读取本地路径，应使用用户上传文件并优先读取 `CHATGPT_CONTEXT.md` 和当前需求文档。
   - `CHATGPT_CONTEXT.md` 仅为跨工具上下文汇总镜像，不是独立事实源；不得只更新镜像而不更新正式源文件。

---

## 4. 项目目录结构与文件职责

```text
laka/
├── AGENTS.md                 # 项目执行协议、读取顺序、交付与归档标准
├── PROJECT_CONTEXT.md        # 跨需求长期继承的产品定位、角色、资产与商业化事实
├── DECISIONS.md              # 已确认、未来需复用或防推翻的重要产品决策及原因
├── REQUIREMENTS_INDEX.md     # 需求总台账（状态、优先级、关联页面、当前与归档路径、阻塞项）
├── CHATGPT_CONTEXT.md        # 供网页版 ChatGPT 使用的公共上下文汇总镜像
├── ui/
│   ├── UI_SYSTEM.md          # Laka 全局 UI 规范、视觉真值优先级与组件设计系统
│   ├── references/           # 真机正式版截图库及截图索引（reference-index.md）
│   └── screens/<screen>/     # 8 大核心页面基线（reference.png、SCREEN_SPEC.md；guardian 待补充）
├── requirements/
│   ├── active/               # 进行中的正式需求目录（YYYYMMDD-english-requirement-name）
│   └── archive/YYYY/         # 已完成归档的需求目录
├── assets/                   # 公共品牌素材与素材清单（asset-manifest.md）
├── agents/competitor-analysis/ # 竞品监控规则（AGENT.md）、竞品池、状态与报告
└── make/                     # Axhub Make 独立工程工具链（仅在明确指定时使用）
```

> 若引用的文件尚不存在或为空：不得虚构内容或假装已读取，继续读取实际存在的有效文件，并在回复中明确列出缺失文件及限制。

---

## 5. 信息优先级

当信息发生冲突时，按以下优先级从高到低处理（高优先级胜出，并在交付说明中指出冲突）：

1. 用户在当前任务中的明确指令；
2. 当前需求最新有效的 `README.md` 和 `PRD.md`；
3. 用户明确提供并确认为当前版本的产品截图、蓝湖稿或 HTML；
4. 对应页面的 `baseline.html`、`reference.png` 和 `SCREEN_SPEC.md`；
5. `PROJECT_CONTEXT.md`；
6. `DECISIONS.md` 中状态为 `Confirmed` 的决策；
7. `REQUIREMENTS_INDEX.md`；
8. 用户授权参考的历史归档需求（`requirements/archive/`）；
9. AI 自身低风险推测（高风险业务规则严禁静默假设，见 [COMMON_RULES.md](../../COMMON_RULES.md)）。

---

## 6. 任务开始前的按需读取规则

遵循工作区“高效按需读取”原则，复用当前会话已加载内容，不机械重复全量读取：

1. **所有正式需求必读**：`AGENTS.md`、`PROJECT_CONTEXT.md`、`REQUIREMENTS_INDEX.md`，按需检索 `DECISIONS.md`；若目标需求目录已存在，读取 `requirements/active/<requirement>/README.md` 与 `PRD.md`。
2. **UI 与原型任务额外必读**：
   - `ui/UI_SYSTEM.md`、`ui/references/reference-index.md`（识别主参考与禁止继承的截图问题）、`assets/asset-manifest.md`（涉及宫殿背景、底部导航、货币、VIP、Relationship、徽章等品牌素材时必查）；
   - 目标页面的 `ui/screens/<screen>/SCREEN_SPEC.md`、`reference.png`、`baseline.html`（若无对应页面，依次检索 `ui/screens/` → `requirements/active/` → `requirements/archive/` → `assets/`）。
3. **历史归档需求（`requirements/archive/`）**：仅在用户明确要求参考、属于历史需求二期、功能高度相似、需追溯决策或当前文件明确引用时读取，不默认作为当前规则。
4. **竞品监控任务**：涉及竞品池、版本变化或市场监控时，读取 `agents/competitor-analysis/` 下的 `AGENT.md`、`competitor-pool.md`、`monitoring-backlog.md`、`state/monitoring-state.json`，报告保存在 `reports/`，仅输出自上次检查后的实质变化。

---

## 7. 正式需求判断与标准交付结构

### 7.1 正式需求边界
- **创建正式需求目录**：需输出正式 PRD、前后台静态评审原型、新增/调整业务规则、设计前后台交互或接口/数据逻辑、提供研发测试验收标准。
- **不创建需求目录**：单句文案优化、概念解释、临时咨询、纯头脑风暴（待进入正式方案阶段再建目录）。

### 7.2 目录命名与文件结构
路径：`requirements/active/YYYYMMDD-english-requirement-name/`

```text
requirements/active/<requirement>/
├── README.md          # 需求元信息、状态、基线来源与待办
├── PRD.md             # 完整业务规则、状态机、后台字段表与验收标准
├── index.html         # 唯一原型评审入口（纯后台无可视化需求时可不建）
├── css/style.css      # 样式文件（相对路径）
├── js/app.js          # 评审导航、Tab/状态切换脚本（相对路径）
├── assets/            # 需求专属静态资源（无专属资源时不建空目录）
└── annotations.json   # 产品标注数据事实源
```

### 7.3 `README.md` 必填项与状态枚举
- 必填：需求名称、创建日期、当前版本、需求类型、关联业务模块、关联页面、UI 基线来源、当前有效 PRD、当前有效 UI 交付物、文档状态、产品状态、待解决问题、最近更新时间。
- **文档状态**：`Draft` | `In Progress` | `Ready for Delivery` | `Archived`
- **产品状态**：`Proposed` | `Approved` | `In Development` | `Released` | `Paused` | `Cancelled`（文档归档不等于产品已上线）。

### 7.4 `PRD.md` 核心覆盖项
根据实际需求覆盖：1.需求背景 2.当前问题 3.需求目标 4.非目标 5.用户角色（区分男性消费侧与女性供给侧） 6.使用场景 7.用户流程 8.功能范围 9.业务规则 10.页面与交互规则（覆盖主客态） 11.状态及流转 12.异常与边界 13.前端要求 14.服务端要求 15.运营后台要求（含后台字段表） 16.数据与埋点 17.版本兼容 18.可测试验收标准 19.待确认问题（区分已确认与待确认）。

---

## 8. UI 事实源、竞品参考与前后台统一 HTML 原型规范

### 8.1 UI 事实源与基线保护
- 已有核心页面（1v1 IM 聊天、首页 For You、用户主页、会话列表、私密内容、守护关系、CP 关系、充值收银台、语音房）**必须基于实际 Laka 页面做增量修改**，严禁从空白画布重做整页或直接覆盖公共 `baseline.html`。
- 缺少实际页面依据时，依次检索全部 UI 文件、活跃需求、归档需求与素材库；仍缺失时局部新增组件须标记为 `Provisional UI`，不得升级为 `baseline.html`。
- 新增 UI 必须在文档或标注中明确：展示位置、层级、尺寸、展示条件、触发条件、点击行为、状态变化、与原有 UI 关系及是否遮挡现有内容。

### 8.2 竞品截图参考触发条件
- **无需搜索竞品**：用户已提供明确截图/原型/蓝湖稿，或已有有效 `baseline.html` / `reference.png` / `SCREEN_SPEC.md` 足以确定布局与状态，或仅为 `运营后台` 黑白线框。
- **必须搜索竞品**：无参考图仅有文字需求、现有参考不足以支撑高保真、新增组件/付费态/异常态无参考、属于 Laka 全新页面/交互，或用户明确要求。触发后至少查找 **3 个相关产品**，将截图/预览发给用户并说明参考点与 Laka 差异，确认后再进入高保真实现。

### 8.3 前后台统一 `index.html` 评审规范
所有需要可视化的需求必须通过**唯一入口 `index.html`** 交付，严禁将前台和后台拆成两个独立 HTML 链接或生成 `delivery.html`：

1. **一级视图切换**：
   - 同时涉及前台与运营后台时，提供 `App 前台` 与 `运营后台` 两个一级切换入口；只涉及一端时不得保留空白或无效 Tab。
   - 每一端的多页面或多状态通过页面/画板导航定位，默认只实现评审所需的目录、Tab、状态和注释切换，不要求实现保存、发布、支付等生产业务动态交互（除非用户明确要求）。
2. **`App 前台` 交付与高保真标准**：
   - **默认静态黑白线框 vs 可选色彩高保真**：遵循工作区 [product-rules.md](../../product-rules.md)，黑白静态线框即可作为默认基础评审交付（确认结构与 PRD 边界）；**色彩高保真为可选项**，仅当用户明确要求上色/高保真时，再按 `ui/UI_SYSTEM.md` 升级视觉；
   - 主验收视口为 **`440 × 956`（iPhone 17 Pro）**，并兼顾窄/宽常见手机视口；前台 UI 文案默认使用英文。
3. **`运营后台` 黑白线框与字段表唯一事实源**：
   - 涉及运营后台配置时，必须先在 `PRD.md` 中建立**后台字段表**并集中请 PM 确认（严禁 AI 擅自把金额、权限、审批、结算等未确认字段渲染为确定控件）。
   - 每个字段至少定义：稳定字段 ID（`F01`、`F02`）、所属页面与分组、按运营人员任务流组织的展示顺序（列表/筛选/新建/编辑/详情/审批分别定义，联动字段紧跟控制字段，系统只读信息独立分区）、字段名称与业务含义、控件类型、必填/默认值/取值范围/单位、显隐与联动条件、查看与编辑权限、生效时间与方式、异常提示，以及确认状态（`Confirmed` / `Proposed` / `TBD`）。
   - `运营后台` 视图使用**黑、白、灰静态线框**，每个字段显示一致的字段 ID（`F01` 等），且**同一视图内必须提供常驻字段解释区**（不能仅把字段解释藏在注释器中）。字段变更时必须先更新 `PRD.md` 字段表再同步 `index.html`。
4. **资源使用优先级**：项目内真实产品资源 > 当前页面已有资源 > 公共 `assets/` > 当前需求 `assets/` > 稳定网络资源（核心图标与品牌背景必须本地化，并在交付说明中标记外部资源）。

---

## 9. 公共文件更新与需求归档

### 9.1 公共文件更新门禁
| 文件 | 允许更新的条件 | 禁止写入的内容 |
|---|---|---|
| `REQUIREMENTS_INDEX.md` | 新建需求、阶段/文档/产品状态变更、关联页面或归档路径变更、阻塞项更新 | — |
| `DECISIONS.md` | 用户明确确认、未来可能复用或易被后续 Agent 误推翻、影响收入/成本/合规/多模块的重要决策 | 未确认建议、临时 UI/文案调整、完整历史 PRD |
| `PROJECT_CONTEXT.md` | 形成已确认、跨需求长期有效的平台级规则或核心定位变化 | 单个需求的局部特殊规则、短期投放数据 |
| `ui/UI_SYSTEM.md` | 形成跨页面的全局 UI 规则 | 单页面规则（应写入对应 `SCREEN_SPEC.md`） |
| `ui/screens/<screen>/baseline.html` & `SCREEN_SPEC.md` | 方案已确认、属于长期产品能力且已成为正式产品基线（或用户明确要求升级） | 尚未采用的归档需求、临时活动页、探索草稿 |
| `ui/screens/<screen>/reference.png` | 取得真实产品正式截图后更新 | AI 原型截图、蓝湖稿或合成图 |
| `CHATGPT_CONTEXT.md` | 上述正式源文件更新后同步刷新汇总镜像 | 仅修改镜像而不改正式源文件 |

### 9.2 需求完成与归档（`requirements/archive/YYYY/YYYYMMDD-...`）
- **归档条件**：`README.md`、`PRD.md`、应交付的唯一 `index.html`（含前后台视图、资源、`annotations.json`）或非可视化需求的结构化交付物已全部完成，PRD/字段表与 HTML 完全一致，可执行验证已通过，无阻塞交付的未决问题，用户未表示仍在讨论（严禁第一版草稿刚生成就立即归档）。
- **归档动作**：完成公共知识提炼（按 9.1 沉淀至 `PROJECT_CONTEXT.md` / `DECISIONS.md` / `ui/`）→ 移动完整需求目录至 `requirements/archive/YYYY/` → 更新 `REQUIREMENTS_INDEX.md` 与 `CHATGPT_CONTEXT.md`。

---

## 10. 修改前声明、验证与完成说明

1. **修改前声明**：遵循工作区 `Before Every Modification` 规范，并明确说明涉及的 Laka 业务模块、关联页面、以及是否会修改公共上下文或 UI 基线。
2. **验证要求**：除遵循 [COMMON_RULES.md](../../COMMON_RULES.md) 与 [COMMON_UI_RULES.md](../../COMMON_UI_RULES.md)（含右侧内置浏览器自动打开/刷新 `index.html`）外，还须专项核对：
   - PRD、后台字段表与 `index.html` 的角色、状态、权限、边界条件、字段 ID（`F01` 等）、顺序和常驻解释 100% 一致；
   - `Proposed` 和 `TBD` 字段未被渲染为已确认事实；未要求业务交互的静态界面不被误报为已完成动态交互验证。
3. **完成报告**：在通用完成报告基础上，明确说明使用的 UI 基线、是否更新公共上下文/新增重要决策/升级 UI 基线、以及是否已归档。
