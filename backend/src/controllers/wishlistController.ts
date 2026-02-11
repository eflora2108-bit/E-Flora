import { Request, Response, NextFunction } from 'express';
import { WishlistModel } from '../models/Wishlist';

export class WishlistController {
  // Get my wishlist
  static async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const items = await WishlistModel.getByUser(userId);

      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  // Add to wishlist
  static async addToWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { product_id, notify_on_stock } = req.body;

      const item = await WishlistModel.add({
        user_id: userId,
        product_id,
        notify_on_stock,
      });

      res.status(201).json({
        success: true,
        message: 'Added to wishlist',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove from wishlist
  static async removeFromWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { productId } = req.params;

      await WishlistModel.remove(userId, productId);

      res.json({
        success: true,
        message: 'Removed from wishlist',
      });
    } catch (error) {
      next(error);
    }
  }

  // Toggle notify on stock
  static async toggleNotify(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { productId } = req.params;

      const notify = await WishlistModel.toggleNotify(userId, productId);

      res.json({
        success: true,
        message: notify ? 'Stock notifications enabled' : 'Stock notifications disabled',
        data: { notify_on_stock: notify },
      });
    } catch (error) {
      next(error);
    }
  }

  // Clear wishlist
  static async clearWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await WishlistModel.clear(userId);

      res.json({
        success: true,
        message: 'Wishlist cleared',
      });
    } catch (error) {
      next(error);
    }
  }
}
