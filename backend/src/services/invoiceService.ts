import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { PoolClient } from 'pg';
import { InvoiceModel } from '../models/Invoice';
import { OrderModel, OrderItemModel } from '../models/Order';
import { AddressModel } from '../models/Address';
import { GSTCalculator } from '../utils/gstCalculator';
import { AppError } from '../middleware/errorHandler';
import { Invoice, InvoiceCreateInput, InvoiceStatus } from '../types';

export class InvoiceService {
  private static UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'invoices');

  // Ensure uploads directory exists
  static ensureUploadsDir() {
    if (!fs.existsSync(this.UPLOADS_DIR)) {
      fs.mkdirSync(this.UPLOADS_DIR, { recursive: true });
    }
  }

  /**
   * Generate invoice from order
   * @param orderId - Order ID
   * @param client - Optional transaction client
   * @returns Generated invoice
   */
  static async generateInvoiceFromOrder(
    orderId: string,
    client?: PoolClient
  ): Promise<Invoice> {
    // Get order details
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if invoice already exists
    const existingInvoice = await InvoiceModel.findByOrderId(orderId);
    if (existingInvoice) {
      return existingInvoice;
    }

    // Get order items
    const orderItems = await OrderItemModel.findByOrderId(orderId);
    if (orderItems.length === 0) {
      throw new AppError('No order items found', 404);
    }

    // Get shipping address
    const shippingAddress = await AddressModel.findById(order.shipping_address_id);
    if (!shippingAddress) {
      throw new AppError('Shipping address not found', 404);
    }

    // For simplicity, assume single supplier or use first item's supplier state
    // In production, you'd handle multiple suppliers differently
    const sellerState = 'Maharashtra'; // This should come from supplier's business address

    // Calculate GST breakdown
    const gstCalculation = GSTCalculator.calculateOrderGST(
      orderItems,
      shippingAddress.state,
      sellerState
    );

    // Create invoice data
    const invoiceData: InvoiceCreateInput = {
      order_id: orderId,
      user_id: order.user_id,
      subtotal: order.subtotal,
      cgst_amount: GSTCalculator.roundCurrency(gstCalculation.cgst),
      sgst_amount: GSTCalculator.roundCurrency(gstCalculation.sgst),
      igst_amount: GSTCalculator.roundCurrency(gstCalculation.igst),
      total_gst: GSTCalculator.roundCurrency(gstCalculation.totalGst),
      shipping_charges: order.shipping_charges,
      total_amount: order.total_amount,
    };

    // Create invoice
    const invoice = await InvoiceModel.create(invoiceData);

    // Generate PDF
    const pdfPath = await this.generateInvoicePDF(invoice.id);

    // Update invoice with PDF URL
    const updatedInvoice = await InvoiceModel.updatePdfUrl(
      invoice.id,
      `/uploads/invoices/${path.basename(pdfPath)}`
    );

    return updatedInvoice;
  }

  /**
   * Generate invoice PDF
   * @param invoiceId - Invoice ID
   * @returns PDF file path
   */
  static async generateInvoicePDF(invoiceId: string): Promise<string> {
    this.ensureUploadsDir();

    // Get invoice details
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Get order and related data
    const order = await OrderModel.findById(invoice.order_id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const orderItems = await OrderItemModel.findByOrderId(order.id);
    const shippingAddress = await AddressModel.findById(order.shipping_address_id);

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const fileName = `${invoice.invoice_number}.pdf`;
    const filePath = path.join(this.UPLOADS_DIR, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('eFlora Marketplace', 50, 50);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('GST-Compliant Tax Invoice', 50, 80)
      .text('123 Plant Street, Mumbai, Maharashtra 400001', 50, 95)
      .text('GSTIN: 27AAAAA0000A1Z5', 50, 110)
      .text('Phone: +91 98765 43210 | Email: sales@eflora.com', 50, 125);

    // Invoice details (right aligned)
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('INVOICE', 400, 50, { align: 'right' });

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Invoice No: ${invoice.invoice_number}`, 400, 70, { align: 'right' })
      .text(`Date: ${new Date(invoice.created_at).toLocaleDateString('en-IN')}`, 400, 85, {
        align: 'right',
      })
      .text(`Order No: ${order.order_number}`, 400, 100, { align: 'right' });

    // Line separator
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, 150)
      .lineTo(550, 150)
      .stroke();

    // Billing information
    doc.fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 170);

    if (shippingAddress) {
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(shippingAddress.full_name, 50, 190)
        .text(shippingAddress.address_line1, 50, 205);

      if (shippingAddress.address_line2) {
        doc.text(shippingAddress.address_line2, 50, 220);
      }

      doc
        .text(
          `${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
          50,
          shippingAddress.address_line2 ? 235 : 220
        )
        .text(`Phone: ${shippingAddress.phone}`, 50, shippingAddress.address_line2 ? 250 : 235);
    }

    // Items table
    const tableTop = 300;
    doc.fontSize(10).font('Helvetica-Bold');

    // Table headers
    doc
      .text('Item', 50, tableTop)
      .text('SKU', 200, tableTop)
      .text('Qty', 300, tableTop, { width: 50, align: 'right' })
      .text('Rate', 350, tableTop, { width: 70, align: 'right' })
      .text('GST%', 420, tableTop, { width: 50, align: 'right' })
      .text('Amount', 470, tableTop, { width: 80, align: 'right' });

    // Line under headers
    doc
      .strokeColor('#cccccc')
      .lineWidth(0.5)
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Table rows
    let yPosition = tableTop + 25;
    doc.font('Helvetica').fontSize(9);

    orderItems.forEach((item) => {
      doc
        .text(item.product_name.substring(0, 30), 50, yPosition, { width: 140 })
        .text(item.product_sku, 200, yPosition)
        .text(item.quantity.toString(), 300, yPosition, { width: 50, align: 'right' })
        .text(`₹${item.unit_price.toFixed(2)}`, 350, yPosition, { width: 70, align: 'right' })
        .text(`${item.gst_percentage}%`, 420, yPosition, { width: 50, align: 'right' })
        .text(`₹${item.total_amount.toFixed(2)}`, 470, yPosition, {
          width: 80,
          align: 'right',
        });

      yPosition += 20;
    });

    // Totals section
    yPosition += 20;
    doc
      .strokeColor('#cccccc')
      .lineWidth(0.5)
      .moveTo(350, yPosition)
      .lineTo(550, yPosition)
      .stroke();

    yPosition += 15;
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Subtotal:', 350, yPosition)
      .text(`₹${invoice.subtotal.toFixed(2)}`, 470, yPosition, { width: 80, align: 'right' });

    yPosition += 20;

    // GST breakdown
    if (invoice.igst_amount > 0) {
      // Inter-state: IGST
      doc
        .text('IGST:', 350, yPosition)
        .text(`₹${invoice.igst_amount.toFixed(2)}`, 470, yPosition, {
          width: 80,
          align: 'right',
        });
      yPosition += 20;
    } else {
      // Intra-state: CGST + SGST
      doc
        .text('CGST:', 350, yPosition)
        .text(`₹${invoice.cgst_amount.toFixed(2)}`, 470, yPosition, {
          width: 80,
          align: 'right',
        });
      yPosition += 20;

      doc
        .text('SGST:', 350, yPosition)
        .text(`₹${invoice.sgst_amount.toFixed(2)}`, 470, yPosition, {
          width: 80,
          align: 'right',
        });
      yPosition += 20;
    }

    if (invoice.shipping_charges > 0) {
      doc
        .text('Shipping:', 350, yPosition)
        .text(`₹${invoice.shipping_charges.toFixed(2)}`, 470, yPosition, {
          width: 80,
          align: 'right',
        });
      yPosition += 20;
    }

    // Total line
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .moveTo(350, yPosition)
      .lineTo(550, yPosition)
      .stroke();

    yPosition += 15;
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total Amount:', 350, yPosition)
      .text(`₹${invoice.total_amount.toFixed(2)}`, 470, yPosition, {
        width: 80,
        align: 'right',
      });

    // Footer
    const footerTop = 700;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Terms & Conditions:', 50, footerTop);

    doc
      .fontSize(8)
      .font('Helvetica')
      .text('1. Payment is due within 30 days of invoice date.', 50, footerTop + 15)
      .text('2. Please quote invoice number when making payment.', 50, footerTop + 27)
      .text('3. For any queries, contact us at support@eflora.com', 50, footerTop + 39);

    doc
      .fontSize(8)
      .font('Helvetica-Oblique')
      .text('This is a computer-generated invoice and does not require a signature.', 50, footerTop + 60, {
        align: 'center',
      });

    // Finalize PDF
    doc.end();

    // Wait for stream to finish
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return filePath;
  }

  /**
   * Get invoice by ID
   * @param invoiceId - Invoice ID
   * @param userId - User ID (for authorization)
   * @returns Invoice
   */
  static async getInvoice(invoiceId: string, userId?: string): Promise<Invoice> {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // If userId provided, verify ownership
    if (userId && invoice.user_id !== userId) {
      throw new AppError('Unauthorized access to invoice', 403);
    }

    return invoice;
  }

  /**
   * Get invoices by user
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated invoices
   */
  static async getUserInvoices(userId: string, page: number = 1, limit: number = 20) {
    const { invoices, total } = await InvoiceModel.findByUserId(userId, page, limit);

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all invoices (admin)
   * @param page - Page number
   * @param limit - Items per page
   * @param status - Filter by status
   * @returns Paginated invoices
   */
  static async getAllInvoices(page: number = 1, limit: number = 20, status?: InvoiceStatus) {
    const { invoices, total } = await InvoiceModel.findAll(page, limit, status);

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Resend invoice email
   * @param invoiceId - Invoice ID
   * @returns Success status
   */
  static async resendInvoiceEmail(invoiceId: string): Promise<boolean> {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Update status to sent
    await InvoiceModel.updateStatus(invoiceId, InvoiceStatus.SENT);

    // TODO: Implement email sending when email service is ready
    // await EmailService.sendInvoiceEmail(invoice);

    return true;
  }

  /**
   * Get invoice PDF path
   * @param invoiceId - Invoice ID
   * @returns PDF file path
   */
  static async getInvoicePdfPath(invoiceId: string): Promise<string> {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (!invoice.pdf_url) {
      // Generate PDF if not exists
      const pdfPath = await this.generateInvoicePDF(invoiceId);
      await InvoiceModel.updatePdfUrl(
        invoiceId,
        `/uploads/invoices/${path.basename(pdfPath)}`
      );
      return pdfPath;
    }

    const fileName = path.basename(invoice.pdf_url);
    const filePath = path.join(this.UPLOADS_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      // Regenerate PDF if file doesn't exist
      return await this.generateInvoicePDF(invoiceId);
    }

    return filePath;
  }
}
