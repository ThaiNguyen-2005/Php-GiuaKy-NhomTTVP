# BOOK_LOAN_MIDTERM

Full-stack library borrowing system for student and admin workflows.

- Backend: Laravel 12 API in `BE/`
- Frontend: React + TypeScript + Vite app in `FE/book_loan/`

This README is the primary onboarding document for running the project locally.

## 1. Project Overview

Book Loan Midterm supports the full borrow lifecycle:

- Student registration and login
- Catalog browsing and digital document browsing
- Borrow request creation
- Admin approval and return processing
- Inventory synchronization (`total_quantity`, `available_quantity`, `is_available`)
- Role-based access control (`student`, `admin`)

## 2. Tech Stack

### Backend

- PHP 8.2+
- Laravel 12
- Laravel Sanctum (token auth)
- SQLite by default (MySQL also supported)

### Frontend

- Node.js 18+
- React 19 + TypeScript
- Vite
- React Router

## 3. Repository Structure

```text
BOOK_LOAN_MIDTERM/
|-- BE/                 # Laravel API backend
|   |-- app/
|   |-- database/
|   |-- routes/
|   `-- .env.example
|-- FE/
|   `-- book_loan/      # React frontend
|       |-- src/
|       |-- package.json
|       `-- .env.example
|-- PROJECT_DOCUMENTATION.md
`-- README.md
```

## 4. Prerequisites

Install these before setup:

- Git
- PHP 8.2+ with required extensions:
	- `pdo_sqlite` (recommended default)
	- or `pdo_mysql` (if using MySQL)
- Composer 2+
- Node.js 18+ and npm

## 5. Quick Start (Recommended)

Run backend and frontend in two terminals.

### Step 1: Clone repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd BOOK_LOAN_MIDTERM
```

### Step 2: Setup and run backend

```bash
cd BE
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Windows PowerShell copy command:

```powershell
Copy-Item .env.example .env
```

### Step 3: Setup and run frontend

Open a second terminal:

```bash
cd FE/book_loan
npm install
cp .env.example .env
```

Edit `FE/book_loan/.env` and ensure:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Then run:

```bash
npm run dev
```

### Step 4: Open app

- Frontend: `http://localhost:3000`
- Backend API base: `http://localhost:8000/api`

## 6. Environment Variables

### Backend (`BE/.env`)

Important variables:

```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=sqlite
# If sqlite:
# DB_DATABASE=database/database.sqlite

# If mysql:
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=book_loan_midterm
# DB_USERNAME=root
# DB_PASSWORD=

SANCTUM_EXPIRATION=10080

# Optional: controls seeded account password
# LIBRARY_DEMO_PASSWORD=Library@2026
```

Notes:

- `LIBRARY_DEMO_PASSWORD` is optional but used by both `MemberSeeder` and `LibrarianSeeder`.
- If you change DB settings, run `php artisan migrate --seed` again.

### Frontend (`FE/book_loan/.env`)

Required for local backend integration:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Template variables still present from earlier scaffolding:

- `GEMINI_API_KEY`
- `APP_URL`

These are not required for the current library core workflow.

## 7. Database Setup Options

### Option A: SQLite (default, easiest)

`BE/.env.example` already uses SQLite.

If `BE/database/database.sqlite` is missing, create it:

```bash
touch database/database.sqlite
```

PowerShell:

```powershell
New-Item -ItemType File -Path database/database.sqlite -Force
```

Then run:

```bash
php artisan migrate --seed
```

### Option B: MySQL

Update DB values in `BE/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=book_loan_midterm
DB_USERNAME=root
DB_PASSWORD=
```

Then run:

```bash
php artisan migrate --seed
```

## 8. Seeded Demo Accounts

If you run `php artisan migrate --seed`, you can log in immediately.

- Default password: `Library@2026`
- If `LIBRARY_DEMO_PASSWORD` is set, use that value instead.

Sample accounts:

| Role | Login identifier | Email |
|---|---|---|
| student | `1` | `4801104101@student.hcmue.edu.vn` |
| student | `2` | `4801104102@student.hcmue.edu.vn` |
| admin | `1` | `nguyen.van.an@hcmue.edu.vn` |
| admin | `2` | `tran.thi.mai@hcmue.edu.vn` |

Login behavior:

- `role` must be `student` or `admin`
- `identifier` can be ID or email
- password is required

## 9. Useful Development Commands

### Backend (`BE/`)

```bash
php artisan serve
php artisan migrate --seed
php artisan migrate:fresh --seed
php artisan route:list
php artisan test
composer test
```

### Frontend (`FE/book_loan/`)

```bash
npm run dev
npm run lint
npm run build
npm run test
```

## 10. API Surface Summary

Main routes in `BE/routes/api.php`:

- Public:
	- `POST /api/login`
	- `POST /api/register`
	- `GET /api/books`
	- `GET /api/digital-documents`
- Authenticated:
	- `GET /api/me`
	- `PUT /api/me`
	- `POST /api/logout`
- Student only:
	- `POST /api/requests`
	- `GET /api/requests/me`
- Admin only:
	- `GET /api/members`
	- `POST /api/books`
	- `PUT /api/books/{book}`
	- `DELETE /api/books/{book}`
	- `GET /api/requests`
	- `POST /api/requests/{loanId}/approve`
	- `POST /api/requests/{loanId}/return`

Auth protection:

- Sanctum token middleware: `auth:sanctum`
- Role middleware alias: `role`
- Login/register throttle: `throttle:auth` (configured in `AppServiceProvider`)

## 11. Troubleshooting

### Frontend cannot reach backend

- Ensure backend is running on port 8000.
- Ensure `VITE_API_BASE_URL` points to `http://localhost:8000/api`.
- Restart frontend after changing `.env`.

### Database errors on startup

- Verify DB driver in `BE/.env` matches your setup.
- For SQLite, ensure `database/database.sqlite` exists.
- Re-run:

```bash
php artisan migrate:fresh --seed
```

### Login fails with 429 Too Many Requests

- Auth endpoints are rate-limited.
- Wait about 1 minute and try again.

### 401 after session expiry

- Token may be expired (`SANCTUM_EXPIRATION`).
- Log in again to obtain a new token.

## 12. Collaboration Notes

- Pull latest changes before starting work.
- After pulling backend migration changes, run:

```bash
cd BE
php artisan migrate
```

- If seed data changed and you need a clean state:

```bash
php artisan migrate:fresh --seed
```

- Use the included Postman collection for API testing:
	- `BE/postman/BOOK_LOAN_API.postman_collection.json`

## 13. Additional Documentation

- `PROJECT_DOCUMENTATION.md` contains deeper architecture and flow details.
