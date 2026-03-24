import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export class ProductController {
  // POST /api/v1/products - Create product (supplier only)
  static create = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { SupplierModel } = await import('../models/Supplier');

      const supplier = await SupplierModel.findByUserId(userId);
      if (!supplier) {
        throw new AppError('Supplier profile not found', 404);
      }

      const payload: any = { ...req.body };
      if (payload.min_order_quantity !== undefined && payload.minimum_order_quantity === undefined) {
        payload.minimum_order_quantity = payload.min_order_quantity;
      }

      const product = await ProductService.create(supplier.id, payload);

      res.status(201).json({
        success: true,
        message: 'Product created successfully. Pending moderation.',
        data: product,
      });
    }
  );

  // GET /api/v1/products/my-products - Get supplier's products
  static getMyProducts = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { page = '1', limit = '20' } = req.query;
      const { SupplierModel } = await import('../models/Supplier');

      const supplier = await SupplierModel.findByUserId(userId);
      if (!supplier) {
        throw new AppError('Supplier profile not found', 404);
      }

      const result = await ProductService.getSupplierProducts(
        supplier.id,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result.products,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: result.total,
        },
      });
    }
  );

  // GET /api/v1/products - Get public products
  static getPublicProducts = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        category_id,
        search,
        min_price,
        max_price,
        page = '1',
        limit = '20',
      } = req.query;

      const filters: any = {};
      if (category_id) filters.category_id = category_id as string;
      if (search) filters.search = search as string;
      if (min_price) filters.min_price = parseFloat(min_price as string);
      if (max_price) filters.max_price = parseFloat(max_price as string);

      const result = await ProductService.getPublicProducts(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result.products,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: result.total,
        },
      });
    }
  );

  // GET /api/v1/products/:slug - Get product by slug (public)
  static getBySlug = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { slug } = req.params;

      const product = await ProductService.getBySlug(slug);

      res.json({
        success: true,
        data: product,
      });
    }
  );

  // PUT /api/v1/products/:id - Update product (supplier only)
  static update = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { SupplierModel } = await import('../models/Supplier');

      const supplier = await SupplierModel.findByUserId(userId);
      if (!supplier) {
        throw new AppError('Supplier profile not found', 404);
      }

      const payload: any = { ...req.body };
      if (payload.min_order_quantity !== undefined && payload.minimum_order_quantity === undefined) {
        payload.minimum_order_quantity = payload.min_order_quantity;
      }

      const product = await ProductService.update(id, supplier.id, payload);

      res.json({
        success: true,
        message: 'Product updated. Pending re-moderation.',
        data: product,
      });
    }
  );

  // POST /api/v1/products/:id/images - Upload product images
  static uploadImages = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];
      const { SupplierModel } = await import('../models/Supplier');

      const supplier = await SupplierModel.findByUserId(userId);
      if (!supplier) {
        throw new AppError('Supplier profile not found', 404);
      }

      if (!files || files.length === 0) {
        throw new AppError('Please upload at least one image', 400);
      }

      const product = await ProductService.uploadImages(id, supplier.id, files);

      res.json({
        success: true,
        message: 'Product images uploaded successfully',
        data: product,
      });
    }
  );

  // DELETE /api/v1/products/:id - Delete product
  static delete = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { SupplierModel } = await import('../models/Supplier');

      const supplier = await SupplierModel.findByUserId(userId);
      if (!supplier) {
        throw new AppError('Supplier profile not found', 404);
      }

      const result = await ProductService.delete(id, supplier.id);

      res.json({
        success: true,
        message:
          result === 'deleted'
            ? 'Product deleted successfully'
            : 'Product is part of past orders and has been deactivated',
      });
    }
  );

  // GET /api/v1/admin/products/pending - Get pending products (admin)
  static getPendingProducts = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { page = '1', limit = '20' } = req.query;

      const result = await ProductService.getPendingProducts(
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result.products,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: result.total,
        },
      });
    }
  );

  // POST /api/v1/admin/products/:id/approve - Approve product (admin)
  static approve = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const adminId = req.user!.userId;

      const product = await ProductService.approve(id, adminId);

      res.json({
        success: true,
        message: 'Product approved successfully',
        data: product,
      });
    }
  );

  // POST /api/v1/admin/products/:id/reject - Reject product (admin)
  static reject = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user!.userId;

      if (!reason) {
        throw new AppError('Rejection reason is required', 400);
      }

      const product = await ProductService.reject(id, reason, adminId);

      res.json({
        success: true,
        message: 'Product rejected',
        data: product,
      });
    }
  );

  // GET /api/v1/admin/products/stats - Get product stats (admin)
  static getStats = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await ProductService.getProductStats();

      res.json({
        success: true,
        data: stats,
      });
    }
  );
}
