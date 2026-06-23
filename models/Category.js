const pool = require('../config/database');

class Category {
  static async findAll() {
    const { rows } = await pool.query(
      'SELECT * FROM categories ORDER BY name'
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return rows[0];
  }
}

module.exports = Category;