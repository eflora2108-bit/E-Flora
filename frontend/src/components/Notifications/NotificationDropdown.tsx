import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  CheckCheck,
  Trash2,
  Package,
  Star,
  ShoppingBag,
  AlertCircle,
  Info,
  X,
  Bell,
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { Notification, NotificationType } from '../../types';
import { toast } from 'react-hot-toast';

interface NotificationDropdownProps {
  onClose: () => void;
  onNotificationRead: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onClose,
  onNotificationRead,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(page, 10);
      if (page === 1) {
        setNotifications(data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...data.notifications]);
      }
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif))
      );
      onNotificationRead();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
      onNotificationRead();
      toast.success('All notifications marked as read');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      onNotificationRead();
      toast.success('Notification deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all notifications?')) {
      return;
    }

    try {
      await notificationService.deleteAll();
      setNotifications([]);
      onNotificationRead();
      toast.success('All notifications deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete all notifications');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ORDER_CONFIRMED:
      case NotificationType.ORDER_SHIPPED:
      case NotificationType.ORDER_DELIVERED:
      case NotificationType.ORDER_CANCELLED:
        return <Package className="w-5 h-5 text-blue-500" />;
      case NotificationType.PRODUCT_APPROVED:
      case NotificationType.PRODUCT_REJECTED:
        return <ShoppingBag className="w-5 h-5 text-green-500" />;
      case NotificationType.REVIEW_APPROVED:
      case NotificationType.REVIEW_REJECTED:
        return <Star className="w-5 h-5 text-yellow-500" />;
      case NotificationType.STOCK_ALERT:
      case NotificationType.LOW_STOCK_ALERT:
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-red-600 hover:text-red-700"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer relative
                  ${!notification.is_read ? 'bg-blue-50' : ''}
                `}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-start gap-1">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-700"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="p-1 text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {!notification.is_read && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="px-4 py-3 border-t border-gray-200">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading}
            className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
