import { Router } from 'express';
import { WishlistController } from '../controllers/wishlistController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', WishlistController.getWishlist);
router.post('/', WishlistController.addToWishlist);
router.delete('/:productId', WishlistController.removeFromWishlist);
router.put('/:productId/notify', WishlistController.toggleNotify);
router.delete('/', WishlistController.clearWishlist);

export default router;
