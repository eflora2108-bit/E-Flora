import { ProductModel } from '../models/Product';
import { CategoryModel } from '../models/Category';
import { SupplierModel } from '../models/Supplier';
import { AppError } from '../middleware/errorHandler';
import {
  ProductCreateInput,
  ProductUpdateInput,
  ProductModerationStatus,
  SupplierVerificationStatus,
} from '../types';
import logger from '../utils/logger';

export class ProductService {
  // Create product (supplier only)
  static async create(supplierId: string, data: Omit<ProductCreateInput, 'supplier_id'>) {
    // Verify supplier is approved
    const supplier = await SupplierModel.findById(supplierId);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    if (supplier.verification_status !== SupplierVerificationStatus.APPROVED) {
      throw new AppError('Supplier must be approved before adding products', 403);
    }

    // Verify category exists
    const category = await CategoryModel.findById(data.category_id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const product = await ProductModel.create({
      ...data,
      supplier_id: supplierId,
    });

    logger.info(`Product created: ${product.id} by supplier ${supplierId}`);
    return product;
  }

  // Get supplier's own products
  static async getSupplierProducts(
    supplierId: string,
    page: number = 1,
    limit: number = 20
  ) {
    return await ProductModel.findAll(
      { supplier_id: supplierId },
      { page, limit }
    );
  }

  // Get product by ID (for owner)
  static async getById(id: string, supplierId?: string) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // If supplier ID provided, verify ownership
    if (supplierId && product.supplier_id !== supplierId) {
      throw new AppError('You do not have permission to access this product', 403);
    }

    return product;
  }

  // Update product (supplier only, requires re-moderation)
  static async update(
    id: string,
    supplierId: string,
    data: ProductUpdateInput
  ) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.supplier_id !== supplierId) {
      throw new AppError('You do not have permission to update this product', 403);
    }

    // Verify category if being updated
    if (data.category_id) {
      const category = await CategoryModel.findById(data.category_id);
      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    const updated = await ProductModel.update(id, data);
    logger.info(`Product updated: ${id}, reset to pending moderation`);
    return updated;
  }

  // Upload product images
  static async uploadImages(
    id: string,
    supplierId: string,
    files: Express.Multer.File[]
  ) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.supplier_id !== supplierId) {
      throw new AppError('You do not have permission to update this product', 403);
    }

    const images = files.map(file => ({
      filename: file.filename,
      path: `/uploads/products/${file.filename}`,
      uploadedAt: new Date().toISOString(),
    }));

    const updated = await ProductModel.uploadImages(id, images);
    logger.info(`Product images uploaded: ${id}, count: ${files.length}`);
    return updated;
  }

  // Get public products (approved and active)
  static async getPublicProducts(
    filters?: {
      category_id?: string;
      search?: string;
      min_price?: number;
      max_price?: number;
    },
    page: number = 1,
    limit: number = 20
  ) {
    return await ProductModel.getPublicProducts(filters, { page, limit });
  }

  // Get product by slug (public)
  static async getBySlug(slug: string) {
    const product = await ProductModel.findBySlug(slug);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  // Delete product (supplier only)
  static async delete(id: string, supplierId: string) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.supplier_id !== supplierId) {
      throw new AppError('You do not have permission to delete this product', 403);
    }

    await ProductModel.delete(id);
    logger.info(`Product deleted: ${id}`);
  }

  // Get pending products (admin)
  static async getPendingProducts(page: number = 1, limit: number = 20) {
    return await ProductModel.findAll(
      { moderation_status: ProductModerationStatus.PENDING },
      { page, limit }
    );
  }

  // Approve product (admin)
  static async approve(id: string, adminId: string) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.moderation_status === ProductModerationStatus.APPROVED) {
      throw new AppError('Product already approved', 400);
    }

    const approved = await ProductModel.approve(id, adminId);
    logger.info(`Product approved: ${id} by admin ${adminId}`);
    return approved;
  }

  // Reject product (admin)
  static async reject(id: string, reason: string, adminId: string) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!reason || reason.trim().length === 0) {
      throw new AppError('Rejection reason is required', 400);
    }

    const rejected = await ProductModel.reject(id, reason, adminId);
    logger.info(`Product rejected: ${id} by admin ${adminId}`);
    return rejected;
  }

  // Get product stats (admin)
  static async getProductStats() {
    const [pending, approved, rejected, all] = await Promise.all([
      ProductModel.findAll({ moderation_status: ProductModerationStatus.PENDING }),
      ProductModel.findAll({ moderation_status: ProductModerationStatus.APPROVED }),
      ProductModel.findAll({ moderation_status: ProductModerationStatus.REJECTED }),
      ProductModel.findAll({}),
    ]);

    return {
      pending: pending.total,
      approved: approved.total,
      rejected: rejected.total,
      total: all.total,
    };
  }
}
