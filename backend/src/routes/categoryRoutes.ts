import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';

const router = Router();

// Public routes
router.get('/', CategoryController.getAllActive);
router.get('/tree', CategoryController.getCategoryTree);

export default router;
