# Product Rules

适用于新产品需求、功能方案、产品文档和产品原型交付。仅在相应任务或阶段开始时读取相关章节；复用已加载内容。权限与优先级继承 [AGENTS.md](AGENTS.md)。

### Product Prototype Skill Routing

采用“**云端收口 → 轻量契约 → 静态黑白线框图 + 完整 `PRD.md`（含 7 维边界自检）→【可选】色彩高保真**”交付路径，由 `~/.kb/skills/pm-delivery-workflow/SKILL.md` 作为**唯一编排器**执行（各阶段细节由对应 Skill 定义，本入口不重复展开）：

| 触发条件 | 动作与路由 | 完成标准 |
|---|---|---|
| 新需求/云端讨论思路/Feature Contract → 原型与 PRD | 启动 `pm-delivery-workflow`，按阶段按需读取 `ui-html-build`、`prd-boundary-audit`、`implementation-review`、`prototype-annotation` | 默认 `wireframe-only` 完成 `契约 + 黑白线框 index.html + PRD.md + 7 维边界自检 + 本地预览` 即交付 |
| 明确要求“需要上色 / 高保真” | 在 `pm-delivery-workflow` 中走 `two-stage`（先线框确认再上色）或 `high-fidelity` | 在同一 `index.html` 原地升级高保真 + 标注 + 审查 + Vercel 只读 |
| 普通 Bug、文案微调、局部样式或重构 | **不启动** `pm-delivery-workflow`，直接局部 `Patch-Only` 或调用专项 Skill | 仅改动目标范围，既有内容不变 |

- `pm-delivery-workflow` 已内置云端抓取、准备检查与范围锁定，禁止在内部再调用独立 `contract-review` 或 `~/.kb/archive/` 中的 Skill。

## Product Documentation Rules

- 正式编写 `PRD.md` 时使用 `~/.kb/templates/prd-template.md`，确保包含目标/非目标、角色与端差异、业务规则、状态流转与异常边界矩阵、后台字段表、数据口径与可测试验收标准（`Given-When-Then`）。
- **定稿前必须运行边界扫雷**：`PRD.md` 输出定稿前（或对已有 PRD 补漏时），调用 `~/.kb/skills/prd-boundary-audit/SKILL.md` 完成 7 维对抗性边界自检；发现的 `P0/P1` 缺口先向用户确认或明确标为 `TBD`，不得静默遗漏。
- For metrics and tracking, define event name, trigger timing, properties, user scope, denominator, numerator, deduplication rule, time window, timezone attribution, and relevant `msg_id`, `reply_to_msg_id`, or session id relationships.

## 新需求端到端产品协作规则

当用户提出一个新的产品需求、功能想法、优化方向或业务问题时，Agent 不得默认采用“用户说一步、Agent 做一步”的被动执行方式。除非用户明确要求只讨论、只分析或只完成某个单独环节，Agent 应将任务理解为从需求探索到正式交付的端到端产品协作任务。

Agent 必须先复用当前上下文中已有的项目事实，并按当前需求的信息缺口读取相关项目背景、产品事实、历史决策、需求和页面；不得将这些类别理解为每轮必须全量重读。随后主动完成问题定义、用户与场景分析、业务目标分析、现有能力复用判断、核心规则梳理、方案比较、风险与边界识别、数据验证设计和交付物规划。

Agent 不得只围绕用户已经说出的内容进行整理，还必须从用户、业务、产品、设计、开发、测试、数据、运营和风险控制等视角，主动识别用户尚未提到但可能影响需求价值、产品方向、系统架构、实现成本或验收结果的问题，并提出具有产品判断的建议。

当存在会改变产品方向、方案范围、系统复用方式、核心业务规则、统计口径、结算方式、奖励成本、权限、风险或验收标准的不确定项时，Agent 必须优先进行澄清。每轮原则上只提出不超过 3 个最高价值的问题；每个问题应说明决策影响，提供可选方案、主要权衡和 Agent 的明确推荐，不得仅把决策工作重新交还给用户。

完成必要讨论后，Agent 应主动形成需求基线，包括需求目标、目标用户、核心场景、推荐方案、本期范围、非目标、核心规则、系统边界、主要风险和遗留问题，并集中请求用户确认方向。除非出现新的重大方向分歧，需求基线应作为正式产出前的主要确认节点，避免用户逐步指挥后续工作。

需求基线确认后，Agent 应根据需求类型主动判断并继续完成必要交付物，包括但不限于 PRD、用户流程、状态矩阵、后台配置、数据埋点、验收标准、测试场景和高保真原型。用户无需分别下达每一步指令。未经确认的内容必须明确标记为建议、假设或待确认事项，不得写成已经确定的产品事实。

正式交付前，Agent 必须从产品、用户、设计、开发、测试、数据、运营和风险控制视角进行自审。能够基于已确认方向安全补齐的普通缺口应主动补齐；会改变产品方向或产生重大成本和风险的事项，应集中向用户确认。不得提交仍需要各角色大量猜测的“形式完整但不可执行”文档或原型。

如果用户明确要求“先讨论”“只分析”“暂不输出 PRD”“暂不制作原型”，Agent 必须遵守该阶段边界，不得自动创建或修改正式项目文件。但在讨论范围内，仍应主动提出问题、方案、风险和推荐，而不是被动等待用户继续拆解任务。
