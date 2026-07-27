# ✈️ QTravel - Fullstack Travel Booking Platform

Chào mừng bạn đến với **QTravel** - Nền tảng đặt vé máy bay và phòng khách sạn toàn diện.

**Được phát triển bởi:** Vũ Anh Quốc

---

## 📖 Giới thiệu (Introduction)

QTravel là một ứng dụng Fullstack (Frontend & Backend) được thiết kế để cung cấp trải nghiệm trơn tru cho người dùng trong việc tìm kiếm, so sánh và đặt trước các dịch vụ du lịch như chuyến bay và phòng khách sạn. Hệ thống cũng hỗ trợ thanh toán điện tử, quản lý hồ sơ và theo dõi lịch sử đặt chỗ.

## 🛠 Công nghệ sử dụng (Tech Stack)

Dự án được chia làm hai phần chính với các công nghệ hiện đại:

### Frontend (`/QTravelFrontend`)
- **Framework:** React.js (khởi tạo với Vite để tối ưu tốc độ build)
- **Quản lý trạng thái:** Zustand / Context API (theo cấu trúc store)
- **Định tuyến:** React Router
- **Giao diện:** Thiết kế thân thiện, tương thích với nhiều thiết bị.

### Backend (`/QTravel`)
- **Môi trường:** Node.js với Express.js
- **Cơ sở dữ liệu & ORM:** Prisma ORM (tương tác với cơ sở dữ liệu SQL)
- **Thanh toán:** Tích hợp cổng thanh toán **MoMo**
- **Tài liệu API:** Swagger UI (Cung cấp tài liệu API trực quan)
- **Kiến trúc:** Layered Architecture (Routes -> Controllers -> Services)

## 📂 Cấu trúc dự án (Project Structure)

```text
QTravel-FullStack/
├── QTravel/                # Backend API Server
│   ├── api-docs/           # Các file test API (.rest)
│   ├── database/           # Sơ đồ cơ sở dữ liệu
│   ├── mock-data/          # Dữ liệu mẫu (mock)
│   ├── prisma/             # Schema cho Prisma ORM
│   ├── src/                # Mã nguồn chính của Backend (Controllers, Services, Routes)
│   └── swagger.js          # Cấu hình tài liệu Swagger
│
├── QTravelFrontend/        # Frontend Client App
│   └── QTravelFrontend/
│       ├── src/            # Mã nguồn chính của Frontend (Components, Pages, Hooks)
│       └── vite.config.js  # Cấu hình Vite
│
└── README.md               # Tài liệu dự án
```

## 🚀 Tính năng nổi bật (Key Features)

- **Tìm kiếm dịch vụ:** Tìm kiếm chuyến bay và phòng khách sạn theo nhiều tiêu chí (địa điểm, thời gian, giá).
- **Hệ thống đặt chỗ (Booking):** Đặt phòng, đặt vé máy bay nhanh chóng.
- **Thanh toán:** Tích hợp ví điện tử MoMo an toàn, tiện lợi.
- **Xác thực & Người dùng:** Đăng ký, đăng nhập (Authentication) và Quản lý thông tin cá nhân.
- **Quản lý đơn hàng:** Xem và theo dõi chi tiết lịch sử đặt chỗ (My Bookings).

## 💻 Hướng dẫn chạy dự án (How to run locally)

### 1. Backend (QTravel)
1. Mở terminal, di chuyển vào thư mục backend: `cd QTravel`
2. Cài đặt các gói thư viện: `npm install`
3. Cấu hình biến môi trường (`.env`) dựa trên `.env.example` (nếu có).
4. Khởi chạy dự án: `npm run dev`

### 2. Frontend (QTravelFrontend)
1. Mở terminal khác, di chuyển vào thư mục frontend: `cd QTravelFrontend/QTravelFrontend`
2. Cài đặt các gói thư viện: `npm install`
3. Khởi chạy dự án: `npm run dev`
4. Truy cập ứng dụng qua đường dẫn được hiển thị trên terminal (thường là `http://localhost:5173`).

---

*Cảm ơn bạn đã quan tâm đến dự án QTravel!*