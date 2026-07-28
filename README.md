# ✈️ QTravel - Hệ sinh thái Du lịch & Đặt phòng Toàn diện (Fullstack Travel Platform)

Chào mừng bạn đến với **QTravel** - Hệ sinh thái đặt vé máy bay và phòng khách sạn toàn diện, hỗ trợ quản lý đặt chỗ, tích hợp cổng thanh toán trực tuyến, và đặc biệt là hệ thống đồng bộ hóa thời gian thực (real-time) với các đối tác khách sạn.

**Được phát triển bởi:** Vũ Anh Quốc

<div align="center">
  <h3>Frontend</h3>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
  
  <h3>Backend & Database</h3>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/MoMo_Pay-D82D8B?style=for-the-badge&logo=momo&logoColor=white" alt="MoMo Pay" />
</div>

---

## 📖 Giới thiệu (Introduction)

QTravel không chỉ là một ứng dụng Fullstack (Frontend & Backend) thông thường. Nền tảng được thiết kế với kiến trúc hướng dịch vụ, cung cấp trải nghiệm mượt mà từ việc tìm kiếm chuyến bay toàn cầu, đặt phòng khách sạn, thanh toán trực tuyến qua MoMo, cho đến việc theo dõi đơn hàng và nhận thông báo đẩy (push notification) ngay lập tức khi có cập nhật mới.

Hệ thống bao gồm 3 phân hệ chính:
1. **QTravel Frontend**: Giao diện người dùng web hiện đại, tốc độ cao.
2. **QTravel Backend**: API Server trung tâm, xử lý logic nghiệp vụ, giao tiếp với các bên thứ 3 (Duffel, MoMo).
3. **QHotel**: Một mini-server đóng vai trò là "Đối tác khách sạn", minh họa cho luồng Webhook đồng bộ hóa đơn hàng tự động từ trang web riêng của khách sạn về nền tảng QTravel.

## 🛠 Công nghệ & Kiến trúc sử dụng (Tech Stack & Architecture)

### Frontend (`/QTravelFrontend`)
- **Core:** React.js (khởi tạo với Vite để tối ưu tốc độ build & HMR).
- **Styling:** Tailwind CSS (utility-first, responsive, custom themes), Lucide React (Icons).
- **Quản lý trạng thái (State Management):** Zustand (gọn nhẹ, hỗ trợ persist storage), Context API.
- **Định tuyến (Routing):** React Router v6.
- **Real-time:** `socket.io-client` để nhận Push Notifications từ Backend.
- **Tiện ích khác:** `date-fns` (xử lý ngày tháng), `axios` (gọi API).

### Backend Trung tâm (`/QTravel`)
- **Core:** Node.js với Express.js.
- **Kiến trúc:** Layered Architecture (Routes -> Controllers -> Services).
- **Cơ sở dữ liệu (Database):** MySQL (Quản lý qua **Prisma ORM** với schema rõ ràng).
- **Caching (Bộ nhớ đệm):** **Redis** (Tối ưu hóa các endpoint nặng như API tìm kiếm Top Destinations).
- **Real-time:** **Socket.io** (Quản lý WebSocket, xác thực bằng JWT, đẩy thông báo thời gian thực về Frontend).
- **Bảo mật & Xác thực:** JWT (JSON Web Tokens), `bcryptjs` (mã hóa mật khẩu).
- **Tích hợp bên thứ 3 (Third-party Integrations):**
  - **Duffel API**: Tìm kiếm, lấy giá, và tạo đơn đặt vé máy bay thực tế.
  - **MoMo API**: Xử lý thanh toán điện tử (Momo ATM, CC, Wallet) kèm webhook (IPN) xử lý kết quả tự động.
- **Tài liệu API:** Swagger UI (`swagger-autogen` tự động sinh docs từ code comments).

### Đối tác Khách sạn (`/QHotel`)
- **Mô hình giả lập (Mock Partner):** Một Node.js/Express server đơn giản có giao diện HTML/CSS cơ bản.
- **Webhook Integration**: Minh họa luồng khách hàng đặt phòng trực tiếp trên website khách sạn, sau đó server khách sạn sẽ tự động gọi **Webhook** sang QTravel để đồng bộ đơn hàng về hệ sinh thái chung.

## 📂 Cấu trúc dự án (Project Structure)

```text
QTravel-FullStack/
├── QTravel/                  # Backend API Server chính
│   ├── prisma/               # Schema cho Prisma ORM (schema.prisma)
│   ├── src/
│   │   ├── config/           # Cấu hình DB, Redis,...
│   │   ├── controllers/      # Logic xử lý HTTP request (webhook, momo, auth, user,...)
│   │   ├── middlewares/      # Middleware (Auth JWT, Error handling)
│   │   ├── routes/           # Định tuyến API
│   │   ├── services/         # Logic nghiệp vụ (Duffel API, Momo, Socket.io)
│   │   └── index.js          # Entry point, tích hợp Socket.io & Express
│   └── swagger.js            # Cấu hình tự động tạo Swagger docs
│
├── QTravelFrontend/          # Frontend Web Client
│   └── QTravelFrontend/
│       ├── src/
│       │   ├── components/   # Các UI components tái sử dụng (Header, Modal,...)
│       │   ├── pages/        # Giao diện các trang (Home, Bookings, Profile,...)
│       │   ├── services/     # API Client (Axios interceptors)
│       │   ├── store/        # Zustand stores (AuthStore, CurrencyStore,...)
│       │   └── App.jsx       # Khai báo React Router
│       └── tailwind.config.js
│
├── QHotel/                   # Mini Server đóng vai trò đối tác khách sạn
│   └── server.js             # Giao diện HTML form & Logic Webhook
│
└── README.md                 # Tài liệu dự án
```

## 🚀 Tính năng nổi bật (Key Features)

- **🔍 Tìm kiếm Dịch vụ Toàn cầu:** Tích hợp Duffel API để tìm kiếm vé máy bay, hiển thị chi tiết hãng hàng không. Tính năng Top Destinations được tăng tốc bằng **Redis Caching**.
- **💳 Thanh toán Điện tử (MoMo):** Luồng thanh toán hoàn chỉnh với MoMo Sandbox. Nhận IPN Webhook để tự động cập nhật trạng thái đơn hàng.
- **🔄 Đồng bộ Webhook Khách sạn:** Cho phép người dùng đặt phòng trên trang web vệ tinh (QHotel), hệ thống tự động đẩy dữ liệu đơn hàng về QTravel qua Webhook an toàn.
- **🔔 Push Notification Thời gian thực:** Tích hợp Socket.io. Ngay khi có đơn hàng mới hoặc thanh toán thành công, hệ thống tự động đẩy thông báo (kèm "chấm đỏ" notification) ngay trên màn hình người dùng mà không cần tải lại trang.
- **👤 Quản lý Tài khoản & Đặt chỗ:** Xem chi tiết vé máy bay, phòng khách sạn, định dạng tiền tệ động, xử lý xác thực bảo mật bằng JWT.

## 💻 Hướng dẫn chạy dự án (How to run locally)

Yêu cầu môi trường: `Node.js` (v16+), `MySQL`, và `Redis Server` đang chạy.

### 1. Backend Chính (QTravel)
1. Mở terminal, di chuyển vào thư mục: `cd QTravel`
2. Cài đặt các gói thư viện: `npm install`
3. Cấu hình biến môi trường (`.env`), đảm bảo có đủ các key của DB, Redis, Duffel, MoMo, JWT.
4. Chạy migration Database: `npx prisma db push`
5. Khởi chạy dự án: `npm run dev`
*(Swagger Docs sẽ có sẵn tại `http://localhost:3000/api-docs`)*

### 2. Frontend (QTravelFrontend)
1. Mở terminal mới, di chuyển vào thư mục: `cd QTravelFrontend/QTravelFrontend`
2. Cài đặt các gói thư viện: `npm install`
3. Khởi chạy dự án: `npm run dev`
*(Giao diện web chạy tại `http://localhost:5173`)*

### 3. Server Vệ tinh Khách sạn (QHotel)
1. Mở terminal thứ 3, di chuyển vào thư mục: `cd QHotel`
2. Cài đặt thư viện: `npm install`
3. Khởi chạy dự án: `node server.js`
*(Trang đặt phòng khách sạn chạy tại `http://localhost:4000`)*

---
*Cảm ơn bạn đã quan tâm đến dự án QTravel!*