import { Router } from 'express';
import { SupplierController } from '../controllers/supplierController';
import { authenticate } from '../middleware/auth';
import { requireSupplier } from '../middleware/rbac';
import { uploadMultiple } from '../config/multer';

const router = Router();

// All routes require authentication and supplier role
router.use(authenticate);
router.use(requireSupplier);

// Supplier profile management
router.post('/profile', SupplierController.createProfile);
router.get('/profile', SupplierController.getProfile);
router.put('/profile', SupplierController.updateProfile);

// Document upload for verification
router.post(
  '/documents',
  uploadMultiple('documents', 5, 'document'),
  SupplierController.uploadDocuments
);

// Verification status
router.get('/verification-status', SupplierController.getVerificationStatus);

export default router;
