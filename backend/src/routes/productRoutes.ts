import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { requireSupplier } from '../middleware/rbac';
import { uploadMultiple } from '../config/multer';

const router = Router();

// Supplier routes (protected) - must be before /:slug to avoid conflict
router.get('/my-products', authenticate, requireSupplier, ProductController.getMyProducts);
router.post('/', authenticate, requireSupplier, ProductController.create);
router.put('/:id', authenticate, requireSupplier, ProductController.update);
router.post(
  '/:id/images',
  authenticate,
  requireSupplier,
  uploadMultiple('images', 10, 'image'),
  ProductController.uploadImages
);
router.delete('/:id', authenticate, requireSupplier, ProductController.delete);

// Public routes - /:slug must be last since it's a catch-all pattern
router.get('/', ProductController.getPublicProducts);
router.get('/:slug', ProductController.getBySlug);

export default router;
