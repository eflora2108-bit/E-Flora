import { Request, Response, NextFunction } from 'express';
import { ReviewModel } from '../models/Review';
import { NotificationModel } from '../models/Notification';
import { ReviewStatus, NotificationType } from '../types';
import { AppError } from '../middleware/errorHandler';

export class ReviewController {
  // Create review
  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { product_id, rating, title, comment } = req.body;

      // Check if user can review this product
      const { can, orderId } = await ReviewModel.canUserReview(userId, product_id);
      if (!can) {
        throw new AppError('You can only review products you have purchased and received', 403);
      }

      const review = await ReviewModel.create({
        product_id,
        user_id: userId,
        order_id: orderId!,
        rating,
        title,
        comment,
      });

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully. It will be visible after moderation.',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get product reviews
  static async getProductReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { reviews, total } = await ReviewModel.findByProductId(productId, page, limit);
      const stats = await ReviewModel.getProductRatingStats(productId);

      res.json({
        success: true,
        data: {
          reviews,
          stats,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Check if user can review a product
  static async canReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { productId } = req.params;

      const result = await ReviewModel.canUserReview(userId, productId);

      res.json({
        success: true,
        data: {
          can: result.can,
          orderId: result.orderId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get my reviews
  static async getMyReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { reviews, total } = await ReviewModel.findByUserId(userId, page, limit);

      res.json({
        success: true,
        data: reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update review
  static async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const { rating, title, comment } = req.body;

      const review = await ReviewModel.findById(id);
      if (!review || review.user_id !== userId) {
        throw new AppError('Review not found', 404);
      }

      const updated = await ReviewModel.update(id, { rating, title, comment });

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete review
  static async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const review = await ReviewModel.findById(id);
      if (!review || review.user_id !== userId) {
        throw new AppError('Review not found', 404);
      }

      await ReviewModel.delete(id);

      res.json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark review as helpful
  static async markHelpful(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await ReviewModel.markHelpful(id, userId);

      res.json({
        success: true,
        message: 'Marked as helpful',
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get pending reviews
  static async getPendingReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { reviews, total } = await ReviewModel.findPending(page, limit);

      res.json({
        success: true,
        data: reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Approve review
  static async approveReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const moderatorId = req.user!.userId;

      const review = await ReviewModel.moderate(id, ReviewStatus.APPROVED, moderatorId);

      // Notify user
      await NotificationModel.create({
        user_id: review.user_id,
        type: NotificationType.REVIEW_APPROVED,
        title: 'Review Approved',
        message: 'Your product review has been approved and is now visible to others.',
        link: `/products/${review.product_id}`,
      });

      res.json({
        success: true,
        message: 'Review approved',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Reject review
  static async rejectReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const moderatorId = req.user!.userId;

      const review = await ReviewModel.moderate(id, ReviewStatus.REJECTED, moderatorId);

      // Notify user
      await NotificationModel.create({
        user_id: review.user_id,
        type: NotificationType.REVIEW_REJECTED,
        title: 'Review Rejected',
        message: 'Your product review did not meet our community guidelines.',
      });

      res.json({
        success: true,
        message: 'Review rejected',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
}
