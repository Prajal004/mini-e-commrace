const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
require('dotenv').config();

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error('Migrations directory not found');
    process.exit(1);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('ℹ️ No migration files found');
    process.exit(0);
  }

  console.log(`📦 Found ${files.length} migration file(s)`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      console.log(`Running: ${file}`);
      await pool.query(sql);
      console.log(`Completed: ${file}`);
    } catch (error) {
      console.error(`Error in ${file}:`, error.message);

      try {
        await pool.end();
      } catch (_) {}

      process.exit(1);
    }
  }

  console.log('✨ All migrations completed successfully');

  await pool.end();
}

if (require.main === module) {
  runMigrations().catch(async (err) => {
    console.error('Migration failed:', err);

    try {
      await pool.end();
    } catch (_) {}

    process.exit(1);
  });
}

module.exports = runMigrations;