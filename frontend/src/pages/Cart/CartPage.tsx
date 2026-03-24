import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { resolveImageUrl } from '../../utils/image';

export const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, loading, error, updateQuantity, removeItem, refreshCart } = useCart();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    refreshCart();
  }, [isAuthenticated]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      await updateQuantity(productId, newQuantity);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (productId: string) => {
    if (!window.confirm('Remove this item from cart?')) return;
    try {
      await removeItem(productId);
      toast.success('Item removed from cart');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove item');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {error && <ErrorAlert message={error} />}

        {loading && !cart ? (
          <LoadingSpinner text="Loading cart..." />
        ) : !cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm animate-fade-in-up">
            <EmptyState
              icon={<span className="text-5xl">🛒</span>}
              title="Your cart is empty"
              description="Add some plants to get started!"
              actionLabel="Browse Products"
              onAction={() => navigate('/products')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Items ({cart.items.length})</h2>

              <div className="flex flex-col gap-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[100px_1fr_auto] gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    {/* Product Image */}
                    <div
                      className="w-[100px] h-[100px] rounded-lg flex items-center justify-center text-white text-3xl bg-cover bg-center"
                      style={
                        item.images && item.images[0]
                          ? { backgroundImage: `url(${resolveImageUrl(item.images[0])})` }
                          : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
                      }
                    >
                      {(!item.images || item.images.length === 0) && '🌱'}
                    </div>

                    {/* Product Info */}
                    <div>
                      <h3 className="mb-2 font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        SKU: {item.sku}
                      </p>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-bold text-primary-600">
                          ₹{Number(item.price || 0).toFixed(2)}
                        </span>
                        {item.mrp && Number(item.mrp) > Number(item.price || 0) && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{Number(item.mrp).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          disabled={loading}
                          className="w-8 h-8 bg-gray-100 border-none rounded cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          disabled={loading || item.quantity >= (item.stock_quantity || 0)}
                          className="w-8 h-8 bg-gray-100 border-none rounded cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemove(item.product_id)}
                          disabled={loading}
                          className="ml-4 px-3 py-1.5 bg-transparent text-red-500 border border-red-500 rounded cursor-pointer text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        ₹{Number(item.total_with_gst || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        (incl. GST ₹{Number(item.gst_amount || 0).toFixed(2)})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold">₹{Number(cart.summary.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">GST</span>
                    <span className="font-semibold">₹{Number(cart.summary.total_gst).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-semibold text-emerald-500">
                      {cart.summary.subtotal >= 500 ? 'FREE' : '₹50.00'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mb-6 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">
                    ₹{(Number(cart.summary.total) + (cart.summary.subtotal >= 500 ? 0 : 50)).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-bold text-lg text-white transition-all ${
                    loading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg cursor-pointer'
                  }`}
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full mt-3 py-3 bg-transparent text-primary-600 border border-primary-500 rounded-lg font-semibold cursor-pointer hover:bg-primary-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
