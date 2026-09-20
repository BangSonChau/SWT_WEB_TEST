import express from "express";
import cors from "cors";
import rootRoutes from "./routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Cho phép client truy cập và đọc dữ liệu JSON gửi lên
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Gắn tiền tố chung /api/v1 cho toàn bộ hệ thống API
app.use("/api/v1", rootRoutes);

// Bắt các route không tồn tại
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Đường dẫn API không tồn tại",
  });
});

// Middleware xử lý lỗi tập trung (bắt buộc đặt ở cuối cùng)
app.use(errorHandler);

export default app;
