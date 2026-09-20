//bắt lỗi và format lỗi
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống nội bộ';

  res.status(statusCode).json({
    success: false,
    message,
  });
};