import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import ReviewList from '../../components/Reviews/ReviewList';
import WriteReview from '../../components/Reviews/WriteReview';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Heart } from 'lucide-react';
import { wishlistService } from '../../services/wishlistService';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    if (!slug) return;

    setLoading(true);
    setError('');
    try {
      const data = await productService.getBySlug(slug);
      setProduct(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.id, quantity);
      toast.success(`${quantity} x ${product.name} added to cart!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      setWishlistLoading(true);
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(product.id);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(product.id);
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }
    setIsWriteReviewOpen(true);
  };

  const handleReviewSuccess = () => {
    setReviewRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading product..." />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-500 text-lg mb-4">
            {error || 'Product not found'}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const hasImages = images.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <span onClick={() => navigate('/')} className="cursor-pointer text-primary-600 hover:text-primary-700 transition-colors">
              Home
            </span>
            <span>/</span>
            <span onClick={() => navigate('/products')} className="cursor-pointer text-primary-600 hover:text-primary-700 transition-colors">
              Products
            </span>
            <span>/</span>
            <span className="text-gray-700">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 animate-fade-in-up">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Images Section */}
            <div>
              {/* Main Image */}
              <div
                className="h-96 rounded-xl mb-4 flex items-center justify-center text-white text-7xl bg-contain bg-center bg-no-repeat"
                style={
                  hasImages
                    ? { backgroundImage: `url(http://localhost:5000${images[selectedImage]})`, backgroundColor: '#f9fafb' }
                    : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
                }
              >
                {!hasImages && '🌱'}
              </div>

              {/* Thumbnail Gallery */}
              {hasImages && images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg cursor-pointer bg-cover bg-center transition-all ${
                        selectedImage === index
                          ? 'border-[3px] border-primary-500 shadow-md'
                          : 'border border-gray-200 hover:border-primary-300'
                      }`}
                      style={{ backgroundImage: `url(http://localhost:5000${image})` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div>
              <div className="mb-2 text-primary-600 font-semibold text-sm">
                {product.category?.name}
              </div>

              <h1 className="mb-4 text-3xl font-bold text-gray-900">{product.name}</h1>

              <div className="mb-6">
                <div className="flex items-baseline gap-4 mb-2">
                  <div className="text-4xl font-bold text-primary-600">
                    ₹{Number(product.price).toFixed(2)}
                  </div>
                  {product.mrp && Number(product.mrp) > Number(product.price) && (
                    <>
                      <div className="text-lg text-gray-400 line-through">
                        ₹{Number(product.mrp).toFixed(2)}
                      </div>
                      <div className="text-base font-semibold text-emerald-500">
                        {Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100)}% OFF
                      </div>
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  (Inclusive of all taxes &bull; GST: {product.gst_percentage}%)
                </div>
              </div>

              {/* Stock Status */}
              <div
                className={`p-3 rounded-lg mb-6 font-semibold ${
                  product.stock_quantity > 0
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {product.stock_quantity > 0
                  ? `✓ In Stock (${product.stock_quantity} available)`
                  : '✕ Out of Stock'}
              </div>

              {/* Quantity Selector */}
              {product.stock_quantity > 0 && (
                <div className="mb-6">
                  <label className="block mb-2 font-semibold text-gray-700">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity((q) => Math.max(product.min_order_quantity, q - 1))}
                      className="w-10 h-10 bg-gray-100 border-none rounded-lg cursor-pointer text-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(
                            product.min_order_quantity,
                            Math.min(product.stock_quantity, parseInt(e.target.value) || 1)
                          )
                        )
                      }
                      min={product.min_order_quantity}
                      max={product.stock_quantity}
                      className="w-20 py-2 text-center border border-gray-300 rounded-lg text-lg input-base"
                    />
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                      className="w-10 h-10 bg-gray-100 border-none rounded-lg cursor-pointer text-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      +
                    </button>
                    <span className="ml-4 text-gray-500 text-sm">
                      Min order: {product.min_order_quantity}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className={`flex-1 py-3 rounded-lg font-bold text-lg text-white transition-all ${
                    product.stock_quantity === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg cursor-pointer'
                  }`}
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`p-3 rounded-lg font-semibold cursor-pointer flex items-center justify-center transition-all border-2 ${
                    isInWishlist
                      ? 'bg-red-50 text-red-500 border-red-500 hover:bg-red-100'
                      : 'bg-white text-primary-600 border-primary-500 hover:bg-primary-50'
                  } disabled:opacity-50`}
                >
                  <Heart className="w-6 h-6" fill={isInWishlist ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Product Details */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="mb-4 font-semibold text-gray-900">Product Details</h3>

                <div className="grid gap-3 text-sm">
                  <div className="flex">
                    <span className="font-semibold w-32 text-gray-700">SKU:</span>
                    <span className="text-gray-500">{product.sku}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-32 text-gray-700">Supplier:</span>
                    <span className="text-gray-500">{product.supplier?.business_name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Care Instructions */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            {product.description && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Description</h2>
                <div className="leading-relaxed text-gray-600">{product.description}</div>
              </div>
            )}

            {product.care_instructions && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900">Care Instructions</h2>
                <div className="p-6 bg-blue-50 rounded-lg leading-relaxed text-gray-600">
                  {product.care_instructions}
                </div>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
              {isAuthenticated && (
                <button
                  onClick={handleWriteReview}
                  className="btn-primary"
                >
                  Write a Review
                </button>
              )}
            </div>
            <ReviewList key={reviewRefreshKey} productId={product.id} />
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      {product && (
        <WriteReview
          productId={product.id}
          productName={product.name}
          isOpen={isWriteReviewOpen}
          onClose={() => setIsWriteReviewOpen(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};
