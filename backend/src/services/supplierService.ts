import { SupplierModel } from '../models/Supplier';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { SupplierCreateInput, SupplierUpdateInput, UserRole } from '../types';
import { isValidGSTIN, isValidPAN, isValidPincode } from '../utils/validators';
import logger from '../utils/logger';

export class SupplierService {
  // Create supplier profile
  static async createProfile(
    userId: string,
    data: Omit<SupplierCreateInput, 'user_id'>
  ) {
    // Verify user exists and has supplier role
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== UserRole.SUPPLIER) {
      throw new AppError('Only users with supplier role can create supplier profile', 403);
    }

    // Check if supplier profile already exists
    const existingSupplier = await SupplierModel.findByUserId(userId);
    if (existingSupplier) {
      throw new AppError('Supplier profile already exists', 409);
    }

    // Validate GSTIN if provided
    if (data.gstin && !isValidGSTIN(data.gstin)) {
      throw new AppError('Invalid GSTIN format', 400);
    }

    // Validate PAN if provided
    if (data.pan && !isValidPAN(data.pan)) {
      throw new AppError('Invalid PAN format', 400);
    }

    // Validate pincode if provided
    if (data.pincode && !isValidPincode(data.pincode)) {
      throw new AppError('Invalid pincode format', 400);
    }

    // Check if GSTIN is already registered
    if (data.gstin) {
      const existingGSTIN = await SupplierModel.findByGSTIN(data.gstin);
      if (existingGSTIN) {
        throw new AppError('GSTIN already registered', 409);
      }
    }

    // Create supplier profile
    const supplier = await SupplierModel.create({
      user_id: userId,
      ...data,
    });

    logger.info(`Supplier profile created: ${supplier.id} for user ${userId}`);

    return supplier;
  }

  // Get supplier profile
  static async getProfile(userId: string) {
    const supplier = await SupplierModel.findByUserId(userId);

    if (!supplier) {
      throw new AppError('Supplier profile not found', 404);
    }

    return supplier;
  }

  // Update supplier profile
  static async updateProfile(
    userId: string,
    data: SupplierUpdateInput
  ) {
    const supplier = await SupplierModel.findByUserId(userId);

    if (!supplier) {
      throw new AppError('Supplier profile not found', 404);
    }

    // Validate GSTIN if being updated
    if (data.gstin && !isValidGSTIN(data.gstin)) {
      throw new AppError('Invalid GSTIN format', 400);
    }

    // Validate PAN if being updated
    if (data.pan && !isValidPAN(data.pan)) {
      throw new AppError('Invalid PAN format', 400);
    }

    // Validate pincode if being updated
    if (data.pincode && !isValidPincode(data.pincode)) {
      throw new AppError('Invalid pincode format', 400);
    }

    // Check if GSTIN is already registered by another supplier
    if (data.gstin && data.gstin !== supplier.gstin) {
      const existingGSTIN = await SupplierModel.findByGSTIN(data.gstin);
      if (existingGSTIN && existingGSTIN.id !== supplier.id) {
        throw new AppError('GSTIN already registered', 409);
      }
    }

    const updatedSupplier = await SupplierModel.update(supplier.id, data);

    logger.info(`Supplier profile updated: ${supplier.id}`);

    return updatedSupplier;
  }

  // Upload verification documents
  static async uploadDocuments(
    userId: string,
    files: Express.Multer.File[]
  ) {
    const supplier = await SupplierModel.findByUserId(userId);

    if (!supplier) {
      throw new AppError('Supplier profile not found', 404);
    }

    if (files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    // Create document metadata
    const documents = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/documents/${file.filename}`,
      uploadedAt: new Date().toISOString(),
    }));

    const updatedSupplier = await SupplierModel.uploadDocuments(
      supplier.id,
      documents
    );

    logger.info(`Documents uploaded for supplier: ${supplier.id}, count: ${files.length}`);

    return updatedSupplier;
  }

  // Get verification status
  static async getVerificationStatus(userId: string) {
    const supplier = await SupplierModel.findByUserId(userId);

    if (!supplier) {
      throw new AppError('Supplier profile not found', 404);
    }

    return {
      verification_status: supplier.verification_status,
      rejection_reason: supplier.rejection_reason,
      verified_at: supplier.verified_at,
      has_documents: !!supplier.verification_documents,
    };
  }
}
