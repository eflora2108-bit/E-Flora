import api, { getErrorMessage } from './api';
import { Supplier, SupplierProfileData, ApiResponse } from '../types';

export const supplierService = {
  // Create supplier profile
  async createProfile(data: SupplierProfileData): Promise<Supplier> {
    try {
      const response = await api.post<ApiResponse<Supplier>>('/suppliers/profile', data);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get supplier profile
  async getProfile(): Promise<Supplier> {
    try {
      const response = await api.get<ApiResponse<Supplier>>('/suppliers/profile');
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Update supplier profile
  async updateProfile(data: Partial<SupplierProfileData>): Promise<Supplier> {
    try {
      const response = await api.put<ApiResponse<Supplier>>('/suppliers/profile', data);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Upload verification documents
  async uploadDocuments(files: FileList): Promise<Supplier> {
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('documents', file);
      });

      const response = await api.post<ApiResponse<Supplier>>(
        '/suppliers/documents',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get verification status
  async getVerificationStatus(): Promise<any> {
    try {
      const response = await api.get('/suppliers/verification-status');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
