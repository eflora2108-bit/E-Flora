import api, { getErrorMessage } from './api';
import { Category, ApiResponse } from '../types';

export const categoryService = {
  // Get all active categories
  async getAllActive(): Promise<Category[]> {
    try {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get category tree (hierarchical)
  async getCategoryTree(): Promise<Category[]> {
    try {
      const response = await api.get<ApiResponse<Category[]>>('/categories/tree');
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Admin: Get all categories (including inactive)
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await api.get<ApiResponse<Category[]>>('/admin/categories');
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Admin: Create category
  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    parent_id?: string;
  }): Promise<Category> {
    try {
      const response = await api.post<ApiResponse<Category>>('/admin/categories', data);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Admin: Update category
  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    try {
      const response = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Admin: Delete category
  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/admin/categories/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
