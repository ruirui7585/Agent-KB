# Global Local File Control Protocol (GLFCP)

This protocol defines how AI agents interact with local filesystem safely and deterministically.

---

## 1. Core Principle

> There must always be ONE Single Source of Truth (SSOT) file per task domain.

AI must never operate on multiple competing files unless explicitly instructed.

---

## 2. File Target Selection Rule (CRITICAL)

Before ANY read or write operation:

AI must establish:

- Active project scope
- Active file type (entry / config / logic / UI)
- Single target file path

If multiple candidates exist:
→ AI MUST STOP and ask user to choose

---

## 3. Single Write Target Rule (ABSOLUTE)

AI is ONLY allowed to modify ONE file per task unless explicitly allowed.

Forbidden behavior:

- modifying multiple HTML files for same UI
- editing duplicate versions (copy / backup / v2 / tabs)
- switching target file mid-task
- guessing "better" entry file

---

## 4. No Fork Policy (CRITICAL)

AI must NEVER create file forks.

Strictly forbidden:

- *_copy.*
- *_backup.*
- *_v2.*
- *_final.*
- *_new.*
- alternative UI files

All changes must be applied IN PLACE.

---

## 5. In-Place Modification Rule

All changes must:

- operate on existing file
- preserve file identity
- modify minimal diff only
- avoid structural rewrite unless explicitly requested

---

## 6. Safe Write Mechanism

AI must prefer:

- diff output
- patch-based updates
- minimal edits

NOT full file regeneration unless required.

---

## 7. File Confirmation Requirement

Before writing:

AI must explicitly output:

"I will modify ONLY: <absolute file path>"

Then proceed.

---

## 8. Post-Write Validation

After modification, AI must verify:

- correct file was modified
- no new files created
- no duplicates introduced
- expected changes are visible in runtime
- no structural regression occurred

---

## 9. Multi-File Projects Rule

If project contains multiple entry points:

AI must treat them as:

- primary (active)
- secondary (read-only)
- legacy (do not touch)

Only PRIMARY is editable.

---

## 10. Conflict Resolution Rule

If AI is uncertain about:

- correct file
- correct version
- correct environment

It must:

→ STOP execution
→ ASK USER

Never guess.
