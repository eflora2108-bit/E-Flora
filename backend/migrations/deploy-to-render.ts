/**
 * Deploy schema + seed data to Render PostgreSQL
 *
 * Usage:
 *   npx tsx migrations/deploy-to-render.ts <DATABASE_URL>
 */

import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Please provide DATABASE_URL as argument or env var');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runSchema() {
  console.log('📦 Step 1/3: Creating database schema...\n');

  const client = await pool.connect();
  try {
    // Run entire schema as one batch using multi-statement query
    await client.query(`
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Users Table
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'supplier', 'admin')),
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          is_active BOOLEAN DEFAULT true,
          email_verified BOOLEAN DEFAULT false,
          email_verification_token VARCHAR(255),
          email_verification_expires TIMESTAMP,
          password_reset_token VARCHAR(255),
          password_reset_expires TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Supplier Profiles
      CREATE TABLE IF NOT EXISTS suppliers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          business_name VARCHAR(255) NOT NULL,
          business_type VARCHAR(50),
          gstin VARCHAR(15) UNIQUE,
          pan VARCHAR(10),
          business_address TEXT,
          city VARCHAR(100),
          state VARCHAR(100),
          pincode VARCHAR(10),
          verification_status VARCHAR(20) DEFAULT 'pending'
              CHECK (verification_status IN ('pending', 'under_review', 'approved', 'rejected')),
          verification_documents JSONB,
          rejection_reason TEXT,
          verified_at TIMESTAMP,
          verified_by UUID REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Categories
      CREATE TABLE IF NOT EXISTS categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          parent_id UUID REFERENCES categories(id),
          image_url VARCHAR(500),
          is_active BOOLEAN DEFAULT true,
          display_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Products
      CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
          category_id UUID REFERENCES categories(id),
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          short_description VARCHAR(500),
          botanical_name VARCHAR(255),
          sku VARCHAR(100) UNIQUE NOT NULL,
          price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
          mrp DECIMAL(10, 2),
          gst_percentage DECIMAL(5, 2) DEFAULT 5.00 CHECK (gst_percentage >= 0),
          hsn_code VARCHAR(20),
          unit VARCHAR(20) DEFAULT 'piece',
          minimum_order_quantity INTEGER DEFAULT 1,
          stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
          low_stock_threshold INTEGER DEFAULT 10,
          images JSONB,
          specifications JSONB,
          moderation_status VARCHAR(20) DEFAULT 'pending'
              CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
          rejection_reason TEXT,
          is_active BOOLEAN DEFAULT true,
          is_featured BOOLEAN DEFAULT false,
          moderated_by UUID REFERENCES users(id),
          moderated_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Inventory Logs
      CREATE TABLE IF NOT EXISTS inventory_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          change_type VARCHAR(20) NOT NULL
              CHECK (change_type IN ('purchase', 'sale', 'return', 'adjustment', 'damage')),
          quantity_change INTEGER NOT NULL,
          previous_stock INTEGER NOT NULL,
          new_stock INTEGER NOT NULL CHECK (new_stock >= 0),
          reference_type VARCHAR(50),
          reference_id UUID,
          notes TEXT,
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Shopping Cart
      CREATE TABLE IF NOT EXISTS cart_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, product_id)
      );

      -- Addresses
      CREATE TABLE IF NOT EXISTS addresses (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          address_type VARCHAR(20) DEFAULT 'shipping'
              CHECK (address_type IN ('shipping', 'billing', 'both')),
          full_name VARCHAR(200) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          address_line1 VARCHAR(255) NOT NULL,
          address_line2 VARCHAR(255),
          city VARCHAR(100) NOT NULL,
          state VARCHAR(100) NOT NULL,
          pincode VARCHAR(10) NOT NULL,
          landmark VARCHAR(255),
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Orders
      CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          order_number VARCHAR(50) UNIQUE NOT NULL,
          user_id UUID REFERENCES users(id),
          shipping_address_id UUID REFERENCES addresses(id),
          billing_address_id UUID REFERENCES addresses(id),
          status VARCHAR(30) DEFAULT 'pending'
              CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped',
                               'delivered', 'cancelled', 'returned')),
          payment_status VARCHAR(30) DEFAULT 'pending'
              CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
          payment_method VARCHAR(50),
          payment_transaction_id VARCHAR(255),
          subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
          gst_amount DECIMAL(10, 2) NOT NULL CHECK (gst_amount >= 0),
          shipping_charges DECIMAL(10, 2) DEFAULT 0 CHECK (shipping_charges >= 0),
          discount_amount DECIMAL(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
          total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
          notes TEXT,
          tracking_number VARCHAR(100),
          shipped_at TIMESTAMP,
          delivered_at TIMESTAMP,
          cancelled_at TIMESTAMP,
          cancellation_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Order Items
      CREATE TABLE IF NOT EXISTS order_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id),
          supplier_id UUID REFERENCES suppliers(id),
          product_name VARCHAR(255) NOT NULL,
          sku VARCHAR(100) NOT NULL,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
          gst_percentage DECIMAL(5, 2) NOT NULL CHECK (gst_percentage >= 0),
          gst_amount DECIMAL(10, 2) NOT NULL CHECK (gst_amount >= 0),
          total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Invoices
      CREATE TABLE IF NOT EXISTS invoices (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          invoice_number VARCHAR(50) UNIQUE NOT NULL,
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id),
          invoice_date DATE DEFAULT CURRENT_DATE,
          due_date DATE,
          subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
          cgst_amount DECIMAL(10, 2) DEFAULT 0 CHECK (cgst_amount >= 0),
          sgst_amount DECIMAL(10, 2) DEFAULT 0 CHECK (sgst_amount >= 0),
          igst_amount DECIMAL(10, 2) DEFAULT 0 CHECK (igst_amount >= 0),
          total_gst DECIMAL(10, 2) NOT NULL CHECK (total_gst >= 0),
          shipping_charges DECIMAL(10, 2) DEFAULT 0 CHECK (shipping_charges >= 0),
          discount_amount DECIMAL(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
          total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
          pdf_url VARCHAR(500),
          status VARCHAR(20) DEFAULT 'generated'
              CHECK (status IN ('generated', 'sent', 'paid', 'overdue', 'cancelled')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Reviews
      CREATE TABLE IF NOT EXISTS reviews (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          order_id UUID REFERENCES orders(id),
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(255),
          comment TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          helpful_count INTEGER DEFAULT 0,
          is_verified_purchase BOOLEAN DEFAULT false,
          is_approved BOOLEAN DEFAULT false,
          approved_by UUID REFERENCES users(id),
          moderated_by UUID REFERENCES users(id),
          moderated_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(product_id, user_id, order_id)
      );

      -- Wishlist
      CREATE TABLE IF NOT EXISTS wishlist (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, product_id)
      );

      -- Wishlist Items (alternate table used by some services)
      CREATE TABLE IF NOT EXISTS wishlist_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          notify_on_stock BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, product_id)
      );

      -- Notifications
      CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          data JSONB,
          link VARCHAR(500),
          is_read BOOLEAN DEFAULT false,
          read_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Audit Logs
      CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id),
          action VARCHAR(100) NOT NULL,
          entity_type VARCHAR(50) NOT NULL,
          entity_id UUID,
          changes JSONB,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Review Helpful Votes
      CREATE TABLE IF NOT EXISTS review_helpful_votes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(review_id, user_id)
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
      CREATE INDEX IF NOT EXISTS idx_suppliers_verification ON suppliers(verification_status);
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
      CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_status ON products(moderation_status, is_active);
      CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_supplier ON order_items(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

      -- Updated_at trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Seed categories
      INSERT INTO categories (name, slug, description, is_active) VALUES
      ('Indoor Plants', 'indoor-plants', 'Perfect plants for your home and office spaces', true),
      ('Outdoor Plants', 'outdoor-plants', 'Hardy plants for gardens and outdoor spaces', true),
      ('Succulents & Cacti', 'succulents-cacti', 'Low-maintenance desert plants', true),
      ('Flowering Plants', 'flowering-plants', 'Beautiful blooming plants', true),
      ('Herbs & Vegetables', 'herbs-vegetables', 'Edible plants for your kitchen garden', true),
      ('Trees & Shrubs', 'trees-shrubs', 'Large plants and ornamental trees', true)
      ON CONFLICT (slug) DO NOTHING;
    `);

    console.log('  ✅ Schema and categories created!\n');
  } finally {
    client.release();
  }
}

async function createTestUsers() {
  console.log('👥 Step 2/3: Creating test users...\n');

  const adminHash = await bcrypt.hash('Admin@123', 10);
  const supplierHash = await bcrypt.hash('Supplier@123', 10);
  const customerHash = await bcrypt.hash('Customer@123', 10);

  // Admin
  await pool.query(`
    INSERT INTO users (email, password_hash, role, first_name, last_name, email_verified, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash, email_verified = EXCLUDED.email_verified, is_active = EXCLUDED.is_active
  `, ['admin@eflora.com', adminHash, 'admin', 'Admin', 'User', true, true]);
  console.log('  ✅ Admin: admin@eflora.com / Admin@123');

  // Supplier
  const res = await pool.query(`
    INSERT INTO users (email, password_hash, role, first_name, last_name, email_verified, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash, email_verified = EXCLUDED.email_verified, is_active = EXCLUDED.is_active
    RETURNING id
  `, ['supplier@eflora.com', supplierHash, 'supplier', 'Test', 'Supplier', true, true]);
  console.log('  ✅ Supplier: supplier@eflora.com / Supplier@123');

  await pool.query(`
    INSERT INTO suppliers (user_id, business_name, gstin, pan, verification_status)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id) DO UPDATE SET business_name = EXCLUDED.business_name, verification_status = EXCLUDED.verification_status
  `, [res.rows[0].id, 'Test Nursery', '29ABCDE1234F1Z5', 'ABCDE1234F', 'approved']);
  console.log('  ✅ Supplier profile (approved)');

  // Customer
  await pool.query(`
    INSERT INTO users (email, password_hash, role, first_name, last_name, email_verified, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash, email_verified = EXCLUDED.email_verified, is_active = EXCLUDED.is_active
  `, ['customer@eflora.com', customerHash, 'customer', 'Test', 'Customer', true, true]);
  console.log('  ✅ Customer: customer@eflora.com / Customer@123\n');
}

async function verifyTables() {
  console.log('🔍 Step 3/3: Verifying...\n');
  const result = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name;
  `);
  console.log(`  Found ${result.rows.length} tables:`);
  result.rows.forEach(row => console.log(`    - ${row.table_name}`));

  const users = await pool.query('SELECT email, role FROM users ORDER BY role');
  console.log(`\n  Found ${users.rows.length} users:`);
  users.rows.forEach(row => console.log(`    - ${row.email} (${row.role})`));
  console.log('');
}

async function main() {
  console.log('🚀 E-Flora Database Deployment\n');
  try {
    await pool.query('SELECT 1');
    console.log('  ✅ Connected!\n');
    await runSchema();
    await createTestUsers();
    await verifyTables();
    console.log('🎉 Done! Database is ready.\n');
  } catch (err: any) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
