export class UserEntity {
  constructor({ id, email, password, role, accessToken }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.role = role || "USER";
    this.accessToken = accessToken || null;
  }

  // Phương thức ẩn mật khẩu khi gửi thông tin về phía Frontend (bảo mật)
  toResponse() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
    };
  }
}
