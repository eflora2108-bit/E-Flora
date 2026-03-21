import React, { useEffect, useState } from 'react';
import { cartService } from '../../services/cartService';
import { Cart } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';

// Admin view: List all user carts with basic details
export const CartsOverviewPage: React.FC = () => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    setLoading(true);
    setError('');
    try {
      // Admin endpoint to fetch all carts. Backend must support this route.
      const data = await cartService.getAllCarts();
      setCarts(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load carts');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (userId: string) => {
    setExpandedUser((prev) => (prev === userId ? null : userId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Cart Overview</h1>
        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
        {loading ? (
          <LoadingSpinner text="Loading carts..." />
        ) : (
          <div className="space-y-4">
            {carts.length === 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">No carts available.</div>
            )}
            {carts.map((cart) => (
              <div key={cart?.items?.[0]?.user_id ?? 'cart'} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">👤</span>
                    <strong>{cart?.items?.[0]?.name || 'User Cart'}</strong>
                  </div>
                  <button onClick={() => toggleExpand(cart?.items?.[0]?.user_id || '')} className="text-sm text-primary-600">
                    {expandedUser ? 'Hide' : 'View'} Details
                  </button>
                </div>
                {expandedUser && (
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cart.items.map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">🌱</div>
                        <div className="flex-1">
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                          <div className="text-xs text-gray-500">Price: ₹{Number(item.price || 0).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartsOverviewPage;
