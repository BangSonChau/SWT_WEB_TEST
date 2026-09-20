import { authService } from './auth.service.js';

export const authController = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body || {};

      // Gọi xuống tầng Service xử lý
      const result = await authService.login({ email, password });

      // Trả kết quả thành công về cho Frontend
      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (error) {
      // Đẩy lỗi sang middleware errorHandler xử lý tập trung
      next(error);
    }
  },
};