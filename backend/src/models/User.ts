import { query, getClient, transaction } from '../config/database';
import { User, UserCreateInput, UserUpdateInput, UserPublic } from '../types';
import { PoolClient } from 'pg';

export class UserModel {
  // Create a new user
  static async create(data: UserCreateInput): Promise<User> {
    const sql = `
      INSERT INTO users (
        email, password_hash, role, first_name, last_name, phone
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await query(sql, [
      data.email.toLowerCase(),
      data.password, // Should be hashed before calling this
      data.role,
      data.first_name,
      data.last_name,
      data.phone || null,
    ]);

    return result.rows[0];
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await query(sql, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  // Find user by email verification token
  static async findByEmailVerificationToken(
    token: string
  ): Promise<User | null> {
    const sql = `
      SELECT * FROM users
      WHERE email_verification_token = $1
      AND email_verification_expires > NOW()
    `;
    const result = await query(sql, [token]);
    return result.rows[0] || null;
  }

  // Find user by password reset token
  static async findByPasswordResetToken(token: string): Promise<User | null> {
    const sql = `
      SELECT * FROM users
      WHERE password_reset_token = $1
      AND password_reset_expires > NOW()
    `;
    const result = await query(sql, [token]);
    return result.rows[0] || null;
  }

  // Update user
  static async update(id: string, data: UserUpdateInput): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.first_name !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(data.first_name);
    }
    if (data.last_name !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(data.last_name);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(data.email.toLowerCase());
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Update password
  static async updatePassword(
    id: string,
    passwordHash: string
  ): Promise<void> {
    const sql = `
      UPDATE users
      SET password_hash = $1,
          password_reset_token = NULL,
          password_reset_expires = NULL,
          updated_at = NOW()
      WHERE id = $2
    `;
    await query(sql, [passwordHash, id]);
  }

  // Set email verification token
  static async setEmailVerificationToken(
    id: string,
    token: string,
    expires: Date
  ): Promise<void> {
    const sql = `
      UPDATE users
      SET email_verification_token = $1,
          email_verification_expires = $2,
          updated_at = NOW()
      WHERE id = $3
    `;
    await query(sql, [token, expires, id]);
  }

  // Verify email
  static async verifyEmail(id: string): Promise<void> {
    const sql = `
      UPDATE users
      SET email_verified = true,
          email_verification_token = NULL,
          email_verification_expires = NULL,
          updated_at = NOW()
      WHERE id = $1
    `;
    await query(sql, [id]);
  }

  // Set password reset token
  static async setPasswordResetToken(
    id: string,
    token: string,
    expires: Date
  ): Promise<void> {
    const sql = `
      UPDATE users
      SET password_reset_token = $1,
          password_reset_expires = $2,
          updated_at = NOW()
      WHERE id = $3
    `;
    await query(sql, [token, expires, id]);
  }

  // Deactivate user
  static async deactivate(id: string): Promise<void> {
    const sql = `
      UPDATE users
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
    `;
    await query(sql, [id]);
  }

  // Activate user
  static async activate(id: string): Promise<void> {
    const sql = `
      UPDATE users
      SET is_active = true, updated_at = NOW()
      WHERE id = $1
    `;
    await query(sql, [id]);
  }

  // Get all users (admin only)
  static async findAll(
    filters?: {
      role?: string;
      is_active?: boolean;
      email_verified?: boolean;
    },
    pagination?: { page: number; limit: number }
  ): Promise<{ users: User[]; total: number }> {
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    // Apply filters
    if (filters?.role) {
      sql += ` AND role = $${paramCount++}`;
      params.push(filters.role);
    }
    if (filters?.is_active !== undefined) {
      sql += ` AND is_active = $${paramCount++}`;
      params.push(filters.is_active);
    }
    if (filters?.email_verified !== undefined) {
      sql += ` AND email_verified = $${paramCount++}`;
      params.push(filters.email_verified);
    }

    // Get total count
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination
    if (pagination) {
      const offset = (pagination.page - 1) * pagination.limit;
      sql += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(pagination.limit, offset);
    } else {
      sql += ' ORDER BY created_at DESC';
    }

    const result = await query(sql, params);
    return { users: result.rows, total };
  }

  // Delete user (hard delete - use with caution)
  static async delete(id: string): Promise<void> {
    const sql = 'DELETE FROM users WHERE id = $1';
    await query(sql, [id]);
  }

  // Convert User to UserPublic (remove sensitive fields)
  static toPublic(user: User): UserPublic {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      is_active: user.is_active,
      email_verified: user.email_verified,
      created_at: user.created_at,
    };
  }
}
