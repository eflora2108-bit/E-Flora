import { query } from '../config/database';
import {
  Supplier,
  SupplierCreateInput,
  SupplierUpdateInput,
  SupplierVerificationStatus,
} from '../types';

export class SupplierModel {
  // Create supplier profile
  static async create(data: SupplierCreateInput): Promise<Supplier> {
    const sql = `
      INSERT INTO suppliers (
        user_id, business_name, business_type, gstin, pan,
        business_address, city, state, pincode
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await query(sql, [
      data.user_id,
      data.business_name,
      data.business_type || null,
      data.gstin || null,
      data.pan || null,
      data.business_address || null,
      data.city || null,
      data.state || null,
      data.pincode || null,
    ]);

    return result.rows[0];
  }

  // Find by ID
  static async findById(id: string): Promise<Supplier | null> {
    const sql = 'SELECT * FROM suppliers WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Find by user ID
  static async findByUserId(userId: string): Promise<Supplier | null> {
    const sql = 'SELECT * FROM suppliers WHERE user_id = $1';
    const result = await query(sql, [userId]);
    return result.rows[0] || null;
  }

  // Find by GSTIN
  static async findByGSTIN(gstin: string): Promise<Supplier | null> {
    const sql = 'SELECT * FROM suppliers WHERE gstin = $1';
    const result = await query(sql, [gstin]);
    return result.rows[0] || null;
  }

  // Update supplier profile
  static async update(id: string, data: SupplierUpdateInput): Promise<Supplier> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.business_name !== undefined) {
      fields.push(`business_name = $${paramCount++}`);
      values.push(data.business_name);
    }
    if (data.business_type !== undefined) {
      fields.push(`business_type = $${paramCount++}`);
      values.push(data.business_type);
    }
    if (data.gstin !== undefined) {
      fields.push(`gstin = $${paramCount++}`);
      values.push(data.gstin);
    }
    if (data.pan !== undefined) {
      fields.push(`pan = $${paramCount++}`);
      values.push(data.pan);
    }
    if (data.business_address !== undefined) {
      fields.push(`business_address = $${paramCount++}`);
      values.push(data.business_address);
    }
    if (data.city !== undefined) {
      fields.push(`city = $${paramCount++}`);
      values.push(data.city);
    }
    if (data.state !== undefined) {
      fields.push(`state = $${paramCount++}`);
      values.push(data.state);
    }
    if (data.pincode !== undefined) {
      fields.push(`pincode = $${paramCount++}`);
      values.push(data.pincode);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE suppliers
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Upload verification documents
  static async uploadDocuments(
    id: string,
    documents: any
  ): Promise<Supplier> {
    const sql = `
      UPDATE suppliers
      SET verification_documents = $1,
          verification_status = 'under_review',
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(sql, [JSON.stringify(documents), id]);
    return result.rows[0];
  }

  // Approve supplier
  static async approve(
    id: string,
    verifiedBy: string
  ): Promise<Supplier> {
    const sql = `
      UPDATE suppliers
      SET verification_status = 'approved',
          verified_at = NOW(),
          verified_by = $1,
          rejection_reason = NULL,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(sql, [verifiedBy, id]);
    return result.rows[0];
  }

  // Reject supplier
  static async reject(
    id: string,
    reason: string,
    verifiedBy: string
  ): Promise<Supplier> {
    const sql = `
      UPDATE suppliers
      SET verification_status = 'rejected',
          rejection_reason = $1,
          verified_by = $2,
          verified_at = NOW(),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(sql, [reason, verifiedBy, id]);
    return result.rows[0];
  }

  // Get all suppliers with filters
  static async findAll(
    filters?: {
      verification_status?: SupplierVerificationStatus;
      state?: string;
    },
    pagination?: { page: number; limit: number }
  ): Promise<{ suppliers: Supplier[]; total: number }> {
    let sql = `
      SELECT s.*, u.email, u.first_name, u.last_name, u.phone
      FROM suppliers s
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    // Apply filters
    if (filters?.verification_status) {
      sql += ` AND s.verification_status = $${paramCount++}`;
      params.push(filters.verification_status);
    }
    if (filters?.state) {
      sql += ` AND s.state = $${paramCount++}`;
      params.push(filters.state);
    }

    // Get total count
    const countSql = sql.replace(
      'SELECT s.*, u.email, u.first_name, u.last_name, u.phone',
      'SELECT COUNT(*)'
    );
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination
    if (pagination) {
      const offset = (pagination.page - 1) * pagination.limit;
      sql += ` ORDER BY s.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(pagination.limit, offset);
    } else {
      sql += ' ORDER BY s.created_at DESC';
    }

    const result = await query(sql, params);
    return { suppliers: result.rows, total };
  }

  // Get supplier with user details
  static async getWithUserDetails(id: string): Promise<any | null> {
    const sql = `
      SELECT s.*, u.email, u.first_name, u.last_name, u.phone, u.email_verified
      FROM suppliers s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Check if user already has supplier profile
  static async existsByUserId(userId: string): Promise<boolean> {
    const sql = 'SELECT id FROM suppliers WHERE user_id = $1';
    const result = await query(sql, [userId]);
    return result.rows.length > 0;
  }
}
