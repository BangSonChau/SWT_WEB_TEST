# SWT301 Web Application Testing Environment

Ứng dụng full-stack dùng cho thực hành kiểm thử phần mềm (SWT301). Project
gồm một giao diện React cho luồng xác thực, REST API bằng Express/Prisma và
một bộ kiểm thử E2E chạy theo dữ liệu trong Excel bằng Playwright.

## 1. Thành phần chính

| Thành phần | Công nghệ | Thư mục |
| --- | --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS | `client/` |
| State và gọi API | Zustand, TanStack Query, Axios, React Hook Form, Zod | `client/src/` |
| Backend | Node.js, Express 5, CORS, JWT, bcryptjs | `server/` |
| ORM và cơ sở dữ liệu | Prisma 6, PostgreSQL | `server/prisma/` |
| Kiểm thử E2E | Playwright, Chromium, TypeScript | `playwright-test/` |
| Báo cáo | HTML Reporter và Excel Reporter tùy chỉnh | `playwright-test/` |

## 2. Luồng hoạt động

1. Người dùng mở trang `/login` trên frontend.
2. Form đăng nhập được kiểm tra ở frontend bằng React Hook Form và Zod.
3. Frontend gọi `POST /api/v1/auth/login`.
4. Backend kiểm tra dữ liệu, tìm người dùng theo email trong PostgreSQL và
   so sánh mật khẩu đã băm bằng `bcryptjs`.
5. Nếu đăng nhập thành công, backend ký JWT có thời hạn một ngày, lưu token
   vào `accessToken` của người dùng và trả về token cùng thông tin người dùng
   (không trả mật khẩu).
6. Frontend lưu token và role trong Zustand, được persist vào `localStorage`
   với key `auth-storage`.

### Các route hiện có

| Method | URL | Mô tả |
| --- | --- | --- |
| `GET` | `/` | Trang chủ demo |
| `GET` | `/login` | Trang đăng nhập |
| `POST` | `/api/v1/auth/login` | Xác thực email và mật khẩu |

## 3. Cấu trúc thư mục

```text
.
├── client/                         # React/Vite frontend
│   └── src/
│       ├── app/                    # App providers và router
│       ├── feature/auth/           # Form, validation, service, auth store
│       ├── lib/                    # Axios, env và query client
│       └── shared/                 # Layout, trang chủ và route guards
├── server/                         # Express backend
│   ├── prisma/                     # Schema và migration
│   └── src/
│       ├── config/                 # Prisma client
│       ├── middlewares/            # Error handler
│       └── modules/auth/           # Route, controller, service, repository
├── playwright-test/                # Bộ test E2E chạy theo Excel
│   ├── tests/dynamic-runner.spec.ts
│   ├── reporters/excel-reporter.ts
│   ├── test-case.xlsx              # File mẫu đầu vào
│   └── Test_Report.xlsx            # File mẫu báo cáo
└── package.json                    # Script chạy toàn project
```

## 4. Yêu cầu môi trường

- Node.js và npm.
- PostgreSQL đang chạy và có database phù hợp.
- Có một tài khoản trong bảng `users` để chạy test đăng nhập thành công.
- Cổng mặc định:
  - Frontend: `5173`
  - Backend: `5000`
  - Playwright config hiện đặt `baseURL` là `http://localhost:5143`; khi
    chạy test theo file mẫu, cần bảo đảm URL và frontend đang chạy khớp nhau.

## 5. Cấu hình biến môi trường

Không commit các file `.env` thật. Tạo các file local sau:

### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### `server/.env`

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<database>
JWT_SECRET=<your-development-secret>
```

Thay các giá trị trong dấu `<...>` bằng cấu hình local của bạn. Không sử dụng
secret thật trong file mẫu hoặc trong test-case public.

## 6. Cài đặt

Từ thư mục gốc:

```bash
npm install
npm run install:all
cd playwright-test
npm install
cd ..
```

Hoặc cài riêng từng package:

```bash
cd client && npm install
cd ../server && npm install
cd ../playwright-test && npm install
```

Sau khi cài Playwright lần đầu, cài browser:

```bash
cd playwright-test
npx playwright install chromium
```

## 7. Chuẩn bị database

1. Tạo PostgreSQL database.
2. Điền `DATABASE_URL` trong `server/.env`.
3. Chạy migration:

```bash
cd server
npx prisma migrate dev
```

Schema hiện có bảng `users`:

| Cột | Mô tả |
| --- | --- |
| `id` | UUID dạng chuỗi, khóa chính |
| `email` | Email duy nhất |
| `password` | Mật khẩu đã băm |
| `role` | Mặc định `USER` |
| `accessToken` | JWT token gần nhất, có thể rỗng |

Project hiện không có seed script. Vì vậy cần tạo user test bằng quy trình
seed riêng hoặc chèn một bản ghi có mật khẩu đã băm đúng bằng `bcryptjs`.

## 8. Chạy ứng dụng

Chạy cả frontend và backend đồng thời:

```bash
npm run dev
```

Chạy riêng:

```bash
npm run dev:client
npm run dev:server
```

Frontend được mở tại `http://localhost:5173`. Backend mặc định chạy tại
`http://localhost:5000`.

Build và kiểm tra frontend:

```bash
cd client
npm run lint
npm run build
```

## 9. Bộ test E2E theo Excel

File [`playwright-test/test-case.xlsx`](./playwright-test/test-case.xlsx) là
nguồn chuẩn (single source of truth) cho đặc tả kiểm thử và là file mẫu public
của project. Mọi test runner, locator, dữ liệu đầu vào và expected output cần
được đối chiếu theo file này. File chứa hai sheet:

- Sheet tổng quan: mô tả test case, pre-condition, test data, expected output.
- Sheet bước chạy: các cột `TC_ID`, `Step`, `Description`, `Action`,
  `Locator_Type`, `Locator_Value`, `Value`, `Expected`, `Stop_On_Fail`.

`dynamic-runner.spec.ts` đọc sheet bước chạy, gom các dòng theo `TC_ID` và hỗ
trợ các action:

| Action | Ý nghĩa |
| --- | --- |
| `GOTO` | Mở URL |
| `INPUT` | Nhập dữ liệu vào selector |
| `CLICK` | Click phần tử |
| `ASSERT_URL` | Kiểm tra URL hiện tại |
| `ASSERT_TEXT` | Kiểm tra text của phần tử |

Selector được tạo từ `Locator_Type`:

- `id` → `#<Locator_Value>`
- `css` → dùng trực tiếp
- `xpath` → `xpath=<Locator_Value>`

### Các test case trong file mẫu

| ID | Kịch bản | Dữ liệu / kỳ vọng chính |
| --- | --- | --- |
| `TC_LOG_01` | Đăng nhập thành công | `user@example.com` / `Pass@123`; kiểm tra chuyển hướng |
| `TC_LOG_02` | Bỏ trống email và mật khẩu | Hiển thị lỗi tối thiểu email 3 ký tự và password 6 ký tự |
| `TC_LOG_03` | Email sai định dạng | Dùng `user@`; hiển thị `Email không đúng định dạng` |
| `TC_LOG_04` | Sai mật khẩu | Dùng `admin@example.com` / `WrongPass123`; hiển thị toast `Tài khoản hoặc mật khẩu không chính xác` |

Các locator UI quan trọng:

- Email: `#email`
- Mật khẩu: `#password`
- Nút đăng nhập: `#btn-login`
- Lỗi email: `#error-email`
- Lỗi mật khẩu: `#error-password`
- Toast lỗi đăng nhập: `[data-sonner-toast]`

### Chạy test

Từ thư mục gốc:

```bash
npm run test:e2e
```

Chạy ở UI Mode:

```bash
npm run test:e2e:ui
```

Hoặc từ `playwright-test/`:

```bash
npx playwright test
npx playwright test --ui
npx playwright test --headed
```

File `run-tool.bat` cũng cung cấp menu để chạy UI Mode hoặc chạy headed.

Sau khi chạy, Playwright tạo HTML report trong `playwright-report/`. Excel
reporter được cấu hình để xuất `Test_Report.xlsx`.

## 10. Lưu ý hiện trạng test và report

- `TC_LOG_01` trong Excel kỳ vọng URL `/dashboard`. Đây là expected output
  chuẩn; nếu code hiện tại chưa có route này thì cần bổ sung hoặc điều chỉnh
  code theo Excel trước khi coi test là đạt.
- Excel reporter hiện đọc file nguồn tên `Book1.xlsx`, còn file mẫu trong
  repository là `test-case.xlsx`. Khi triển khai reporter, file nguồn cần được
  đổi sang `test-case.xlsx` để thống nhất với file chuẩn.
- Thông tin tài khoản trong Excel là dữ liệu mẫu phục vụ test. Khi thay bằng
  tài khoản thật, không commit password hoặc secret vào repository.

## 11. Tài liệu test

- Test input: [`playwright-test/test-case.xlsx`](./playwright-test/test-case.xlsx)
- Report template: [`playwright-test/Test_Report.xlsx`](./playwright-test/Test_Report.xlsx)
- Dynamic runner: [`playwright-test/tests/dynamic-runner.spec.ts`](./playwright-test/tests/dynamic-runner.spec.ts)
- Excel reporter: [`playwright-test/reporters/excel-reporter.ts`](./playwright-test/reporters/excel-reporter.ts)
