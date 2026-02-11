import api from './api';
import { WishlistItem, ApiResponse } from '../types';

export const wishlistService = {
  // Get my wishlist
  async getWishlist(): Promise<WishlistItem[]> {
    const response = await api.get<ApiResponse<WishlistItem[]>>('/wishlist');
    return response.data.data!;
  },

  // Add to wishlist
  async addToWishlist(productId: string, notifyOnStock: boolean = false): Promise<WishlistItem> {
    const response = await api.post<ApiResponse<WishlistItem>>('/wishlist', {
      product_id: productId,
      notify_on_stock: notifyOnStock,
    });
    return response.data.data!;
  },

  // Remove from wishlist
  async removeFromWishlist(productId: string): Promise<void> {
    await api.delete(`/wishlist/${productId}`);
  },

  // Toggle stock notification
  async toggleNotify(productId: string, notify: boolean): Promise<void> {
    await api.put(`/wishlist/${productId}/notify`, { notify });
  },

  // Clear wishlist
  async clearWishlist(): Promise<void> {
    await api.delete('/wishlist');
  },

  // Check if product is in wishlist
  async isInWishlist(productId: string, wishlist: WishlistItem[]): boolean {
    return wishlist.some((item) => item.product_id === productId);
  },
};
