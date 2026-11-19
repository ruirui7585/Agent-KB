# Agent Workspace

Gemini / Antigravity、Codex、Claude Code、Cursor 及其他 AI Agent 共用的工作区：`/Users/shilv/Agent-Workspace`。
本文件提供目录说明与导航；执行规则以对应入口和规则文件为准。

## 规则与入口

| 文件 | 职责 |
|---|---|
| [AGENTS.md](AGENTS.md) | 工作区权威入口、通用执行与验证底线、项目与 Skill 路由（全 Agent 通用） |
| [GEMINI.md](GEMINI.md) | Gemini / Antigravity 专用薄入口，继承 AGENTS.md |
| [CLAUDE.md](CLAUDE.md) | Claude / Claude Code 专用薄入口，继承 AGENTS.md |
| [COMMON_UI_RULES.md](COMMON_UI_RULES.md) | 通用 UI / HTML 原型执行规范 |
| [product-rules.md](product-rules.md) | 新需求端到端产品协作、文档标准与原型 Skill 路由 |
| [rule-maintenance.md](rule-maintenance.md) | Skill 变更同步与长期指令提炼/确认门禁 |
| [Agent-KB/AGENTS.md](Agent-KB/AGENTS.md) | 共享知识库使用规则 |

## 目录

| 目录 | 用途 |
|---|---|
| `Projects/` | 正式项目；新项目放在这里，包含项目级 AGENTS.md（及按需配套平台入口） |
| `Agent-KB/` | 共享 Skill 与模板，默认只读；`~/.kb/` 指向此处 |
| `Sandbox/` | 临时实验与验证，不作为正式项目事实源 |

共享 Skill 存放于 `Agent-KB/skills/`。项目归档、跨项目操作与知识库修改均按入口规则及用户授权执行。
开始项目工作时，按 AGENTS.md 的读取顺序定位项目规则与当前需要的资料，无需全量读取目录。
