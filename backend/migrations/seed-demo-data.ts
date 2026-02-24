import { Pool } from 'pg';

const DATABASE_URL = 'postgresql://eflora_db_user:HTYy1N3cRumK59fSLrdn7aZBNbnHtYJH@dpg-d6ev9bngi27c73et1ld0-a.oregon-postgres.render.com/eflora_db';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sampleProducts = [
  {
    name: 'Monstera Deliciosa',
    slug: 'monstera-deliciosa',
    category: 'indoor-plants',
    description: 'Beautiful Swiss Cheese Plant with large, glossy leaves. Perfect for bright, indirect light. This tropical beauty is a must-have for any plant enthusiast.',
    price: 499,
    mrp: 699,
    gst_percentage: 5,
    stock_quantity: 50,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800'],
    specifications: { height: '30-40 cm', pot_size: '6 inch', sunlight: 'Indirect bright light', watering: 'Once a week', maintenance: 'Low' }
  },
  {
    name: 'Snake Plant (Sansevieria)',
    slug: 'snake-plant-sansevieria',
    category: 'indoor-plants',
    description: 'Air purifying plant that thrives on neglect. Perfect for beginners and low-light spaces. NASA recommends it for improving indoor air quality.',
    price: 299,
    mrp: 399,
    gst_percentage: 5,
    stock_quantity: 100,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1593482892290-a670300d3e4e?w=800'],
    specifications: { height: '20-30 cm', pot_size: '5 inch', sunlight: 'Low to bright indirect light', watering: 'Once every 2-3 weeks', maintenance: 'Very low' }
  },
  {
    name: 'Aloe Vera Plant',
    slug: 'aloe-vera-plant',
    category: 'succulents-cacti',
    description: 'Medicinal succulent with healing gel. Easy to care for and propagates easily. Great for skin care and minor burns.',
    price: 199,
    mrp: 299,
    gst_percentage: 5,
    stock_quantity: 75,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800'],
    specifications: { height: '15-25 cm', pot_size: '5 inch', sunlight: 'Bright direct light', watering: 'Once every 3 weeks', maintenance: 'Very low' }
  },
  {
    name: 'Money Plant (Pothos)',
    slug: 'money-plant-pothos',
    category: 'indoor-plants',
    description: 'Fast-growing trailing plant that brings good luck and prosperity. Very easy to care for and perfect for hanging baskets.',
    price: 149,
    mrp: 249,
    gst_percentage: 5,
    stock_quantity: 120,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1572688484469-e013d90087fc?w=800'],
    specifications: { height: '10-15 cm', pot_size: '4 inch', sunlight: 'Low to bright indirect light', watering: 'Once a week', maintenance: 'Very low' }
  },
  {
    name: 'Peace Lily',
    slug: 'peace-lily',
    category: 'flowering-plants',
    description: 'Elegant white flowers and excellent air purifier. Thrives in shade and adds a touch of elegance to any room.',
    price: 399,
    mrp: 549,
    gst_percentage: 5,
    stock_quantity: 60,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1593482892290-2d08a3d1f0ec?w=800'],
    specifications: { height: '25-35 cm', pot_size: '6 inch', sunlight: 'Low to medium indirect light', watering: 'Twice a week', maintenance: 'Low' }
  },
  {
    name: 'Jade Plant',
    slug: 'jade-plant',
    category: 'succulents-cacti',
    description: 'Symbol of good luck and prosperity. Thick, glossy leaves on woody stems. A beautiful desktop companion.',
    price: 249,
    mrp: 349,
    gst_percentage: 5,
    stock_quantity: 85,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1459156212016-c812468e2115?w=800'],
    specifications: { height: '15-20 cm', pot_size: '5 inch', sunlight: 'Bright direct light', watering: 'Once every 2 weeks', maintenance: 'Very low' }
  },
  {
    name: 'Basil Plant',
    slug: 'basil-plant',
    category: 'herbs-vegetables',
    description: 'Fresh basil for your kitchen. Aromatic leaves perfect for Italian dishes and herbal tea.',
    price: 99,
    mrp: 149,
    gst_percentage: 5,
    stock_quantity: 150,
    minimum_order_quantity: 2,
    images: ['https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=800'],
    specifications: { height: '10-15 cm', pot_size: '4 inch', sunlight: 'Full sun (6-8 hours)', watering: 'Daily', maintenance: 'Medium' }
  },
  {
    name: 'Mint Plant',
    slug: 'mint-plant',
    category: 'herbs-vegetables',
    description: 'Fresh mint leaves for tea and cooking. Fast-growing and aromatic. Perfect for mojitos and chutneys!',
    price: 89,
    mrp: 139,
    gst_percentage: 5,
    stock_quantity: 140,
    minimum_order_quantity: 2,
    images: ['https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=800'],
    specifications: { height: '10-15 cm', pot_size: '4 inch', sunlight: 'Partial sun', watering: 'Daily', maintenance: 'Low' }
  },
  {
    name: 'Rose Plant',
    slug: 'rose-plant',
    category: 'flowering-plants',
    description: 'Classic red roses. Beautiful blooms with sweet fragrance. The queen of flowers for your garden.',
    price: 349,
    mrp: 499,
    gst_percentage: 5,
    stock_quantity: 45,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'],
    specifications: { height: '25-30 cm', pot_size: '7 inch', sunlight: 'Full sun (6+ hours)', watering: 'Daily', maintenance: 'High' }
  },
  {
    name: 'Rubber Plant',
    slug: 'rubber-plant',
    category: 'indoor-plants',
    description: 'Large, glossy burgundy leaves. Excellent air purifier and statement plant for living rooms.',
    price: 449,
    mrp: 599,
    gst_percentage: 5,
    stock_quantity: 55,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1614594895304-fe7116ac3b58?w=800'],
    specifications: { height: '35-45 cm', pot_size: '7 inch', sunlight: 'Bright indirect light', watering: 'Once a week', maintenance: 'Low' }
  },
  {
    name: 'Hibiscus Plant',
    slug: 'hibiscus-plant',
    category: 'outdoor-plants',
    description: 'Vibrant tropical flowers in bright colors. Perfect for gardens and patios.',
    price: 299,
    mrp: 449,
    gst_percentage: 5,
    stock_quantity: 40,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1594767082395-09e3e4348bb7?w=800'],
    specifications: { height: '30-40 cm', pot_size: '8 inch', sunlight: 'Full sun', watering: 'Daily', maintenance: 'Medium' }
  },
  {
    name: 'Lavender Plant',
    slug: 'lavender-plant',
    category: 'flowering-plants',
    description: 'Fragrant purple flowers. Perfect for aromatherapy, decoration, and attracting butterflies.',
    price: 249,
    mrp: 349,
    gst_percentage: 5,
    stock_quantity: 65,
    minimum_order_quantity: 1,
    images: ['https://images.unsplash.com/photo-1611251180889-c99afe9b6e93?w=800'],
    specifications: { height: '20-25 cm', pot_size: '6 inch', sunlight: 'Full sun', watering: 'Once every 3-4 days', maintenance: 'Low' }
  }
];

async function seedDemoData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting comprehensive demo data seeding...\n');

    // ============================================
    // STEP 1: Get existing user IDs
    // ============================================
    console.log('📋 Step 1: Fetching user IDs...');

    const adminResult = await client.query("SELECT id FROM users WHERE email = 'admin@eflora.com'");
    const supplierUserResult = await client.query("SELECT id FROM users WHERE email = 'supplier@eflora.com'");
    const customerResult = await client.query("SELECT id FROM users WHERE email = 'customer@eflora.com'");

    if (!adminResult.rows[0] || !supplierUserResult.rows[0] || !customerResult.rows[0]) {
      console.error('❌ Test users not found! Run create-test-users first.');
      return;
    }

    const adminId = adminResult.rows[0].id;
    const supplierUserId = supplierUserResult.rows[0].id;
    const customerId = customerResult.rows[0].id;

    console.log(`  Admin ID: ${adminId}`);
    console.log(`  Supplier User ID: ${supplierUserId}`);
    console.log(`  Customer ID: ${customerId}`);

    // Get supplier profile ID
    const supplierProfileResult = await client.query("SELECT id FROM suppliers WHERE user_id = $1", [supplierUserId]);
    const supplierId = supplierProfileResult.rows[0].id;
    console.log(`  Supplier Profile ID: ${supplierId}`);

    // ============================================
    // STEP 2: Insert Categories (if not existing)
    // ============================================
    console.log('\n📋 Step 2: Ensuring categories exist...');

    const categories = [
      { name: 'Indoor Plants', slug: 'indoor-plants', description: 'Beautiful plants for your home interior', display_order: 1 },
      { name: 'Outdoor Plants', slug: 'outdoor-plants', description: 'Hardy plants for gardens and patios', display_order: 2 },
      { name: 'Flowering Plants', slug: 'flowering-plants', description: 'Colorful blooming plants', display_order: 3 },
      { name: 'Succulents & Cacti', slug: 'succulents-cacti', description: 'Low-maintenance desert plants', display_order: 4 },
      { name: 'Herbs & Vegetables', slug: 'herbs-vegetables', description: 'Edible plants for your kitchen garden', display_order: 5 },
      { name: 'Seeds & Bulbs', slug: 'seeds-bulbs', description: 'Plant seeds and flower bulbs', display_order: 6 },
      { name: 'Pots & Planters', slug: 'pots-planters', description: 'Decorative and functional pots', display_order: 7 },
      { name: 'Gardening Tools', slug: 'gardening-tools', description: 'Essential tools for every gardener', display_order: 8 },
    ];

    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (name, slug, description, display_order, is_active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (slug) DO NOTHING
      `, [cat.name, cat.slug, cat.description, cat.display_order]);
    }
    console.log(`  ✅ ${categories.length} categories ensured`);

    // Get category map
    const categoriesResult = await client.query('SELECT id, slug FROM categories');
    const categoryMap = new Map(categoriesResult.rows.map((c: any) => [c.slug, c.id]));

    // ============================================
    // STEP 3: Insert Products
    // ============================================
    console.log('\n📋 Step 3: Adding sample products...');

    const productIds: string[] = [];
    const productPrices: number[] = [];
    const productNames: string[] = [];
    const productSkus: string[] = [];

    for (const product of sampleProducts) {
      const categoryId = categoryMap.get(product.category);
      if (!categoryId) {
        console.log(`  ⚠️  Category not found: ${product.category}`);
        continue;
      }

      // Check if product already exists
      const existing = await client.query('SELECT id, sku FROM products WHERE slug = $1', [product.slug]);
      if (existing.rows.length > 0) {
        productIds.push(existing.rows[0].id);
        productPrices.push(product.price);
        productNames.push(product.name);
        productSkus.push(existing.rows[0].sku);
        console.log(`  ⏭️  Exists: ${product.name}`);
        continue;
      }

      const sku = `PLT-${Math.floor(1000 + Math.random() * 9000)}`;

      const result = await client.query(`
        INSERT INTO products (
          supplier_id, category_id, name, slug, sku, description,
          price, mrp, gst_percentage, stock_quantity, minimum_order_quantity,
          images, specifications, moderation_status, is_active, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id
      `, [
        supplierId, categoryId, product.name, product.slug, sku,
        product.description, product.price, product.mrp, product.gst_percentage,
        product.stock_quantity, product.minimum_order_quantity,
        JSON.stringify(product.images), JSON.stringify(product.specifications),
        'approved', true, product.price >= 399 // Feature premium products
      ]);

      productIds.push(result.rows[0].id);
      productPrices.push(product.price);
      productNames.push(product.name);
      productSkus.push(sku);
      console.log(`  ✅ Added: ${product.name} (₹${product.price}) [${sku}]`);
    }

    console.log(`  Total products: ${productIds.length}`);

    // ============================================
    // STEP 4: Customer Addresses
    // ============================================
    console.log('\n📋 Step 4: Adding customer addresses...');

    const addresses = [
      {
        full_name: 'Test Customer',
        phone: '9876543210',
        address_line1: '42, Green Valley Apartments',
        address_line2: 'Near City Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        landmark: 'Opposite Metro Station',
        is_default: true,
        address_type: 'both'
      },
      {
        full_name: 'Test Customer',
        phone: '9876543211',
        address_line1: '15, Sunshine Colony',
        address_line2: 'MG Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        landmark: 'Near Big Bazaar',
        is_default: false,
        address_type: 'shipping'
      },
    ];

    const addressIds: string[] = [];
    for (const addr of addresses) {
      const existing = await client.query(
        'SELECT id FROM addresses WHERE user_id = $1 AND address_line1 = $2',
        [customerId, addr.address_line1]
      );
      if (existing.rows.length > 0) {
        addressIds.push(existing.rows[0].id);
        console.log(`  ⏭️  Exists: ${addr.address_line1}`);
        continue;
      }
      const result = await client.query(`
        INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, landmark, is_default, address_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [customerId, addr.full_name, addr.phone, addr.address_line1, addr.address_line2, addr.city, addr.state, addr.pincode, addr.landmark, addr.is_default, addr.address_type]);
      addressIds.push(result.rows[0].id);
      console.log(`  ✅ Added: ${addr.address_line1}, ${addr.city}`);
    }

    // ============================================
    // STEP 5: Create Orders (various statuses)
    // ============================================
    console.log('\n📋 Step 5: Creating demo orders...');

    const orderConfigs = [
      {
        order_number: 'EFL-2026-001',
        status: 'delivered',
        payment_status: 'completed',
        payment_method: 'razorpay',
        products: [0, 1], // indices into productIds
        quantities: [1, 2],
        days_ago: 30,
        tracking_number: 'DTDC123456789',
      },
      {
        order_number: 'EFL-2026-002',
        status: 'delivered',
        payment_status: 'completed',
        payment_method: 'razorpay',
        products: [3, 6, 7],
        quantities: [2, 3, 2],
        days_ago: 20,
        tracking_number: 'DTDC987654321',
      },
      {
        order_number: 'EFL-2026-003',
        status: 'shipped',
        payment_status: 'completed',
        payment_method: 'razorpay',
        products: [4, 5],
        quantities: [1, 1],
        days_ago: 5,
        tracking_number: 'BLUEDART55667788',
      },
      {
        order_number: 'EFL-2026-004',
        status: 'processing',
        payment_status: 'completed',
        payment_method: 'cod',
        products: [8, 9],
        quantities: [1, 1],
        days_ago: 2,
        tracking_number: null,
      },
      {
        order_number: 'EFL-2026-005',
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'razorpay',
        products: [10, 11],
        quantities: [1, 2],
        days_ago: 0,
        tracking_number: null,
      },
      {
        order_number: 'EFL-2026-006',
        status: 'cancelled',
        payment_status: 'refunded',
        payment_method: 'razorpay',
        products: [2],
        quantities: [3],
        days_ago: 15,
        tracking_number: null,
      },
    ];

    const orderIds: string[] = [];
    const defaultAddressId = addressIds[0];

    for (const config of orderConfigs) {
      // Check if order already exists
      const existing = await client.query('SELECT id FROM orders WHERE order_number = $1', [config.order_number]);
      if (existing.rows.length > 0) {
        orderIds.push(existing.rows[0].id);
        console.log(`  ⏭️  Exists: ${config.order_number}`);
        continue;
      }

      // Calculate totals
      let subtotal = 0;
      const items: { productIdx: number; qty: number; price: number; name: string; sku: string }[] = [];
      for (let i = 0; i < config.products.length; i++) {
        const idx = config.products[i];
        if (idx >= productIds.length) continue;
        const price = productPrices[idx];
        const qty = config.quantities[i];
        subtotal += price * qty;
        items.push({ productIdx: idx, qty, price, name: productNames[idx], sku: productSkus[idx] });
      }

      const gstAmount = parseFloat((subtotal * 0.05).toFixed(2));
      const shippingCharges = subtotal >= 500 ? 0 : 49;
      const totalAmount = parseFloat((subtotal + gstAmount + shippingCharges).toFixed(2));

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - config.days_ago);

      const shippedAt = config.status === 'shipped' || config.status === 'delivered'
        ? new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000) : null;
      const deliveredAt = config.status === 'delivered'
        ? new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000) : null;
      const cancelledAt = config.status === 'cancelled'
        ? new Date(createdAt.getTime() + 1 * 24 * 60 * 60 * 1000) : null;

      const orderResult = await client.query(`
        INSERT INTO orders (
          order_number, user_id, shipping_address_id, billing_address_id,
          status, payment_status, payment_method, payment_transaction_id,
          subtotal, gst_amount, shipping_charges, discount_amount, total_amount,
          tracking_number, shipped_at, delivered_at, cancelled_at, cancellation_reason,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING id
      `, [
        config.order_number, customerId, defaultAddressId, defaultAddressId,
        config.status, config.payment_status, config.payment_method,
        config.payment_status === 'completed' ? `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` : null,
        subtotal, gstAmount, shippingCharges, 0, totalAmount,
        config.tracking_number, shippedAt, deliveredAt, cancelledAt,
        config.status === 'cancelled' ? 'Changed my mind about this purchase' : null,
        createdAt, createdAt,
      ]);

      const orderId = orderResult.rows[0].id;
      orderIds.push(orderId);

      // Insert order items
      for (const item of items) {
        const itemGst = parseFloat((item.price * item.qty * 0.05).toFixed(2));
        const itemTotal = parseFloat((item.price * item.qty + itemGst).toFixed(2));

        await client.query(`
          INSERT INTO order_items (order_id, product_id, supplier_id, product_name, sku, quantity, unit_price, gst_percentage, gst_amount, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [orderId, productIds[item.productIdx], supplierId, item.name, item.sku, item.qty, item.price, 5, itemGst, itemTotal]);
      }

      console.log(`  ✅ Order ${config.order_number}: ${config.status} | ₹${totalAmount} | ${items.length} items`);
    }

    // ============================================
    // STEP 6: Create Invoices for completed orders
    // ============================================
    console.log('\n📋 Step 6: Creating invoices for paid orders...');

    let invoiceNum = 1;
    for (let i = 0; i < orderConfigs.length; i++) {
      const config = orderConfigs[i];
      if (config.payment_status !== 'completed') continue;

      const orderId = orderIds[i];
      const invoiceNumber = `INV-2026-${String(invoiceNum).padStart(4, '0')}`;

      const existing = await client.query('SELECT id FROM invoices WHERE order_id = $1', [orderId]);
      if (existing.rows.length > 0) {
        console.log(`  ⏭️  Exists: ${invoiceNumber}`);
        invoiceNum++;
        continue;
      }

      // Get order totals
      const orderData = await client.query('SELECT subtotal, gst_amount, shipping_charges, discount_amount, total_amount, created_at FROM orders WHERE id = $1', [orderId]);
      const order = orderData.rows[0];
      const halfGst = parseFloat((order.gst_amount / 2).toFixed(2));

      await client.query(`
        INSERT INTO invoices (invoice_number, order_id, user_id, invoice_date, due_date, subtotal, cgst_amount, sgst_amount, igst_amount, total_gst, shipping_charges, discount_amount, total_amount, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        invoiceNumber, orderId, customerId,
        order.created_at, new Date(new Date(order.created_at).getTime() + 30 * 24 * 60 * 60 * 1000),
        order.subtotal, halfGst, halfGst, 0, order.gst_amount,
        order.shipping_charges, order.discount_amount, order.total_amount,
        'paid'
      ]);

      console.log(`  ✅ Invoice ${invoiceNumber} for order ${orderConfigs[i].order_number}`);
      invoiceNum++;
    }

    // ============================================
    // STEP 7: Reviews (for delivered orders)
    // ============================================
    console.log('\n📋 Step 7: Adding product reviews...');

    const reviews = [
      { productIdx: 0, rating: 5, title: 'Absolutely stunning!', comment: 'The Monstera arrived in perfect condition. Beautiful large leaves and well-packaged. Already seeing new growth after just 2 weeks!' },
      { productIdx: 1, rating: 4, title: 'Great beginner plant', comment: 'Snake plant is thriving in my bedroom with almost no care. Perfect for someone new to plants.' },
      { productIdx: 3, rating: 5, title: 'Growing like crazy!', comment: 'The Money Plant has grown so much in just one month. Excellent quality and great value for money.' },
      { productIdx: 6, rating: 4, title: 'Fresh and aromatic', comment: 'Fresh basil right from my kitchen windowsill. Makes Italian cooking so much better!' },
      { productIdx: 7, rating: 5, title: 'Perfect for tea', comment: 'The mint plant is very fragrant. I use it daily for making fresh mint tea. Love it!' },
      { productIdx: 4, rating: 5, title: 'Elegant and beautiful', comment: 'The Peace Lily is gorgeous. The white flowers add such elegance to my living room.' },
      { productIdx: 8, rating: 3, title: 'Good but needs care', comment: 'The rose plant is beautiful but needs daily attention. Would recommend for experienced gardeners only.' },
    ];

    // Use the first delivered order for reviews
    const deliveredOrders = orderIds.filter((_, i) => orderConfigs[i].status === 'delivered');

    for (const review of reviews) {
      if (review.productIdx >= productIds.length) continue;

      const existing = await client.query(
        'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2',
        [productIds[review.productIdx], customerId]
      );
      if (existing.rows.length > 0) {
        console.log(`  ⏭️  Exists: Review for ${productNames[review.productIdx]}`);
        continue;
      }

      await client.query(`
        INSERT INTO reviews (product_id, user_id, order_id, rating, title, comment, is_verified_purchase, is_approved, approved_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        productIds[review.productIdx], customerId,
        deliveredOrders.length > 0 ? deliveredOrders[0] : null,
        review.rating, review.title, review.comment,
        true, true, adminId
      ]);

      console.log(`  ✅ Review: ${productNames[review.productIdx]} - ${review.rating}⭐ "${review.title}"`);
    }

    // ============================================
    // STEP 8: Wishlist items for customer
    // ============================================
    console.log('\n📋 Step 8: Adding wishlist items...');

    const wishlistIndices = [4, 8, 9, 11]; // Peace Lily, Rose, Rubber Plant, Lavender
    for (const idx of wishlistIndices) {
      if (idx >= productIds.length) continue;

      const existing = await client.query(
        'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
        [customerId, productIds[idx]]
      );
      if (existing.rows.length > 0) {
        console.log(`  ⏭️  Exists: ${productNames[idx]}`);
        continue;
      }

      await client.query(`
        INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)
      `, [customerId, productIds[idx]]);
      console.log(`  ✅ Wishlisted: ${productNames[idx]}`);
    }

    // ============================================
    // STEP 9: Cart items for customer
    // ============================================
    console.log('\n📋 Step 9: Adding cart items...');

    const cartItems = [
      { productIdx: 2, quantity: 1 }, // Aloe Vera
      { productIdx: 5, quantity: 2 }, // Jade Plant
      { productIdx: 10, quantity: 1 }, // Hibiscus
    ];

    for (const item of cartItems) {
      if (item.productIdx >= productIds.length) continue;

      const existing = await client.query(
        'SELECT id FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [customerId, productIds[item.productIdx]]
      );
      if (existing.rows.length > 0) {
        console.log(`  ⏭️  Exists: ${productNames[item.productIdx]}`);
        continue;
      }

      await client.query(`
        INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)
      `, [customerId, productIds[item.productIdx], item.quantity]);
      console.log(`  ✅ Cart: ${productNames[item.productIdx]} x${item.quantity}`);
    }

    // ============================================
    // STEP 10: Notifications
    // ============================================
    console.log('\n📋 Step 10: Adding notifications...');

    const notifications = [
      // Customer notifications
      { user_id: customerId, type: 'order_delivered', title: 'Order Delivered!', message: 'Your order EFL-2026-001 has been delivered. Enjoy your plants! 🌱' },
      { user_id: customerId, type: 'order_shipped', title: 'Order Shipped', message: 'Your order EFL-2026-003 has been shipped. Track it with BLUEDART55667788.' },
      { user_id: customerId, type: 'promotion', title: 'Spring Sale! 🌸', message: 'Get 20% off on all flowering plants this weekend. Use code SPRING20.' },
      // Supplier notifications
      { user_id: supplierUserId, type: 'new_order', title: 'New Order Received', message: 'You have a new order EFL-2026-004. Please process it soon.' },
      { user_id: supplierUserId, type: 'low_stock', title: 'Low Stock Alert', message: 'Hibiscus Plant stock is running low (40 units remaining).' },
      { user_id: supplierUserId, type: 'review', title: 'New Review', message: 'A customer left a 5-star review on Monstera Deliciosa!' },
      // Admin notifications
      { user_id: adminId, type: 'new_supplier', title: 'New Supplier Registration', message: 'A new supplier "Green Gardens Nursery" has registered and is pending verification.' },
      { user_id: adminId, type: 'report', title: 'Weekly Sales Report', message: 'This week: 6 orders, ₹8,450 revenue. 15% increase from last week.' },
    ];

    for (const notif of notifications) {
      await client.query(`
        INSERT INTO notifications (user_id, type, title, message, is_read)
        VALUES ($1, $2, $3, $4, $5)
      `, [notif.user_id, notif.type, notif.title, notif.message, false]);
    }
    console.log(`  ✅ Added ${notifications.length} notifications`);

    // ============================================
    // STEP 11: Inventory Logs (for supplier dashboard)
    // ============================================
    console.log('\n📋 Step 11: Adding inventory logs...');

    // Add initial stock logs for a few products
    const inventoryProducts = [0, 1, 3, 8]; // Monstera, Snake Plant, Money Plant, Rose
    for (const idx of inventoryProducts) {
      if (idx >= productIds.length) continue;

      // Initial stock entry
      await client.query(`
        INSERT INTO inventory_logs (product_id, change_type, quantity_change, previous_stock, new_stock, reference_type, notes, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        productIds[idx], 'purchase', sampleProducts[idx].stock_quantity, 0,
        sampleProducts[idx].stock_quantity, 'manual_adjustment',
        'Initial stock entry', supplierUserId
      ]);

      // Sale entry (simulate some sold items)
      const soldQty = Math.floor(Math.random() * 10) + 1;
      const newStock = sampleProducts[idx].stock_quantity - soldQty;
      await client.query(`
        INSERT INTO inventory_logs (product_id, change_type, quantity_change, previous_stock, new_stock, reference_type, notes, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        productIds[idx], 'sale', -soldQty, sampleProducts[idx].stock_quantity,
        newStock, 'order',
        'Sold via marketplace orders', supplierUserId
      ]);

      console.log(`  ✅ Inventory logs: ${productNames[idx]} (+${sampleProducts[idx].stock_quantity}, -${soldQty})`);
    }

    // ============================================
    // STEP 12: Audit Logs (for admin dashboard)
    // ============================================
    console.log('\n📋 Step 12: Adding audit logs...');

    const auditLogs = [
      { action: 'approve_supplier', entity_type: 'supplier', entity_id: supplierId, changes: { status: 'approved', business_name: 'Test Nursery' } },
      { action: 'approve_product', entity_type: 'product', entity_id: productIds[0], changes: { moderation_status: 'approved', product_name: 'Monstera Deliciosa' } },
      { action: 'approve_product', entity_type: 'product', entity_id: productIds[1], changes: { moderation_status: 'approved', product_name: 'Snake Plant' } },
      { action: 'update_order_status', entity_type: 'order', entity_id: orderIds[0], changes: { old_status: 'processing', new_status: 'shipped' } },
      { action: 'approve_review', entity_type: 'review', entity_id: null, changes: { product: 'Monstera Deliciosa', rating: 5 } },
    ];

    for (const log of auditLogs) {
      await client.query(`
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [adminId, log.action, log.entity_type, log.entity_id, JSON.stringify(log.changes), '192.168.1.1']);
    }
    console.log(`  ✅ Added ${auditLogs.length} audit logs`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DEMO DATA SEEDING COMPLETE!');
    console.log('='.repeat(60));

    // Count totals
    const counts = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM products WHERE is_active = true) as products,
        (SELECT COUNT(*) FROM orders) as orders,
        (SELECT COUNT(*) FROM reviews) as reviews,
        (SELECT COUNT(*) FROM cart_items) as cart_items,
        (SELECT COUNT(*) FROM wishlist) as wishlist_items,
        (SELECT COUNT(*) FROM addresses) as addresses,
        (SELECT COUNT(*) FROM invoices) as invoices,
        (SELECT COUNT(*) FROM notifications) as notifications,
        (SELECT COUNT(*) FROM inventory_logs) as inventory_logs,
        (SELECT COUNT(*) FROM audit_logs) as audit_logs
    `);

    const c = counts.rows[0];
    console.log(`\n📊 Database Summary:`);
    console.log(`  🌿 Products: ${c.products}`);
    console.log(`  📦 Orders: ${c.orders}`);
    console.log(`  ⭐ Reviews: ${c.reviews}`);
    console.log(`  🛒 Cart Items: ${c.cart_items}`);
    console.log(`  ❤️  Wishlist Items: ${c.wishlist_items}`);
    console.log(`  📍 Addresses: ${c.addresses}`);
    console.log(`  🧾 Invoices: ${c.invoices}`);
    console.log(`  🔔 Notifications: ${c.notifications}`);
    console.log(`  📦 Inventory Logs: ${c.inventory_logs}`);
    console.log(`  📝 Audit Logs: ${c.audit_logs}`);

    console.log(`\n👤 Login Credentials:`);
    console.log(`  Admin:    admin@eflora.com / Admin@123`);
    console.log(`  Supplier: supplier@eflora.com / Supplier@123`);
    console.log(`  Customer: customer@eflora.com / Customer@123`);

    console.log(`\n✅ All three roles now have demo data to explore!`);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDemoData();
