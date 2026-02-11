import api from './api';
import {
  Review,
  ReviewFormData,
  ReviewStats,
  ApiResponse,
} from '../types';

export const reviewService = {
  // Get product reviews
  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: Review[]; stats: ReviewStats; pagination: any }> {
    const response = await api.get<
      ApiResponse<{
        reviews: Review[];
        stats: ReviewStats;
        pagination: any;
      }>
    >(`/reviews/products/${productId}/reviews`, {
      params: { page, limit },
    });
    return response.data.data!;
  },

  // Check if user can review a product
  async canReview(productId: string): Promise<{ can: boolean; orderId?: string }> {
    const response = await api.get<
      ApiResponse<{ can: boolean; orderId?: string }>
    >(`/reviews/can-review/${productId}`);
    return response.data.data!;
  },

  // Create a review
  async createReview(data: ReviewFormData): Promise<Review> {
    const response = await api.post<ApiResponse<Review>>('/reviews', data);
    return response.data.data!;
  },

  // Get my reviews
  async getMyReviews(
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: Review[]; total: number; pagination: any }> {
    const response = await api.get<
      ApiResponse<{ reviews: Review[]; total: number; pagination: any }>
    >('/reviews/my-reviews', {
      params: { page, limit },
    });
    return response.data.data!;
  },

  // Update review
  async updateReview(id: string, data: Partial<ReviewFormData>): Promise<Review> {
    const response = await api.put<ApiResponse<Review>>(`/reviews/${id}`, data);
    return response.data.data!;
  },

  // Delete review
  async deleteReview(id: string): Promise<void> {
    await api.delete(`/reviews/${id}`);
  },

  // Mark review as helpful
  async markHelpful(id: string): Promise<void> {
    await api.post(`/reviews/${id}/helpful`);
  },

  // Admin: Get pending reviews
  async getPendingReviews(
    page: number = 1,
    limit: number = 20
  ): Promise<{ reviews: Review[]; total: number; pagination: any }> {
    const response = await api.get<
      ApiResponse<{ reviews: Review[]; total: number; pagination: any }>
    >('/admin/reviews/pending', {
      params: { page, limit },
    });
    return response.data.data!;
  },

  // Admin: Approve review
  async approveReview(id: string): Promise<void> {
    await api.post(`/admin/reviews/${id}/approve`);
  },

  // Admin: Reject review
  async rejectReview(id: string, reason: string): Promise<void> {
    await api.post(`/admin/reviews/${id}/reject`, { reason });
  },
};
