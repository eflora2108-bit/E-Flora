import { query } from '../config/database';
import { Invoice, InvoiceCreateInput, InvoiceStatus } from '../types';

export class InvoiceModel {
  // Generate invoice number: INV-YYYYMMDD-0001
  static async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    const sql = `SELECT COUNT(*) as count FROM invoices WHERE invoice_number LIKE $1`;
    const result = await query(sql, [`INV-${dateStr}%`]);
    const count = parseInt(result.rows[0].count) + 1;

    return `INV-${dateStr}-${count.toString().padStart(4, '0')}`;
  }

  // Create invoice
  static async create(data: InvoiceCreateInput): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();

    const sql = `
      INSERT INTO invoices (
        invoice_number, order_id, user_id, invoice_date, subtotal,
        cgst_amount, sgst_amount, igst_amount, total_gst,
        shipping_charges, total_amount, status
      )
      VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      invoiceNumber,
      data.order_id,
      data.user_id,
      data.subtotal,
      data.cgst_amount,
      data.sgst_amount,
      data.igst_amount,
      data.total_gst,
      data.shipping_charges,
      data.total_amount,
      InvoiceStatus.GENERATED,
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Get invoice by ID
  static async findById(id: string): Promise<Invoice | null> {
    const sql = 'SELECT * FROM invoices WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Get invoice by order ID
  static async findByOrderId(orderId: string): Promise<Invoice | null> {
    const sql = 'SELECT * FROM invoices WHERE order_id = $1';
    const result = await query(sql, [orderId]);
    return result.rows[0] || null;
  }

  // Get invoices by user ID
  static async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ invoices: Invoice[]; total: number }> {
    const offset = (page - 1) * limit;

    const countSql = 'SELECT COUNT(*) FROM invoices WHERE user_id = $1';
    const countResult = await query(countSql, [userId]);
    const total = parseInt(countResult.rows[0].count);

    const sql = `
      SELECT * FROM invoices
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [userId, limit, offset]);
    return { invoices: result.rows, total };
  }

  // Update invoice PDF URL
  static async updatePdfUrl(id: string, pdfUrl: string): Promise<Invoice> {
    const sql = `
      UPDATE invoices
      SET pdf_url = $1, generated_at = NOW(), updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(sql, [pdfUrl, id]);
    return result.rows[0];
  }

  // Update invoice status
  static async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const sql = `
      UPDATE invoices
      SET status = $1,
          sent_at = CASE WHEN $1 = 'sent' THEN NOW() ELSE sent_at END,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(sql, [status, id]);
    return result.rows[0];
  }

  // Get all invoices (admin)
  static async findAll(
    page: number = 1,
    limit: number = 20,
    status?: InvoiceStatus
  ): Promise<{ invoices: Invoice[]; total: number }> {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    let whereClause = '';

    if (status) {
      whereClause = 'WHERE status = $1';
      params.push(status);
    }

    const countSql = `SELECT COUNT(*) FROM invoices ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const paramIndices = params.length;

    const sql = `
      SELECT * FROM invoices
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndices - 1} OFFSET $${paramIndices}
    `;

    const result = await query(sql, params);
    return { invoices: result.rows, total };
  }

  // Delete invoice
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM invoices WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rowCount! > 0;
  }
}
