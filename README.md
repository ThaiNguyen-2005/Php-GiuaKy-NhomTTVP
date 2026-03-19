# Hướng dẫn Cài đặt và Chạy Dự án (Book Loan Midterm)

Tài liệu này hướng dẫn cách cài đặt và chạy dự án bao gồm Backend (Laravel) và Frontend (React + Vite).

## Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt:

- **PHP** >= 8.2
- **Composer** (Quản lý thư viện PHP)
- **Node.js** & **npm** (hoặc yarn/pnpm)
- **MySQL** (hoặc MariaDB)

## Cấu trúc thư mục

- `BE/`: Mã nguồn Backend (Laravel Framework)
- `FE/book_loan/`: Mã nguồn Frontend (ReactJS + Vite)

---

## 1. Cài đặt Backend (BE)

Truy cập vào thư mục `BE` và thực hiện các bước sau:

### Bước 1: Di chuyển vào thư mục
```bash
cd BE
```

### Bước 2: Cài đặt các thư viện PHP
```bash
composer install
```

### Bước 3: Cấu hình môi trường
Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```
Mở file `.env` vừa tạo và cấu hình thông tin kết nối cơ sở dữ liệu (Database):
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ten_database_cua_ban
DB_USERNAME=root
DB_PASSWORD=
```

### Bước 4: Tạo Application Key
```bash
php artisan key:generate
```

### Bước 5: Chạy Migration (Tạo bảng CSDL)
```bash
php artisan migrate
```
*(Nếu có dữ liệu mẫu, bạn có thể chạy thêm `php artisan db:seed`)*

### Bước 6: Khởi chạy Server Backend
```bash
php artisan serve
```
Mặc định server sẽ chạy tại: `http://127.0.0.1:8000`

---

## 2. Cài đặt Frontend (FE)

Mở một terminal mới, truy cập vào thư mục `FE/book_loan` và thực hiện các bước sau:

### Bước 1: Di chuyển vào thư mục
```bash
cd FE/book_loan
```

### Bước 2: Cài đặt các thư viện Node.js
```bash
npm install
```

### Bước 3: Cấu hình môi trường (Nếu cần)
Nếu dự án có file `.env.example`, hãy copy nó thành `.env` và cấu hình API URL trỏ về Backend:
```bash
cp .env.example .env
```
Ví dụ nội dung `.env` cho Frontend:
```env
VITE_API_URL=http://127.0.0.1:8000
```

### Bước 4: Khởi chạy Server Frontend
```bash
npm run dev
```
Mặc định ứng dụng sẽ chạy tại: `http://localhost:3000` (hoặc cổng hiển thị trên terminal).

---

## Tổng kết

Sau khi khởi chạy cả 2 terminal:
1. **Backend** hoạt động tại `http://127.0.0.1:8000`
2. **Frontend** hoạt động tại `http://localhost:3000`

Truy cập địa chỉ của Frontend trên trình duyệt để sử dụng ứng dụng.
