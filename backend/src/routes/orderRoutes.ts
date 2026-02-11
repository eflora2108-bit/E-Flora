import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';
import { requireSupplier, requireAdmin } from '../middleware/rbac';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Customer routes
router.get('/', OrderController.getMyOrders);
router.get('/:id', OrderController.getOrderDetails);
router.post('/:id/cancel', OrderController.cancelOrder);

// Supplier routes
router.get('/supplier/orders', requireSupplier, OrderController.getSupplierOrders);

// Admin routes
router.get('/admin/all', requireAdmin, OrderController.getAllOrders);
router.put('/admin/:id/status', requireAdmin, OrderController.updateOrderStatus);

export default router;
