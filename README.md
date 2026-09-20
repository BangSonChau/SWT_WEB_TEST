# SWT301 - Web Application Testing Environment (Authentication Module)

Hệ thống Full-stack Web phục vụ thực hành kiểm thử phần mềm (Software Testing - SWT301), tích hợp bộ kiểm thử tự động End-to-End (E2E) bằng **Playwright** cho phân hệ Xác thực (Authentication).

---

## 1. Công nghệ sử dụng

* **Frontend:** React (Vite), TypeScript, Tailwind CSS, Axios, TanStack Query, Zustand, React Router DOM.
* **Backend:** Node.js, Express.js (RESTful API), Prisma ORM.
* **Database:** PostgreSQL (Mã hóa mật khẩu và token bằng `bcrypt` qua extension `pgcrypto`).
* **Automation Testing:** Playwright (Hỗ trợ Chromium, Headless/Headed, UI Mode và HTML Reporter).

---

## 2. Cấu trúc Cơ sở dữ liệu (PostgreSQL)

Bảng **`users`** phục vụ lưu trữ tài khoản kiểm thử:

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | Primary Key | Định danh tài khoản dạng UUID |
| `email` | `TEXT` | Unique, Not Null | Email đăng nhập |
| `password` | `TEXT` | Not Null | Mật khẩu đã được băm bằng thuật toán `bcrypt` |
| `role` | `TEXT` | Default: `'USER'` | Phân quyền tài khoản (`ADMIN` hoặc `USER`) |
| `accessToken` | `TEXT` | Nullable | Chuỗi băm/JWT token phiên đăng nhập |

---

## 3. Đặc tả Kịch bản Kiểm thử & Locators (Playwright Mapping)

Hệ thống định danh các phần tử giao diện bằng `id` và `class` cố định để Playwright bắt chính xác:

| Test Case | Mô tả kịch bản | Dữ liệu kiểm thử (Input) | Playwright Action & Locator | Kỳ vọng (Expected) |
| :--- | :--- | :--- | :--- | :--- |
| **TC_LOG_01** | Đăng nhập thành công | `admin@example.com`<br>`Pass@123` | `page.locator('#email').fill(...)`<br>`page.locator('#password').fill(...)`<br>`page.locator('#btn-login').click()` | Chuyển hướng đến URL chứa `/dashboard` |
| **TC_LOG_02** | Bỏ trống email & mật khẩu | `""`<br>`""` | `page.locator('#btn-login').click()` | `.error-email`: `"Vui lòng nhập email"`<br>`.error-password`: `"Vui lòng nhập mật khẩu"` |
| **TC_LOG_03** | Email sai định dạng | `user@`<br>`Pass@123` | `page.locator('#email').fill('user@')`<br>`page.locator('#btn-login').click()` | `.error-email`: `"Email không đúng định dạng"` |
| **TC_LOG_04** | Nhập sai mật khẩu | `admin@example.com`<br>`WrongPass123` | `page.locator('#password').fill('WrongPass123')`<br>`page.locator('#btn-login').click()` | `.alert-danger`: `"Tài khoản hoặc mật khẩu không chính xác"` |

---

## 4. Hướng dẫn Cài đặt & Chuẩn bị Môi trường

### Bước 1: Cài đặt Dependencies
```bash
# Cài đặt Backend
cd server && npm install

# Cài đặt Frontend
cd ../client && npm install
