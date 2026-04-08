# Book Loan — Senior Code Review Report

## Context

The user (working on the `BOOK_LOAN_MIDTERM` project) asked for a comprehensive senior-engineer code review of the entire codebase. The project is a midterm assignment: a library / book lending system split into a Laravel 11 backend (`BE/`) and a React 19 + TypeScript frontend (`FE/book_loan/`). This document is the deliverable — no code changes are intended, only analysis, findings, and prioritized recommendations.

---

## 1. Project Overview

**book_loan** is a small library management system for a university midterm. It models two roles:

- **Student / Member** — can browse the book catalog, request to borrow books, view their borrow history, and (in theory) manage their profile.
- **Librarian / Admin** — can approve borrow requests, mark books as returned, manage book inventory, and view members.

**Architecture (intended):**
- **Backend:** Laravel 11 + SQLite, intended to expose a REST API. Sanctum is installed for token auth (but unused).
- **Frontend:** React 19 + React Router 7 + TypeScript + Tailwind v4 (Vite). Pages are split into `student/` and `admin/` areas with separate layouts.
- **Integration:** Currently NOT wired together — the FE talks to an in-memory mock module (`src/api/mockData.ts`) because [src/api/client.ts](FE/book_loan/src/api/client.ts) is intentionally disabled and throws an error.

It is functionally a prototype/demo with a polished UI but a thin and partly disconnected backend.

---

## 2. What Has Been Done (Completed Features)

### 2.1 Backend (Laravel) — [BE/](BE/)

**Implemented:**
- **Database schema** (9 migrations under [BE/database/migrations/](BE/database/migrations/)):
  - `librarians`, `members`, `books`, `borrowing` core tables.
  - Later migrations add `password` to members/librarians, Sanctum's `personal_access_tokens`, a `status` enum (`pending|borrowed|returned|rejected`) on `borrowing`, and `total_quantity` / `available_quantity` on `books`.
- **Seeders** ([BE/database/seeders/](BE/database/seeders/)): 2 librarians, 2 members, 5 books — all with hard-coded password `123456`.
- **Controllers** ([BE/app/Http/Controllers/](BE/app/Http/Controllers/)):
  - `AuthController` — `login`, `register`, `getUser`, `getAllMembers`.
  - `BookController` — `getDigitalDocuments` (returns hard-coded sample data, not DB).
  - `BorrowController` — `requestBorrow`, `approveBorrow`, `returnBook`, `getAllRequests`, `getMemberRequests`.
- **Routes** ([BE/routes/api.php](BE/routes/api.php)) — only **two** endpoints actually registered: `POST /login` and `GET /digital-documents`.
- Sanctum installed and configured ([BE/config/sanctum.php](BE/config/sanctum.php)) — but never used.
- Default User model ([BE/app/Models/User.php](BE/app/Models/User.php)) exists but is unused.

**Stack:** Laravel 11, PHP 8.x, SQLite, Sanctum (configured only).

### 2.2 Frontend (React/TypeScript) — [FE/book_loan/](FE/book_loan/)

**Implemented (working against mock data):**

| Area | Page | Status |
|---|---|---|
| Auth | [Login.tsx](FE/book_loan/src/pages/auth/Login.tsx) | Complete (mock auth) |
| Student | [Home.tsx](FE/book_loan/src/pages/student/Home.tsx) | Complete |
| Student | [Catalog.tsx](FE/book_loan/src/pages/student/Catalog.tsx) | Complete (search, filter, modal, borrow) |
| Student | [MyBooks.tsx](FE/book_loan/src/pages/student/MyBooks.tsx) | Complete |
| Student | [StudentRequests.tsx](FE/book_loan/src/pages/student/StudentRequests.tsx) | Complete |
| Student | [History.tsx](FE/book_loan/src/pages/student/History.tsx) | Complete |
| Student | [Digital.tsx](FE/book_loan/src/pages/student/Digital.tsx) | Stub — calls hard-coded `http://127.0.0.1:8000/api/digital-documents` |
| Student | [StudentSettings.tsx](FE/book_loan/src/pages/student/StudentSettings.tsx) | UI only — no submit handlers |
| Admin | [AdminDashboard.tsx](FE/book_loan/src/pages/admin/AdminDashboard.tsx) | Complete |
| Admin | [AdminInventory.tsx](FE/book_loan/src/pages/admin/AdminInventory.tsx) | Complete (CRUD modal) |
| Admin | [AdminRequests.tsx](FE/book_loan/src/pages/admin/AdminRequests.tsx) | Complete (approve / return) |
| Admin | [AdminMembers.tsx](FE/book_loan/src/pages/admin/AdminMembers.tsx) | Partial |
| Admin | [AdminReports.tsx](FE/book_loan/src/pages/admin/AdminReports.tsx) | Stub — fake CSS bar chart |
| Admin | [AdminSettings.tsx](FE/book_loan/src/pages/admin/AdminSettings.tsx) | Stub |

**Stack:** React 19, React Router 7, TypeScript ~5.8, Vite 6, Tailwind CSS v4, Google Material Symbols icons. No external component library; everything is custom Tailwind. Auth state is just a `user` JSON in `localStorage` plus a `userRole` state in `App.tsx`.

---

## 3. What Needs to Be Developed (Next Steps / Missing Parts)

### 3.1 Backend gaps

- **Wire up routes.** Only `/login` and `/digital-documents` exist in [api.php](BE/routes/api.php). Methods that exist but are not routed: `register`, `getUser`, `getAllMembers`, `requestBorrow`, `approveBorrow`, `returnBook`, `getAllRequests`, `getMemberRequests`.
- **Real authentication.** `login` returns a user object **with no token**. Sanctum is installed — issue a `personal_access_token` on login, send it as `Authorization: Bearer …`, and protect routes with `auth:sanctum`.
- **Authorization / middleware.** None of the protected endpoints actually verify the caller. Add a middleware that resolves the authenticated user and checks role (`student` vs `admin`) instead of trusting `librarian_id` from the request body.
- **Eloquent models.** Create `Book`, `Member`, `Librarian`, `Borrowing` models with `$fillable`, `$hidden`, and relationships. Replace raw `DB::table(...)` everywhere.
- **Domain logic that simply doesn't exist yet:**
  - `due_date` column + overdue calculation.
  - Late-fee / fine tracking.
  - Borrow rejection reason.
  - Renewal endpoint.
  - Per-member borrow limits / membership status (active / suspended).
  - Search/filter endpoints for the catalog.
  - Real `BookController::getDigitalDocuments` from DB instead of hard-coded array.
- **Missing CRUD endpoints** the FE will need: `GET/POST/PUT/DELETE /books`, `GET /books/{id}`, `GET /members`, `PUT /members/{id}`.
- **Validation:** move inline `$request->validate(...)` calls into FormRequest classes; tighten password rules (length, complexity).
- **Tests:** [tests/](BE/tests/) only contains the default `ExampleTest`. No feature/unit tests for any business logic.
- **Migrations housekeeping:** add `timestamps()` to every table, add indexes on `borrowing.member_id`, `borrowing.book_id`, `borrowing.status`, `members.email`, `librarians.email`.

### 3.2 Frontend gaps

- **Re-enable [src/api/client.ts](FE/book_loan/src/api/client.ts).** It currently throws on every call by design ("disabled for handoff"). Implement a real `fetch`/`axios` wrapper with `VITE_API_BASE_URL`, JSON parsing, error normalization, and an `Authorization` header from stored token.
- **Replace the mock layer.** [src/api/mockData.ts](FE/book_loan/src/api/mockData.ts) (~520 lines) is the de-facto database. Each `*Api.ts` module needs to switch from mock to real HTTP once `client.ts` is restored.
- **Finish stub pages:** `Digital`, `AdminReports`, `AdminSettings`, `StudentSettings`. Settings forms need `onSubmit` handlers.
- **Auth context.** Move auth state out of [App.tsx](FE/book_loan/src/App.tsx) into a `AuthContext` (or Zustand/Redux) so components don't reach into `localStorage` directly. Implement a real `logout()` that clears state, token, and storage.
- **Route guards.** Student routes have no guard at all — only `/admin` is checked. Add a `<ProtectedRoute role="student">` wrapper.
- **Pagination.** Pagination buttons in `AdminDashboard.tsx` and `AdminInventory.tsx` are visual only — no `onClick`.
- **Error / toast system.** Replace `alert()` and `console.error` with a proper toast (e.g. `sonner`) and an `<ErrorBoundary>` at the root.
- **Image lazy loading**, route-level code splitting (`React.lazy`), removing unused deps (`lucide-react`, `motion`, `@google/genai`, `express`, `@types/express`).
- **TypeScript strict mode** + remove the many `(x: any)` annotations.
- **Tests.** No tests at all. At minimum add Vitest + RTL coverage for `Login`, `Catalog → borrow`, `AdminRequests → approve/return`.
- **Accessibility:** add missing `alt`, `aria-label`, focus states; verify color contrast; add skip-link.

### 3.3 Cross-cutting / DevOps

- No CI, no linting in CI, no formatter config committed.
- No `.env.example` consistency between FE and BE — `VITE_API_BASE_URL` is referenced but unused.
- No CORS config on the BE for the Vite dev server (`http://localhost:5173`).
- No Postman / OpenAPI doc kept in sync with the actual routes (a `BE/postman/` folder exists — verify it matches reality).

---

## 4. Logic Issues, Bugs & Code Quality Problems

### 4.1 Critical (security / correctness)

1. **No real authentication.** [AuthController::login](BE/app/Http/Controllers/AuthController.php) verifies the password and then returns the user object — but issues no token, no session, nothing the client can present later. Combined with the fact that no route uses `auth:sanctum`, the entire API is effectively public.
2. **Authorization is taken from request body.** `BorrowController::approveBorrow` and `returnBook` accept `librarian_id` from the JSON body and trust it. Any caller can pretend to be any librarian.
3. **IDOR on member data.** `AuthController::getUser` and `BorrowController::getMemberRequests` accept a member id from the URL with no check that the caller owns it. Anyone can read anyone's loan history.
4. **`getAllMembers` is publicly readable** with no auth at all — leaks every member's name, email, phone.
5. **Hard-coded default password `123456`** in [2026_03_23_180651_add_password_to_users_tables.php](BE/database/migrations/2026_03_23_180651_add_password_to_users_tables.php) (`->default(bcrypt('123456'))`) and in seeders. Same plaintext password is also baked into [FE mockData.ts](FE/book_loan/src/api/mockData.ts).
6. **Race condition on `available_quantity`.** `BorrowController::requestBorrow` reads `available_quantity`, then later `approveBorrow` decrements it without a transaction or row lock — two simultaneous approvals can drive it negative.
7. **Client-side role spoofing.** [App.tsx](FE/book_loan/src/App.tsx) decides role purely from `localStorage.user`. Setting `localStorage.user = '{"librarian_id":1}'` in DevTools grants the admin UI. This is only bad in combination with #1 — but together they form a complete bypass.
8. **`BookController::getDigitalDocuments` returns hard-coded fake data.** The endpoint that *is* exposed publicly does not actually read the DB.
9. **Frontend-to-backend wiring is broken by design.** [client.ts](FE/book_loan/src/api/client.ts) throws unconditionally; the only real `fetch()` in the codebase is the hard-coded `http://127.0.0.1:8000/api/digital-documents` in [Digital.tsx](FE/book_loan/src/pages/student/Digital.tsx).

### 4.2 Bugs / flawed logic

- **`approveBorrow` overwrites `borrow_date`** that was set during `requestBorrow`, losing the original request timestamp.
- **`returnBook` does not compute fines or check overdues** — but the schema doesn't have `due_date` either, so the feature is structurally absent.
- **`MyBooks.tsx` hard-codes `dueDate = borrowDate + 14 days`** on the FE instead of using a backend value, so the displayed due date is fictional.
- **`is_available` flag is redundant with `available_quantity`** and the two can drift (manual updates in two places).
- **Logout in [Sidebar.tsx](FE/book_loan/src/components/Sidebar.tsx)** only navigates to `/login`; it does not clear `localStorage.user` or reset `userRole` in `App.tsx` — the next page reload still treats the user as logged in.
- **Pagination buttons in admin tables are decorative** (no `onClick`), but only the first page of data is ever shown.
- **`BorrowController::requestBorrow`** doesn't null-check the `$book` lookup — if the row vanishes between validation and read, you get a fatal `Trying to access property on null`.
- **`unset($user->password)`** is used to "hide" passwords in responses. Fragile — the right way is `$hidden` on the model or an explicit `select()`.
- **Empty migration file** `2026_03_27_131144_*` exists with no schema changes.

### 4.3 Code smells / quality

- **Models exist but are not used.** The whole BE bypasses Eloquent and uses `DB::table(...)` everywhere — losing relationships, casts, hidden fields, scopes, observers.
- **Inline validation in controllers** instead of FormRequest classes.
- **Magic strings** for table names and statuses (`'pending'`, `'borrowed'`, `'returned'`, `'rejected'`) — should be a PHP 8.1 enum.
- **Status → Vietnamese label mapping** inline inside `getAllRequests` — should be a presenter / resource.
- **Mix of mock + live calls on FE.** Most pages use the mock layer, `Digital.tsx` uses a hard-coded live URL — there is no single source of truth for "where data comes from".
- **TypeScript `any` everywhere** — `MyBooks`, `Catalog`, `AdminDashboard`, `AdminInventory` all annotate map callbacks as `(x: any)`. `tsconfig.json` does not enable `strict`.
- **Unused dependencies on the FE:** `lucide-react`, `motion`, `@google/genai`, `express`, `@types/express`. Bundle bloat and confusion.
- **Vite alias bug:** `@` resolves to project root, not `src/` ([vite.config.ts](FE/book_loan/vite.config.ts)). Same issue in `tsconfig.json`.
- **Orphaned duplicate file** [src/views/MyBooks.tsx](FE/book_loan/src/views/MyBooks.tsx) duplicates the page version and is not routed.
- **Large "god" pages** — `AdminDashboard.tsx` (~345 LOC) bundles dashboard + approval table + inventory list + recent returns. Should be split.
- **Error handling = `alert()` + `console.error`.** No toast system, no `<ErrorBoundary>`. A single thrown render error crashes the whole app.
- **No tests anywhere.** BE has only `ExampleTest`; FE has none.
- **Comments are sparse and mixed-language** (English + Vietnamese).
- **N+1 risk** is low today (raw joins are used), but the moment Eloquent is introduced, `BorrowController::getMemberRequests` will need `with('book')`.

---

## 5. Recommendations (Prioritized)

### P0 — Must fix before ANY shared environment / demo to non-classmates

1. **Issue Sanctum tokens on login** and protect every non-public route with `auth:sanctum`. ([AuthController.php](BE/app/Http/Controllers/AuthController.php), [routes/api.php](BE/routes/api.php))
   ```php
   $token = $user->createToken('api')->plainTextToken;
   return response()->json(['user' => $user, 'token' => $token]);
   ```
2. **Stop trusting `librarian_id` / `member_id` from the request body.** Derive the caller from `auth()->user()` and check role in middleware.
3. **Remove the hard-coded `default(bcrypt('123456'))`** from the migration; force seeders to call `Hash::make()` of an env-provided value or random per-user value.
4. **Delete the plaintext passwords from [mockData.ts](FE/book_loan/src/api/mockData.ts)** (or at least mark them as test fixtures and never ship to a real environment).
5. **Wrap the borrow / return flow in `DB::transaction()`** with `lockForUpdate()` on the book row to kill the race condition.
6. **Add a real route guard for student routes** in `App.tsx` and a real `logout()` that clears `localStorage` + state.

### P1 — Make the system actually work end-to-end

7. **Re-enable [client.ts](FE/book_loan/src/api/client.ts)** with `VITE_API_BASE_URL`, attach the bearer token automatically, and switch each `*Api.ts` module from mockData to HTTP. Keep mockData only as an MSW handler for tests.
8. **Register all the missing routes** in `routes/api.php` and add the missing CRUD endpoints for `books` and `members`.
9. **Migrate to Eloquent models** with relationships (`Borrowing belongsTo Book/Member/Librarian`). Replace `BookController::getDigitalDocuments` to read from the DB.
10. **Add `due_date` to `borrowing`** + a small `BorrowingService` that computes it on approval, plus a daily job (or on-read calculation) for overdue / fine.
11. **Replace inline validation with FormRequest classes** and tighten password rules (`min:8`, mixed case, digit).
12. **Fix the Vite/TS path alias** to point at `src/`.
13. **Finish or hide stub pages** (`Digital`, `AdminReports`, `AdminSettings`, `StudentSettings`). Don't link to pages that don't work.

### P2 — Quality, scalability, DX

14. **Enable TypeScript `strict`** and replace `(x: any)` with proper types derived from the API. Generate types from the BE if possible.
15. **Introduce an `AuthContext`** and a `useAuth()` hook; remove all direct `localStorage` access from components.
16. **Add a toast system** (`sonner` or similar) and a top-level `<ErrorBoundary>`.
17. **Split the giant pages** (`AdminDashboard`, `AdminInventory`) into smaller components — extract the modal forms and table rows.
18. **Remove unused dependencies** (`lucide-react`, `motion`, `@google/genai`, `express`, `@types/express`).
19. **Add indexes & timestamps** on every table; add `softDeletes` if you want history.
20. **Tests:** at minimum, BE feature tests for `login`, `requestBorrow`, `approveBorrow`, `returnBook`, and FE Vitest tests for `Login` and `AdminRequests`.
21. **CI:** GitHub Actions running `php artisan test`, `npm run build`, `tsc --noEmit`, `eslint`.
22. **Accessibility pass:** add missing `alt`, `aria-label`, focus rings, skip-link, color-contrast check.
23. **Lazy-load admin and student route bundles** with `React.lazy` + `<Suspense>`.

### P3 — Nice to have

- Replace status strings with PHP 8.1 enums and a shared TS union.
- Move borrow business logic into a `BorrowingService`.
- Extract loan duration / fine rules into config so admin can change them later.
- Add OpenAPI doc (`scribe` or `l5-swagger`) and regenerate the Postman collection from it.
- Image optimization / `loading="lazy"` on covers.

---

## Critical Files Referenced

**Backend**
- [BE/routes/api.php](BE/routes/api.php) — only 2 routes
- [BE/app/Http/Controllers/AuthController.php](BE/app/Http/Controllers/AuthController.php)
- [BE/app/Http/Controllers/BorrowController.php](BE/app/Http/Controllers/BorrowController.php)
- [BE/app/Http/Controllers/BookController.php](BE/app/Http/Controllers/BookController.php) — hard-coded fake data
- [BE/database/migrations/2026_03_23_180651_add_password_to_users_tables.php](BE/database/migrations/2026_03_23_180651_add_password_to_users_tables.php) — hard-coded default password
- [BE/database/seeders/](BE/database/seeders/)
- [BE/config/sanctum.php](BE/config/sanctum.php) — installed but unused

**Frontend**
- [FE/book_loan/src/App.tsx](FE/book_loan/src/App.tsx) — auth wiring + routing
- [FE/book_loan/src/api/client.ts](FE/book_loan/src/api/client.ts) — disabled
- [FE/book_loan/src/api/mockData.ts](FE/book_loan/src/api/mockData.ts) — in-memory DB w/ plaintext passwords
- [FE/book_loan/src/pages/auth/Login.tsx](FE/book_loan/src/pages/auth/Login.tsx)
- [FE/book_loan/src/pages/student/Digital.tsx](FE/book_loan/src/pages/student/Digital.tsx) — hard-coded URL
- [FE/book_loan/src/pages/student/StudentSettings.tsx](FE/book_loan/src/pages/student/StudentSettings.tsx) — no submit
- [FE/book_loan/src/pages/admin/AdminDashboard.tsx](FE/book_loan/src/pages/admin/AdminDashboard.tsx) — 345-line god page
- [FE/book_loan/src/pages/admin/AdminInventory.tsx](FE/book_loan/src/pages/admin/AdminInventory.tsx)
- [FE/book_loan/src/components/Sidebar.tsx](FE/book_loan/src/components/Sidebar.tsx) — broken logout
- [FE/book_loan/vite.config.ts](FE/book_loan/vite.config.ts) — wrong `@` alias

---

## Verification (how to confirm the findings)

- `php artisan route:list` in `BE/` — confirms only `/login` and `/digital-documents` are registered.
- `php artisan tinker` → `DB::table('borrowing')->get()` — confirms no `due_date`/`fine` columns.
- In the FE devtools, run `localStorage.setItem('user', JSON.stringify({librarian_id:1}))` and reload — you reach the admin UI without logging in (confirms client-side role bypass).
- `grep -R "123456" BE FE` — confirms the hard-coded password is in seeders, the migration default, and `mockData.ts`.
- Open [src/api/client.ts](FE/book_loan/src/api/client.ts) — `apiRequest` body is just `throw new Error(...)`.
