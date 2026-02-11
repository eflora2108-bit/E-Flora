import { query } from '../config/database';
import { InventoryLog, InventoryLogCreateInput } from '../types';

export class InventoryLogModel {
  // Create inventory log entry
  static async create(data: InventoryLogCreateInput): Promise<InventoryLog> {
    const sql = `
      INSERT INTO inventory_logs (
        product_id, change_type, quantity_change, previous_stock, new_stock,
        reference_type, reference_id, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      data.product_id,
      data.change_type,
      data.quantity_change,
      data.previous_stock,
      data.new_stock,
      data.reference_type || null,
      data.reference_id || null,
      data.notes || null,
      data.created_by || null,
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Get logs for a specific product
  static async getByProduct(
    productId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<InventoryLog[]> {
    const sql = `
      SELECT * FROM inventory_logs
      WHERE product_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [productId, limit, offset]);
    return result.rows;
  }

  // Get logs for a supplier's products
  static async getBySupplier(
    supplierId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const sql = `
      SELECT il.*, p.name as product_name, p.sku
      FROM inventory_logs il
      INNER JOIN products p ON il.product_id = p.id
      WHERE p.supplier_id = $1
      ORDER BY il.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [supplierId, limit, offset]);
    return result.rows;
  }

  // Get total count for pagination
  static async getCountByProduct(productId: string): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM inventory_logs WHERE product_id = $1`;
    const result = await query(sql, [productId]);
    return parseInt(result.rows[0].count);
  }

  static async getCountBySupplier(supplierId: string): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count
      FROM inventory_logs il
      INNER JOIN products p ON il.product_id = p.id
      WHERE p.supplier_id = $1
    `;
    const result = await query(sql, [supplierId]);
    return parseInt(result.rows[0].count);
  }
}
