# Agent Workspace

A unified local workspace shared by Codex, Claude Code, and Cursor.

This workspace ensures all agents operate on a **single authoritative knowledge base**, preventing accidental reads from Desktop, Documents, plugins, legacy folders, or date-stamped directories.

---

## Directory Structure

```text
Agent-Workspace/
├── AGENTS.md              # Entry rules for Codex / general coding agents
├── CLAUDE.md              # Entry rules for Claude Code
├── .cursorrules           # Cursor rules entry (optional)
├── README.md              # This file
│
├── Agent-KB/              # Single source of truth knowledge base (read-only by default)
│   ├── AGENTS.md          # Knowledge base usage rules
│   ├── skills/            # Shared reusable skills
│   ├── global-rules/      # Cross-project global rules
│   ├── templates/         # File templates
│   ├── examples/          # Reference examples
│   └── archive/           # Historical materials (not active by default)
│
├── Projects/              # Active projects (one folder per project)
├── Sandbox/               # Experimental workspace (non-production)
└── Archive/               # Completed, deprecated, or migrated projects

Usage Guidelines

* All new projects must be created under Projects/.
* Each project must include its own AGENTS.md and CLAUDE.md.
* Shared skills must be stored under Agent-KB/skills/.
* Temporary experiments must be placed in Sandbox/.
* Completed or deprecated projects must be moved to Archive/.

⸻

Core Principles

* Agent-KB/ is the only authoritative knowledge base and is read-only during normal operations.
* The knowledge base may only be modified when explicitly requested by the user (e.g., “update knowledge base” or “update skill”).
* Each task must be strictly scoped to a single project only. Cross-project modifications are forbidden.
* Agent-KB/archive/ and Archive/ are not considered active sources of truth.
* Agents must NOT treat Desktop, Documents, Downloads, plugins, legacy folders, backup folders, or date-stamped directories as valid sources of operational data.

⸻

Governance Hierarchy

All agents must follow this strict priority order:

1. Projects/<active-project>/ → highest priority, writable scope
2. Agent-KB/ → read-only authoritative reference
3. External directories → ignored unless explicitly provided by user

⸻

Safety Constraints

Agents must NEVER:

* Modify multiple projects in a single task
* Cross-reference unrelated project contexts
* Infer missing files from external or non-project directories
* Create duplicate or forked project structures without explicit instruction
* Modify Agent-KB/ without explicit user approval

⸻

Execution Rules

Before performing any file operation, the agent must:

1. Identify active project scope
2. Identify exact file path to be modified
3. Confirm file is within allowed scope
4. Output planned change summary

If any ambiguity exists:
→ The agent must STOP and request clarification.

⸻

File Modification Rules

* Prefer minimal, targeted diffs over full file rewrites
* Never generate duplicate files (e.g., *_copy, *_v2, *_backup)
* All modifications must be applied IN PLACE
* Preserve existing project structure unless explicitly instructed otherwise

⸻

Final Principle

Single Source of Truth + Single Write Target + In-Place Modification Only
