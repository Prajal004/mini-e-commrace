const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
require('dotenv').config();

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`📦 Found ${files.length} migration files`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      console.log(`🔄 Running: ${file}`);
      await pool.query(sql);
      console.log(`✅ Completed: ${file}`);
    } catch (error) {
      console.error(`❌ Error in ${file}:`, error.message);
      throw error;
    }
  }

  console.log('✨ All migrations completed successfully');
  await pool.end();
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});