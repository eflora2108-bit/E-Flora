import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/products/:productId/reviews', ReviewController.getProductReviews);

// Protected routes
router.use(authenticate);

router.get('/can-review/:productId', ReviewController.canReview);
router.post('/', ReviewController.createReview);
router.get('/my-reviews', ReviewController.getMyReviews);
router.put('/:id', ReviewController.updateReview);
router.delete('/:id', ReviewController.deleteReview);
router.post('/:id/helpful', ReviewController.markHelpful);

export default router;
