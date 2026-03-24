import api, { getErrorMessage } from './api';
import { Product, ProductFormData, ApiResponse } from '../types';

export const productService = {
  // Public: Get all approved products with filters
  async getPublicProducts(params?: {
    category_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; pagination: any }> {
    try {
      const response = await api.get('/products', { params });
      return {
        products: response.data.data || [],
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Public: Get product by slug
  async getBySlug(slug: string): Promise<Product> {
    try {
      const response = await api.get<ApiResponse<Product>>(`/products/${slug}`);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Supplier: Create product
  async createProduct(data: ProductFormData): Promise<Product> {
    try {
      const response = await api.post<ApiResponse<Product>>('/products', data);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Supplier: Get my products
  async getMyProducts(params?: {
    moderation_status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; pagination: any }> {
    try {
      const response = await api.get('/products/my-products', { params });
      return {
        products: response.data.data || [],
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Supplier: Update product
  async updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
    try {
      const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Supplier: Upload product images
  async uploadImages(productId: string, files: FileList | File[]): Promise<Product> {
    try {
      const formData = new FormData();
      const list = Array.isArray(files) ? files : Array.from(files);
      list.forEach((file) => {
        formData.append('images', file);
      });

      const response = await api.post<ApiResponse<Product>>(
        `/products/${productId}/images`,
        formData
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Supplier: Update product images (for removal)
  async updateProductImages(id: string, images: any[]): Promise<Product> {
    try {
      const response = await api.put<ApiResponse<Product>>(`/products/${id}`, { images });
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Supplier: Delete product
  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Admin: Get pending products
  async getPendingProducts(page: number = 1, limit: number = 20): Promise<any> {
    try {
      const response = await api.get('/admin/products/pending', {
        params: { page, limit },
      });
      return {
        products: response.data.data || [],
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Admin: Approve product
  async approveProduct(id: string): Promise<Product> {
    try {
      const response = await api.post<ApiResponse<Product>>(`/admin/products/${id}/approve`);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Admin: Reject product
  async rejectProduct(id: string, reason: string): Promise<Product> {
    try {
      const response = await api.post<ApiResponse<Product>>(`/admin/products/${id}/reject`, {
        reason,
      });
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Admin: Get product statistics
  async getProductStats(): Promise<any> {
    try {
      const response = await api.get('/admin/products/stats');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
