import api, { getErrorMessage } from './api';

export const checkoutService = {
  // Validate checkout
  async validateCheckout(shippingAddressId: string): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const response = await api.post('/checkout/validate', {
        shipping_address_id: shippingAddressId,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Calculate order totals
  async calculateTotals(shippingAddressId: string): Promise<any> {
    try {
      const response = await api.post('/checkout/calculate', {
        shipping_address_id: shippingAddressId,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
