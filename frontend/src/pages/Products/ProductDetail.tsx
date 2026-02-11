import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import ReviewList from '../../components/Reviews/ReviewList';
import WriteReview from '../../components/Reviews/WriteReview';
import { useAuth } from '../../contexts/AuthContext';
import { Heart } from 'lucide-react';
import { wishlistService } from '../../services/wishlistService';
import { toast } from 'react-hot-toast';

export const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
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

  const handleAddToCart = () => {
    if (!product) return;
    // Cart functionality will be implemented in Phase 6
    alert(`Added ${quantity} x ${product.name} to cart!`);
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
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666', fontSize: '1.2rem' }}>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '1rem' }}>
            {error || 'Product not found'}
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
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
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #e0e0e0', padding: '1rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#667eea' }}>
              Home
            </span>
            {' / '}
            <span onClick={() => navigate('/products')} style={{ cursor: 'pointer', color: '#667eea' }}>
              Products
            </span>
            {' / '}
            <span>{product.name}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            {/* Images Section */}
            <div>
              {/* Main Image */}
              <div
                style={{
                  height: '400px',
                  background: hasImages
                    ? `url(http://localhost:5000${images[selectedImage]}) center/contain no-repeat`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '5rem',
                }}
              >
                {!hasImages && '🌱'}
              </div>

              {/* Thumbnail Gallery */}
              {hasImages && images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      style={{
                        width: '80px',
                        height: '80px',
                        background: `url(http://localhost:5000${image}) center/cover`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: selectedImage === index ? '3px solid #667eea' : '1px solid #e0e0e0',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div>
              <div style={{ marginBottom: '0.5rem', color: '#667eea', fontWeight: '600' }}>
                {product.category?.name}
              </div>

              <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>{product.name}</h1>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea' }}>
                    ₹{product.price.toFixed(2)}
                  </div>
                  {product.mrp && product.mrp > product.price && (
                    <>
                      <div style={{ fontSize: '1.2rem', color: '#999', textDecoration: 'line-through' }}>
                        ₹{product.mrp.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#10b981' }}>
                        {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                      </div>
                    </>
                  )}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  (Inclusive of all taxes • GST: {product.gst_percentage}%)
                </div>
              </div>

              {/* Stock Status */}
              <div
                style={{
                  padding: '0.75rem',
                  background: product.stock_quantity > 0 ? '#d1fae5' : '#fee',
                  color: product.stock_quantity > 0 ? '#065f46' : '#c33',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontWeight: '600',
                }}
              >
                {product.stock_quantity > 0
                  ? `✓ In Stock (${product.stock_quantity} available)`
                  : '✕ Out of Stock'}
              </div>

              {/* Quantity Selector */}
              {product.stock_quantity > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Quantity</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => setQuantity((q) => Math.max(product.min_order_quantity, q - 1))}
                      style={{
                        width: '40px',
                        height: '40px',
                        background: '#f0f0f0',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                      }}
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
                      style={{
                        width: '80px',
                        padding: '0.5rem',
                        textAlign: 'center',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '1.1rem',
                      }}
                    />
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                      style={{
                        width: '40px',
                        height: '40px',
                        background: '#f0f0f0',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                      }}
                    >
                      +
                    </button>
                    <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.9rem' }}>
                      Min order: {product.min_order_quantity}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: product.stock_quantity === 0 ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    cursor: product.stock_quantity === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  style={{
                    padding: '1rem',
                    background: isInWishlist ? '#fee' : 'white',
                    color: isInWishlist ? '#c33' : '#667eea',
                    border: `2px solid ${isInWishlist ? '#c33' : '#667eea'}`,
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Heart style={{ width: '24px', height: '24px', fill: isInWishlist ? '#c33' : 'none' }} />
                </button>
              </div>

              {/* Product Details */}
              <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Product Details</h3>

                <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex' }}>
                    <span style={{ fontWeight: '600', width: '120px' }}>SKU:</span>
                    <span style={{ color: '#666' }}>{product.sku}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ fontWeight: '600', width: '120px' }}>Supplier:</span>
                    <span style={{ color: '#666' }}>{product.supplier?.business_name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Care Instructions */}
          <div style={{ marginTop: '3rem', borderTop: '1px solid #e0e0e0', paddingTop: '2rem' }}>
            {product.description && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Description</h2>
                <div style={{ lineHeight: '1.8', color: '#444' }}>{product.description}</div>
              </div>
            )}

            {product.care_instructions && (
              <div>
                <h2 style={{ marginBottom: '1rem' }}>🌱 Care Instructions</h2>
                <div
                  style={{
                    padding: '1.5rem',
                    background: '#f0f8ff',
                    borderRadius: '8px',
                    lineHeight: '1.8',
                    color: '#444',
                  }}
                >
                  {product.care_instructions}
                </div>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div style={{ marginTop: '3rem', borderTop: '1px solid #e0e0e0', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Customer Reviews</h2>
              {isAuthenticated && (
                <button
                  onClick={handleWriteReview}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
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
