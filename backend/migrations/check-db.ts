import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
  try {
    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📋 Existing tables:');
    tablesResult.rows.forEach(r => console.log('  ✓', r.table_name));

    // Check reviews table structure if it exists
    const reviewsCheck = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'reviews'
      ORDER BY ordinal_position;
    `);

    if (reviewsCheck.rows.length > 0) {
      console.log('\n📊 Reviews table columns:');
      reviewsCheck.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type}`));
    } else {
      console.log('\n⚠️  Reviews table does not exist');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
