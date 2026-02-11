import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cartService';
import { AppError } from '../middleware/errorHandler';

export class CartController {
  /**
   * Add item to cart
   * POST /api/v1/cart
   */
  static async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { product_id, quantity } = req.body;
      const userId = req.user!.userId;

      if (!product_id || !quantity) {
        throw new AppError('Product ID and quantity are required', 400);
      }

      if (quantity <= 0) {
        throw new AppError('Quantity must be greater than 0', 400);
      }

      const cartItem = await CartService.addToCart(userId, product_id, quantity);

      res.status(200).json({
        success: true,
        message: 'Item added to cart',
        data: cartItem,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cart
   * GET /api/v1/cart
   */
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const cart = await CartService.getCart(userId);

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update cart item quantity
   * PUT /api/v1/cart/:productId
   */
  static async updateQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req.user!.userId;

      if (quantity === undefined) {
        throw new AppError('Quantity is required', 400);
      }

      if (quantity < 0) {
        throw new AppError('Quantity cannot be negative', 400);
      }

      const cartItem = await CartService.updateQuantity(userId, productId, quantity);

      res.status(200).json({
        success: true,
        message: quantity === 0 ? 'Item removed from cart' : 'Quantity updated',
        data: cartItem,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove item from cart
   * DELETE /api/v1/cart/:productId
   */
  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const userId = req.user!.userId;

      await CartService.removeItem(userId, productId);

      res.status(200).json({
        success: true,
        message: 'Item removed from cart',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear cart
   * DELETE /api/v1/cart
   */
  static async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await CartService.clearCart(userId);

      res.status(200).json({
        success: true,
        message: 'Cart cleared',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate cart
   * POST /api/v1/cart/validate
   */
  static async validateCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validation = await CartService.validateCart(userId);

      res.status(200).json({
        success: true,
        data: validation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cart count
   * GET /api/v1/cart/count
   */
  static async getCartCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const count = await CartService.getCartCount(userId);

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
}
