import { query } from '../config/database';
import { Address, AddressCreateInput, AddressUpdateInput } from '../types';

export class AddressModel {
  // Create address
  static async create(data: AddressCreateInput): Promise<Address> {
    // If this is set as default, unset other defaults first
    if (data.is_default) {
      await this.unsetDefaults(data.user_id, data.address_type);
    }

    const sql = `
      INSERT INTO addresses (
        user_id, address_type, full_name, phone,
        address_line1, address_line2, city, state, pincode, is_default
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      data.user_id,
      data.address_type,
      data.full_name,
      data.phone,
      data.address_line1,
      data.address_line2 || null,
      data.city,
      data.state,
      data.pincode,
      data.is_default || false,
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Get all addresses for user
  static async getByUser(userId: string): Promise<Address[]> {
    const sql = `
      SELECT * FROM addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `;

    const result = await query(sql, [userId]);
    return result.rows;
  }

  // Get addresses by type
  static async getByUserAndType(
    userId: string,
    addressType: string
  ): Promise<Address[]> {
    const sql = `
      SELECT * FROM addresses
      WHERE user_id = $1 AND address_type = $2
      ORDER BY is_default DESC, created_at DESC
    `;

    const result = await query(sql, [userId, addressType]);
    return result.rows;
  }

  // Get single address
  static async findById(id: string): Promise<Address | null> {
    const sql = `SELECT * FROM addresses WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Update address
  static async update(id: string, data: AddressUpdateInput): Promise<Address> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      const address = await this.findById(id);
      if (!address) throw new Error('Address not found');
      return address;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE addresses
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Set as default
  static async setDefault(id: string, userId: string): Promise<Address> {
    const address = await this.findById(id);
    if (!address) throw new Error('Address not found');

    // Unset other defaults
    await this.unsetDefaults(userId, address.address_type);

    // Set this as default
    const sql = `
      UPDATE addresses
      SET is_default = true, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Unset all defaults for user and type
  static async unsetDefaults(userId: string, addressType: string): Promise<void> {
    const sql = `
      UPDATE addresses
      SET is_default = false
      WHERE user_id = $1 AND address_type = $2
    `;

    await query(sql, [userId, addressType]);
  }

  // Delete address
  static async delete(id: string): Promise<void> {
    const sql = `DELETE FROM addresses WHERE id = $1`;
    await query(sql, [id]);
  }

  // Get default address
  static async getDefault(userId: string, addressType: string): Promise<Address | null> {
    const sql = `
      SELECT * FROM addresses
      WHERE user_id = $1 AND address_type = $2 AND is_default = true
      LIMIT 1
    `;

    const result = await query(sql, [userId, addressType]);
    return result.rows[0] || null;
  }
}
