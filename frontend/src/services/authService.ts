import api, { getErrorMessage } from './api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ApiResponse,
} from '../types';

export const authService = {
  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Login user
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Logout (client-side)
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of server response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Update profile
  async updateProfile(data: { first_name?: string; last_name?: string; phone?: string }): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>('/auth/profile', data);
      return response.data.data!;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    try {
      await api.post('/auth/verify-email', { token });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Resend verification email
  async resendVerification(email: string): Promise<void> {
    try {
      await api.post('/auth/resend-verification', { email });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Request password reset
  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Change password (authenticated)
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
