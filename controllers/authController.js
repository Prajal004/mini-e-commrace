const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { AppError } = require('../middlewares/errorMiddleware');

class AuthController {
  async register(ctx) {
    const { email, password, role } = ctx.request.body;  // Removed name

    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.length > 0) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userRole = role === 'admin' ? 'admin' : 'user';

    const { rows } = await pool.query(
      `INSERT INTO users (email, password, role)   -- Removed name
       VALUES ($1, $2, $3) 
       RETURNING id, email, role, created_at`,
      [email, hashedPassword, userRole]
    );

    const user = rows[0];
    const token = generateToken(user);

    ctx.status = 201;
    ctx.body = {
      success: true,
      message: 'User registered successfully',
      data: { user, token },
    };
  }

  async login(ctx) {
    const { email, password } = ctx.request.body;

    const { rows } = await pool.query(
      'SELECT id, email, password, role FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user);

    ctx.body = {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      },
    };
  }

  async getProfile(ctx) {
    const { rows } = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1',
      [ctx.user.id]
    );

    ctx.body = {
      success: true,
      data: rows[0],
    };
  }
}

module.exports = new AuthController();