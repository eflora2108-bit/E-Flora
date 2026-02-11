import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { PaymentService } from '../services/paymentService';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class PaymentController {
  /**
   * Initiate payment
   * POST /api/v1/payments/initiate
   */
  static async initiatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { shipping_address_id, billing_address_id, notes } = req.body;

      if (!shipping_address_id) {
        throw new AppError('Shipping address is required', 400);
      }

      // Create order (this also creates Razorpay order)
      const order = await OrderService.createOrderFromCart(
        userId,
        shipping_address_id,
        billing_address_id,
        notes
      );

      res.status(200).json({
        success: true,
        message: 'Payment initiated',
        data: {
          order_id: order.id,
          order_number: order.order_number,
          razorpay_order_id: order.razorpay_order_id,
          amount: order.total_amount,
          currency: 'INR',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify payment (client-side callback)
   * POST /api/v1/payments/verify
   */
  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new AppError('Missing payment parameters', 400);
      }

      // Confirm order with payment details
      const order = await OrderService.confirmOrder(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          order_id: order.id,
          order_number: order.order_number,
          status: order.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Razorpay webhook handler
   * POST /api/v1/payments/webhook
   * NOTE: This endpoint should NOT have authentication middleware
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const webhookSignature = req.headers['x-razorpay-signature'] as string;
      const webhookBody = JSON.stringify(req.body);

      // Verify webhook signature
      const isValid = PaymentService.verifyWebhookSignature(webhookBody, webhookSignature);

      if (!isValid) {
        logger.warn('Invalid webhook signature received');
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }

      const event = req.body.event;
      const payload = req.body.payload;

      logger.info(`Razorpay webhook received: ${event}`);

      switch (event) {
        case 'payment.captured':
        case 'payment.authorized':
          // Payment successful
          const { order_id, id: payment_id } = payload.payment.entity;

          try {
            // Note: Webhook doesn't have signature from client-side
            // We've already verified the webhook signature
            // For webhooks, we'll update the order directly
            logger.info(`Processing payment success for order: ${order_id}`);

            // In production, you might want to:
            // 1. Find the order by razorpay_order_id
            // 2. Verify it hasn't been processed already
            // 3. Process the order (deduct stock, etc.)
            // This is a backup to the client-side verification
          } catch (error: any) {
            logger.error(`Webhook processing error: ${error.message}`);
          }
          break;

        case 'payment.failed':
          // Payment failed
          logger.info(`Payment failed for order: ${payload.payment.entity.order_id}`);
          // Could update order status to failed
          break;

        default:
          logger.info(`Unhandled webhook event: ${event}`);
      }

      // Always return 200 to Razorpay to acknowledge receipt
      res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error(`Webhook error: ${error.message}`);
      // Still return 200 to avoid Razorpay retries
      res.status(200).json({ success: false });
    }
  }
}
