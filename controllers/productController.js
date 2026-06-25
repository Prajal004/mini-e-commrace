const pool = require('../config/database');
const { AppError } = require('../middlewares/errorMiddleware');

class ProductController {
  create = async (ctx) => {
    const {
      name,
      description,
      price,
      category_id,
      stock_quantity,
      options = [],
      images = [],
    } = ctx.request.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { rows: productRows } = await client.query(
        `INSERT INTO products
         (name, description, price, category_id, stock_quantity)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, description, price, category_id, stock_quantity || 0]
      );

      const product = productRows[0];

      for (const option of options) {
        await client.query(
          `INSERT INTO product_options
           (product_id, name, value)
           VALUES ($1, $2, $3)`,
          [product.id, option.name, option.value]
        );
      }

      for (const url of images) {
        await client.query(
          `INSERT INTO product_images
           (product_id, url)
           VALUES ($1, $2)`,
          [product.id, url]
        );
      }

      await client.query('COMMIT');

      const fullProduct = await this.getProductById(product.id);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Product created successfully',
        data: fullProduct,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

  update = async (ctx) => {
    const { id } = ctx.params;
    const {
      name,
      description,
      price,
      category_id,
      stock_quantity,
      options,
      images,
    } = ctx.request.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `UPDATE products
         SET
           name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category_id = COALESCE($4, category_id),
           stock_quantity = COALESCE($5, stock_quantity),
           updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [name, description, price, category_id, stock_quantity, id]
      );

      if (rows.length === 0) {
        throw new AppError('Product not found', 404);
      }

      if (options !== undefined) {
        await client.query('DELETE FROM product_options WHERE product_id = $1', [id]);

        for (const option of options) {
          await client.query(
            `INSERT INTO product_options
             (product_id, name, value)
             VALUES ($1, $2, $3)`,
            [id, option.name, option.value]
          );
        }
      }

      if (images !== undefined) {
        await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);

        for (const url of images) {
          await client.query(
            `INSERT INTO product_images
             (product_id, url)
             VALUES ($1, $2)`,
            [id, url]
          );
        }
      }

      await client.query('COMMIT');

      const fullProduct = await this.getProductById(id);

      ctx.body = {
        success: true,
        message: 'Product updated successfully',
        data: fullProduct,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

  delete = async (ctx) => {
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
  };

  getById = async (ctx) => {
    const { id } = ctx.params;

    const product = await this.getProductById(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    ctx.body = {
      success: true,
      data: product,
    };
  };

  list = async (ctx) => {
    const {
      search,
      category_id,
      min_price,
      max_price,
      page = 1,
      limit = 10,
    } = ctx.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const values = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`p.name ILIKE $${paramIndex}`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (category_id) {
      whereConditions.push(`p.category_id = $${paramIndex}`);
      values.push(category_id);
      paramIndex++;
    }

    if (min_price) {
      whereConditions.push(`p.price >= $${paramIndex}`);
      values.push(min_price);
      paramIndex++;
    }

    if (max_price) {
      whereConditions.push(`p.price <= $${paramIndex}`);
      values.push(max_price);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM products p
      ${whereClause}
    `;

    const { rows: countRows } = await pool.query(countQuery, values);
    const total = parseInt(countRows[0].total, 10);

    const productsQuery = `
      SELECT
        p.*,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
    `;

    const { rows: products } = await pool.query(productsQuery, [
      ...values,
      limitNum,
      offset,
    ]);

    const productsWithRelations = await Promise.all(
      products.map((product) => this.getProductById(product.id))
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
  };

  getProductById = async (id) => {
    const { rows } = await pool.query(
      `SELECT
        p.*,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      WHERE p.id = $1`,
      [id]
    );

    if (rows.length === 0) return null;

    const product = rows[0];

    const { rows: optionsRows } = await pool.query(
      `SELECT * FROM product_options WHERE product_id = $1`,
      [id]
    );

    const { rows: imagesRows } = await pool.query(
      `SELECT * FROM product_images WHERE product_id = $1`,
      [id]
    );

    product.options = optionsRows;
    product.images = imagesRows;

    return product;
  };
}

module.exports = new ProductController();