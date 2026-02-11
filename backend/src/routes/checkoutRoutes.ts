import { Router } from 'express';
import { CheckoutController } from '../controllers/checkoutController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validate checkout
router.post('/validate', CheckoutController.validateCheckout);

// Calculate order totals
router.post('/calculate', CheckoutController.calculateTotals);

export default router;
