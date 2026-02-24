import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function createTestUsers() {
  console.log('👥 Creating test users...\n');

  try {
    // Hash password: Admin@123
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const supplierHash = await bcrypt.hash('Supplier@123', 10);
    const customerHash = await bcrypt.hash('Customer@123', 10);

    // Insert admin user
    await pool.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, email_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        email_verified = EXCLUDED.email_verified,
        is_active = EXCLUDED.is_active
    `, ['admin@eflora.com', adminHash, 'admin', 'Admin', 'User', true, true]);
    console.log('✅ Admin user created: admin@eflora.com / Admin@123');

    // Insert supplier user
    const supplierResult = await pool.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, email_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        email_verified = EXCLUDED.email_verified,
        is_active = EXCLUDED.is_active
      RETURNING id
    `, ['supplier@eflora.com', supplierHash, 'supplier', 'Test', 'Supplier', true, true]);
    console.log('✅ Supplier user created: supplier@eflora.com / Supplier@123');

    // Create supplier profile
    const supplierId = supplierResult.rows[0].id;
    await pool.query(`
      INSERT INTO suppliers (user_id, business_name, gstin, pan, verification_status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        business_name = EXCLUDED.business_name,
        verification_status = EXCLUDED.verification_status
    `, [supplierId, 'Test Nursery', '29ABCDE1234F1Z5', 'ABCDE1234F', 'approved']);
    console.log('✅ Supplier profile created (approved)');

    // Insert customer user
    await pool.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, email_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        email_verified = EXCLUDED.email_verified,
        is_active = EXCLUDED.is_active
    `, ['customer@eflora.com', customerHash, 'customer', 'Test', 'Customer', true, true]);
    console.log('✅ Customer user created: customer@eflora.com / Customer@123');

    console.log('\n🎉 All test users created successfully!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createTestUsers();
