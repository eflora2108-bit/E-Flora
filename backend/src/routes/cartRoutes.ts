import { Router } from 'express';
import { CartController } from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get cart count (before other routes to avoid conflict)
router.get('/count', CartController.getCartCount);

// Validate cart
router.post('/validate', CartController.validateCart);

// Get cart
router.get('/', CartController.getCart);

// Add to cart
router.post('/', CartController.addToCart);

// Update cart item quantity
router.put('/:productId', CartController.updateQuantity);

// Remove item from cart
router.delete('/:productId', CartController.removeItem);

// Clear cart
router.delete('/', CartController.clearCart);

export default router;
