import { ProductModel } from '../models/Product';
import { CategoryModel } from '../models/Category';
import { SupplierModel } from '../models/Supplier';
import { AppError } from '../middleware/errorHandler';
import { isCloudinaryConfigured, uploadProductImageToCloudinary } from '../config/cloudinary';
import * as fs from 'fs/promises';
import {
  ProductCreateInput,
  ProductUpdateInput,
  ProductModerationStatus,
  SupplierVerificationStatus,
} from '../types';
import logger from '../utils/logger';

export class ProductService {
  private static imageToUrl(image: any): string | null {
    if (!image) return null;

    if (typeof image === 'string') {
      return image;
    }

    if (typeof image === 'object') {
      if (typeof image.url === 'string') return image.url;
      if (typeof image.secure_url === 'string') return image.secure_url;
      if (typeof image.path === 'string') return image.path;
    }

    return null;
  }

  private static normalizeImages(images: any): string[] {
    if (!Array.isArray(images)) return [];
    return images
      .map((img) => this.imageToUrl(img))
      .filter((url): url is string => Boolean(url));
  }

  private static normalizeProduct<T extends any>(product: T): T {
    if (!product || typeof product !== 'object') return product;
    return {
      ...product,
      images: this.normalizeImages((product as any).images),
    };
  }

  private static normalizeProducts<T extends any>(products: T[]): T[] {
    return products.map((p) => this.normalizeProduct(p));
  }

  // Create product (supplier only)
  static async create(supplierId: string, data: Omit<ProductCreateInput, 'supplier_id'>) {
    if (!data?.category_id) {
      throw new AppError('Category is required', 400);
    }
    if (!data?.name || String(data.name).trim().length === 0) {
      throw new AppError('Product name is required', 400);
    }
    if (data.price === undefined || Number(data.price) < 0) {
      throw new AppError('Valid price is required', 400);
    }
    if (data.stock_quantity === undefined || Number(data.stock_quantity) < 0) {
      throw new AppError('Valid stock quantity is required', 400);
    }

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

    let product;
    try {
      product = await ProductModel.create({
        ...data,
        supplier_id: supplierId,
      });
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new AppError('A product with similar details already exists. Try a different name.', 400);
      }
      if (error?.code === '23503') {
        throw new AppError('Invalid category or supplier reference', 400);
      }
      if (error?.code === '23502') {
        throw new AppError('Missing required product fields', 400);
      }
      throw error;
    }

    logger.info(`Product created: ${product.id} by supplier ${supplierId}`);
    return this.normalizeProduct(product);
  }

  // Get supplier's own products
  static async getSupplierProducts(
    supplierId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const result = await ProductModel.findAll(
      { supplier_id: supplierId, is_active: true },
      { page, limit }
    );

    return {
      ...result,
      products: this.normalizeProducts(result.products),
    };
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

    return this.normalizeProduct(product);
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

    if (data.images !== undefined) {
      data.images = this.normalizeImages(data.images as any);
    }

    const updated = await ProductModel.update(id, data);
    logger.info(`Product updated: ${id}, reset to pending moderation`);
    return this.normalizeProduct(updated);
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

    let newImages: string[] = [];

    if (isCloudinaryConfigured()) {
      try {
        newImages = await Promise.all(
          files.map(async (file) => {
            const uploadedUrl = await uploadProductImageToCloudinary(file.path, id);
            return uploadedUrl;
          })
        );
      } catch (error: any) {
        throw new AppError(error?.message || 'Failed to upload images to cloud storage', 500);
      } finally {
        await Promise.all(
          files.map(async (file) => {
            if (file.path) {
              try {
                await fs.unlink(file.path);
              } catch {
                // ignore cleanup error
              }
            }
          })
        );
      }
    } else {
      newImages = files.map((file) => `/uploads/products/${file.filename}`);
    }

    // Append new images to existing ones
    const existingImages = this.normalizeImages(product.images);
    const allImages = [...existingImages, ...newImages];

    const updated = await ProductModel.uploadImages(id, allImages);
    logger.info(`Product images uploaded: ${id}, new: ${files.length}, total: ${allImages.length}`);
    return this.normalizeProduct(updated);
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
    const result = await ProductModel.getPublicProducts(filters, { page, limit });
    return {
      ...result,
      products: this.normalizeProducts(result.products),
    };
  }

  // Get product by slug (public)
  static async getBySlug(slug: string) {
    const product = await ProductModel.findBySlug(slug);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return this.normalizeProduct(product);
  }

  // Delete product (supplier only)
  static async delete(id: string, supplierId: string): Promise<'deleted' | 'deactivated'> {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.supplier_id !== supplierId) {
      throw new AppError('You do not have permission to delete this product', 403);
    }

    try {
      await ProductModel.delete(id);
      logger.info(`Product deleted: ${id}`);
      return 'deleted';
    } catch (error: any) {
      // If product is referenced in historical records, fallback to soft delete
      if (error?.code === '23503') {
        await ProductModel.deactivate(id);
        logger.info(`Product deactivated due to references: ${id}`);
        return 'deactivated';
      }
      throw error;
    }
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
    return this.normalizeProduct(approved);
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
    return this.normalizeProduct(rejected);
  }

  // Get product stats (admin) - single aggregated query for efficiency
  static async getProductStats() {
    const { query: dbQuery } = await import('../config/database');
    const sql = `SELECT
      COUNT(*) FILTER (WHERE moderation_status = 'pending') AS pending,
      COUNT(*) FILTER (WHERE moderation_status = 'approved') AS approved,
      COUNT(*) FILTER (WHERE moderation_status = 'rejected') AS rejected,
      COUNT(*) AS total
    FROM products`;
    const result = await dbQuery(sql);
    const row = result.rows[0];
    return {
      pending: parseInt(row.pending),
      approved: parseInt(row.approved),
      rejected: parseInt(row.rejected),
      total: parseInt(row.total),
    };
  }
}
