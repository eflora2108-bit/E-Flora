import api, { getErrorMessage } from './api';
import { Order, OrderStatus, ApiResponse } from '../types';

export const orderService = {
  // Get my orders
  async getMyOrders(status?: OrderStatus, page: number = 1, limit: number = 20): Promise<{ orders: Order[]; pagination: any }> {
    try {
      const params: any = { page, limit };
      if (status) params.status = status;

      const response = await api.get('/orders', { params });
      return {
        orders: response.data.data || [],
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get order details
  async getOrderDetails(orderId: string): Promise<Order> {
    try {
      const response = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Cancel order
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const response = await api.post<ApiResponse<Order>>(`/orders/${orderId}/cancel`);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
