# Book Loan Frontend

React + TypeScript + Vite client for the Book Loan Midterm system.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS v4

## Setup

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set the API base URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

The dev server runs on:

```text
http://localhost:3000
```

## Useful Commands

```powershell
npm.cmd run dev
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Use `npm.cmd` in PowerShell if script execution policy blocks `npm.ps1`.

## App Flow

- Students browse the catalog, submit borrow requests, view active loans/history, and open digital documents.
- Admins manage inventory, members, borrowing requests, and summary reports.
- Authentication is token-based through the Laravel API.
- Admin settings are browser-local demo preferences; Laravel still enforces real borrowing and inventory rules.
