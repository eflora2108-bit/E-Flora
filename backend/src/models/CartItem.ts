import { query } from '../config/database';
import { CartItem, CartItemCreateInput } from '../types';

export class CartItemModel {
  // Add item to cart or update quantity if exists
  static async addOrUpdate(data: CartItemCreateInput): Promise<CartItem> {
    const sql = `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = NOW()
      RETURNING *
    `;

    const result = await query(sql, [data.user_id, data.product_id, data.quantity]);
    return result.rows[0];
  }

  // Set exact quantity
  static async setQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CartItem> {
    const sql = `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = $3, updated_at = NOW()
      RETURNING *
    `;

    const result = await query(sql, [userId, productId, quantity]);
    return result.rows[0];
  }

  // Get all cart items for user with product details
  static async getByUser(userId: string): Promise<any[]> {
    const sql = `
      SELECT
        ci.*,
        p.name, p.slug, p.sku, p.price, p.mrp, p.gst_percentage,
        p.stock_quantity, p.minimum_order_quantity, p.images,
        p.supplier_id, p.is_active,
        s.business_name as supplier_name,
        c.name as category_name
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
    `;

    const result = await query(sql, [userId]);
    return result.rows;
  }

  // Get single cart item
  static async getByUserAndProduct(
    userId: string,
    productId: string
  ): Promise<CartItem | null> {
    const sql = `
      SELECT * FROM cart_items
      WHERE user_id = $1 AND product_id = $2
    `;

    const result = await query(sql, [userId, productId]);
    return result.rows[0] || null;
  }

  // Remove item from cart
  static async remove(userId: string, productId: string): Promise<void> {
    const sql = `DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2`;
    await query(sql, [userId, productId]);
  }

  // Clear entire cart
  static async clearCart(userId: string): Promise<void> {
    const sql = `DELETE FROM cart_items WHERE user_id = $1`;
    await query(sql, [userId]);
  }

  // Get cart count
  static async getCartCount(userId: string): Promise<number> {
    const sql = `
      SELECT COALESCE(SUM(quantity), 0) as count
      FROM cart_items
      WHERE user_id = $1
    `;

    const result = await query(sql, [userId]);
    return parseInt(result.rows[0].count);
  }
}
