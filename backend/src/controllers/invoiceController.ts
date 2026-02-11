import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../services/invoiceService';
import { InvoiceStatus } from '../types';
import fs from 'fs';

export class InvoiceController {
  /**
   * Get my invoices
   * GET /api/v1/invoices
   */
  static async getMyInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await InvoiceService.getUserInvoices(userId, page, limit);

      res.json({
        success: true,
        message: 'Invoices retrieved successfully',
        data: result.invoices,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get invoice details
   * GET /api/v1/invoices/:id
   */
  static async getInvoiceDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const invoice = await InvoiceService.getInvoice(id, userId);

      res.json({
        success: true,
        message: 'Invoice retrieved successfully',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download invoice PDF
   * GET /api/v1/invoices/:id/download
   */
  static async downloadInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      // Verify ownership
      await InvoiceService.getInvoice(id, userId);

      // Get PDF path
      const pdfPath = await InvoiceService.getInvoicePdfPath(id);

      // Check if file exists
      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({
          success: false,
          message: 'Invoice PDF not found',
        });
      }

      // Send file
      res.download(pdfPath);
    } catch (error) {
      next(error);
    }
  }

  /**
   * View invoice PDF (inline)
   * GET /api/v1/invoices/:id/view
   */
  static async viewInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      // Verify ownership
      await InvoiceService.getInvoice(id, userId);

      // Get PDF path
      const pdfPath = await InvoiceService.getInvoicePdfPath(id);

      // Check if file exists
      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({
          success: false,
          message: 'Invoice PDF not found',
        });
      }

      // Send file for inline viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      fs.createReadStream(pdfPath).pipe(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend invoice email
   * POST /api/v1/invoices/:id/resend
   */
  static async resendInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      // Verify ownership
      await InvoiceService.getInvoice(id, userId);

      // Resend email
      await InvoiceService.resendInvoiceEmail(id);

      res.json({
        success: true,
        message: 'Invoice email sent successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get invoice by order ID
   * GET /api/v1/invoices/order/:orderId
   */
  static async getInvoiceByOrderId(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const userId = req.user!.userId;

      // Generate invoice if not exists
      const invoice = await InvoiceService.generateInvoiceFromOrder(orderId);

      // Verify ownership
      if (invoice.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to invoice',
        });
      }

      res.json({
        success: true,
        message: 'Invoice retrieved successfully',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== Admin Routes ====================

  /**
   * Get all invoices (admin)
   * GET /api/v1/admin/invoices
   */
  static async getAllInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as InvoiceStatus | undefined;

      const result = await InvoiceService.getAllInvoices(page, limit, status);

      res.json({
        success: true,
        message: 'Invoices retrieved successfully',
        data: result.invoices,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get any invoice details (admin)
   * GET /api/v1/admin/invoices/:id
   */
  static async getAnyInvoiceDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const invoice = await InvoiceService.getInvoice(id);

      res.json({
        success: true,
        message: 'Invoice retrieved successfully',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download any invoice (admin)
   * GET /api/v1/admin/invoices/:id/download
   */
  static async downloadAnyInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Get PDF path
      const pdfPath = await InvoiceService.getInvoicePdfPath(id);

      // Check if file exists
      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({
          success: false,
          message: 'Invoice PDF not found',
        });
      }

      // Send file
      res.download(pdfPath);
    } catch (error) {
      next(error);
    }
  }
}
