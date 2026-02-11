import api, { getErrorMessage } from './api';
import { Address, AddressFormData, AddressType, ApiResponse } from '../types';

export const addressService = {
  // Create address
  async createAddress(data: AddressFormData): Promise<Address> {
    try {
      const response = await api.post<ApiResponse<Address>>('/addresses', data);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get all addresses
  async getAllAddresses(): Promise<Address[]> {
    try {
      const response = await api.get<ApiResponse<Address[]>>('/addresses');
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get addresses by type
  async getAddressesByType(type: AddressType): Promise<Address[]> {
    try {
      const response = await api.get<ApiResponse<Address[]>>(`/addresses/type/${type}`);
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get single address
  async getAddressById(id: string): Promise<Address> {
    try {
      const response = await api.get<ApiResponse<Address>>(`/addresses/${id}`);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Update address
  async updateAddress(id: string, data: Partial<AddressFormData>): Promise<Address> {
    try {
      const response = await api.put<ApiResponse<Address>>(`/addresses/${id}`, data);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Set default address
  async setDefault(id: string): Promise<Address> {
    try {
      const response = await api.put<ApiResponse<Address>>(`/addresses/${id}/default`);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Delete address
  async deleteAddress(id: string): Promise<void> {
    try {
      await api.delete(`/addresses/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
