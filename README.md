# DATN - ToeicZone LMS

Dự án học tập web luyện TOEIC gồm 2 phần:
- `lms-backend`: API Node.js/Express + MySQL + Socket.IO
- `lms-fe`: Frontend React + Vite

## Chức năng chính

- Đăng ký, đăng nhập, quản lý tài khoản
- Phân quyền `ADMIN`, `TEACHER`, `USER`
- Quản lý khóa học, bài học, bài test
- Đăng ký khóa học và theo dõi thanh toán
- Chat realtime giữa giáo viên và học viên
- Quản lý từ vựng, ghi chú, dashboard giáo viên/admin
- Upload file cho bài học, test và dữ liệu media

## Cấu trúc thư mục

- `lms-backend/`: source code backend, routes, controllers, models, socket
- `lms-fe/`: source code giao diện người dùng
- `PROJECT_DOCUMENTATION.md`: tài liệu mô tả chi tiết API và tính năng

## Yêu cầu

- Node.js 18+ (khuyến nghị)
- MySQL
- npm

## Cài đặt

### 1) Backend

```bash
cd lms-backend
npm install
npm run dev
```

Mặc định backend chạy ở cổng `3000` nếu không khai báo `PORT` trong `.env`.

### 2) Frontend

```bash
cd lms-fe
npm install
npm run dev
```

## Ghi chú cấu hình

- Backend dùng biến môi trường từ file `.env`.
- Backend phục vụ file tĩnh trong thư mục `data/` qua đường dẫn `/data`.
- Frontend dùng Vite, có cấu hình `allowedHosts` trong `vite.config.js`.

## Scripts

### `lms-backend`

- `npm run dev`: chạy server với `nodemon`
- `npm start`: chạy server bằng `node`

### `lms-fe`

- `npm run dev`: chạy frontend ở chế độ phát triển
- `npm run build`: build production
- `npm run preview`: xem bản build
- `npm run lint`: kiểm tra code bằng ESLint

## Tài liệu thêm

Xem chi tiết API, controller và luồng dữ liệu trong [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).
