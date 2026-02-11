import { PoolClient } from 'pg';
import { transaction, query } from '../config/database';
import { ProductModel } from '../models/Product';
import { InventoryLogModel } from '../models/InventoryLog';
import { InventoryChangeType, Product } from '../types';
import { AppError } from '../middleware/errorHandler';

export class InventoryService {
  /**
   * Adjust stock quantity manually (with transaction safety)
   * Used for manual stock adjustments by suppliers
   */
  static async adjustStock(
    productId: string,
    quantityChange: number,
    changeType: InventoryChangeType,
    notes?: string,
    userId?: string
  ): Promise<Product> {
    return transaction(async (client: PoolClient) => {
      // Lock the product row to prevent concurrent modifications
      const lockSql = `
        SELECT * FROM products
        WHERE id = $1
        FOR UPDATE
      `;
      const lockResult = await client.query(lockSql, [productId]);

      if (lockResult.rows.length === 0) {
        throw new AppError('Product not found', 404);
      }

      const product = lockResult.rows[0];
      const previousStock = product.stock_quantity;
      const newStock = previousStock + quantityChange;

      if (newStock < 0) {
        throw new AppError(
          `Insufficient stock. Available: ${previousStock}, Requested change: ${quantityChange}`,
          400
        );
      }

      // Update product stock
      const updateSql = `
        UPDATE products
        SET stock_quantity = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      const updateResult = await client.query(updateSql, [newStock, productId]);

      // Create inventory log
      const logSql = `
        INSERT INTO inventory_logs (
          product_id, change_type, quantity_change, previous_stock, new_stock,
          notes, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      await client.query(logSql, [
        productId,
        changeType,
        quantityChange,
        previousStock,
        newStock,
        notes || null,
        userId || null,
      ]);

      return updateResult.rows[0];
    });
  }

  /**
   * Reserve stock during checkout (locks stock without deducting)
   * Used in Phase 6 for cart checkout
   */
  static async reserveStock(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<void> {
    return transaction(async (client: PoolClient) => {
      for (const item of items) {
        const lockSql = `
          SELECT stock_quantity FROM products
          WHERE id = $1
          FOR UPDATE
        `;
        const result = await client.query(lockSql, [item.productId]);

        if (result.rows.length === 0) {
          throw new AppError(`Product ${item.productId} not found`, 404);
        }

        const availableStock = result.rows[0].stock_quantity;

        if (availableStock < item.quantity) {
          throw new AppError(
            `Insufficient stock for product ${item.productId}. Available: ${availableStock}, Required: ${item.quantity}`,
            400
          );
        }
      }
      // Stock is validated and locked within transaction
      // Actual deduction happens after payment confirmation
    });
  }

  /**
   * Deduct stock after successful payment
   * Used in Phase 7 payment webhook handler
   */
  static async deductStock(
    items: Array<{ productId: string; quantity: number }>,
    orderId: string,
    client?: PoolClient
  ): Promise<void> {
    const executeDeduction = async (txClient: PoolClient) => {
      for (const item of items) {
        const lockSql = `
          SELECT * FROM products
          WHERE id = $1
          FOR UPDATE
        `;
        const lockResult = await txClient.query(lockSql, [item.productId]);

        if (lockResult.rows.length === 0) {
          throw new AppError(`Product ${item.productId} not found`, 404);
        }

        const product = lockResult.rows[0];
        const previousStock = product.stock_quantity;
        const newStock = previousStock - item.quantity;

        if (newStock < 0) {
          throw new AppError(
            `Insufficient stock for product ${item.productId}. Available: ${previousStock}, Required: ${item.quantity}`,
            400
          );
        }

        // Update stock
        const updateSql = `
          UPDATE products
          SET stock_quantity = $1, updated_at = NOW()
          WHERE id = $2
        `;
        await txClient.query(updateSql, [newStock, item.productId]);

        // Log the change
        const logSql = `
          INSERT INTO inventory_logs (
            product_id, change_type, quantity_change, previous_stock, new_stock,
            reference_type, reference_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await txClient.query(logSql, [
          item.productId,
          InventoryChangeType.SALE,
          -item.quantity,
          previousStock,
          newStock,
          'order',
          orderId,
        ]);
      }
    };

    if (client) {
      // Use provided transaction client
      await executeDeduction(client);
    } else {
      // Create new transaction
      await transaction(executeDeduction);
    }
  }

  /**
   * Restore stock on order cancellation or return
   */
  static async restoreStock(
    items: Array<{ productId: string; quantity: number }>,
    orderId: string,
    changeType: InventoryChangeType = InventoryChangeType.RETURN
  ): Promise<void> {
    return transaction(async (client: PoolClient) => {
      for (const item of items) {
        const lockSql = `
          SELECT * FROM products
          WHERE id = $1
          FOR UPDATE
        `;
        const lockResult = await client.query(lockSql, [item.productId]);

        if (lockResult.rows.length === 0) {
          throw new AppError(`Product ${item.productId} not found`, 404);
        }

        const product = lockResult.rows[0];
        const previousStock = product.stock_quantity;
        const newStock = previousStock + item.quantity;

        // Update stock
        const updateSql = `
          UPDATE products
          SET stock_quantity = $1, updated_at = NOW()
          WHERE id = $2
        `;
        await client.query(updateSql, [newStock, item.productId]);

        // Log the change
        const logSql = `
          INSERT INTO inventory_logs (
            product_id, change_type, quantity_change, previous_stock, new_stock,
            reference_type, reference_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await client.query(logSql, [
          item.productId,
          changeType,
          item.quantity,
          previousStock,
          newStock,
          'order',
          orderId,
        ]);
      }
    });
  }

  /**
   * Check stock availability for cart items
   */
  static async checkStockAvailability(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<{ available: boolean; issues: string[] }> {
    const issues: string[] = [];

    for (const item of items) {
      const product = await ProductModel.findById(item.productId);

      if (!product) {
        issues.push(`Product ${item.productId} not found`);
        continue;
      }

      if (!product.is_active) {
        issues.push(`Product "${product.name}" is not available`);
        continue;
      }

      if (product.stock_quantity < item.quantity) {
        issues.push(
          `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${item.quantity}`
        );
      }
    }

    return {
      available: issues.length === 0,
      issues,
    };
  }

  /**
   * Get low stock products for a supplier
   */
  static async getLowStockProducts(supplierId: string): Promise<Product[]> {
    const sql = `
      SELECT * FROM products
      WHERE supplier_id = $1
        AND stock_quantity <= low_stock_threshold
        AND is_active = true
      ORDER BY stock_quantity ASC
    `;

    const result = await query(sql, [supplierId]);
    return result.rows;
  }

  /**
   * Get inventory logs for a product
   */
  static async getInventoryLogs(
    productId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ logs: any[]; total: number }> {
    const offset = (page - 1) * limit;
    const logs = await InventoryLogModel.getByProduct(productId, limit, offset);
    const total = await InventoryLogModel.getCountByProduct(productId);

    return { logs, total };
  }

  /**
   * Get inventory logs for all supplier's products
   */
  static async getSupplierInventoryLogs(
    supplierId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ logs: any[]; total: number }> {
    const offset = (page - 1) * limit;
    const logs = await InventoryLogModel.getBySupplier(supplierId, limit, offset);
    const total = await InventoryLogModel.getCountBySupplier(supplierId);

    return { logs, total };
  }

  /**
   * Get inventory statistics for a supplier
   */
  static async getSupplierInventoryStats(supplierId: string): Promise<any> {
    const sql = `
      SELECT
        COUNT(*) as total_products,
        SUM(stock_quantity) as total_stock,
        COUNT(CASE WHEN stock_quantity <= low_stock_threshold THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock_count,
        AVG(stock_quantity) as avg_stock
      FROM products
      WHERE supplier_id = $1 AND is_active = true
    `;

    const result = await query(sql, [supplierId]);
    return result.rows[0];
  }
}
