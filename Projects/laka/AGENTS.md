# Laka Project Agent Instructions

> Version: 2.1 (Slim & Deduplicated) | Updated: 2026-11-19 | Project: Laka

本文件是 **Laka** 的专属执行协议，继承工作区 [AGENTS.md](../../AGENTS.md)、[COMMON_UI_RULES.md](../../COMMON_UI_RULES.md) 与 [product-rules.md](../../product-rules.md)，不复述通用条款。新需求默认继承 Laka 既有背景、决策、需求状态与真实 UI 基线。

## 1. 语言、命名与环境路径

- **语言**：文档/PRD/后台解释用中文；路径/字段/标识用小写英文连字符（保留大写公共文件：`AGENTS.md`、`PROJECT_CONTEXT.md`、`DECISIONS.md`、`REQUIREMENTS_INDEX.md`、`CHATGPT_CONTEXT.md`、`UI_SYSTEM.md`、`COPY_GLOSSARY.md`、`SCREEN_SPEC.md`、`README.md`、`PRD.md`）。
- **App 前台英文**：默认英文，严格按 `~/.kb/skills/social-ui-copy/SKILL.md` 与 `ui/COPY_GLOSSARY.md` 取词（新功能优先对标 `SUGO`、`Yalla`、`Chamet`、`BIGO Live`、`Timo`、`SoulChill`、`YoHo` 真实英文 UI，既有核心入口沿用 Laka 确认词且排除 `reference-index.md` 标明不继承的瑕疵词，禁直译与 B 端词泄漏）。
- **多设备 `PROJECT_ROOT`**：家庭 `/Users/judy/Agent/Projects/laka`、公司 `/Users/shilv/Agent-Workspace/Projects/laka`。以当前打开根目录为准，文档与代码内一律用相对路径，禁硬编码本机绝对路径。
- **网页/无本地权限环境**：不伪称已读本地文件，优先读用户上传的 `CHATGPT_CONTEXT.md`（仅汇总镜像，非独立事实源）和当前需求文档。

## 2. 目录结构与信息优先级

```text
laka/
├── AGENTS.md / PROJECT_CONTEXT.md / DECISIONS.md / REQUIREMENTS_INDEX.md / CHATGPT_CONTEXT.md
├── ui/
│   ├── UI_SYSTEM.md            # 全局 UI 规范、视觉真值优先级与组件系统
│   ├── COPY_GLOSSARY.md        # 前台英文文案与专有名词词表
│   ├── references/             # 真机截图库与索引（reference-index.md）
│   └── screens/<screen>/       # 8 大核心页面基线（reference.png、SCREEN_SPEC.md；guardian 待补）
├── requirements/{active/, archive/YYYY/}  # 活跃与归档需求（YYYYMMDD-english-slug）
├── assets/                     # 公共品牌素材与清单（asset-manifest.md）
├── agents/competitor-analysis/ # 竞品监控规则、竞品池与报告
└── make/                       # Axhub Make 工程（仅明确指定时使用）
```

- **信息优先级（高 → 低）**：用户当前指令 > 当前需求 `README.md`/`PRD.md` > 确认版截图/蓝湖/HTML > 页面 `baseline.html`/`reference.png`/`SCREEN_SPEC.md` > `PROJECT_CONTEXT.md` > `DECISIONS.md(Confirmed)` > `REQUIREMENTS_INDEX.md` > 授权归档需求 > 低风险推断（高风险禁静默假设）。引用文件缺失时如实列出，不得虚构。

## 3. 按需读取路由（复用已加载内容）

1. **正式需求必读**：`AGENTS.md`、`PROJECT_CONTEXT.md`、`REQUIREMENTS_INDEX.md`（有已登记决策时查 `DECISIONS.md`）；需求目录已存在时读其 `README.md` 与 `PRD.md`。
2. **UI / 原型必读**：`ui/UI_SYSTEM.md`、`ui/COPY_GLOSSARY.md`、`ui/references/reference-index.md`、涉及品牌资产查 `assets/asset-manifest.md`，以及目标页 `ui/screens/<screen>/SCREEN_SPEC.md`、`reference.png`、`baseline.html`。
3. **归档需求（`requirements/archive/`）**：仅明确指定、二期迭代、高度相似或追溯决策时读取。
4. **竞品监控**：读 `agents/competitor-analysis/` 下 `AGENT.md`、`competitor-pool.md`、`monitoring-backlog.md`、`state/monitoring-state.json`，报告落 `reports/`，仅报实质变化。
5. **PM 日常收箱与需求前预研**：触发「需求前预研」「收箱整理」「入库拆解」或新功能竞品参考时，优先读 `pm-inbox/PLAYBOOK.md`、`agents/competitor-analysis/library-data.json` 与对应能力域 `cards/`，先复用已沉淀的实机拆解和词表，再给精准实机补拍清单；新英文词先落 `copy-staging.md`，经 PM 确认后再入 `ui/COPY_GLOSSARY.md`。

## 4. 正式需求结构与文档标准

- **建目录边界**：输出正式 PRD、静态评审原型、新增/调整业务规则或前后台逻辑时建 `requirements/active/YYYYMMDD-english-slug/`（含 `README.md`、`PRD.md`、唯一 `index.html` 及实际引用的 `css/style.css`、`js/app.js`、`assets/`）；单句文案/临时咨询/纯脑暴不建目录。
- **`README.md` 必填**：需求名称、创建日期、版本、类型、关联模块与页面、UI 基线来源、当前有效 PRD/UI 交付物、文档状态（`Draft|In Progress|Ready for Delivery|Archived`）、产品状态（`Proposed|Approved|In Development|Released|Paused|Cancelled`）、待解决问题、最近更新时间。
- **`PRD.md` 标准**：按 `~/.kb/templates/prd-template.md` 编写，须覆盖男女消费/供给侧差异、主客态交互、前后台字段表、版本兼容与区分已确认/待确认项。

## 5. UI 交付、竞品参考与前后台规范

- **基线保护**：9 个既有核心页（1v1 IM、首页 For You、个人主页、会话列表、私密内容、守护、CP、收银台、语音房）必须增量修改，严禁重做整页或覆盖公共 `baseline.html`；无依据的新增组件标 `Provisional UI`，须写清位置、层级、尺寸、显隐/触发条件与遮挡关系。
- **竞品参考**：视觉缺参考图或为全新页面/组件时，先查 ≥ 3 个竞品发截图说明差异并经确认再做高保真；新功能英文文案必先查 `ui/COPY_GLOSSARY.md`，未覆盖词按 `social-ui-copy` 联网对齐成熟竞品（`SUGO`/`Yalla`/`Chamet`/`BIGO Live`/`Timo`/`SoulChill`/`YoHo`）真实英文 UI。
- **前后台统一 `index.html`**（禁拆多链或建 `delivery.html`）：
  1. 同时含前后台时在同页提供 `App 前台` / `运营后台` 一级切换（单端不留空 Tab）；默认仅做评审目录、Tab 与状态切换，不写生产业务交互。
  2. **`App 前台`**：直接按 `ui/UI_SYSTEM.md` 交付高保真，主验收视口 **`440 × 956`（iPhone 17 Pro）**，默认英文。
  3. **`运营后台`（黑/白/灰静态线框）**：先在 `PRD.md` 建立后台字段表并经 PM 确认（严禁把未定金额/权限/结算画成确定控件）；每字段须含稳定 ID（`F01` 等）、所属页与任务流顺序、业务含义、控件/校验/默认值/范围/联动/权限/生效方式与状态（`Confirmed|Proposed|TBD`）；页面展示一致字段 ID 且**同视图提供常驻字段解释区**，变更时先改 `PRD.md` 再同步 `index.html`。
  4. **资源优先级**：真实产品资源 > 当前页已有 > 公共 `assets/` > 需求 `assets/` > 稳定外链（核心图标与背景须本地化）。

## 6. 公共文件更新门禁与归档

| 文件 | 允许更新条件 | 禁止写入 |
|---|---|---|
| `REQUIREMENTS_INDEX.md` | 新建需求、状态/页面/归档路径或阻塞项变更 | — |
| `DECISIONS.md` | 经确认、可复用/易误推翻或影响收入/成本/合规的重要决策 | 未确认建议、临时微调、完整 PRD |
| `PROJECT_CONTEXT.md` | 长期平台级规则或核心定位变化 | 单需求局部规则、短期投放数据 |
| `ui/UI_SYSTEM.md` | 跨页面全局 UI 规则 | 单页面规则（写对应 `SCREEN_SPEC.md`） |
| `ui/COPY_GLOSSARY.md` | 经 PM 确认的跨需求英文专有名词或竞品对齐词条 | 临时句子、直译词或瑕疵英文 |
| `ui/screens/*/baseline.html` & `SCREEN_SPEC.md` | 方案确认且已成为正式产品基线（或明确要求升级） | 未采用归档、临时活动、草稿 |
| `ui/screens/*/reference.png` | 取得真实产品正式截图后更新 | AI 原型截图、蓝湖稿或合成图 |
| `CHATGPT_CONTEXT.md` | 正式源文件更新后同步刷新镜像 | 仅改镜像不改源文件 |

- **归档（`requirements/archive/YYYY/YYYYMMDD-...`）**：全部交付物完备一致、验证通过、无阻塞未决项且不再讨论时（禁初稿即归档），先按上表提炼沉淀 → 移动目录 → 更新 `REQUIREMENTS_INDEX.md` 与 `CHATGPT_CONTEXT.md`。

## 7. 修改前声明、专项验证与完成报告

- 修改前按工作区规范声明，并补充涉及的 Laka 业务模块、关联页面及是否改动公共上下文/UI 基线。
- 除遵循工作区 `AGENTS.md` 与 `COMMON_UI_RULES.md` 外，专项核对：PRD/字段表/`index.html` 的角色、状态、权限、字段 ID 与常驻解释 100% 一致；`Proposed`/`TBD` 未被画成已确认事实；静态界面不误报动态验证。完成报告注明使用的 UI 基线、公共上下文/决策更新及归档状态。
