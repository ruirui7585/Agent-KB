# Rule Maintenance

仅在变更 Skill、维护长期规则或用户反馈触发指令沉淀评估时，读取对应章节。权限与优先级继承 [AGENTS.md](AGENTS.md)，本文件不授予额外写入权限。

### Skill Change Synchronization

After installing, updating, renaming, moving, or removing any Skill under `~/.kb/skills/`, review both `/Users/shilv/Agent-Workspace/AGENTS.md` and `/Users/shilv/Agent-Workspace/CLAUDE.md` before completing the task.

- When a Skill's name, path, trigger conditions, scope, prerequisites, permissions, or workflow changes, update the authoritative routing in `AGENTS.md` and the applicable specialist rule file and verify that the Claude entry still inherits it correctly; update Claude-specific routing only if affected.
- If only internal implementation, scripts, examples, or explanatory content changed and routing remains valid, do not modify the entry files mechanically. Report that both files were reviewed and no update was required.
- Treat `AGENTS.md` and its routed specialist rules as the workspace source of truth and `CLAUDE.md` as a thin Claude-specific entry that references it. Keep routing semantically consistent without duplicating the shared rules.
- Validate that every referenced Skill path exists and that no stale Skill references remain.

## 指令提炼与归类规则

### 触发条件

当用户对 Agent 的同一项输出主动提出至少 1 次调整、纠正或补充后，Agent 必须在任务结束前判断这些反馈是否值得沉淀为长期指令。

### 判断分类

Agent 必须将候选内容归类为以下类型之一：

1. 通用指令：适用于 `/Users/shilv/Agent-Workspace` 下所有项目。
2. Laka 指令：只适用于 `/Users/shilv/Agent-Workspace/Projects/laka`。
3. 单次需求规则：只适用于当前需求，不应沉淀为长期指令。
4. 临时偏好：仅在当前对话有效，不应写入项目文件。

### 推荐存放位置

- 跨项目执行流程和协作规则：
  `/Users/shilv/Agent-Workspace/COMMON_RULES.md`（执行细则）；`AGENTS.md` 仅保留入口约束与路由
- 跨项目产品协作规则：
  `/Users/shilv/Agent-Workspace/product-rules.md`
- 规则维护与沉淀流程：
  `/Users/shilv/Agent-Workspace/rule-maintenance.md`
- 跨项目 UI、HTML 和高保真原型规则：
  `/Users/shilv/Agent-Workspace/COMMON_UI_RULES.md`
- Laka 项目级执行规则：
  `/Users/shilv/Agent-Workspace/Projects/laka/AGENTS.md`
- Laka 全局 UI 规范：
  `/Users/shilv/Agent-Workspace/Projects/laka/ui/UI_SYSTEM.md`
- Laka 单页面长期规则：
  对应页面的 `SCREEN_SPEC.md`
- 单个需求的产品逻辑：
  当前需求目录的 `PRD.md` 或 `README.md`
- 可复用 Skill、模板或知识库内容：
  `Agent-KB/` 对应目录，但必须获得用户明确的知识库写入授权。

### 指令确认与写入门禁

- 触发后说明是否值得沉淀、分类、适用范围、准确目标路径、完整指令正文及是否合并已有规则，并请求确认；即使不建议沉淀，也说明原因并询问用户是否仍需增加。
- 写入前检查重复或相近规则，优先合并，不机械追加。
- 只有用户明确回复“无误”“确认”“可以写入”“执行同步”或同等授权后才写入。“先整理”“先看看”“继续补充”“再优化”“调整一下”“输出我看看”仅代表继续整理。
- 用户继续修改时，重新展示完整版本并重新等待确认，不沿用旧确认；未回复、切换话题或只评价部分内容不算授权。
- 仅写入最后确认的版本，不在写入时自行增删改写；仍需调整则重新同步并确认。
- 完成后反馈实际文件、写入或合并位置、重复或冲突情况，以及验证结果。
