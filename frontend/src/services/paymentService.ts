import api, { getErrorMessage } from './api';

export const paymentService = {
  // Initiate payment
  async initiatePayment(shippingAddressId: string, billingAddressId?: string, notes?: string): Promise<any> {
    try {
      const response = await api.post('/payments/initiate', {
        shipping_address_id: shippingAddressId,
        billing_address_id: billingAddressId,
        notes,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Verify payment
  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<any> {
    try {
      const response = await api.post('/payments/verify', {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Load Razorpay script
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },
};
