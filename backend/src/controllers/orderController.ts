import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { OrderModel, OrderItemModel } from '../models/Order';
import { SupplierModel } from '../models/Supplier';
import { OrderStatus } from '../types';
import { AppError } from '../middleware/errorHandler';

export class OrderController {
  /**
   * Get my orders (customer)
   * GET /api/v1/orders
   */
  static async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const status = req.query.status as OrderStatus | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const orders = await OrderModel.getByUser(userId, status, limit, offset);

      res.status(200).json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total: orders.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order details
   * GET /api/v1/orders/:id
   */
  static async getOrderDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const orderDetails = await OrderService.getOrderDetails(id, userId);

      res.status(200).json({
        success: true,
        data: orderDetails,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel order
   * POST /api/v1/orders/:id/cancel
   */
  static async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const order = await OrderService.cancelOrder(id, userId);

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get supplier orders
   * GET /api/v1/supplier/orders
   */
  static async getSupplierOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const supplier = await SupplierModel.findByUserId(userId);
      if (!supplier) {
        throw new AppError('Supplier profile not found', 404);
      }

      const orderItems = await OrderItemModel.getBySupplier(supplier.id, limit, offset);

      res.status(200).json({
        success: true,
        data: orderItems,
        pagination: {
          page,
          limit,
          total: orderItems.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders (admin)
   * GET /api/v1/admin/orders
   */
  static async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as OrderStatus | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const orders = await OrderModel.getAll(status, limit, offset);

      res.status(200).json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total: orders.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status (admin)
   * PUT /api/v1/admin/orders/:id/status
   */
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, tracking_number } = req.body;

      if (!status) {
        throw new AppError('Status is required', 400);
      }

      const updates: any = { status };

      if (status === OrderStatus.SHIPPED && tracking_number) {
        updates.tracking_number = tracking_number;
        updates.shipped_at = new Date();
      }

      if (status === OrderStatus.DELIVERED) {
        updates.delivered_at = new Date();
      }

      const order = await OrderModel.update(id, updates);

      res.status(200).json({
        success: true,
        message: 'Order status updated',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}
