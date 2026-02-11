import { query } from '../config/database';
import { Review, ReviewCreateInput, ReviewUpdateInput, ReviewStatus } from '../types';

export class ReviewModel {
  // Create review
  static async create(data: ReviewCreateInput): Promise<Review> {
    const sql = `
      INSERT INTO reviews (
        product_id, user_id, order_id, rating, title, comment, status, verified_purchase
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *
    `;

    const values = [
      data.product_id,
      data.user_id,
      data.order_id,
      data.rating,
      data.title || null,
      data.comment || null,
      ReviewStatus.PENDING,
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Get review by ID
  static async findById(id: string): Promise<Review | null> {
    const sql = 'SELECT * FROM reviews WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Get reviews by product ID
  static async findByProductId(
    productId: string,
    page: number = 1,
    limit: number = 10,
    status: ReviewStatus = ReviewStatus.APPROVED
  ): Promise<{ reviews: Review[]; total: number }> {
    const offset = (page - 1) * limit;

    const countSql = 'SELECT COUNT(*) FROM reviews WHERE product_id = $1 AND status = $2';
    const countResult = await query(countSql, [productId, status]);
    const total = parseInt(countResult.rows[0].count);

    const sql = `
      SELECT r.*, u.first_name, u.last_name, u.email
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.status = $2
      ORDER BY r.created_at DESC
      LIMIT $3 OFFSET $4
    `;

    const result = await query(sql, [productId, status, limit, offset]);
    return { reviews: result.rows, total };
  }

  // Get reviews by user ID
  static async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: Review[]; total: number }> {
    const offset = (page - 1) * limit;

    const countSql = 'SELECT COUNT(*) FROM reviews WHERE user_id = $1';
    const countResult = await query(countSql, [userId]);
    const total = parseInt(countResult.rows[0].count);

    const sql = `
      SELECT r.*, p.name as product_name, p.slug as product_slug
      FROM reviews r
      INNER JOIN products p ON r.product_id = p.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [userId, limit, offset]);
    return { reviews: result.rows, total };
  }

  // Get pending reviews (admin)
  static async findPending(
    page: number = 1,
    limit: number = 20
  ): Promise<{ reviews: Review[]; total: number }> {
    const offset = (page - 1) * limit;

    const countSql = 'SELECT COUNT(*) FROM reviews WHERE status = $1';
    const countResult = await query(countSql, [ReviewStatus.PENDING]);
    const total = parseInt(countResult.rows[0].count);

    const sql = `
      SELECT r.*,
             u.first_name, u.last_name, u.email,
             p.name as product_name, p.slug as product_slug
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN products p ON r.product_id = p.id
      WHERE r.status = $1
      ORDER BY r.created_at ASC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [ReviewStatus.PENDING, limit, offset]);
    return { reviews: result.rows, total };
  }

  // Update review
  static async update(id: string, data: ReviewUpdateInput): Promise<Review> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.rating !== undefined) {
      fields.push(`rating = $${paramCount++}`);
      values.push(data.rating);
    }
    if (data.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.comment !== undefined) {
      fields.push(`comment = $${paramCount++}`);
      values.push(data.comment);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE reviews
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Moderate review (approve/reject)
  static async moderate(id: string, status: ReviewStatus, moderatorId: string): Promise<Review> {
    const sql = `
      UPDATE reviews
      SET status = $1,
          moderated_by = $2,
          moderated_at = NOW(),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(sql, [status, moderatorId, id]);
    return result.rows[0];
  }

  // Delete review
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM reviews WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rowCount! > 0;
  }

  // Mark review as helpful
  static async markHelpful(reviewId: string, userId: string): Promise<boolean> {
    try {
      // Add helpful vote
      const voteSql = `
        INSERT INTO review_helpful_votes (review_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (review_id, user_id) DO NOTHING
      `;
      await query(voteSql, [reviewId, userId]);

      // Update helpful count
      const countSql = `
        UPDATE reviews
        SET helpful_count = (
          SELECT COUNT(*) FROM review_helpful_votes WHERE review_id = $1
        )
        WHERE id = $1
      `;
      await query(countSql, [reviewId]);

      return true;
    } catch (error) {
      return false;
    }
  }

  // Remove helpful vote
  static async removeHelpful(reviewId: string, userId: string): Promise<boolean> {
    try {
      // Remove helpful vote
      const voteSql = 'DELETE FROM review_helpful_votes WHERE review_id = $1 AND user_id = $2';
      await query(voteSql, [reviewId, userId]);

      // Update helpful count
      const countSql = `
        UPDATE reviews
        SET helpful_count = (
          SELECT COUNT(*) FROM review_helpful_votes WHERE review_id = $1
        )
        WHERE id = $1
      `;
      await query(countSql, [reviewId]);

      return true;
    } catch (error) {
      return false;
    }
  }

  // Get product rating stats
  static async getProductRatingStats(productId: string): Promise<any> {
    const sql = `
      SELECT
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews
      WHERE product_id = $1 AND status = $2
    `;

    const result = await query(sql, [productId, ReviewStatus.APPROVED]);
    const stats = result.rows[0];

    return {
      totalReviews: parseInt(stats.total_reviews),
      averageRating: parseFloat(stats.average_rating).toFixed(1),
      fiveStar: parseInt(stats.five_star),
      fourStar: parseInt(stats.four_star),
      threeStar: parseInt(stats.three_star),
      twoStar: parseInt(stats.two_star),
      oneStar: parseInt(stats.one_star),
    };
  }

  // Check if user can review product (must have purchased)
  static async canUserReview(userId: string, productId: string): Promise<{ can: boolean; orderId?: string }> {
    const sql = `
      SELECT DISTINCT o.id as order_id
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
        AND oi.product_id = $2
        AND o.payment_status = 'completed'
        AND o.status IN ('delivered', 'completed')
        AND NOT EXISTS (
          SELECT 1 FROM reviews r
          WHERE r.user_id = $1 AND r.product_id = $2 AND r.order_id = o.id
        )
      LIMIT 1
    `;

    const result = await query(sql, [userId, productId]);

    if (result.rows.length > 0) {
      return { can: true, orderId: result.rows[0].order_id };
    }

    return { can: false };
  }
}
