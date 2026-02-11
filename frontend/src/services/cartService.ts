import api, { getErrorMessage } from './api';
import { Cart, ApiResponse } from '../types';

export const cartService = {
  // Add item to cart
  async addToCart(productId: string, quantity: number): Promise<any> {
    try {
      const response = await api.post('/cart', {
        product_id: productId,
        quantity,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get cart
  async getCart(): Promise<Cart> {
    try {
      const response = await api.get<ApiResponse<Cart>>('/cart');
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Update cart item quantity
  async updateQuantity(productId: string, quantity: number): Promise<any> {
    try {
      const response = await api.put(`/cart/${productId}`, { quantity });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Remove item from cart
  async removeItem(productId: string): Promise<void> {
    try {
      await api.delete(`/cart/${productId}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Clear cart
  async clearCart(): Promise<void> {
    try {
      await api.delete('/cart');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Validate cart
  async validateCart(): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const response = await api.post('/cart/validate');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get cart count
  async getCartCount(): Promise<number> {
    try {
      const response = await api.get('/cart/count');
      return response.data.data.count;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
