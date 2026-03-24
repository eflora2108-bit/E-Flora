import { Request, Response, NextFunction } from 'express';
import { NotificationModel } from '../models/Notification';

export class NotificationController {
  // Get my notifications
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';

      const { notifications, total } = await NotificationModel.getByUser(userId, page, limit, unreadOnly);
      const unreadCount = await NotificationModel.getUnreadCount(userId);

      res.json({
        success: true,
        data: notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      // Gracefully degrade on DB connectivity errors
      if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNRESET' || error?.errno === -3008) {
        return res.json({ success: true, data: [], unreadCount: 0, pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
      }
      return next(error);
    }
  }

  // Get unread count
  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const count = await NotificationModel.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error: any) {
      // Return 0 count gracefully on transient DB errors
      if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNRESET' || error?.errno === -3008) {
        return res.json({ success: true, data: { count: 0 } });
      }
      return next(error);
    }
  }

  // Mark as read
  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await NotificationModel.markAsRead(id, userId);

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark all as read
  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const count = await NotificationModel.markAllAsRead(userId);

      res.json({
        success: true,
        message: `${count} notifications marked as read`,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete notification
  static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await NotificationModel.delete(id, userId);

      res.json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete all notifications
  static async deleteAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const count = await NotificationModel.deleteAll(userId);

      res.json({
        success: true,
        message: `${count} notifications deleted`,
      });
    } catch (error) {
      next(error);
    }
  }
}
