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

async function fixTables() {
  console.log('🔧 Fixing Phase 11 tables...\n');

  try {
    // Drop old tables
    console.log('📄 Dropping old Phase 11 tables...');
    await pool.query(`
      DROP TABLE IF EXISTS review_helpful_votes CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS wishlist CASCADE;
      DROP TABLE IF EXISTS wishlist_items CASCADE;
      DROP TABLE IF EXISTS reviews CASCADE;
    `);
    console.log('✅ Old tables dropped\n');

    // Recreate with correct schema
    console.log('📄 Creating new Phase 11 tables...');
    const sqlPath = path.join(__dirname, '010_create_reviews_wishlist_notifications.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('✅ New tables created successfully!\n');

    // Verify
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'reviews'
      ORDER BY ordinal_position;
    `);

    console.log('📊 Reviews table columns:');
    result.rows.forEach(r => console.log(`  ✓ ${r.column_name}: ${r.data_type}`));

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixTables();
