import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cartService';
import { AddressModel } from '../models/Address';
import { AppError } from '../middleware/errorHandler';

export class CheckoutController {
  /**
   * Validate checkout
   * POST /api/v1/checkout/validate
   */
  static async validateCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { shipping_address_id } = req.body;

      const issues: string[] = [];

      // Validate cart
      const cartValidation = await CartService.validateCart(userId);
      if (!cartValidation.valid) {
        issues.push(...cartValidation.issues);
      }

      // Validate shipping address
      if (shipping_address_id) {
        const address = await AddressModel.findById(shipping_address_id);
        if (!address) {
          issues.push('Shipping address not found');
        } else if (address.user_id !== userId) {
          issues.push('Invalid shipping address');
        }
      } else {
        issues.push('Shipping address is required');
      }

      res.status(200).json({
        success: true,
        data: {
          valid: issues.length === 0,
          issues,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate order totals
   * POST /api/v1/checkout/calculate
   */
  static async calculateTotals(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { shipping_address_id } = req.body;

      // Get cart with totals
      const cart = await CartService.getCart(userId);

      if (cart.items.length === 0) {
        throw new AppError('Cart is empty', 400);
      }

      // Get shipping address for state-based GST calculation
      let shippingAddress = null;
      if (shipping_address_id) {
        shippingAddress = await AddressModel.findById(shipping_address_id);
        if (!shippingAddress || shippingAddress.user_id !== userId) {
          throw new AppError('Invalid shipping address', 400);
        }
      }

      // Calculate GST breakdown (CGST/SGST or IGST)
      // For simplicity, we'll use a flat shipping charge
      // In production, this could be based on weight, distance, etc.
      const shippingCharges = cart.summary.subtotal >= 500 ? 0 : 50;

      // GST breakdown
      // Note: For accurate CGST/SGST vs IGST, we'd need to compare buyer and seller states
      // For now, we'll show combined GST
      const gstBreakdown = {
        cgst: 0,
        sgst: 0,
        igst: cart.summary.total_gst,
      };

      // If shipping address is in same state as any supplier, split GST
      // This is simplified - in production, calculate per item based on supplier state
      if (shippingAddress) {
        // Example: Split GST for intra-state transactions
        // In real implementation, check supplier state vs buyer state for each item
        const sameState = false; // Placeholder
        if (sameState) {
          gstBreakdown.cgst = cart.summary.total_gst / 2;
          gstBreakdown.sgst = cart.summary.total_gst / 2;
          gstBreakdown.igst = 0;
        }
      }

      const grandTotal = cart.summary.total + shippingCharges;

      res.status(200).json({
        success: true,
        data: {
          subtotal: cart.summary.subtotal,
          gst_breakdown: gstBreakdown,
          total_gst: cart.summary.total_gst,
          shipping_charges: shippingCharges,
          total_before_shipping: cart.summary.total,
          grand_total: grandTotal,
          total_items: cart.summary.total_items,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
