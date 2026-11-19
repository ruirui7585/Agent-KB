# Product Rules

适用于新产品需求、功能方案、产品文档和产品原型交付。仅在相应任务或阶段开始时读取相关章节；复用已加载内容。权限与优先级继承 [AGENTS.md](AGENTS.md)。

### Product Prototype Skill Routing

采用“**云端收口 → 轻量契约 → 高保真静态原型 `index.html` + 完整 `PRD.md`**”交付路径，由 `~/.kb/skills/pm-delivery-workflow/SKILL.md` 作为**唯一编排器**执行（各阶段细节由对应 Skill 定义，本入口不重复展开）：

| 触发条件 | 动作与路由 | 完成标准 |
|---|---|---|
| 新需求/云端讨论思路/Feature Contract → 原型与 PRD | 启动 `pm-delivery-workflow`，结合 `COMMON_UI_RULES.md` 与项目 `ui/UI_SYSTEM.md` 执行 | 完成 `契约 + 高保真 index.html + PRD.md + 本地预览`（按需 Vercel 只读）即交付 |
| 普通 Bug、文案微调、局部样式或重构 | **不启动** `pm-delivery-workflow`，直接局部 `Patch-Only` 或调用专项 Skill | 仅改动目标范围，既有内容不变 |

- `pm-delivery-workflow` 已内置云端抓取、准备检查与范围锁定，禁止在内部再调用独立 `contract-review`。

## Product Documentation Rules

- 正式编写 `PRD.md` 时使用 `~/.kb/templates/prd-template.md`，确保包含目标/非目标、角色与端差异、业务规则、状态流转与异常边界矩阵、后台字段表、数据口径与可测试验收标准（`Given-When-Then`）。
- **定稿前必须自检关键边界**：`PRD.md` 定稿前须复核权限、时序并发、回滚、存量级联、数据口径、极限值及前后台一致性边界；发现的 `P0/P1` 缺口先向用户确认或明确标为 `TBD`，不得静默遗漏。
- For metrics and tracking, define event name, trigger timing, properties, user scope, denominator, numerator, deduplication rule, time window, timezone attribution, and relevant `msg_id`, `reply_to_msg_id`, or session id relationships.

## 新需求端到端产品协作规则

1. **端到端主动推进**：除用户明确要求“先讨论 / 只分析 / 暂不输出 PRD 或原型”外，新需求按“问题定义 → 方案对比 → 风险边界 → 交付物”主动推进，不等待用户一步步指挥。
2. **复用上下文与多视角补漏**：按信息缺口读取相关项目事实（不每轮全量重读）；从用户、业务、产品、设计、开发、测试、数据、运营与风控视角主动识别隐含问题并给出产品判断。
3. **高价值澄清（每轮 ≤ 3 问）**：仅在影响产品方向、范围、复用、核心规则、统计/结算、成本、权限、风险或验收标准时优先澄清；每个问题必须附决策影响、候选方案权衡与 Agent 明确推荐。
4. **先定基线再批量交付**：讨论后集中产出需求基线（目标、用户场景、推荐方案、范围与非目标、核心规则、边界风险与遗留项）请用户确认；确认后一次性完成所需交付物，未确认项必须明确标为建议、假设或 `TBD`。
5. **交付自审与讨论边界**：交付前多角色自审，普通缺口安全补齐、高风险方向分歧集中确认；遇“仅讨论/只分析”请求时严守边界，不自动创建或修改正式项目文件。
