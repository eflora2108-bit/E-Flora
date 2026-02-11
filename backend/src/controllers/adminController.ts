import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { SupplierVerificationStatus } from '../types';

export class AdminController {
  // GET /api/v1/admin/suppliers - Get all suppliers with filters
  static getAllSuppliers = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { verification_status, state, page = '1', limit = '20' } = req.query;

      const filters: any = {};
      if (verification_status) {
        filters.verification_status = verification_status as SupplierVerificationStatus;
      }
      if (state) {
        filters.state = state as string;
      }

      const result = await AdminService.getAllSuppliers(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result.suppliers,
        pagination: result.pagination,
      });
    }
  );

  // GET /api/v1/admin/suppliers/pending - Get pending suppliers
  static getPendingSuppliers = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { page = '1', limit = '20' } = req.query;

      const result = await AdminService.getPendingSuppliers(
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result.suppliers,
        pagination: result.pagination,
      });
    }
  );

  // GET /api/v1/admin/suppliers/under-review - Get suppliers under review
  static getUnderReviewSuppliers = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { page = '1', limit = '20' } = req.query;

      const result = await AdminService.getUnderReviewSuppliers(
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result.suppliers,
        pagination: result.pagination,
      });
    }
  );

  // GET /api/v1/admin/suppliers/:id - Get supplier details
  static getSupplierDetails = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const supplier = await AdminService.getSupplierDetails(id);

      res.json({
        success: true,
        data: supplier,
      });
    }
  );

  // POST /api/v1/admin/suppliers/:id/approve - Approve supplier
  static approveSupplier = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const adminId = req.user!.userId;

      const supplier = await AdminService.approveSupplier(id, adminId);

      res.json({
        success: true,
        message: 'Supplier approved successfully',
        data: supplier,
      });
    }
  );

  // POST /api/v1/admin/suppliers/:id/reject - Reject supplier
  static rejectSupplier = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user!.userId;

      if (!reason) {
        throw new AppError('Rejection reason is required', 400);
      }

      const supplier = await AdminService.rejectSupplier(id, reason, adminId);

      res.json({
        success: true,
        message: 'Supplier rejected',
        data: supplier,
      });
    }
  );

  // GET /api/v1/admin/suppliers/stats - Get supplier statistics
  static getSupplierStats = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await AdminService.getSupplierStats();

      res.json({
        success: true,
        data: stats,
      });
    }
  );
}
