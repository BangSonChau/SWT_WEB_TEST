import { Router } from 'express';
import authRoutes from './modules/auth/auth.route.js';

const router = Router();

// Gắn toàn bộ các đường dẫn của module auth vào tiền tố /auth
router.use('/auth', authRoutes);

export default router;