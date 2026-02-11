import React, { useState, useEffect } from 'react';
import { ThumbsUp, CheckCircle } from 'lucide-react';
import StarRating from './StarRating';
import { Review, ReviewStats } from '../../types';
import { reviewService } from '../../services/reviewService';
import { toast } from 'react-hot-toast';

interface ReviewListProps {
  productId: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReviews();
  }, [productId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getProductReviews(productId, page, 10);
      setReviews(data.reviews);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (helpfulReviews.has(reviewId)) {
      return; // Already marked helpful
    }

    try {
      await reviewService.markHelpful(reviewId);
      setHelpfulReviews((prev) => new Set([...prev, reviewId]));
      // Update the helpful count locally
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? { ...review, helpful_count: review.helpful_count + 1 }
            : review
        )
      );
      toast.success('Thank you for your feedback!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark as helpful');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">
                {stats.average_rating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(stats.average_rating)} readonly size="lg" />
              <div className="text-sm text-gray-600 mt-2">
                {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.rating_distribution[star] || 0;
                const percentage =
                  stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;

                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-12">
                      {star} star
                    </span>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No reviews yet. Be the first to review this product!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {review.user_name || 'Anonymous'}
                    </span>
                    {review.verified_purchase && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>
                <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
              </div>

              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              )}

              {review.comment && <p className="text-gray-700 mb-3">{review.comment}</p>}

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  disabled={helpfulReviews.has(review.id)}
                  className={`
                    flex items-center gap-1 text-sm
                    ${
                      helpfulReviews.has(review.id)
                        ? 'text-green-600 cursor-default'
                        : 'text-gray-600 hover:text-green-600'
                    }
                    transition-colors
                  `}
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${helpfulReviews.has(review.id) ? 'fill-current' : ''}`}
                  />
                  <span>
                    Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
