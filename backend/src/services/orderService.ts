import { PoolClient } from 'pg';
import { transaction } from '../config/database';
import { OrderModel, OrderItemModel } from '../models/Order';
import { CartItemModel } from '../models/CartItem';
import { AddressModel } from '../models/Address';
import { InventoryService } from './inventoryService';
import { CartService } from './cartService';
import { PaymentService } from './paymentService';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { AppError } from '../middleware/errorHandler';

export class OrderService {
  /**
   * Create order from cart (called after payment initiation)
   * This prepares the order but doesn't confirm it yet
   */
  static async createOrderFromCart(
    userId: string,
    shippingAddressId: string,
    billingAddressId?: string,
    notes?: string
  ): Promise<Order> {
    // Get cart with totals
    const cart = await CartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Validate cart
    const validation = await CartService.validateCart(userId);
    if (!validation.valid) {
      throw new AppError(`Cart validation failed: ${validation.issues.join(', ')}`, 400);
    }

    // Verify shipping address exists and belongs to user
    const shippingAddress = await AddressModel.findById(shippingAddressId);
    if (!shippingAddress || shippingAddress.user_id !== userId) {
      throw new AppError('Invalid shipping address', 400);
    }

    // Calculate totals
    const subtotal = cart.summary.subtotal;
    const gstAmount = cart.summary.total_gst;
    const shippingCharges = subtotal >= 500 ? 0 : 50;
    const totalAmount = cart.summary.total + shippingCharges;

    // Generate order number
    const orderNumber = await OrderModel.generateOrderNumber();

    // Create Razorpay order
    const razorpayOrder = await PaymentService.createRazorpayOrder(totalAmount, orderNumber);

    // Create order in database
    const order = await OrderModel.create({
      order_number: orderNumber,
      user_id: userId,
      subtotal,
      gst_amount: gstAmount,
      shipping_charges: shippingCharges,
      total_amount: totalAmount,
      shipping_address_id: shippingAddressId,
      billing_address_id: billingAddressId,
      razorpay_order_id: razorpayOrder.id,
      notes,
    });

    return order;
  }

  /**
   * Confirm order after successful payment
   * This is the critical transaction that:
   * 1. Verifies payment
   * 2. Creates order items
   * 3. Deducts stock
   * 4. Clears cart
   * All within a database transaction for safety
   */
  static async confirmOrder(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<Order> {
    // Verify payment signature
    const isValid = PaymentService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      throw new AppError('Invalid payment signature', 400);
    }

    // Find order
    const order = await OrderModel.findByRazorpayOrderId(razorpayOrderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.payment_status === PaymentStatus.COMPLETED) {
      throw new AppError('Order already confirmed', 400);
    }

    // Get cart items
    const cart = await CartService.getCart(order.user_id);

    if (cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Process order confirmation within transaction
    return transaction(async (client: PoolClient) => {
      // Update order status
      const sql = `
        UPDATE orders
        SET status = $1,
            payment_status = $2,
            payment_method = $3,
            razorpay_payment_id = $4,
            razorpay_signature = $5,
            updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `;
      const result = await client.query(sql, [
        OrderStatus.CONFIRMED,
        PaymentStatus.COMPLETED,
        'razorpay',
        razorpayPaymentId,
        razorpaySignature,
        order.id,
      ]);
      const updatedOrder = result.rows[0];

      // Create order items
      const orderItems = cart.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        supplier_id: item.supplier_id!,
        product_name: item.name!,
        product_sku: item.sku!,
        quantity: item.quantity,
        unit_price: item.price!,
        gst_percentage: item.gst_percentage!,
        gst_amount: item.gst_amount!,
        total_amount: item.total_with_gst!,
      }));

      // Insert order items
      const itemsInsertValues: any[] = [];
      const itemsPlaceholders: string[] = [];
      let paramCount = 1;

      orderItems.forEach((item) => {
        itemsPlaceholders.push(
          `($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${paramCount + 4}, $${paramCount + 5}, $${paramCount + 6}, $${paramCount + 7}, $${paramCount + 8}, $${paramCount + 9})`
        );
        itemsInsertValues.push(
          item.order_id,
          item.product_id,
          item.supplier_id,
          item.product_name,
          item.product_sku,
          item.quantity,
          item.unit_price,
          item.gst_percentage,
          item.gst_amount,
          item.total_amount
        );
        paramCount += 10;
      });

      const itemsSql = `
        INSERT INTO order_items (
          order_id, product_id, supplier_id, product_name, product_sku,
          quantity, unit_price, gst_percentage, gst_amount, total_amount
        )
        VALUES ${itemsPlaceholders.join(', ')}
      `;
      await client.query(itemsSql, itemsInsertValues);

      // Deduct stock
      const stockItems = cart.items.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
      }));
      await InventoryService.deductStock(stockItems, order.id, client);

      // Clear cart
      await client.query('DELETE FROM cart_items WHERE user_id = $1', [order.user_id]);

      return updatedOrder;
    });
  }

  /**
   * Get order details with items
   */
  static async getOrderDetails(orderId: string, userId?: string): Promise<any> {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // If userId provided, verify ownership
    if (userId && order.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const items = await OrderItemModel.getByOrderId(orderId);

    return {
      ...order,
      items,
    };
  }

  /**
   * Cancel order (only if not shipped)
   */
  static async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new AppError('Cannot cancel shipped or delivered order', 400);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new AppError('Order already cancelled', 400);
    }

    return transaction(async (client: PoolClient) => {
      // Update order status
      const sql = `
        UPDATE orders
        SET status = $1, cancelled_at = NOW(), updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      const result = await client.query(sql, [OrderStatus.CANCELLED, orderId]);
      const cancelledOrder = result.rows[0];

      // Restore stock if payment was completed
      if (order.payment_status === PaymentStatus.COMPLETED) {
        const items = await OrderItemModel.getByOrderId(orderId);
        const stockItems = items.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
        }));
        await InventoryService.restoreStock(stockItems, orderId);

        // Initiate refund if paid
        if (order.razorpay_payment_id) {
          await PaymentService.initiateRefund(order.razorpay_payment_id, order.total_amount);
        }
      }

      return cancelledOrder;
    });
  }
}
