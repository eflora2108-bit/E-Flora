import { Request, Response, NextFunction } from 'express';
import { AddressModel } from '../models/Address';
import { AppError } from '../middleware/errorHandler';

export class AddressController {
  /**
   * Create address
   * POST /api/v1/addresses
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const addressData = { ...req.body, user_id: userId };

      const address = await AddressModel.create(addressData);

      res.status(201).json({
        success: true,
        message: 'Address created successfully',
        data: address,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all addresses
   * GET /api/v1/addresses
   */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const addresses = await AddressModel.getByUser(userId);

      res.status(200).json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get addresses by type
   * GET /api/v1/addresses/type/:type
   */
  static async getByType(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { type } = req.params;

      if (type !== 'shipping' && type !== 'billing') {
        throw new AppError('Invalid address type', 400);
      }

      const addresses = await AddressModel.getByUserAndType(userId, type);

      res.status(200).json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single address
   * GET /api/v1/addresses/:id
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const address = await AddressModel.findById(id);

      if (!address) {
        throw new AppError('Address not found', 404);
      }

      if (address.user_id !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      res.status(200).json({
        success: true,
        data: address,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update address
   * PUT /api/v1/addresses/:id
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const address = await AddressModel.findById(id);

      if (!address) {
        throw new AppError('Address not found', 404);
      }

      if (address.user_id !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      // If setting as default, handle it separately
      if (req.body.is_default === true) {
        const updated = await AddressModel.setDefault(id, userId);
        return res.status(200).json({
          success: true,
          message: 'Address updated successfully',
          data: updated,
        });
      }

      const updated = await AddressModel.update(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: updated,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Set default address
   * PUT /api/v1/addresses/:id/default
   */
  static async setDefault(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const address = await AddressModel.findById(id);

      if (!address) {
        throw new AppError('Address not found', 404);
      }

      if (address.user_id !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      const updated = await AddressModel.setDefault(id, userId);

      res.status(200).json({
        success: true,
        message: 'Default address updated',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete address
   * DELETE /api/v1/addresses/:id
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const address = await AddressModel.findById(id);

      if (!address) {
        throw new AppError('Address not found', 404);
      }

      if (address.user_id !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      await AddressModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
