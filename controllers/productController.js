const pool = require('../config/database');
const { AppError } = require('../middlewares/errorMiddleware');

class ProductController {
  async create(ctx) {
    const { name, description, price, category_id, options, images } = ctx.request.body;

    const { rows: productRows } = await pool.query(
      `INSERT INTO products (name, description, price, category_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, description, price, category_id, created_at, updated_at`,
      [name, description, price, category_id]
    );

    const product = productRows[0];

    if (options && options.length > 0) {
      for (const option of options) {
        await pool.query(
          `INSERT INTO product_options (product_id, name, value) 
           VALUES ($1, $2, $3)`,
          [product.id, option.name, option.value]
        );
      }
    }

    if (images && images.length > 0) {
      for (const url of images) {
        await pool.query(
          `INSERT INTO product_images (product_id, url) 
           VALUES ($1, $2)`,
          [product.id, url]
        );
      }
    }

    const fullProduct = await this.getProductById(product.id);

    ctx.status = 201;
    ctx.body = {
      success: true,
      message: 'Product created successfully',
      data: fullProduct,
    };
  }

  async update(ctx) {
    const { id } = ctx.params;
    const { name, description, price, category_id, options, images } = ctx.request.body;

    const { rows } = await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, category_id = $4, updated_at = NOW() 
       WHERE id = $5 
       RETURNING id, name, description, price, category_id, created_at, updated_at`,
      [name, description, price, category_id, id]
    );

    if (rows.length === 0) {
      throw new AppError('Product not found', 404);
    }

    const product = rows[0];

    if (options) {
      await pool.query('DELETE FROM product_options WHERE product_id = $1', [id]);
      for (const option of options) {
        await pool.query(
          `INSERT INTO product_options (product_id, name, value) 
           VALUES ($1, $2, $3)`,
          [id, option.name, option.value]
        );
      }
    }

    if (images) {
      await pool.query('DELETE FROM product_images WHERE product_id = $1', [id]);
      for (const url of images) {
        await pool.query(
          `INSERT INTO product_images (product_id, url) 
           VALUES ($1, $2)`,
          [id, url]
        );
      }
    }

    const fullProduct = await this.getProductById(id);

    ctx.body = {
      success: true,
      message: 'Product updated successfully',
      data: fullProduct,
    };
  }

  async delete(ctx) {
    const { id } = ctx.params;

    const { rows } = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );

    if (rows.length === 0) {
      throw new AppError('Product not found', 404);
    }

    ctx.body = {
      success: true,
      message: 'Product deleted successfully',
    };
  }

  async getById(ctx) {
    const { id } = ctx.params;
    const product = await this.getProductById(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    ctx.body = {
      success: true,
      data: product,
    };
  }

  async list(ctx) {
    const {
      search,
      category_id,
      min_price,
      max_price,
      page = 1,
      limit = 10,
    } = ctx.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const values = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`name ILIKE $${paramIndex}`);
      values.push(`${search}`);
      paramIndex++;
    }

    if (category_id) {
      whereConditions.push(`category_id = $${paramIndex}`);
      values.push(category_id);
      paramIndex++;
    }

    if (min_price) {
      whereConditions.push(`price >= $${paramIndex}`);
      values.push(min_price);
      paramIndex++;
    }

    if (max_price) {
      whereConditions.push(`price <= $${paramIndex}`);
      values.push(max_price);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const { rows: countRows } = await pool.query(countQuery, values);
    const total = parseInt(countRows[0].total);

    const productsQuery = `
      SELECT 
        p.id, p.name, p.description, p.price, p.category_id,
        p.created_at, p.updated_at, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const { rows: products } = await pool.query(
      productsQuery,
      [...values, limitNum, offset]
    );

    const productsWithRelations = await Promise.all(
      products.map(product => this.getProductById(product.id))
    );

    ctx.body = {
      success: true,
      data: {
        products: productsWithRelations,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    };
  }

  async getProductById(id) {
    const { rows } = await pool.query(
      `SELECT 
        p.id, p.name, p.description, p.price, p.category_id,
        p.created_at, p.updated_at, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1`,
      [id]
    );

    if (rows.length === 0) return null;

    const product = rows[0];

    const { rows: optionsRows } = await pool.query(
      'SELECT id, name, value, created_at FROM product_options WHERE product_id = $1',
      [id]
    );
    product.options = optionsRows;

    const { rows: imagesRows } = await pool.query(
      'SELECT id, url, created_at FROM product_images WHERE product_id = $1',
      [id]
    );
    product.images = imagesRows;

    return product;
  }
}

module.exports = new ProductController();