import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = (location.state as any)?.orderId;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrderDetails(orderId);
      setOrder(data);
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading order details..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="text-7xl mb-4 animate-bounce-in">✅</div>
          <h1 className="text-3xl font-bold text-emerald-500 mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-500 mb-8">
            Thank you for your order. We've received your payment and will process your order soon.
          </p>

          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left animate-fade-in">
              <div className="mb-4">
                <strong className="text-gray-700">Order Number:</strong>{' '}
                <span className="text-gray-900">{order.order_number}</span>
              </div>
              <div className="mb-4">
                <strong className="text-gray-700">Order Total:</strong>{' '}
                <span className="text-gray-900 font-semibold">₹{Number(order.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <strong className="text-gray-700">Status:</strong>
                <StatusBadge status={order.status} size="md" />
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <strong className="text-gray-800">What's Next?</strong>
            <ul className="mt-3 pl-6 leading-8 text-gray-600 list-disc">
              <li>You'll receive an order confirmation email shortly</li>
              <li>We'll notify you when your order is shipped</li>
              <li>Track your order status in "My Orders"</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/orders')}
              className="btn-primary px-8 py-3"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/products')}
              className="btn-secondary px-8 py-3"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
