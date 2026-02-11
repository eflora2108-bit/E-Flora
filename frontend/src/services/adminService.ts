import api, { getErrorMessage } from './api';
import { Supplier, ApiResponse } from '../types';

export const adminService = {
  // Get all suppliers
  async getAllSuppliers(
    params?: {
      verification_status?: string;
      state?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ suppliers: Supplier[]; pagination: any }> {
    try {
      const response = await api.get('/admin/suppliers', { params });
      return {
        suppliers: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get pending suppliers
  async getPendingSuppliers(page: number = 1, limit: number = 20): Promise<any> {
    try {
      const response = await api.get('/admin/suppliers/pending', {
        params: { page, limit },
      });
      return {
        suppliers: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get supplier details
  async getSupplierDetails(id: string): Promise<Supplier> {
    try {
      const response = await api.get<ApiResponse<Supplier>>(`/admin/suppliers/${id}`);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Approve supplier
  async approveSupplier(id: string): Promise<Supplier> {
    try {
      const response = await api.post<ApiResponse<Supplier>>(`/admin/suppliers/${id}/approve`);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Reject supplier
  async rejectSupplier(id: string, reason: string): Promise<Supplier> {
    try {
      const response = await api.post<ApiResponse<Supplier>>(`/admin/suppliers/${id}/reject`, {
        reason,
      });
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get supplier statistics
  async getSupplierStats(): Promise<any> {
    try {
      const response = await api.get('/admin/suppliers/stats');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
