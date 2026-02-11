import api from './api';
import { Notification, NotificationResponse, ApiResponse } from '../types';

export const notificationService = {
  // Get notifications
  async getNotifications(
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<NotificationResponse> {
    const response = await api.get<ApiResponse<NotificationResponse>>('/notifications', {
      params: { page, limit, unreadOnly },
    });
    return response.data.data!;
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data.data!.count;
  },

  // Mark as read
  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  },

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  // Delete all notifications
  async deleteAll(): Promise<void> {
    await api.delete('/notifications');
  },
};
