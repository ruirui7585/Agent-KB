# Agent Knowledge Base

## Directory Purpose

| Directory | Purpose | Active |
|-----------|---------|--------|
| `./skills/` | Officially enabled general-purpose skills | Yes |
| `./global-rules/` | Rules that apply across all projects | Yes |
| `./templates/` | File and project templates | Yes |
| `./examples/` | Reference examples and configurations | Yes |
| `./archive/` | Deprecated or superseded KB entries | **No** |

## Location
Knowledge base is located at: `~/.kb/`

## Rules

### For Agents
- You may **read** `./skills/`, `./global-rules/`, `./templates/`, and `./examples/` for context.
- You must **not write** to the KB unless the user explicitly says:
  - "update knowledge base"
  - "update skill"
  - "add to knowledge base"
  - "create a new skill"
  - or equivalent explicit instruction.
- `./archive/` is **never an active rule source**. Do not read from it by default.

### Agent-Neutral Authoring

Agent-KB 是跨 Agent 复用的通用知识库。所有活动 Markdown 必须使用“Agent”作为通用执行主体，不得将 Codex、GPT、ChatGPT 或其他特定模型定性为唯一执行者。只有在描述真实的平台专属路径、命令、API 或 Runtime 时，才保留具体产品名称，并明确限定其适用范围。归档内容不追溯修改。

### For Humans
- Place new skills under `./skills/<skill-name>/`.
- Place cross-project rules under `./global-rules/`.
- Place templates under `./templates/`.
- Place reference material under `./examples/`.
- Move obsolete entries to `./archive/`.
