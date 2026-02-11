import { query } from '../config/database';
import { Notification, NotificationCreateInput, NotificationType } from '../types';

export class NotificationModel {
  // Create notification
  static async create(data: NotificationCreateInput): Promise<Notification> {
    const sql = `
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [data.user_id, data.type, data.title, data.message, data.link || null];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Get user notifications
  static async getByUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<{ notifications: Notification[]; total: number }> {
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = $1';
    if (unreadOnly) {
      whereClause += ' AND is_read = false';
    }

    const countSql = `SELECT COUNT(*) FROM notifications ${whereClause}`;
    const countResult = await query(countSql, [userId]);
    const total = parseInt(countResult.rows[0].count);

    const sql = `
      SELECT * FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [userId, limit, offset]);
    return { notifications: result.rows, total };
  }

  // Get unread count
  static async getUnreadCount(userId: string): Promise<number> {
    const sql = 'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false';
    const result = await query(sql, [userId]);
    return parseInt(result.rows[0].count);
  }

  // Mark as read
  static async markAsRead(id: string, userId: string): Promise<boolean> {
    const sql = `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await query(sql, [id, userId]);
    return result.rowCount! > 0;
  }

  // Mark all as read
  static async markAllAsRead(userId: string): Promise<number> {
    const sql = `
      UPDATE notifications
      SET is_read = true
      WHERE user_id = $1 AND is_read = false
      RETURNING id
    `;

    const result = await query(sql, [userId]);
    return result.rowCount!;
  }

  // Delete notification
  static async delete(id: string, userId: string): Promise<boolean> {
    const sql = 'DELETE FROM notifications WHERE id = $1 AND user_id = $2';
    const result = await query(sql, [id, userId]);
    return result.rowCount! > 0;
  }

  // Delete all notifications
  static async deleteAll(userId: string): Promise<number> {
    const sql = 'DELETE FROM notifications WHERE user_id = $1';
    const result = await query(sql, [userId]);
    return result.rowCount!;
  }

  // Create bulk notifications (for multiple users)
  static async createBulk(notifications: NotificationCreateInput[]): Promise<number> {
    if (notifications.length === 0) return 0;

    const values: any[] = [];
    const placeholders: string[] = [];
    let paramCount = 1;

    notifications.forEach((notif) => {
      placeholders.push(
        `($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${paramCount + 4})`
      );
      values.push(notif.user_id, notif.type, notif.title, notif.message, notif.link || null);
      paramCount += 5;
    });

    const sql = `
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES ${placeholders.join(', ')}
    `;

    const result = await query(sql, values);
    return result.rowCount!;
  }
}
