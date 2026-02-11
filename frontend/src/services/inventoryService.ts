import api, { getErrorMessage } from './api';
import { Product, InventoryLog, InventoryStats, InventoryChangeType, ApiResponse } from '../types';

export const inventoryService = {
  // Adjust stock manually
  async adjustStock(
    productId: string,
    quantityChange: number,
    changeType: InventoryChangeType,
    notes?: string
  ): Promise<Product> {
    try {
      const response = await api.post<ApiResponse<Product>>(
        `/inventory/products/${productId}/adjust`,
        {
          quantity_change: quantityChange,
          change_type: changeType,
          notes,
        }
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get inventory logs for a specific product
  async getProductLogs(
    productId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ logs: InventoryLog[]; pagination: any }> {
    try {
      const response = await api.get(`/inventory/products/${productId}/logs`, {
        params: { page, limit },
      });
      return {
        logs: response.data.data || [],
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get all inventory logs for supplier
  async getSupplierLogs(
    page: number = 1,
    limit: number = 50
  ): Promise<{ logs: InventoryLog[]; pagination: any }> {
    try {
      const response = await api.get('/inventory/logs', {
        params: { page, limit },
      });
      return {
        logs: response.data.data || [],
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get low stock products
  async getLowStockProducts(): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>('/inventory/low-stock');
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get inventory statistics
  async getInventoryStats(): Promise<InventoryStats> {
    try {
      const response = await api.get<ApiResponse<InventoryStats>>('/inventory/stats');
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Check stock availability
  async checkAvailability(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<{ available: boolean; issues: string[] }> {
    try {
      const response = await api.post('/inventory/check-availability', { items });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
