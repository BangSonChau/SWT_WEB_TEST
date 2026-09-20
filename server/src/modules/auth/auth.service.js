import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from './auth.repository.js';

// Regex chuẩn kiểm tra định dạng email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authService = {
  login: async ({ email, password }) => {
    // 1. TC_LOG_02: Bỏ trống email hoặc mật khẩu
    if (!email || !password || email.trim() === '' || password.trim() === '') {
      const error = new Error('Vui lòng nhập đầy đủ email và mật khẩu');
      error.statusCode = 400;
      throw error;
    }

    const cleanEmail = email.trim();

    // 2. TC_LOG_03: Email sai định dạng
    if (!EMAIL_REGEX.test(cleanEmail)) {
      const error = new Error('Email không đúng định dạng');
      error.statusCode = 400;
      throw error;
    }

    // 3. Tìm user trong DB thông qua Repository
    const user = await authRepository.findByEmail(cleanEmail);

    // 4. TC_LOG_05: Tài khoản không tồn tại
    // (Bảo mật: Trả thông báo chung tránh để hacker dò biết email nào đã đăng ký)
    if (!user) {
      const error = new Error('Tài khoản hoặc mật khẩu không chính xác');
      error.statusCode = 401;
      throw error;
    }

    // 5. TC_LOG_04: Sai mật khẩu
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      const error = new Error('Tài khoản hoặc mật khẩu không chính xác');
      error.statusCode = 401;
      throw error;
    }

    // 6. TC_LOG_01: Đăng nhập thành công -> Ký chuỗi JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1d' }
    );

    // Lưu token vào database qua repository
    const updatedUser = await authRepository.updateAccessToken(user.id, token);

    // Trả về dữ liệu Entity đã được lọc bỏ mật khẩu
    return {
      token,
      user: updatedUser.toResponse(),
    };
  },
};