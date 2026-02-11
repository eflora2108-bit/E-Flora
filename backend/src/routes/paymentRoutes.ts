import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Initiate payment (requires auth)
router.post('/initiate', authenticate, PaymentController.initiatePayment);

// Verify payment (requires auth)
router.post('/verify', authenticate, PaymentController.verifyPayment);

// Webhook endpoint (NO AUTH - verified by signature)
router.post('/webhook', PaymentController.handleWebhook);

export default router;
