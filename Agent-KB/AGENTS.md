# Agent Knowledge Base

位置：`~/.kb/` → `/Users/shilv/Agent-Workspace/Agent-KB`（跨 Agent 复用，默认只读）。

| Directory | Purpose |
|---|---|
| `./skills/` | 正式启用的跨项目通用 Skill |
| `./templates/` | 跨项目标准模板（契约 / PRD） |
| `./pm-kb/` | PM 个人成长可视化知识库（唯一事实源 `pm-kb.md` + 离线复盘页 `review.html` + 同步脚本 `sync-kb.mjs`） |

## 规则

- **读写权限**：Agent 可按需读取 `./skills/`、`./templates/` 与 `./pm-kb/pm-kb.md`；除非用户明确授权（如“更新知识库 / 更新 Skill / 创建新 Skill”，或在 `pm-kb` A 模式确认卡中回复 `1` / `记下`），严禁写入或删除本目录文件。
- **pm-kb 同步与可读性**：每次写入 `./pm-kb/pm-kb.md` 后必须运行 `/usr/local/bin/node ~/.kb/pm-kb/sync-kb.mjs` 刷新 `kb-data.js`，并严守极简大白话字数红线（`hook` ≤ 20 字、`flow` 单步 ≤ 22 字、`contrast` 单侧 ≤ 30 字、`flashcard` 正文 ≤ 45 字；专业黑话收进 `glossary` 折叠区）。
- **Agent 中性编写**：所有活动 Markdown 必须以“Agent”作为通用执行主体，不得将特定模型定性为唯一执行者；仅在描述真实平台专属路径、命令、API 或 Runtime 时保留具体产品名并限定适用范围。
- **维护约定**：新增 Skill 放入 `./skills/<skill-name>/`，模板放入 `./templates/`，废弃内容直接清理（依赖 Git 历史留档）。
