import { query } from '../config/database';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '../types';

export class OrderModel {
  // Create order
  static async create(orderData: {
    order_number: string;
    user_id: string;
    subtotal: number;
    gst_amount: number;
    shipping_charges: number;
    total_amount: number;
    shipping_address_id: string;
    billing_address_id?: string;
    razorpay_order_id?: string;
    notes?: string;
  }): Promise<Order> {
    const sql = `
      INSERT INTO orders (
        order_number, user_id, status, payment_status,
        subtotal, gst_amount, shipping_charges, total_amount,
        shipping_address_id, billing_address_id, razorpay_order_id, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      orderData.order_number,
      orderData.user_id,
      OrderStatus.PENDING,
      PaymentStatus.PENDING,
      orderData.subtotal,
      orderData.gst_amount,
      orderData.shipping_charges,
      orderData.total_amount,
      orderData.shipping_address_id,
      orderData.billing_address_id || null,
      orderData.razorpay_order_id || null,
      orderData.notes || null,
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find order by ID
  static async findById(id: string): Promise<Order | null> {
    const sql = `SELECT * FROM orders WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Find order by order number
  static async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const sql = `SELECT * FROM orders WHERE order_number = $1`;
    const result = await query(sql, [orderNumber]);
    return result.rows[0] || null;
  }

  // Find order by Razorpay order ID
  static async findByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
    const sql = `SELECT * FROM orders WHERE razorpay_order_id = $1`;
    const result = await query(sql, [razorpayOrderId]);
    return result.rows[0] || null;
  }

  // Update order
  static async update(
    id: string,
    updates: Partial<{
      status: OrderStatus;
      payment_status: PaymentStatus;
      payment_method: string;
      payment_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      tracking_number: string;
      shipped_at: Date;
      delivered_at: Date;
      cancelled_at: Date;
      notes: string;
    }>
  ): Promise<Order> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE orders
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Get orders by user
  static async getByUser(
    userId: string,
    status?: OrderStatus,
    limit: number = 20,
    offset: number = 0
  ): Promise<Order[]> {
    let sql = `
      SELECT * FROM orders
      WHERE user_id = $1
    `;
    const values: any[] = [userId];

    if (status) {
      sql += ` AND status = $2`;
      values.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows;
  }

  // Get all orders (admin)
  static async getAll(
    status?: OrderStatus,
    limit: number = 20,
    offset: number = 0
  ): Promise<Order[]> {
    let sql = `SELECT * FROM orders`;
    const values: any[] = [];

    if (status) {
      sql += ` WHERE status = $1`;
      values.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows;
  }

  // Generate unique order number
  static async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    const sql = `
      SELECT COUNT(*) as count FROM orders
      WHERE order_number LIKE $1
    `;
    const result = await query(sql, [`ORD-${dateStr}%`]);
    const count = parseInt(result.rows[0].count) + 1;

    return `ORD-${dateStr}-${count.toString().padStart(4, '0')}`;
  }
}

export class OrderItemModel {
  // Create order items (bulk insert)
  static async createBulk(items: Array<{
    order_id: string;
    product_id: string;
    supplier_id: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    gst_percentage: number;
    gst_amount: number;
    total_amount: number;
  }>): Promise<OrderItem[]> {
    if (items.length === 0) return [];

    const values: any[] = [];
    const placeholders: string[] = [];
    let paramCount = 1;

    items.forEach((item) => {
      placeholders.push(
        `($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${paramCount + 4}, $${paramCount + 5}, $${paramCount + 6}, $${paramCount + 7}, $${paramCount + 8}, $${paramCount + 9})`
      );
      values.push(
        item.order_id,
        item.product_id,
        item.supplier_id,
        item.product_name,
        item.product_sku,
        item.quantity,
        item.unit_price,
        item.gst_percentage,
        item.gst_amount,
        item.total_amount
      );
      paramCount += 10;
    });

    const sql = `
      INSERT INTO order_items (
        order_id, product_id, supplier_id, product_name, sku,
        quantity, unit_price, gst_percentage, gst_amount, total_price
      )
      VALUES ${placeholders.join(', ')}
      RETURNING *, sku as product_sku, total_price as total_amount
    `;

    const result = await query(sql, values);
    return result.rows;
  }

  // Get order items by order ID
  static async getByOrderId(orderId: string): Promise<OrderItem[]> {
    const sql = `
      SELECT *, sku as product_sku, total_price as total_amount
      FROM order_items
      WHERE order_id = $1
      ORDER BY created_at ASC
    `;
    const result = await query(sql, [orderId]);
    return result.rows;
  }

  // Get order items by supplier
  static async getBySupplier(
    supplierId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const sql = `
      SELECT oi.*, oi.sku as product_sku, oi.total_price as total_amount,
        o.order_number, o.status as order_status, o.created_at as order_date
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE oi.supplier_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [supplierId, limit, offset]);
    return result.rows;
  }
}
