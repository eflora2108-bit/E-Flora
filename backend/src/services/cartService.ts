import { CartItemModel } from '../models/CartItem';
import { ProductModel } from '../models/Product';
import { InventoryService } from './inventoryService';
import { AppError } from '../middleware/errorHandler';

export class CartService {
  private static normalizeImages(images: any): string[] {
    if (!Array.isArray(images)) return [];
    return images
      .map((img) => {
        if (typeof img === 'string') return img;
        if (img && typeof img === 'object') {
          return img.url || img.secure_url || img.path || null;
        }
        return null;
      })
      .filter((url): url is string => Boolean(url));
  }

  /**
   * Add item to cart with stock validation
   */
  static async addToCart(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<any> {
    // Validate product exists and is active
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!product.is_active || product.moderation_status !== 'approved') {
      throw new AppError('Product is not available for purchase', 400);
    }

    // Check stock availability
    if (product.stock_quantity < quantity) {
      throw new AppError(
        `Insufficient stock. Available: ${product.stock_quantity}, Requested: ${quantity}`,
        400
      );
    }

    // Check minimum order quantity
    if (quantity < product.minimum_order_quantity) {
      throw new AppError(
        `Minimum order quantity is ${product.minimum_order_quantity}`,
        400
      );
    }

    // Add to cart
    return await CartItemModel.addOrUpdate({ user_id: userId, product_id: productId, quantity });
  }

  /**
   * Update cart item quantity
   */
  static async updateQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<any> {
    if (quantity <= 0) {
      await CartItemModel.remove(userId, productId);
      return null;
    }

    // Validate stock
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.stock_quantity < quantity) {
      throw new AppError(
        `Insufficient stock. Available: ${product.stock_quantity}, Requested: ${quantity}`,
        400
      );
    }

    if (quantity < product.minimum_order_quantity) {
      throw new AppError(
        `Minimum order quantity is ${product.minimum_order_quantity}`,
        400
      );
    }

    return await CartItemModel.setQuantity(userId, productId, quantity);
  }

  /**
   * Get cart with calculated totals
   */
  static async getCart(userId: string): Promise<any> {
    const items = await CartItemModel.getByUser(userId);

    let subtotal = 0;
    let totalGst = 0;
    let totalItems = 0;

    const itemsWithTotals = items.map((item) => {
      const itemTotal = item.price * item.quantity;
      const gstAmount = (itemTotal * item.gst_percentage) / 100;

      subtotal += itemTotal;
      totalGst += gstAmount;
      totalItems += item.quantity;

      return {
        ...item,
        images: this.normalizeImages(item.images),
        item_total: itemTotal,
        gst_amount: gstAmount,
        total_with_gst: itemTotal + gstAmount,
      };
    });

    const total = subtotal + totalGst;

    return {
      items: itemsWithTotals,
      summary: {
        subtotal,
        total_gst: totalGst,
        total,
        total_items: totalItems,
        item_count: items.length,
      },
    };
  }

  /**
   * Validate cart before checkout
   */
  static async validateCart(userId: string): Promise<{ valid: boolean; issues: string[] }> {
    const { items } = await this.getCart(userId);

    if (items.length === 0) {
      return {
        valid: false,
        issues: ['Cart is empty'],
      };
    }

    const issues: string[] = [];

    for (const item of items) {
      // Check if product is still active
      if (!item.is_active) {
        issues.push(`Product "${item.name}" is no longer available`);
        continue;
      }

      // Check stock
      if (item.stock_quantity < item.quantity) {
        issues.push(
          `Insufficient stock for "${item.name}". Available: ${item.stock_quantity}, In cart: ${item.quantity}`
        );
      }

      // Check minimum order quantity
      if (item.quantity < item.minimum_order_quantity) {
        issues.push(
          `"${item.name}" requires minimum ${item.minimum_order_quantity} units`
        );
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Remove item from cart
   */
  static async removeItem(userId: string, productId: string): Promise<void> {
    await CartItemModel.remove(userId, productId);
  }

  /**
   * Clear cart
   */
  static async clearCart(userId: string): Promise<void> {
    await CartItemModel.clearCart(userId);
  }

  /**
   * Get cart count
   */
  static async getCartCount(userId: string): Promise<number> {
    return await CartItemModel.getCartCount(userId);
  }
}
