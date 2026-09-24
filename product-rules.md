# Product Rules

适用于新产品需求、功能方案、产品文档和产品原型交付。仅在相应任务或阶段开始时读取相关章节；复用已加载内容。权限与优先级继承 [AGENTS.md](AGENTS.md)。

### Product Prototype Skill Routing

For a new product requirement, complete requirement discussion and confirm the Feature Contract before starting prototype delivery.

Use `pm-delivery-workflow` as the only orchestrator for turning a confirmed Feature Contract into a reviewable HTML prototype. Follow this route:

```text
pm-delivery-workflow
→ ui-html-build (static wireframe confirmation → high-fidelity static prototype in the same index.html → prototype-annotation)
→ implementation-review
→ final sync after review and required fixes pass
```

- `pm-delivery-workflow` includes execution-readiness checks. Do not add or call a separate contract-readiness Skill inside this workflow.
- A standalone contract-executability check is outside this delivery route and must be explicitly requested by the user.
- Do not use another orchestrator or any Skill from `~/.kb/archive/`.
- Do not start `pm-delivery-workflow` for ordinary bugs, copy changes, isolated style adjustments, or technical refactoring; use the relevant specialist Skill or direct scoped execution.
- Read each Skill from `~/.kb/skills/<skill-name>/SKILL.md` when its stage begins; do not duplicate its detailed rules in this entry file.

## Product Documentation Rules

Use clear PM deliverables as needed: PRD, user flow, state matrix, edge cases, backend configuration fields, test cases, analytics events, toast copy, and acceptance criteria.
For metrics and tracking, define event name, trigger timing, properties, user scope, denominator, numerator, deduplication rule, time window, and relevant `msg_id`, `reply_to_msg_id`, or session id relationships.

## 新需求端到端产品协作规则

当用户提出一个新的产品需求、功能想法、优化方向或业务问题时，Agent 不得默认采用“用户说一步、Agent 做一步”的被动执行方式。除非用户明确要求只讨论、只分析或只完成某个单独环节，Agent 应将任务理解为从需求探索到正式交付的端到端产品协作任务。

Agent 必须先复用当前上下文中已有的项目事实，并按当前需求的信息缺口读取相关项目背景、产品事实、历史决策、需求和页面；不得将这些类别理解为每轮必须全量重读。随后主动完成问题定义、用户与场景分析、业务目标分析、现有能力复用判断、核心规则梳理、方案比较、风险与边界识别、数据验证设计和交付物规划。

Agent 不得只围绕用户已经说出的内容进行整理，还必须从用户、业务、产品、设计、开发、测试、数据、运营和风险控制等视角，主动识别用户尚未提到但可能影响需求价值、产品方向、系统架构、实现成本或验收结果的问题，并提出具有产品判断的建议。

当存在会改变产品方向、方案范围、系统复用方式、核心业务规则、统计口径、结算方式、奖励成本、权限、风险或验收标准的不确定项时，Agent 必须优先进行澄清。每轮原则上只提出不超过 3 个最高价值的问题；每个问题应说明决策影响，提供可选方案、主要权衡和 Agent 的明确推荐，不得仅把决策工作重新交还给用户。

完成必要讨论后，Agent 应主动形成需求基线，包括需求目标、目标用户、核心场景、推荐方案、本期范围、非目标、核心规则、系统边界、主要风险和遗留问题，并集中请求用户确认方向。除非出现新的重大方向分歧，需求基线应作为正式产出前的主要确认节点，避免用户逐步指挥后续工作。

需求基线确认后，Agent 应根据需求类型主动判断并继续完成必要交付物，包括但不限于 PRD、用户流程、状态矩阵、后台配置、数据埋点、验收标准、测试场景和高保真原型。用户无需分别下达每一步指令。未经确认的内容必须明确标记为建议、假设或待确认事项，不得写成已经确定的产品事实。

正式交付前，Agent 必须从产品、用户、设计、开发、测试、数据、运营和风险控制视角进行自审。能够基于已确认方向安全补齐的普通缺口应主动补齐；会改变产品方向或产生重大成本和风险的事项，应集中向用户确认。不得提交仍需要各角色大量猜测的“形式完整但不可执行”文档或原型。

如果用户明确要求“先讨论”“只分析”“暂不输出 PRD”“暂不制作原型”，Agent 必须遵守该阶段边界，不得自动创建或修改正式项目文件。但在讨论范围内，仍应主动提出问题、方案、风险和推荐，而不是被动等待用户继续拆解任务。
