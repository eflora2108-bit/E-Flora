import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController';
import { authenticate } from '../middleware/auth';
import { requireSupplier } from '../middleware/rbac';

const router = Router();

// All routes require authentication and supplier role
router.use(authenticate, requireSupplier);

// Manual stock adjustment
router.post('/products/:productId/adjust', InventoryController.adjustStock);

// Get inventory logs for specific product
router.get('/products/:productId/logs', InventoryController.getProductLogs);

// Get all inventory logs for supplier
router.get('/logs', InventoryController.getSupplierLogs);

// Get low stock products
router.get('/low-stock', InventoryController.getLowStockProducts);

// Get inventory statistics
router.get('/stats', InventoryController.getInventoryStats);

// Check stock availability (can be used by cart)
router.post('/check-availability', InventoryController.checkAvailability);

export default router;
