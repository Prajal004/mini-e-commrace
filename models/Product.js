const pool = require('../config/database');

class Product {
  static async findAll() {
    const { rows } = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    return rows[0];
  }
}

module.exports = Product;