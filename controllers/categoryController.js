const pool = require('../config/database');
const { AppError } = require('../middlewares/errorMiddleware');

class CategoryController {
  async create(ctx) {
    const { name, description } = ctx.request.body;

    const { rows } = await pool.query(
      `INSERT INTO categories (name, description) 
       VALUES ($1, $2) 
       RETURNING id, name, description, created_at, updated_at`,
      [name, description]
    );

    ctx.status = 201;
    ctx.body = {
      success: true,
      message: 'Category created successfully',
      data: rows[0],
    };
  }

  async update(ctx) {
    const { id } = ctx.params;
    const { name, description } = ctx.request.body;

    const { rows } = await pool.query(
      `UPDATE categories 
       SET name = $1, description = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING id, name, description, created_at, updated_at`,
      [name, description, id]
    );

    if (rows.length === 0) {
      throw new AppError('Category not found', 404);
    }

    ctx.body = {
      success: true,
      message: 'Category updated successfully',
      data: rows[0],
    };
  }

  async delete(ctx) {
    const { id } = ctx.params;

    const { rows } = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [id]
    );

    if (rows.length === 0) {
      throw new AppError('Category not found', 404);
    }

    ctx.body = {
      success: true,
      message: 'Category deleted successfully',
    };
  }

  async list(ctx) {
    const { rows } = await pool.query(
      'SELECT id, name, description, created_at, updated_at FROM categories ORDER BY name'
    );

    ctx.body = {
      success: true,
      data: rows,
    };
  }
}

module.exports = new CategoryController();