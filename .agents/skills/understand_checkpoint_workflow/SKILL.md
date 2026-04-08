---
name: Understand Checkpoint Workflow
description: Instructs the agent to be aware of the constraints from FE/Plan/Checkpoint.md to avoid misunderstandings about the current disconnected state of the application.
---

# Understand Checkpoint Workflow

When working on this project (Book Loan Midterm), you MUST be aware of the architectural realities and work-in-progress status outlined in `FE/Plan/Checkpoint.md`. Failure to understand these realities will lead to incorrect assumptions about the codebase.

## Key Facts About the Codebase

1. **Disconnected Architecture**: The Frontend (React/TypeScript in `FE/book_loan/`) and Backend (Laravel in `BE/`) are currently **NOT wired together**. 
2. **Mock Data**: Most frontend pages talk to an in-memory mock store (`FE/book_loan/src/api/mockData.ts`) instead of the real backend. The main API client (`FE/book_loan/src/api/client.ts`) is explicitly disabled and will throw an error.
3. **Missing Features**: Many backend endpoints are stubbed, missing, or bypass Eloquent in favor of `DB::table()`. Many web routes in `api.php` simply aren't registered yet.
4. **No Real Auth**: Authentication in Laravel exists but issues no Sanctum tokens, and the frontend relies on a static `localStorage.user` configuration.

## Required Actions

Always keep these rules in mind when taking actions:

1. **Consult the Checkpoint**: When starting a new task, check `FE/Plan/Checkpoint.md` to see what is already implemented versus what is missing or mock-only.
2. **Backend/Frontend Integration**: If you are asked to connect the FE to the BE, you must ensure that `client.ts` has been re-enabled and the missing backend routes have been created in `api.php`.
3. **Avoid Over-Debugging Known Gaps**: Do not spend time "debugging" an API call or data issue if it is already documented as a known gap (e.g., `getDigitalDocuments` returning hard-coded fake data). Instead, fix the underlying gap as instructed by the Checkpoint.
4. **Model Architecture Awareness**: Do not assume Eloquent is used; check if the data layer uses raw `DB::table()`. Do not assume authentication works securely.
