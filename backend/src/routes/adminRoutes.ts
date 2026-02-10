import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Supplier management
router.get('/suppliers', AdminController.getAllSuppliers);
router.get('/suppliers/pending', AdminController.getPendingSuppliers);
router.get('/suppliers/under-review', AdminController.getUnderReviewSuppliers);
router.get('/suppliers/stats', AdminController.getSupplierStats);
router.get('/suppliers/:id', AdminController.getSupplierDetails);
router.post('/suppliers/:id/approve', AdminController.approveSupplier);
router.post('/suppliers/:id/reject', AdminController.rejectSupplier);

export default router;
