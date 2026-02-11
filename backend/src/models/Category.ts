import { query } from '../config/database';
import { Category, CategoryCreateInput } from '../types';

export class CategoryModel {
  // Create category
  static async create(data: CategoryCreateInput): Promise<Category> {
    const sql = `
      INSERT INTO categories (
        name, slug, description, parent_id, image_url, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await query(sql, [
      data.name,
      data.slug,
      data.description || null,
      data.parent_id || null,
      data.image_url || null,
      data.display_order || 0,
    ]);

    return result.rows[0];
  }

  // Find by ID
  static async findById(id: string): Promise<Category | null> {
    const sql = 'SELECT * FROM categories WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Find by slug
  static async findBySlug(slug: string): Promise<Category | null> {
    const sql = 'SELECT * FROM categories WHERE slug = $1';
    const result = await query(sql, [slug]);
    return result.rows[0] || null;
  }

  // Get all active categories
  static async findAllActive(): Promise<Category[]> {
    const sql = `
      SELECT * FROM categories
      WHERE is_active = true
      ORDER BY display_order ASC, name ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Get all categories (including inactive for admin)
  static async findAll(): Promise<Category[]> {
    const sql = 'SELECT * FROM categories ORDER BY display_order ASC, name ASC';
    const result = await query(sql);
    return result.rows;
  }

  // Get category tree (with children)
  static async getCategoryTree(): Promise<any[]> {
    const sql = `
      WITH RECURSIVE category_tree AS (
        -- Base case: root categories
        SELECT
          id, name, slug, description, parent_id, image_url,
          is_active, display_order, 0 as level,
          ARRAY[id] as path
        FROM categories
        WHERE parent_id IS NULL AND is_active = true

        UNION ALL

        -- Recursive case: child categories
        SELECT
          c.id, c.name, c.slug, c.description, c.parent_id, c.image_url,
          c.is_active, c.display_order, ct.level + 1,
          ct.path || c.id
        FROM categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
        WHERE c.is_active = true
      )
      SELECT * FROM category_tree
      ORDER BY path
    `;

    const result = await query(sql);
    return result.rows;
  }

  // Update category
  static async update(
    id: string,
    data: Partial<CategoryCreateInput>
  ): Promise<Category> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.slug !== undefined) {
      fields.push(`slug = $${paramCount++}`);
      values.push(data.slug);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.parent_id !== undefined) {
      fields.push(`parent_id = $${paramCount++}`);
      values.push(data.parent_id);
    }
    if (data.image_url !== undefined) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(data.image_url);
    }
    if (data.display_order !== undefined) {
      fields.push(`display_order = $${paramCount++}`);
      values.push(data.display_order);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE categories
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Toggle active status
  static async toggleActive(id: string): Promise<Category> {
    const sql = `
      UPDATE categories
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Delete category
  static async delete(id: string): Promise<void> {
    const sql = 'DELETE FROM categories WHERE id = $1';
    await query(sql, [id]);
  }

  // Check if slug exists
  static async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    let sql = 'SELECT id FROM categories WHERE slug = $1';
    const params: any[] = [slug];

    if (excludeId) {
      sql += ' AND id != $2';
      params.push(excludeId);
    }

    const result = await query(sql, params);
    return result.rows.length > 0;
  }
}
