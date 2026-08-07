# SDLC Process Standard — Falz Real Estate SaaS

## Priority: Always follow this process

### 0. Question & Suggestion Protocol
When asking the product owner a question or presenting a decision point:
1. **Suggest at most 3 solutions** — clear, concise, with trade-offs.
2. **Recommend one** — mark it as "(Recommended)" with a brief reason why.
3. **Wait for the user's choice.** They will either pick one of the 3 or write their own answer.
4. **If the user writes their own answer:** Evaluate it honestly. If it's a good solution, confirm and proceed. If there's a better approach or a risk they may not see, **tell them** — explain why and suggest the better alternative.
5. **Final decision is always the user's.** Once they confirm their choice (their own or yours), follow and apply it without second-guessing.

### 1. Start Every Chat by Reading Memory + Checking for New PRD Files
Before doing ANY work:
1. **Read memory:** `D:\falz\.agents\memory\project-state.md` — this tracks what's been done and what's next.
2. **Scan PRD folder:** List files in `D:\falz\PRD\` and compare against the "Processed PRD Files" section in memory.
3. **If new files exist:** Read ONLY the new/unprocessed files, summarize them, incorporate their content into the current work, and update the memory file with their summary.
4. **If no new files:** Trust the memory — do NOT re-read files already summarized.

This ensures the user can drop new PRDs, notes, or meeting outcomes into the folder at any time, and the next chat picks them up automatically.

### 2. SDLC Phases (Strict Order)
Follow these phases. Never skip a phase. Each phase produces a deliverable before the next begins.

| Phase | Name | Deliverable |
|-------|------|-------------|
| 1 | Requirements Gathering | `PRD/01. PRD.md` + `PRD/02. Notes.md` |
| 2 | Clarification & Q/A | `PRD/03. Clarification-QA.md` |
| 3 | Detailed PRD | `PRD/04. Detailed-PRD.md` |
| 4 | Work Planning | `PRD/05. Implementation-Plan.md` |
| 5 | Build & Development | Code + `PRD/06. Team-Assignments.md` |
| 6 | Verification & QA | `PRD/07. Verification-Report.md` |
| 7 | Deploy & Document | `PRD/08. Changelog.md` + GitHub PRs |

### 3. Development Standards
- **Branch per feature:** `feature/F{N}-{feature-name}`
- **Commit convention:** `feat(module): description` / `fix(module): description`
- **Every PR:** Must include description, screenshots, migration notes, testing checklist
- **TypeScript strict mode**, Zod validation, Arabic RTL testing
- **Push to GitHub per feature** with full documentation

### 4. After Every Significant Action — Update Memory
After completing work, answering questions, or making decisions, **update the memory file** (`D:\falz\.agents\memory\project-state.md`) so the next chat knows:
- What was done
- What was decided
- What's next
- Any blockers

### 5. PRD Folder — Living Project Archive
All product documentation lives in `D:\falz\PRD\`. This folder is a **living archive** — the product owner continuously adds new files (PRDs, meeting notes, decisions, change requests). Treat it as:
- **Historical record:** Never delete or overwrite files the user added.
- **Numbered sequence:** Files follow a numbered naming convention (`01. PRD.md`, `02. Notes.md`, `03. ...`).
- **New input trigger:** Any new file not yet in memory means new requirements to process. Read it, extract actionable items, update the SDLC phase accordingly, and log it in memory.
- **SDLC workflow:** `PRD/00. SDLC-Workflow.md` has the detailed process, database audit, and feature list.
- **Database schema:** `D:\falz\prisma\schema.prisma` (PostgreSQL, 27 models, multi-tenant).

### 6. Key Project Facts (Don't Re-Discover These)
- **Project:** Falz — Real Estate SaaS Platform
- **Market:** Saudi Arabia (REGA & FAL License Compliant)
- **Tech Stack:** Next.js 16, React 19, Prisma (PostgreSQL), TailwindCSS 4, Radix UI, NextAuth, S3, Recharts
- **Architecture:** Multi-tenant (Office = Tenant), Roles: OWNER/MANAGER/AGENT + SuperAdmin
- **Language:** Arabic-first (RTL), i18n via next-intl
- **Hosting:** Netlify (netlify.toml present)
