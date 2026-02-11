import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { CategoryController } from '../controllers/categoryController';
import { ProductController } from '../controllers/productController';
import { InvoiceController } from '../controllers/invoiceController';
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

// Category management
router.post('/categories', CategoryController.create);
router.get('/categories', CategoryController.getAll);
router.put('/categories/:id', CategoryController.update);
router.delete('/categories/:id', CategoryController.delete);

// Product moderation
router.get('/products/pending', ProductController.getPendingProducts);
router.get('/products/stats', ProductController.getStats);
router.post('/products/:id/approve', ProductController.approve);
router.post('/products/:id/reject', ProductController.reject);

// Invoice management
router.get('/invoices', InvoiceController.getAllInvoices);
router.get('/invoices/:id', InvoiceController.getAnyInvoiceDetails);
router.get('/invoices/:id/download', InvoiceController.downloadAnyInvoice);

export default router;
