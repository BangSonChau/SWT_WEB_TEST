import prisma from '../../config/prisma.js';
import { UserEntity } from './user.entity.js';

export const authRepository = {
  // Tìm người dùng theo email và chuyển sang UserEntity
  findByEmail: async (email) => {
    const rawUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!rawUser) return null;

    // Chuyển đổi dữ liệu từ model DB thành Entity
    return new UserEntity(rawUser);
  },

  // Cập nhật accessToken khi đăng nhập thành công
  updateAccessToken: async (id, token) => {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { accessToken: token },
    });

    return new UserEntity(updatedUser);
  },
};