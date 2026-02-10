import { SupplierModel } from '../models/Supplier';
import { AppError } from '../middleware/errorHandler';
import { SupplierVerificationStatus } from '../types';
import logger from '../utils/logger';

export class AdminService {
  // Get all suppliers with filters
  static async getAllSuppliers(
    filters?: {
      verification_status?: SupplierVerificationStatus;
      state?: string;
    },
    page: number = 1,
    limit: number = 20
  ) {
    const result = await SupplierModel.findAll(filters, { page, limit });

    const totalPages = Math.ceil(result.total / limit);

    return {
      suppliers: result.suppliers,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
      },
    };
  }

  // Get pending suppliers (awaiting verification)
  static async getPendingSuppliers(page: number = 1, limit: number = 20) {
    return this.getAllSuppliers(
      { verification_status: SupplierVerificationStatus.PENDING },
      page,
      limit
    );
  }

  // Get suppliers under review
  static async getUnderReviewSuppliers(page: number = 1, limit: number = 20) {
    return this.getAllSuppliers(
      { verification_status: SupplierVerificationStatus.UNDER_REVIEW },
      page,
      limit
    );
  }

  // Get supplier details with user info
  static async getSupplierDetails(supplierId: string) {
    const supplier = await SupplierModel.getWithUserDetails(supplierId);

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    return supplier;
  }

  // Approve supplier
  static async approveSupplier(supplierId: string, adminId: string) {
    const supplier = await SupplierModel.findById(supplierId);

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    if (supplier.verification_status === SupplierVerificationStatus.APPROVED) {
      throw new AppError('Supplier already approved', 400);
    }

    const approvedSupplier = await SupplierModel.approve(supplierId, adminId);

    logger.info(`Supplier approved: ${supplierId} by admin ${adminId}`);

    // TODO: Send approval email to supplier

    return approvedSupplier;
  }

  // Reject supplier
  static async rejectSupplier(
    supplierId: string,
    reason: string,
    adminId: string
  ) {
    const supplier = await SupplierModel.findById(supplierId);

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    if (!reason || reason.trim().length === 0) {
      throw new AppError('Rejection reason is required', 400);
    }

    const rejectedSupplier = await SupplierModel.reject(
      supplierId,
      reason,
      adminId
    );

    logger.info(`Supplier rejected: ${supplierId} by admin ${adminId}, reason: ${reason}`);

    // TODO: Send rejection email to supplier with reason

    return rejectedSupplier;
  }

  // Get supplier statistics
  static async getSupplierStats() {
    const [pending, underReview, approved, rejected] = await Promise.all([
      SupplierModel.findAll({ verification_status: SupplierVerificationStatus.PENDING }),
      SupplierModel.findAll({ verification_status: SupplierVerificationStatus.UNDER_REVIEW }),
      SupplierModel.findAll({ verification_status: SupplierVerificationStatus.APPROVED }),
      SupplierModel.findAll({ verification_status: SupplierVerificationStatus.REJECTED }),
    ]);

    return {
      pending: pending.total,
      under_review: underReview.total,
      approved: approved.total,
      rejected: rejected.total,
      total: pending.total + underReview.total + approved.total + rejected.total,
    };
  }
}
