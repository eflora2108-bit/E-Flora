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

const sampleProducts = [
  {
    name: 'Monstera Deliciosa',
    slug: 'monstera-deliciosa',
    category: 'indoor-plants',
    description: 'Beautiful Swiss Cheese Plant with large, glossy leaves. Perfect for bright, indirect light.',
    price: 499,
    mrp: 699,
    gst_percentage: 5,
    stock_quantity: 50,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800'],
    specifications: {
      height: '30-40 cm',
      pot_size: '6 inch',
      sunlight: 'Indirect bright light',
      watering: 'Once a week',
      maintenance: 'Low'
    }
  },
  {
    name: 'Snake Plant (Sansevieria)',
    slug: 'snake-plant-sansevieria',
    category: 'indoor-plants',
    description: 'Air purifying plant that thrives on neglect. Perfect for beginners and low-light spaces.',
    price: 299,
    mrp: 399,
    gst_percentage: 5,
    stock_quantity: 100,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1593482892290-a670300d3e4e?w=800'],
    specifications: {
      height: '20-30 cm',
      pot_size: '5 inch',
      sunlight: 'Low to bright indirect light',
      watering: 'Once every 2-3 weeks',
      maintenance: 'Very low'
    }
  },
  {
    name: 'Aloe Vera Plant',
    slug: 'aloe-vera-plant',
    category: 'succulents-cacti',
    description: 'Medicinal succulent with healing gel. Easy to care for and propagates easily.',
    price: 199,
    mrp: 299,
    gst_percentage: 5,
    stock_quantity: 75,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800'],
    specifications: {
      height: '15-25 cm',
      pot_size: '5 inch',
      sunlight: 'Bright direct light',
      watering: 'Once every 3 weeks',
      maintenance: 'Very low'
    }
  },
  {
    name: 'Money Plant (Pothos)',
    slug: 'money-plant-pothos',
    category: 'indoor-plants',
    description: 'Fast-growing trailing plant that brings good luck and prosperity. Very easy to care for.',
    price: 149,
    mrp: 249,
    gst_percentage: 5,
    stock_quantity: 120,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1572688484469-e013d90087fc?w=800'],
    specifications: {
      height: '10-15 cm',
      pot_size: '4 inch',
      sunlight: 'Low to bright indirect light',
      watering: 'Once a week',
      maintenance: 'Very low'
    }
  },
  {
    name: 'Peace Lily',
    slug: 'peace-lily',
    category: 'flowering-plants',
    description: 'Elegant white flowers and excellent air purifier. Thrives in shade.',
    price: 399,
    mrp: 549,
    gst_percentage: 5,
    stock_quantity: 60,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1593482892290-2d08a3d1f0ec?w=800'],
    specifications: {
      height: '25-35 cm',
      pot_size: '6 inch',
      sunlight: 'Low to medium indirect light',
      watering: 'Twice a week',
      maintenance: 'Low'
    }
  },
  {
    name: 'Jade Plant',
    slug: 'jade-plant',
    category: 'succulents-cacti',
    description: 'Symbol of good luck and prosperity. Thick, glossy leaves on woody stems.',
    price: 249,
    mrp: 349,
    gst_percentage: 5,
    stock_quantity: 85,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1459156212016-c812468e2115?w=800'],
    specifications: {
      height: '15-20 cm',
      pot_size: '5 inch',
      sunlight: 'Bright direct light',
      watering: 'Once every 2 weeks',
      maintenance: 'Very low'
    }
  },
  {
    name: 'Basil Plant',
    slug: 'basil-plant',
    category: 'herbs-vegetables',
    description: 'Fresh basil for your kitchen. Aromatic leaves perfect for Italian dishes.',
    price: 99,
    mrp: 149,
    gst_percentage: 5,
    stock_quantity: 150,
    minimum_order_quantity: 2,
    images: ['https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=800'],
    specifications: {
      height: '10-15 cm',
      pot_size: '4 inch',
      sunlight: 'Full sun (6-8 hours)',
      watering: 'Daily',
      maintenance: 'Medium'
    }
  },
  {
    name: 'Mint Plant',
    slug: 'mint-plant',
    category: 'herbs-vegetables',
    description: 'Fresh mint leaves for tea and cooking. Fast-growing and aromatic.',
    price: 89,
    mrp: 139,
    gst_percentage: 5,
    stock_quantity: 140,
    minimum_order_quantity: 2,
    images: ['https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=800'],
    specifications: {
      height: '10-15 cm',
      pot_size: '4 inch',
      sunlight: 'Partial sun',
      watering: 'Daily',
      maintenance: 'Low'
    }
  },
  {
    name: 'Rose Plant',
    slug: 'rose-plant',
    category: 'flowering-plants',
    description: 'Classic red roses. Beautiful blooms with sweet fragrance.',
    price: 349,
    mrp: 499,
    gst_percentage: 5,
    stock_quantity: 45,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'],
    specifications: {
      height: '25-30 cm',
      pot_size: '7 inch',
      sunlight: 'Full sun (6+ hours)',
      watering: 'Daily',
      maintenance: 'High'
    }
  },
  {
    name: 'Rubber Plant',
    slug: 'rubber-plant',
    category: 'indoor-plants',
    description: 'Large, glossy burgundy leaves. Excellent air purifier and statement plant.',
    price: 449,
    mrp: 599,
    gst_percentage: 5,
    stock_quantity: 55,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1614594895304-fe7116ac3b58?w=800'],
    specifications: {
      height: '35-45 cm',
      pot_size: '7 inch',
      sunlight: 'Bright indirect light',
      watering: 'Once a week',
      maintenance: 'Low'
    }
  },
  {
    name: 'Hibiscus Plant',
    slug: 'hibiscus-plant',
    category: 'outdoor-plants',
    description: 'Vibrant tropical flowers in bright colors. Perfect for gardens.',
    price: 299,
    mrp: 449,
    gst_percentage: 5,
    stock_quantity: 40,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1594767082395-09e3e4348bb7?w=800'],
    specifications: {
      height: '30-40 cm',
      pot_size: '8 inch',
      sunlight: 'Full sun',
      watering: 'Daily',
      maintenance: 'Medium'
    }
  },
  {
    name: 'Lavender Plant',
    slug: 'lavender-plant',
    category: 'flowering-plants',
    description: 'Fragrant purple flowers. Perfect for aromatherapy and decoration.',
    price: 249,
    mrp: 349,
    gst_percentage: 5,
    stock_quantity: 65,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1611251180889-c99afe9b6e93?w=800'],
    specifications: {
      height: '20-25 cm',
      pot_size: '6 inch',
      sunlight: 'Full sun',
      watering: 'Once every 3-4 days',
      maintenance: 'Low'
    }
  }
];

async function addSampleProducts() {
  console.log('🌱 Adding sample products...\n');

  try {
    // Get supplier ID and category IDs
    const supplierResult = await pool.query(
      "SELECT id FROM suppliers WHERE verification_status = 'approved' LIMIT 1"
    );

    if (supplierResult.rows.length === 0) {
      console.error('❌ No approved supplier found!');
      return;
    }

    const supplierId = supplierResult.rows[0].id;
    console.log(`✅ Using supplier ID: ${supplierId}\n`);

    const categoriesResult = await pool.query('SELECT id, slug FROM categories');
    const categoryMap = new Map(categoriesResult.rows.map(c => [c.slug, c.id]));

    let addedCount = 0;

    for (const product of sampleProducts) {
      const categoryId = categoryMap.get(product.category);

      if (!categoryId) {
        console.log(`⚠️  Category not found for: ${product.name}`);
        continue;
      }

      // Check if product already exists
      const existing = await pool.query('SELECT id FROM products WHERE slug = $1', [product.slug]);

      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipping (already exists): ${product.name}`);
        continue;
      }

      // Generate SKU: PLT-XXXX (PLT + 4 random digits)
      const sku = `PLT-${Math.floor(1000 + Math.random() * 9000)}`;

      await pool.query(`
        INSERT INTO products (
          supplier_id, category_id, name, slug, sku, description,
          price, mrp, gst_percentage, stock_quantity, minimum_order_quantity,
          images, specifications, moderation_status, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        supplierId,
        categoryId,
        product.name,
        product.slug,
        sku,
        product.description,
        product.price,
        product.mrp,
        product.gst_percentage,
        product.stock_quantity,
        product.minimum_order_quantity,
        JSON.stringify(product.images),
        JSON.stringify(product.specifications),
        'approved', // Auto-approve for demo purposes
        true
      ]);

      console.log(`✅ Added: ${product.name} (₹${product.price})`);
      addedCount++;
    }

    console.log(`\n🎉 Successfully added ${addedCount} products!`);

    // Show summary
    const summary = await pool.query(`
      SELECT c.name as category, COUNT(*) as count
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true AND p.moderation_status = 'approved'
      GROUP BY c.name
      ORDER BY c.name
    `);

    console.log('\n📊 Products by category:');
    summary.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} products`);
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addSampleProducts();
