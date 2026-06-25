const { verifyToken } = require('../utils/jwt');
const { AppError } = require('./errorMiddleware');
const pool = require('../config/database');

const authenticate = async (ctx, next) => {
  try {
    const authHeader = ctx.headers.authorization;
    
    if (!authHeader) {
      throw new AppError('Authentication required. Please provide token.', 401);
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AppError('Invalid token format. Use Bearer <token>', 401);
    }

    const token = parts[1];
    const decoded = verifyToken(token);
    
    const { rows } = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (rows.length === 0) {
      throw new AppError('User not found', 401);
    }

    ctx.user = rows[0];
    await next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401);
    }
    throw error;
  }
};

const requireRole = (role) => {
  return async (ctx, next) => {
    if (!ctx.user) {
      throw new AppError('Authentication required', 401);
    }
    if (ctx.user.role !== role) {
      throw new AppError(`Access denied. Required role: ${role}`, 403);
    }
    await next();
  };
};

const requireAdmin = requireRole('admin');

module.exports = {
  authenticate,
  requireAdmin,
  requireRole,
};