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

async function addRazorpayColumns() {
  console.log('🔧 Adding missing Razorpay columns to orders table...\n');

  try {
    // Check which columns already exist
    const existing = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'orders'
      AND column_name IN ('razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature')
    `);

    const existingCols = existing.rows.map((r: any) => r.column_name);
    console.log('Existing Razorpay columns:', existingCols.length > 0 ? existingCols.join(', ') : 'none');

    if (!existingCols.includes('razorpay_order_id')) {
      await pool.query(`ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(255)`);
      console.log('✅ Added razorpay_order_id');
    }

    if (!existingCols.includes('razorpay_payment_id')) {
      await pool.query(`ALTER TABLE orders ADD COLUMN razorpay_payment_id VARCHAR(255)`);
      console.log('✅ Added razorpay_payment_id');
    }

    if (!existingCols.includes('razorpay_signature')) {
      await pool.query(`ALTER TABLE orders ADD COLUMN razorpay_signature TEXT`);
      console.log('✅ Added razorpay_signature');
    }

    // Verify
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'orders'
      ORDER BY ordinal_position
    `);

    console.log('\n📊 Orders table columns:');
    result.rows.forEach((r: any) => console.log(`  ✓ ${r.column_name}: ${r.data_type}`));

    console.log('\n✅ Migration complete!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addRazorpayColumns();
