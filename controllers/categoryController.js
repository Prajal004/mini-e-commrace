const pool = require('../config/database');
const { AppError } = require('../middlewares/errorMiddleware');

const create = async (ctx) => {
  const { name, description } = ctx.request.body;

  const { rows } = await pool.query(
    'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
    [name, description || null]
  );

  ctx.status = 201;
  ctx.body = {
    success: true,
    message: 'Category created successfully',
    data: rows[0],
  };
};

const update = async (ctx) => {
  const { id } = ctx.params;
  const { name, description } = ctx.request.body;

  const { rows } = await pool.query(
    `UPDATE categories
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [name || null, description || null, id]
  );

  if (rows.length === 0) {
    throw new AppError('Category not found', 404);
  }

  ctx.body = {
    success: true,
    message: 'Category updated successfully',
    data: rows[0],
  };
};

const remove = async (ctx) => {
  const { id } = ctx.params;

  const { rows } = await pool.query(
    'DELETE FROM categories WHERE id = $1 RETURNING *',
    [id]
  );

  if (rows.length === 0) {
    throw new AppError('Category not found', 404);
  }

  ctx.body = {
    success: true,
    message: 'Category deleted successfully',
    data: rows[0],
  };
};

const list = async (ctx) => {
  const { rows } = await pool.query(
    'SELECT * FROM categories ORDER BY created_at DESC'
  );

  ctx.body = {
    success: true,
    message: 'Categories fetched successfully',
    data: rows,
  };
};

module.exports = {
  create,
  update,
  delete: remove,
  list,
};