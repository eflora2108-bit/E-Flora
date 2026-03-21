import api, { getErrorMessage } from './api';
import { NotificationResponse, ApiResponse } from '../types';

export const notificationService = {
  // Get notifications
  async getNotifications(
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<NotificationResponse> {
    try {
      const response = await api.get<any>('/notifications', {
        params: { page, limit, unreadOnly },
      });

      const payload = response.data;

      // Supports both shapes:
      // 1) { data: { notifications, unreadCount, pagination } }
      // 2) { data: Notification[], unreadCount, pagination }
      const nested = payload?.data;
      const notifications = Array.isArray(nested)
        ? nested
        : Array.isArray(nested?.notifications)
        ? nested.notifications
        : [];

      const unreadCount = Number(
        nested?.unreadCount ?? payload?.unreadCount ?? 0
      );

      const pagination = nested?.pagination ?? payload?.pagination ?? {
        page,
        limit,
        total: notifications.length,
        totalPages: 1,
      };

      return {
        notifications,
        unreadCount,
        pagination,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
      return response.data.data?.count ?? 0;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Mark as read
  async markAsRead(id: string): Promise<void> {
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    try {
      await api.put('/notifications/read-all');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Delete all notifications
  async deleteAll(): Promise<void> {
    try {
      await api.delete('/notifications');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
