import { Router } from 'express';
import { AddressController } from '../controllers/addressController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create address
router.post('/', AddressController.create);

// Get all addresses
router.get('/', AddressController.getAll);

// Get addresses by type
router.get('/type/:type', AddressController.getByType);

// Get single address
router.get('/:id', AddressController.getById);

// Update address
router.put('/:id', AddressController.update);

// Set default address
router.put('/:id/default', AddressController.setDefault);

// Delete address
router.delete('/:id', AddressController.delete);

export default router;
