import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';

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
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ marginBottom: '1rem', color: '#10b981' }}>Order Placed Successfully!</h1>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
            Thank you for your order. We've received your payment and will process your order soon.
          </p>

          {order && (
            <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Order Number:</strong> {order.order_number}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Order Total:</strong> ₹{Number(order.total_amount).toFixed(2)}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                  }}
                >
                  {order.status}
                </span>
              </div>
            </div>
          )}

          <div style={{ background: '#e7f3ff', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
            <strong>What's Next?</strong>
            <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', lineHeight: '2' }}>
              <li>You'll receive an order confirmation email shortly</li>
              <li>We'll notify you when your order is shipped</li>
              <li>Track your order status in "My Orders"</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/orders')}
              style={{
                padding: '0.875rem 2rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '0.875rem 2rem',
                background: 'transparent',
                color: '#667eea',
                border: '1px solid #667eea',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
