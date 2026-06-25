class AppError extends Error {
  constructor(message, statusCode = 500, success = false) {
    super(message);
    this.statusCode = statusCode;
    this.success = success;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorMiddleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    ctx.status = status;
    ctx.body = {
      success: err.success || false,
      message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        error: err.name
      }),
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', err);
    }
  }
};

module.exports = errorMiddleware;
module.exports.AppError = AppError;