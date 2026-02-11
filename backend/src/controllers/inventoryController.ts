import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventoryService';
import { SupplierModel } from '../models/Supplier';
import { ProductModel } from '../models/Product';
import { InventoryChangeType } from '../types';
import { AppError } from '../middleware/errorHandler';

export class InventoryController {
  /**
   * Manual stock adjustment
   * POST /api/v1/inventory/products/:productId/adjust
   */
  static async adjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const { quantity_change, change_type, notes } = req.body;
      const userId = req.user!.userId;

      // Verify supplier owns this product
      const supplier = await SupplierModel.findByUserId(userId);
      if (!supplier) {
        throw new AppError('Supplier profile not found', 404);
      }

      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      if (product.supplier_id !== supplier.id) {
        throw new AppError('You can only adjust stock for your own products', 403);
      }

      // Validate change type
      const validTypes = [
        InventoryChangeType.PURCHASE,
        InventoryChangeType.ADJUSTMENT,
        InventoryChangeType.DAMAGED,
      ];
      if (!validTypes.includes(change_type)) {
        throw new AppError('Invalid change type for manual adjustment', 400);
      }

      const updatedProduct = await InventoryService.adjustStock(
        productId,
        quantity_change,
        change_type,
        notes,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Stock adjusted successfully',
        data: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get inventory logs for a product
   * GET /api/v1/inventory/products/:productId/logs
   */
  static async getProductLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const userId = req.user!.userId;

      // Verify supplier owns this product
      const supplier = await SupplierModel.findByUserId(userId);
      if (!supplier) {
        throw new AppError('Supplier profile not found', 404);
      }

      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      if (product.supplier_id !== supplier.id) {
        throw new AppError('You can only view logs for your own products', 403);
      }

      const { logs, total } = await InventoryService.getInventoryLogs(
        productId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all inventory logs for supplier
   * GET /api/v1/inventory/logs
   */
  static async getSupplierLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const userId = req.user!.userId;

      const supplier = await SupplierModel.findByUserId(userId);
      if (!supplier) {
        throw new AppError('Supplier profile not found', 404);
      }

      const { logs, total } = await InventoryService.getSupplierInventoryLogs(
        supplier.id,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get low stock products
   * GET /api/v1/inventory/low-stock
   */
  static async getLowStockProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const supplier = await SupplierModel.findByUserId(userId);
      if (!supplier) {
        throw new AppError('Supplier profile not found', 404);
      }

      const products = await InventoryService.getLowStockProducts(supplier.id);

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get inventory statistics
   * GET /api/v1/inventory/stats
   */
  static async getInventoryStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const supplier = await SupplierModel.findByUserId(userId);
      if (!supplier) {
        throw new AppError('Supplier profile not found', 404);
      }

      const stats = await InventoryService.getSupplierInventoryStats(supplier.id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check stock availability (utility endpoint)
   * POST /api/v1/inventory/check-availability
   */
  static async checkAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { items } = req.body;

      if (!Array.isArray(items)) {
        throw new AppError('Items must be an array', 400);
      }

      const result = await InventoryService.checkStockAvailability(items);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
