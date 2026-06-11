# Agent 工作区

Codex、Claude Code、Cursor 共用的本地 Agent 工作区。

本工作区的目标是：让不同 Agent 使用同一个正式知识库，避免读取 Desktop、Documents、plugins、旧日期目录中的混乱文件。

---

## 目录说明

```text
Agent-Workspace/
├── AGENTS.md          # Codex / 通用 Coding Agent 入口规则
├── CLAUDE.md          # Claude Code 入口规则
├── .cursorrules       # Cursor 规则入口，可选
├── README.md          # 本文件
│
├── Agent-KB/          # 唯一正式启用的共享知识库，项目任务中默认只读
│   ├── AGENTS.md      # 知识库使用说明
│   ├── skills/        # 通用 Skill
│   ├── global-rules/  # 跨项目通用规则
│   ├── templates/     # 文件模板
│   ├── examples/      # 参考案例
│   └── archive/       # 历史资料，默认不作为 active rule
│
├── Projects/          # 正式项目，每个项目一个子目录
├── Sandbox/           # 临时实验区，不作为正式规则或项目来源
└── Archive/           # 已完成、废弃或迁移前的历史项目
```

---

## 使用方式

- 新建项目放在 `Projects/` 下，每个项目应有自己的 `AGENTS.md` 和 `CLAUDE.md`。
- 通用 Skill 放在 `Agent-KB/skills/` 下。
- 临时试验放在 `Sandbox/` 下。
- 已完成或废弃项目移到 `Archive/`。

## 核心规则

- `Agent-KB/` 是唯一正式知识库，项目任务中 Agent 默认只读。
- 只有用户明确说"更新知识库"或"更新 Skill"时才能写入 `Agent-KB/`。
- 每个任务锁定一个项目，禁止跨项目修改。
- `Agent-KB/archive/` 和 `Archive/` 不作为活跃规则源。
- Agent 不得默认读取 Desktop、Documents、Downloads、plugins、old、backup、日期目录中的文件作为活跃规则。
