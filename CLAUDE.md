# Claude Workspace Entry

## Default Workspace

Default workspace is:

/Users/shilv/Agent-Workspace

Do not treat the user home directory, Desktop, Downloads, or temporary folders as the project workspace.

The active knowledge base is:

~/.kb/

~/.kb/ points to:

/Users/shilv/Agent-Workspace/Agent-KB

## Priority

1. Read /Users/shilv/Agent-Workspace/CLAUDE.md first.
2. Read /Users/shilv/Agent-Workspace/AGENTS.md for shared workspace rules.
3. If the task involves shared rules, skills, templates, examples, delivery standards, or reusable workflows, read ~/.kb/AGENTS.md.
4. Before touching any project file, read the project-level CLAUDE.md or AGENTS.md under:
   /Users/shilv/Agent-Workspace/Projects/<project-name>/
5. If no project is specified, ask the user to confirm the target project path before editing files.

## Directory Roles

| Directory | Purpose | Default Access |
|---|---|---|
| /Users/shilv/Agent-Workspace/Agent-KB/ | Shared knowledge base, skills, templates, examples | Read-only |
| /Users/shilv/Agent-Workspace/Projects/ | Active formal projects | Read/write only inside confirmed project |
| /Users/shilv/Agent-Workspace/Sandbox/ | Temporary experiments | Read/write when explicitly used |
| /Users/shilv/Agent-Workspace/Archive/ | Old or inactive workspace files | Do not read by default |
| ~/.kb/archive/ | Deprecated or backup KB entries | Do not read by default |

## Default Ignore

Do not read or reference files under these directories unless the user explicitly points to them:

- Desktop/
- Documents/
- Downloads/
- plugins/
- .git/
- node_modules/
- dist/
- build/
- .next/
- .vite/
- coverage/
- Any directory named old, archive, backup, legacy, broken, checkpoint
- Any date-named directory, for example 2026-04-20/

## Before Every Modification

Before making any file changes, state:

1. Task type: what kind of change this is
2. Target project: the exact project path
3. Allowed files: exact file paths that will be modified
4. Forbidden files: files explicitly excluded from this change
5. Validation plan: how the change will be verified

Do not modify files until the scope is clear.

## Safety Rules

- Do not modify ~/.kb/ unless the user explicitly says:
  - update knowledge base
  - update skill
  - save this rule
  - revise the KB
  - 写入知识库
  - 更新知识库
  - 更新 skill
- Do not modify files outside the confirmed project directory.
- Do not read archive, backup, legacy, broken, or checkpoint folders by default.
- Do not overwrite user files without explaining which exact file will be changed.
- Do not create duplicate project copies unless the user explicitly asks.
- Do not move files between projects unless the user explicitly asks.
- For coding tasks, always state the exact target path before giving code or terminal commands.

## User Communication Rules

The user is a product manager and a code beginner.

When giving code, terminal commands, or file edits:

1. First state the exact path where the action should happen.
2. Then provide the command or code.
3. Keep steps sequential and avoid giving too many alternatives at once.
4. Explain what the command does in plain language.
5. If there is risk of deleting or overwriting files, stop and ask for confirmation.

Bad:

bash npm run dev 

Good:

Path:

/Users/shilv/Agent-Workspace/Projects/<project-name>/

Command:

bash cd /Users/shilv/Agent-Workspace/Projects/<project-name>/ npm run dev 

## Project Work Rules

For any project task:

1. Identify the project path first.
2. Read the project-level CLAUDE.md or AGENTS.md if it exists.
3. Work only inside that project folder.
4. Prefer modifying the current source files instead of creating new duplicate files.
5. If a file appears outdated, compare before replacing.
6. If multiple similar files exist, ask which one is the active version before editing.

## HTML / UI Prototype Rules

When working on HTML prototypes:

1. Use the project's active prototype folder only.
2. Do not use files from legacy, backup, broken, or archive folders unless explicitly asked.
3. Preserve existing interactions unless the user asks to remove them.
4. For every UI change, verify:
   - page opens without blank screen
   - console has no critical errors
   - main click paths still work
   - mobile layout still fits the target device
5. For product prototype delivery, prefer high-fidelity mobile UI.
6. Use English UI copy by default unless the user asks for Chinese.
7. For social/dating prototypes, use realistic MENA-style female avatars when avatar assets are needed.

## Testing Rules

When modifying code, run the most relevant validation available for the project.

Preferred checks:

1. Syntax or build check
2. Local preview check
3. Console error check
4. Main user-flow check
5. Regression check for previously fixed issues

If validation cannot be run, clearly say what was not verified and why.

## Knowledge Base Usage

Use ~/.kb/ for shared context:

- ~/.kb/skills/ for reusable skills
- ~/.kb/global-rules/ for global behavior rules
- ~/.kb/templates/ for reusable document or project templates
- ~/.kb/examples/ for reference examples
- ~/.kb/archive/ only when explicitly asked

The knowledge base is read-only by default.

Do not write to the knowledge base unless the user explicitly asks to update it.

## Output Style

Be direct and operational.

For implementation tasks, structure the response as:

1. Target path
2. Change scope
3. Files to modify
4. Commands or edits
5. Validation steps

Avoid vague wording such as "maybe", "should be fine", or "try this" when an exact path or command is available.
