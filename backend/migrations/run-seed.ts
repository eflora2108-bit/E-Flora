import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function runSeed() {
  console.log('🌱 Running seed data...\n');

  try {
    const sqlPath = path.join(__dirname, 'seed_data.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);
    console.log('✅ Seed data inserted successfully!\n');

    // Verify categories
    const result = await pool.query('SELECT name, slug FROM categories ORDER BY name');
    console.log('📦 Categories created:');
    result.rows.forEach(r => console.log(`  ✓ ${r.name} (${r.slug})`));

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
