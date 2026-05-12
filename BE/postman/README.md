# Book Loan API Postman Guide

Use this collection to exercise the current Laravel API from Postman.

## Import

1. Start the backend: `php artisan serve --host=127.0.0.1 --port=8000`.
2. Import `BOOK_LOAN_API.postman_collection.json`.
3. Confirm the collection variable `base_url` is `http://localhost:8000/api`.
4. Run `Auth / Login Student` or `Auth / Login Admin` first. The collection stores the returned token in `student_token` or `admin_token`.

## Seeded Accounts

Default password: `Library@2026`

- Student: `4801104101@student.hcmue.edu.vn`
- Admin: `nguyen.van.an@hcmue.edu.vn`

## Current Endpoint Groups

- Auth/profile: `POST /login`, `POST /register`, `GET /me`, `PUT /me`, `POST /logout`
- Books: `GET /books`, `POST /books`, `PUT /books/{book}`, `DELETE /books/{book}`
- Digital documents: `GET /digital-documents`, signed `GET /digital-documents/{book}/download`
- Student requests: `POST /requests`, `GET /requests/me`
- Admin requests: `GET /requests`, `POST /requests/{loanId}/approve`, `POST /requests/{loanId}/reject`, `POST /requests/{loanId}/return`
- Members: `GET /members`, `POST /members`, `PUT /members/{member}`, `DELETE /members/{member}`

## Recommended Smoke Flow

1. Login as a student and an admin.
2. Get books and choose an available `book_id`.
3. As student, create `POST /requests`.
4. Copy the returned `loan.loan_id` into the `loan_id` collection variable.
5. As admin, approve the request, then mark it returned.
6. Check `GET /requests/me`, `GET /requests`, and `GET /books` to confirm status and inventory changes.
