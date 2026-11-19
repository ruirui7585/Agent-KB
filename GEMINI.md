# Gemini / Antigravity Workspace Entry

本文件是 Gemini / Gemini CLI / Antigravity 专用薄入口，不是独立规则或项目事实源。

- 首次进入工作区任务时，加载当前上下文中缺失的 [AGENTS.md](AGENTS.md)，遵循其中的读取顺序、优先级、权限、执行要求和专项触发条件；已加载内容直接复用。
- 首次访问具体项目文件前，按工作区入口补读该项目中缺失的 `AGENTS.md`（若项目内存在 `GEMINI.md` 一并补读）。
- Skill 路由、编码规则与规则维护流程均继承工作区入口及其按需引用的文件，不在此复制。Skill 变更时按 [rule-maintenance.md](rule-maintenance.md) 同步复核入口，仅在 Gemini 专属内容或引用受影响时修改本文件。
