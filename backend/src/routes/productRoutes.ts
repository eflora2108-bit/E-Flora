import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { requireSupplier } from '../middleware/rbac';
import { uploadMultiple } from '../config/multer';

const router = Router();

// Public routes
router.get('/', ProductController.getPublicProducts);
router.get('/:slug', ProductController.getBySlug);

// Supplier routes (protected)
router.post('/', authenticate, requireSupplier, ProductController.create);
router.get('/my-products', authenticate, requireSupplier, ProductController.getMyProducts);
router.put('/:id', authenticate, requireSupplier, ProductController.update);
router.post(
  '/:id/images',
  authenticate,
  requireSupplier,
  uploadMultiple('images', 10, 'image'),
  ProductController.uploadImages
);
router.delete('/:id', authenticate, requireSupplier, ProductController.delete);

export default router;
