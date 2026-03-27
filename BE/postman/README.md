# BOOK_LOAN_MIDTERM - API Postman Doc

## 1) Muc tieu
Tai lieu nay dung de handoff phan API cho thanh vien phu trach fetch API o frontend.
Backend giu nguyen endpoint nhu hien tai, khong doi duong dan.

## 2) File Postman
- Collection: BOOK_LOAN_API.postman_collection.json
- Duong dan: BE/postman/BOOK_LOAN_API.postman_collection.json

## 3) Import vao Postman
1. Mo Postman.
2. Chon Import.
3. Chon file BOOK_LOAN_API.postman_collection.json.
4. Chinh bien base_url neu can (mac dinh: http://localhost:8000/api).

## 4) Bien moi truong trong collection
- base_url: base URL cua API.
- member_id: id sinh vien mau.
- librarian_id: id thu thu mau.
- book_id: id sach mau.
- loan_id: id phieu muon mau.

## 5) Danh sach endpoint

### Auth
- POST /login
  - Body JSON:
    - role: student | admin
    - identifier: member_id/librarian_id hoac email
    - password: mat khau
- POST /register
  - Body JSON:
    - name
    - email
    - password (min 6)
    - phone_number (optional)
- GET /users/{id}?role=student
- GET /admin/members

### Books
- GET /books
- GET /books/search?query=...
- POST /admin/books
  - Body JSON:
    - title (required)
    - author (required)
    - genre (optional)
    - published_year (optional)
    - cover (optional)
    - location (optional)
    - quantity (optional, min 1)
- PUT /admin/books/{book_id}
  - Body JSON (optional fields):
    - title, author, genre, published_year, cover, location, quantity
- DELETE /admin/books/{book_id}

### Borrow
- POST /borrow/request
  - Body JSON:
    - member_id
    - book_id
- GET /borrow/member/{member_id}
- GET /admin/borrow
- PUT /admin/borrow/{loan_id}/approve
  - Body JSON:
    - librarian_id
- PUT /admin/borrow/{loan_id}/return
  - Body JSON:
    - librarian_id

## 6) Luong test de xac minh nhanh
1. Login (student/admin).
2. GET /books de lay danh sach.
3. POST /borrow/request tao request pending.
4. GET /admin/borrow de thay request.
5. PUT /admin/borrow/{loan_id}/approve de duyet.
6. PUT /admin/borrow/{loan_id}/return de tra sach.

## 7) Ghi chu handoff
- FE hien tai da tat luong fetch HTTP va dung mock data o FE/book_loan/src/api.
- Nguoi tiep nhan fetch API chi can thay mock layer bang goi HTTP theo collection nay.
- Khong can doi endpoint BE.
