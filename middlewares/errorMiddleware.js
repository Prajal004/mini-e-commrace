class AppError extends Error {
  constructor(message, statusCode = 500, success = false) {
    super(message);
    this.statusCode = statusCode;
    this.success = success;
  }
}

const errorMiddleware = (err, ctx, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  ctx.status = status;
  ctx.body = {
    success: err.success || false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };
};

module.exports = errorMiddleware;
module.exports.AppError = AppError;