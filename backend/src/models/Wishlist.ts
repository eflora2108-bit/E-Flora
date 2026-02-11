import { query } from '../config/database';
import { WishlistItem, WishlistItemCreateInput } from '../types';

export class WishlistModel {
  // Add to wishlist
  static async add(data: WishlistItemCreateInput): Promise<WishlistItem> {
    const sql = `
      INSERT INTO wishlist_items (user_id, product_id, notify_on_stock)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id) DO UPDATE
        SET notify_on_stock = $3, updated_at = NOW()
      RETURNING *
    `;

    const values = [data.user_id, data.product_id, data.notify_on_stock || false];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Get user's wishlist
  static async getByUser(userId: string): Promise<any[]> {
    const sql = `
      SELECT
        w.*,
        p.id as product_id,
        p.name,
        p.slug,
        p.price,
        p.mrp,
        p.stock_quantity,
        p.images,
        p.is_active,
        p.moderation_status,
        c.name as category_name,
        s.business_name as supplier_name
      FROM wishlist_items w
      INNER JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `;

    const result = await query(sql, [userId]);
    return result.rows;
  }

  // Check if product is in wishlist
  static async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const sql = 'SELECT id FROM wishlist_items WHERE user_id = $1 AND product_id = $2';
    const result = await query(sql, [userId, productId]);
    return result.rows.length > 0;
  }

  // Remove from wishlist
  static async remove(userId: string, productId: string): Promise<boolean> {
    const sql = 'DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2';
    const result = await query(sql, [userId, productId]);
    return result.rowCount! > 0;
  }

  // Toggle notify on stock
  static async toggleNotify(userId: string, productId: string): Promise<boolean> {
    const sql = `
      UPDATE wishlist_items
      SET notify_on_stock = NOT notify_on_stock, updated_at = NOW()
      WHERE user_id = $1 AND product_id = $2
      RETURNING notify_on_stock
    `;

    const result = await query(sql, [userId, productId]);
    return result.rows[0]?.notify_on_stock || false;
  }

  // Get users to notify for product stock
  static async getUsersToNotify(productId: string): Promise<string[]> {
    const sql = `
      SELECT user_id
      FROM wishlist_items
      WHERE product_id = $1 AND notify_on_stock = true
    `;

    const result = await query(sql, [productId]);
    return result.rows.map((row) => row.user_id);
  }

  // Get wishlist count
  static async getCount(userId: string): Promise<number> {
    const sql = 'SELECT COUNT(*) FROM wishlist_items WHERE user_id = $1';
    const result = await query(sql, [userId]);
    return parseInt(result.rows[0].count);
  }

  // Clear wishlist
  static async clear(userId: string): Promise<boolean> {
    const sql = 'DELETE FROM wishlist_items WHERE user_id = $1';
    const result = await query(sql, [userId]);
    return result.rowCount! > 0;
  }
}
