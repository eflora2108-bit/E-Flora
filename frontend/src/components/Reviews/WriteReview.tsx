import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import StarRating from './StarRating';
import { reviewService } from '../../services/reviewService';
import { ReviewFormData } from '../../types';
import { toast } from 'react-hot-toast';

interface WriteReviewProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WriteReview: React.FC<WriteReviewProps> = ({
  productId,
  productName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState<{ can: boolean; orderId?: string }>({
    can: false,
  });
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkReviewEligibility();
    }
  }, [isOpen, productId]);

  const checkReviewEligibility = async () => {
    try {
      setCheckingEligibility(true);
      const result = await reviewService.canReview(productId);
      setCanReview(result);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to check review eligibility');
      setCanReview({ can: false });
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    if (!canReview.orderId) {
      toast.error('Cannot submit review without a verified purchase');
      return;
    }

    try {
      setLoading(true);

      const data: ReviewFormData = {
        product_id: productId,
        order_id: canReview.orderId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      };

      await reviewService.createReview(data);
      toast.success('Review submitted! It will be visible after admin approval.');
      handleClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setTitle('');
    setComment('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {checkingEligibility ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : !canReview.can ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                You need to purchase and receive this product before you can write a review.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{productName}</h3>
                <p className="text-sm text-gray-600">
                  Share your experience with this product
                </p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <StarRating rating={rating} onChange={setRating} size="lg" />
                {rating > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Review Title (Optional)
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder="Summarize your experience"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">{title.length}/100 characters</p>
              </div>

              {/* Comment */}
              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Review (Optional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  rows={6}
                  placeholder="Tell us what you liked or didn't like about this product..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">{comment.length}/1000 characters</p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || rating === 0}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Your review will be published after admin approval
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default WriteReview;
