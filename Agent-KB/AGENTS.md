# Agent Knowledge Base

位置：`~/.kb/` → `/Users/shilv/Agent-Workspace/Agent-KB`（跨 Agent 复用，默认只读）。

| Directory | Purpose |
|---|---|
| `./skills/` | 正式启用的跨项目通用 Skill |
| `./templates/` | 跨项目标准模板（契约 / PRD） |

## 规则

- **读写权限**：Agent 可按需读取 `./skills/` 与 `./templates/`；除非用户明确授权（如“更新知识库 / 更新 Skill / 创建新 Skill”），严禁写入或删除本目录文件。
- **Agent 中性编写**：所有活动 Markdown 必须以“Agent”作为通用执行主体，不得将特定模型定性为唯一执行者；仅在描述真实平台专属路径、命令、API 或 Runtime 时保留具体产品名并限定适用范围。
- **维护约定**：新增 Skill 放入 `./skills/<skill-name>/`，模板放入 `./templates/`，废弃内容直接清理（依赖 Git 历史留档）。
