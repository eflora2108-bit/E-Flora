import { query } from '../config/database';
import {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductModerationStatus,
} from '../types';

export class ProductModel {
  // Create product
  static async create(data: ProductCreateInput): Promise<Product> {
    // Generate slug from name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Generate SKU if not provided
    const sku = `PRD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const sql = `
      INSERT INTO products (
        supplier_id, category_id, name, slug, sku,
        description, short_description, botanical_name,
        price, mrp, gst_percentage, hsn_code,
        unit, minimum_order_quantity, stock_quantity, low_stock_threshold,
        specifications
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const result = await query(sql, [
      data.supplier_id,
      data.category_id,
      data.name,
      slug,
      sku,
      data.description || null,
      data.short_description || null,
      data.botanical_name || null,
      data.price,
      data.mrp || null,
      data.gst_percentage || 5.0,
      data.hsn_code || null,
      data.unit || 'piece',
      data.minimum_order_quantity || 1,
      data.stock_quantity,
      data.low_stock_threshold || 10,
      data.specifications ? JSON.stringify(data.specifications) : null,
    ]);

    return result.rows[0];
  }

  // Find by ID
  static async findById(id: string): Promise<Product | null> {
    const sql = 'SELECT * FROM products WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Find by slug
  static async findBySlug(slug: string): Promise<Product | null> {
    const sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             s.business_name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.slug = $1 AND p.is_active = true AND p.moderation_status = 'approved'
    `;
    const result = await query(sql, [slug]);
    return result.rows[0] || null;
  }

  // Get all products with filters
  static async findAll(
    filters?: {
      supplier_id?: string;
      category_id?: string;
      moderation_status?: ProductModerationStatus;
      is_active?: boolean;
      search?: string;
      min_price?: number;
      max_price?: number;
    },
    pagination?: { page: number; limit: number }
  ): Promise<{ products: Product[]; total: number }> {
    let sql = `
      SELECT p.*, c.name as category_name, s.business_name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 1;

    // Apply filters
    if (filters?.supplier_id) {
      sql += ` AND p.supplier_id = $${paramCount++}`;
      params.push(filters.supplier_id);
    }
    if (filters?.category_id) {
      sql += ` AND p.category_id = $${paramCount++}`;
      params.push(filters.category_id);
    }
    if (filters?.moderation_status) {
      sql += ` AND p.moderation_status = $${paramCount++}`;
      params.push(filters.moderation_status);
    }
    if (filters?.is_active !== undefined) {
      sql += ` AND p.is_active = $${paramCount++}`;
      params.push(filters.is_active);
    }
    if (filters?.search) {
      sql += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount} OR p.botanical_name ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }
    if (filters?.min_price !== undefined) {
      sql += ` AND p.price >= $${paramCount++}`;
      params.push(filters.min_price);
    }
    if (filters?.max_price !== undefined) {
      sql += ` AND p.price <= $${paramCount++}`;
      params.push(filters.max_price);
    }

    // Get total count
    const countSql = sql.replace(
      'SELECT p.*, c.name as category_name, s.business_name as supplier_name',
      'SELECT COUNT(*)'
    );
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination
    if (pagination) {
      const offset = (pagination.page - 1) * pagination.limit;
      sql += ` ORDER BY p.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(pagination.limit, offset);
    } else {
      sql += ' ORDER BY p.created_at DESC';
    }

    const result = await query(sql, params);
    return { products: result.rows, total };
  }

  // Get public products (approved and active)
  static async getPublicProducts(
    filters?: {
      category_id?: string;
      search?: string;
      min_price?: number;
      max_price?: number;
    },
    pagination?: { page: number; limit: number }
  ): Promise<{ products: Product[]; total: number }> {
    return this.findAll(
      {
        ...filters,
        moderation_status: ProductModerationStatus.APPROVED,
        is_active: true,
      },
      pagination
    );
  }

  // Update product
  static async update(id: string, data: ProductUpdateInput): Promise<Product> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const updateableFields = [
      'category_id', 'name', 'description', 'short_description',
      'botanical_name', 'price', 'mrp', 'gst_percentage', 'hsn_code',
      'unit', 'minimum_order_quantity', 'stock_quantity', 'low_stock_threshold'
    ];

    updateableFields.forEach(field => {
      if ((data as any)[field] !== undefined) {
        fields.push(`${field} = $${paramCount++}`);
        values.push((data as any)[field]);
      }
    });

    if (data.specifications !== undefined) {
      fields.push(`specifications = $${paramCount++}`);
      values.push(JSON.stringify(data.specifications));
    }

    if (data.images !== undefined) {
      fields.push(`images = $${paramCount++}`);
      values.push(JSON.stringify(data.images));
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Reset moderation status if product is updated
    fields.push(`moderation_status = 'pending'`);

    values.push(id);
    const sql = `
      UPDATE products
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Upload product images
  static async uploadImages(id: string, images: any): Promise<Product> {
    const sql = `
      UPDATE products
      SET images = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [JSON.stringify(images), id]);
    return result.rows[0];
  }

  // Approve product
  static async approve(id: string, moderatedBy: string): Promise<Product> {
    const sql = `
      UPDATE products
      SET moderation_status = 'approved',
          moderated_by = $1,
          moderated_at = NOW(),
          rejection_reason = NULL,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [moderatedBy, id]);
    return result.rows[0];
  }

  // Reject product
  static async reject(
    id: string,
    reason: string,
    moderatedBy: string
  ): Promise<Product> {
    const sql = `
      UPDATE products
      SET moderation_status = 'rejected',
          rejection_reason = $1,
          moderated_by = $2,
          moderated_at = NOW(),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const result = await query(sql, [reason, moderatedBy, id]);
    return result.rows[0];
  }

  // Toggle active status
  static async toggleActive(id: string): Promise<Product> {
    const sql = `
      UPDATE products
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Delete product
  static async delete(id: string): Promise<void> {
    const sql = 'DELETE FROM products WHERE id = $1';
    await query(sql, [id]);
  }

  // Update stock
  static async updateStock(id: string, quantity: number): Promise<Product> {
    const sql = `
      UPDATE products
      SET stock_quantity = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [quantity, id]);
    return result.rows[0];
  }
}
