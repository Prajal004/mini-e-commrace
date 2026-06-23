const jwt = require('koa-jwt');
const { verifyToken } = require('../utils/jwt');
const { AppError } = require('./errorMiddleware');
const pool = require('../config/database');

const authenticate = jwt({
  secret: process.env.JWT_SECRET,
  passthrough: true,
});

const verifyAuth = async (ctx, next) => {
  try {
    const token = ctx.state.jwt;
    
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

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
    throw error;
  }
};

const requireRole = (role) => {
  return (ctx, next) => {
    if (ctx.user.role !== role) {
      throw new AppError(`Access denied. Required role: ${role}`, 403);
    }
    return next();
  };
};

const requireAdmin = requireRole('admin');

module.exports = {
  authenticate,
  verifyAuth,
  requireAdmin,
  requireRole,
};