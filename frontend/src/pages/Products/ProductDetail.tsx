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

type PotType = 'round' | 'square';
type PotSize = 'small' | 'medium' | 'large';

const POT_PRICING: Record<PotType, Record<PotSize, number>> = {
  round: {
    small: 40,
    medium: 80,
    large: 130,
  },
  square: {
    small: 50,
    medium: 95,
    large: 150,
  },
};

const SOIL_PRICE_PER_100_GM = 30;

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
  const [addPot, setAddPot] = useState(false);
  const [potType, setPotType] = useState<PotType>('round');
  const [potSize, setPotSize] = useState<PotSize>('small');
  const [extraSoil, setExtraSoil] = useState(false);
  const [soilQuantity, setSoilQuantity] = useState(100);

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
      setQuantity(data.min_order_quantity || 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const { addToCart } = useCart();

  const potUnitPrice = addPot ? POT_PRICING[potType][potSize] : 0;
  const baseUnitPrice = Number(product?.price || 0);
  const customizedUnitPrice = baseUnitPrice + potUnitPrice;
  const productTotal = customizedUnitPrice * quantity;
  const soilTotal = extraSoil ? (soilQuantity / 100) * SOIL_PRICE_PER_100_GM : 0;
  const grandTotal = productTotal + soilTotal;

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.id, quantity);
      toast.success(
        `${quantity} x ${product.name} added to cart. ${addPot ? `Pot: ${potType} ${potSize}. ` : ''}Total: ₹${grandTotal.toFixed(2)}`
      );
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
                <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <label className="block mb-3 font-semibold text-gray-800">Quantity</label>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(product.min_order_quantity, q - 1))}
                      className="w-11 h-11 rounded-xl bg-gray-100 text-xl font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
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
                      className="w-24 py-2.5 text-center border border-gray-300 rounded-xl text-lg font-semibold"
                    />
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                      className="w-11 h-11 rounded-xl bg-gray-100 text-xl font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      +
                    </button>
                    <span className="ml-1 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                      Min order: {product.min_order_quantity}
                    </span>
                  </div>
                </div>
              )}

              {/* Pot Customization */}
              {product.stock_quantity > 0 && (
                <div className="mb-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-gray-800">Pot Options</h3>
                    <button
                      type="button"
                      onClick={() => setAddPot((v) => !v)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        addPot ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle pot option"
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          addPot ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">Choose pot shape and size to style your plant.</p>

                  <div className={`${!addPot ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pot Type</label>
                      <div className="grid grid-cols-2 gap-2">
                      {(['round', 'square'] as PotType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setPotType(type)}
                          disabled={!addPot}
                          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize ${
                            potType === type
                              ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pot Size</label>
                      <div className="grid grid-cols-3 gap-2">
                      {(['small', 'medium', 'large'] as PotSize[]).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setPotSize(size)}
                          disabled={!addPot}
                          className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize ${
                            potSize === size
                              ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                          }`}
                        >
                          <div>{size}</div>
                          <div className={`text-xs ${potSize === size ? 'text-white/90' : 'text-gray-500'}`}>
                            +₹{POT_PRICING[potType][size]}
                          </div>
                        </button>
                      ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Extra Soil */}
              {product.stock_quantity > 0 && (
                <div className="mb-6 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">Extra Soil</h3>
                      <p className="text-sm text-gray-600">100 gm = ₹30</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExtraSoil((v) => !v)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        extraSoil ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle extra soil"
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          extraSoil ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {extraSoil && (
                    <div className="mt-4 rounded-xl bg-white border border-amber-100 p-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>100 gm</span>
                        <span>2000 gm</span>
                      </div>
                      <input
                        type="range"
                        min={100}
                        max={2000}
                        step={100}
                        value={soilQuantity}
                        onChange={(e) => setSoilQuantity(parseInt(e.target.value, 10))}
                        className="w-full"
                      />
                      <div className="mt-3 flex items-center justify-between">
                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                          {soilQuantity} gm
                        </span>
                        <span className="text-sm font-semibold text-gray-700">+₹{soilTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              {product.stock_quantity > 0 && (
                <div className="mb-6 rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50 to-emerald-50 p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3">Price Summary</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Plant ({quantity} x ₹{baseUnitPrice.toFixed(2)})</span>
                      <span>₹{(baseUnitPrice * quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pot {addPot ? `(${potType}, ${potSize})` : '(not selected)'}</span>
                      <span>₹{(potUnitPrice * quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Extra soil</span>
                      <span>₹{soilTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-primary-700 pt-2 mt-2 border-t border-primary-200">
                      <span>Grand Total</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
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
