import { Router } from 'express';
import { InvoiceController } from '../controllers/invoiceController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/invoices
 * @desc    Get my invoices
 * @access  Private (Customer/Supplier)
 */
router.get('/', InvoiceController.getMyInvoices);

/**
 * @route   GET /api/v1/invoices/:id
 * @desc    Get invoice details
 * @access  Private (Owner only)
 */
router.get('/:id', InvoiceController.getInvoiceDetails);

/**
 * @route   GET /api/v1/invoices/:id/download
 * @desc    Download invoice PDF
 * @access  Private (Owner only)
 */
router.get('/:id/download', InvoiceController.downloadInvoice);

/**
 * @route   GET /api/v1/invoices/:id/view
 * @desc    View invoice PDF inline
 * @access  Private (Owner only)
 */
router.get('/:id/view', InvoiceController.viewInvoice);

/**
 * @route   POST /api/v1/invoices/:id/resend
 * @desc    Resend invoice email
 * @access  Private (Owner only)
 */
router.post('/:id/resend', InvoiceController.resendInvoice);

/**
 * @route   GET /api/v1/invoices/order/:orderId
 * @desc    Get invoice by order ID (generates if not exists)
 * @access  Private (Owner only)
 */
router.get('/order/:orderId', InvoiceController.getInvoiceByOrderId);

export default router;
