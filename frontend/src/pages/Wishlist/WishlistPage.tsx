import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Bell, BellOff, X } from 'lucide-react';
import { wishlistService } from '../../services/wishlistService';
import { WishlistItem } from '../../types';
import { toast } from 'react-hot-toast';
import { useCart } from '../../contexts/CartContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';

const WishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      setRemovingIds((prev) => new Set([...prev, productId]));
      await wishlistService.removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((item) => item.product_id !== productId));
      toast.success('Removed from wishlist');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
    } finally {
      setRemovingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleToggleNotify = async (productId: string, currentNotify: boolean) => {
    try {
      await wishlistService.toggleNotify(productId, !currentNotify);
      setWishlist((prev) =>
        prev.map((item) =>
          item.product_id === productId
            ? { ...item, notify_on_stock: !currentNotify }
            : item
        )
      );
      toast.success(
        !currentNotify
          ? 'You will be notified when item is back in stock'
          : 'Stock notifications disabled'
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update notification preference');
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!item.is_active) {
      toast.error('This product is no longer available');
      return;
    }

    if (item.stock_quantity === 0) {
      toast.error('This product is out of stock');
      return;
    }

    try {
      await addToCart(item.product_id, 1);
      toast.success('Added to cart');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      await wishlistService.clearWishlist();
      setWishlist([]);
      toast.success('Wishlist cleared');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clear wishlist');
    }
  };

  const getImageUrl = (images?: string[]) => {
    if (!images || images.length === 0) {
      return '/placeholder-product.jpg';
    }
    return images[0];
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading wishlist..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              My Wishlist
            </h1>
            <p className="text-gray-500 mt-1">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          {wishlist.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm">
            <EmptyState
              icon={<Heart className="w-16 h-16 text-gray-300" />}
              title="Your wishlist is empty"
              description="Add products you love to your wishlist and keep track of them here"
              actionLabel="Browse Products"
              onAction={() => window.location.href = '/products'}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden card-hover relative animate-fade-in-up"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.product_id)}
                  disabled={removingIds.has(item.product_id)}
                  className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>

                {/* Product Image */}
                <Link to={`/products/${item.slug}`} className="block">
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={getImageUrl(item.images)}
                      alt={item.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                    {item.stock_quantity === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">Out of Stock</span>
                      </div>
                    )}
                    {!item.is_active && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">Unavailable</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/products/${item.slug}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mb-2">{item.category_name}</p>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{Number(item.price || 0).toFixed(2)}
                    </span>
                    {item.mrp && Number(item.mrp) > Number(item.price || 0) && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{Number(item.mrp).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Stock Notification Toggle */}
                  {item.stock_quantity === 0 && (
                    <button
                      onClick={() => handleToggleNotify(item.product_id, item.notify_on_stock)}
                      className={`
                        w-full mb-2 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors
                        ${
                          item.notify_on_stock
                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }
                      `}
                    >
                      {item.notify_on_stock ? (
                        <>
                          <Bell className="w-4 h-4 fill-current" />
                          <span>Notify On</span>
                        </>
                      ) : (
                        <>
                          <BellOff className="w-4 h-4" />
                          <span>Notify Me</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.is_active || item.stock_quantity === 0}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>
                      {item.stock_quantity === 0
                        ? 'Out of Stock'
                        : !item.is_active
                        ? 'Unavailable'
                        : 'Add to Cart'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
