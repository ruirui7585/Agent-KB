# Agent Workspace Rules

## Workspace Root

Workspace root:

/Users/shilv/Agent-Workspace

This workspace is the default working area for agents.

Do not treat ~/.codex/, Desktop/, Documents/, Downloads/, or random local folders as the active project workspace unless the user explicitly says so.

## Directory Purpose

| Directory | Purpose | Default Access |
|---|---|---|
| ./Agent-KB/ | Shared knowledge base, skills, templates, examples, global rules | Read-only |
| ./Projects/ | Formal active projects | Read/write inside confirmed project only |
| ./Sandbox/ | Temporary experiments, demos, quick tests | Read/write when explicitly used |
| ./Archive/ | Old or inactive workspace files | Do not read by default |
| ./AGENTS.md | Workspace rules for Codex and other agents | Read |
| ./COMMON_RULES.md | Cross-project execution, file-control, naming, assumption, and validation rules | Read |
| ./CLAUDE.md | Workspace rules for Claude Code | Read |
| ./README.md | Human-readable workspace overview | Read |

## Active Knowledge Base

The active knowledge base is:

~/.kb/

~/.kb/ points to:

/Users/shilv/Agent-Workspace/Agent-KB

Use the knowledge base for shared context:

- ~/.kb/AGENTS.md — knowledge base usage rules
- ~/.kb/skills/ — reusable agent skills
- ~/.kb/global-rules/ — global product/design/development rules
- ~/.kb/templates/ — reusable project and document templates
- ~/.kb/examples/ — reference examples
- ~/.kb/archive/ — deprecated or backup KB files

The knowledge base is read-only by default.

Do not write to ~/.kb/ unless the user explicitly says:

- update knowledge base
- update skill
- save this rule
- revise the KB
- 写入知识库
- 更新知识库
- 更新 skill
- 保存规则

## Priority Order

When starting a task, read rules in this order:

1. Workspace rules:
   - /Users/shilv/Agent-Workspace/AGENTS.md
2. Cross-project execution rules:
   - /Users/shilv/Agent-Workspace/COMMON_RULES.md
3. Knowledge base rules, if shared rules, skills, templates, examples, or standards are relevant:
   - ~/.kb/AGENTS.md
4. Project-level rules before touching project files:
   - /Users/shilv/Agent-Workspace/Projects/<project-name>/AGENTS.md
   - /Users/shilv/Agent-Workspace/Projects/<project-name>/CLAUDE.md, if using Claude Code
5. Relevant skill files under:
   - ~/.kb/skills/<skill-name>/SKILL.md

If project-level rules conflict with workspace rules, project-level rules win only inside that project.

If knowledge base rules conflict with the user’s latest explicit instruction, follow the user’s latest explicit instruction.

## Project Selection Rule

Before modifying any project file, identify the target project path.

A valid project path should be under:

/Users/shilv/Agent-Workspace/Projects/

Example:

/Users/shilv/Agent-Workspace/Projects/dating/

If the user does not specify the project, ask for confirmation before editing files.

Do not modify multiple projects in one task unless the user explicitly asks.

## Default Ignore

Do not read, reference, or modify files under these paths unless the user explicitly points to them:

- Desktop/
- Documents/
- Downloads/
- plugins/
- ~/.codex/
- .git/
- node_modules/
- dist/
- build/
- .next/
- .vite/
- coverage/
- Any directory named old
- Any directory named archive
- Any directory named backup
- Any directory named legacy
- Any directory named broken
- Any directory named checkpoint
- Any date-named directory, for example 2026-04-20/

Archive folders are not active sources.

Only use archive, backup, legacy, broken, or checkpoint folders when the user explicitly asks to inspect, compare, restore, or migrate old versions.

## Before Every Modification

Before making file changes, state:

1. Task type: what kind of change this is
2. Target project: exact project path
3. Allowed files: exact file paths that will be modified
4. Forbidden files: files explicitly excluded from this change
5. Validation plan: how the change will be verified

Do not make changes if the target project path is unclear.

Do not make changes if there are multiple possible active files and the active file cannot be determined.

## File Modification Rules

When modifying files:

1. Prefer editing existing active source files.
2. Do not create duplicate project copies unless the user explicitly asks.
3. Do not overwrite files without knowing whether they are active.
4. Do not move files between projects unless the user explicitly asks.
5. Do not delete files unless the user explicitly asks.
6. Do not modify knowledge base files unless explicitly authorized.
7. Do not modify .codex system files unless explicitly authorized.

When creating a new file, explain:

- why the file is needed
- where it will be created
- whether it is active, temporary, or archive

## User Communication Rules

The user is a product manager and a code beginner.

When giving terminal commands, code snippets, or file edit instructions:

1. First state the exact path.
2. Then provide the command or code.
3. Explain briefly what the command does.
4. Keep steps sequential.
5. Avoid giving too many alternatives at once.
6. Stop and ask for confirmation before any risky delete, overwrite, or migration command.

Bad:

bash npm run dev 

Good:

Path:

/Users/shilv/Agent-Workspace/Projects/<project-name>/

Command:

bash cd /Users/shilv/Agent-Workspace/Projects/<project-name>/ npm run dev 

## Project Work Rules

For project work:

1. Confirm the project path.
2. Read project-level AGENTS.md or CLAUDE.md if it exists.
3. Work only inside the confirmed project directory.
4. Use the active source directory, not backup or legacy directories.
5. If multiple similar files exist, identify the active file before editing.
6. If the current active version is unclear, ask the user before changing files.
7. Keep project-specific rules inside the project folder.

Project-level files may include:

- AGENTS.md
- CLAUDE.md
- README.md
- docs/
- prototype/
- src/
- tests/

## Laka Project Routing

当目标项目为：

`./Projects/laka/`

必须先读取：

`./Projects/laka/AGENTS.md`

Laka 项目内的产品规则、UI 规则、需求流程、事实源和交付标准，以项目级 `AGENTS.md` 为准。

Workspace 级 `AGENTS.md` 只负责将 Agent 引导到 Laka 项目级规则，不复制或维护 Laka 专属的产品背景、UI 规范、页面清单、截图索引和素材状态。

进入 Laka 项目后，Agent 仍需遵守 Workspace 级的项目边界、知识库权限和文件安全规则。

## Skill Usage Rules

When a task matches a reusable skill, read the corresponding skill before acting.

Skill location:

~/.kb/skills/

Common skill categories may include:

- HTML / UI prototype skill
- mobile app UI prototype skill
- product requirement skill
- test case skill
- self-check skill

When using a skill:

1. Read the skill file first.
2. Apply only the relevant parts.
3. Do not modify the skill unless the user explicitly asks to update it.
4. If the skill is incomplete, report the gap before proceeding.
5. If the user asks to improve a skill, update the skill and validate it.

## HTML / UI Prototype Rules

When working on HTML or UI prototypes:

1. Identify the active prototype path first.
2. Do not use files from legacy, backup, broken, or archive folders unless explicitly asked.
3. Preserve existing interactions unless the user asks to remove them.
4. Avoid creating a new HTML file when the user expects the existing file to be updated.
5. If updating an existing local preview, confirm the exact file path.
6. For mobile prototypes, default to high-fidelity mobile UI.
7. Use English UI copy by default unless the user asks for Chinese.
8. For social, dating, or MENA-facing products, use realistic MENA-style female avatars when avatar assets are needed.
9. Verify that the page opens without blank screen.
10. Verify that main click paths still work.
11. Verify that the browser console has no critical errors.

## Product Documentation Rules

When producing product documents, prefer clear PM deliverables:

- PRD
- user flow
- state matrix
- edge cases
- backend configuration fields
- test cases
- analytics events
- toast copy
- acceptance criteria

For metrics and tracking, define:

- event name
- trigger timing
- properties
- user scope
- denominator
- numerator
- deduplication rule
- time window
- relation to msg_id, reply_to_msg_id, or session id when relevant

## Testing Rules

When modifying code or prototype files, run the most relevant validation available.

Preferred validation order:

1. Syntax check
2. Build check
3. Local preview check
4. Console error check
5. Main user-flow check
6. Regression check for previously fixed issues

If validation cannot be run, clearly state:

- what was not verified
- why it could not be verified
- how the user can verify it manually

## Sandbox Rules

Use ./Sandbox/ for experiments only.

Files in ./Sandbox/ are not active project files unless the user explicitly promotes them into ./Projects/.

Do not use Sandbox files as source of truth for formal project work.

## Archive Rules

Use ./Archive/ and ~/.kb/archive/ only for deprecated, backup, or superseded files.

Agents must not read archive folders by default.

Archive files are not active rules, active source files, or active project files.

Only inspect archive files when the user explicitly asks to:

- compare old versions
- restore a previous version
- migrate useful content
- inspect backup files

## Output Format for Implementation Tasks

For implementation or file-editing tasks, structure the response as:

1. Target path
2. Task type
3. Allowed files
4. Forbidden files
5. Planned changes
6. Validation plan
7. Commands or edits

For analysis or explanation tasks, answer directly and do not over-format.

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
  `/Users/shilv/Agent-Workspace/AGENTS.md`
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

### Agent 必须执行

每次触发判断后，Agent 必须向用户说明：

1. 本次反馈是否适合沉淀为指令。
2. 建议归类为通用指令、Laka 指令还是单次需求规则。
3. 建议写入的准确文件路径。
4. 准备增加的指令内容。
5. 询问用户是否确认增加。

即使 Agent 判断本次内容不适合沉淀，也必须说明原因，并询问用户是否仍需要增加。

### 写入限制

- 未经用户明确确认，不得自动写入或同步任何指令文件。
- 用户只说“先整理”“先看看”时，只输出草案，不修改本地文件。
- 写入前必须检查目标文件是否已有相同规则，避免重复。
- 已有相近规则时，应优先合并和优化，不得机械追加。

### 指令确认与写入门禁

每次 Agent 整理出通用指令、Laka 指令或其他长期规则后，必须先向用户同步以下内容：

1. 指令的完整正文。
2. 指令分类及适用范围。
3. 建议写入的准确文件路径。
4. 是否会合并或修改已有规则。

同步后必须等待用户审核。

只有用户明确回复“无误”“确认”“可以写入”“执行同步”或表达同等明确授权后，Agent 才能将指令写入文档。

以下表达只代表继续整理，不代表允许写入：

- 先整理
- 先看看
- 继续补充
- 再优化
- 调整一下
- 输出我看看

如果用户继续修改指令，Agent 必须：

1. 根据反馈重新整理。
2. 再次向用户同步修改后的完整指令。
3. 重新等待用户确认。
4. 不得沿用修改前的确认结果。

用户未回复、切换话题或只评价部分内容，均不得视为确认写入。

正式写入时，只能写入用户最后确认的版本。Agent 不得在写入过程中自行增加、删除或改写内容；如发现仍需调整，必须重新同步并取得确认。

写入完成后，Agent 必须反馈：

1. 实际修改的文件路径。
2. 写入或合并的位置。
3. 是否发现重复或冲突。
4. 完成的验证结果。

## Final Rule

When uncertain about a path, active file, or project scope, ask before modifying.

Never guess and modify files across directories.
