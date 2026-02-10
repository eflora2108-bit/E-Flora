import { Request, Response, NextFunction } from 'express';
import { SupplierService } from '../services/supplierService';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export class SupplierController {
  // POST /api/v1/suppliers/profile - Create supplier profile
  static createProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const {
        business_name,
        business_type,
        gstin,
        pan,
        business_address,
        city,
        state,
        pincode,
      } = req.body;

      if (!business_name) {
        throw new AppError('Business name is required', 400);
      }

      const supplier = await SupplierService.createProfile(userId, {
        business_name,
        business_type,
        gstin,
        pan,
        business_address,
        city,
        state,
        pincode,
      });

      res.status(201).json({
        success: true,
        message: 'Supplier profile created successfully',
        data: supplier,
      });
    }
  );

  // GET /api/v1/suppliers/profile - Get own supplier profile
  static getProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;

      const supplier = await SupplierService.getProfile(userId);

      res.json({
        success: true,
        data: supplier,
      });
    }
  );

  // PUT /api/v1/suppliers/profile - Update supplier profile
  static updateProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const updateData = req.body;

      const supplier = await SupplierService.updateProfile(userId, updateData);

      res.json({
        success: true,
        message: 'Supplier profile updated successfully',
        data: supplier,
      });
    }
  );

  // POST /api/v1/suppliers/documents - Upload verification documents
  static uploadDocuments = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new AppError('Please upload at least one document', 400);
      }

      const supplier = await SupplierService.uploadDocuments(userId, files);

      res.json({
        success: true,
        message: 'Documents uploaded successfully. Your application is under review.',
        data: supplier,
      });
    }
  );

  // GET /api/v1/suppliers/verification-status - Get verification status
  static getVerificationStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;

      const status = await SupplierService.getVerificationStatus(userId);

      res.json({
        success: true,
        data: status,
      });
    }
  );
}
