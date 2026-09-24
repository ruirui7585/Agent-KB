# Agent Workspace

Codex、Claude Code 和 Cursor 共用的工作区：`/Users/shilv/Agent-Workspace`。
本文件提供目录说明与导航；执行规则以对应入口和规则文件为准。

## 规则与入口

| 文件 | 职责 |
|---|---|
| [AGENTS.md](AGENTS.md) | 工作区权威入口、权限边界、项目与 Skill 路由 |
| [CLAUDE.md](CLAUDE.md) | Claude 专用入口，继承 AGENTS.md |
| [COMMON_RULES.md](COMMON_RULES.md) | 文件控制、冲突处理、修改与验证细则 |
| [COMMON_UI_RULES.md](COMMON_UI_RULES.md) | 通用 UI / HTML 原型规范 |
| [handoff.md](handoff.md) | 全局交接协议与最近一次任务快照 |
| [Agent-KB/AGENTS.md](Agent-KB/AGENTS.md) | 共享知识库使用规则 |

## 目录

| 目录 | 用途 |
|---|---|
| `Projects/` | 正式项目；新项目放在这里，包含项目级 AGENTS.md 和 CLAUDE.md |
| `Agent-KB/` | 共享 Skill、规则、模板与案例，默认只读；`~/.kb/` 指向此处 |
| `Sandbox/` | 临时实验与验证，不作为正式项目事实源 |
| `Archive/` | 已完成、停用或迁移的历史内容，默认不读取 |

共享 Skill 存放于 `Agent-KB/skills/`。项目归档、跨项目操作与知识库修改均按入口规则及用户授权执行。
开始项目工作时，按 AGENTS.md 的读取顺序定位项目规则与当前需要的资料，无需全量读取目录。
