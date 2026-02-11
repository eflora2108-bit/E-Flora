import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';

export const OrderListPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const { orders: data } = await orderService.getMyOrders(statusFilter);
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      [OrderStatus.PENDING]: '#f59e0b',
      [OrderStatus.CONFIRMED]: '#3b82f6',
      [OrderStatus.PROCESSING]: '#8b5cf6',
      [OrderStatus.SHIPPED]: '#10b981',
      [OrderStatus.DELIVERED]: '#059669',
      [OrderStatus.CANCELLED]: '#ef4444',
      [OrderStatus.RETURNED]: '#ef4444',
    };
    return colors[status] || '#666';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>📦 My Orders</h1>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee', color: '#c33', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        {/* Status Filter */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setStatusFilter(undefined)}
              style={{
                padding: '0.5rem 1rem',
                background: !statusFilter ? '#667eea' : 'transparent',
                color: !statusFilter ? 'white' : '#666',
                border: !statusFilter ? 'none' : '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              All Orders
            </button>
            {Object.values(OrderStatus).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.5rem 1rem',
                  background: statusFilter === status ? '#667eea' : 'transparent',
                  color: statusFilter === status ? 'white' : '#666',
                  border: statusFilter === status ? 'none' : '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem 0' }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
              <h2 style={{ marginBottom: '1rem' }}>No orders found</h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                {statusFilter ? `No ${statusFilter} orders` : "You haven't placed any orders yet"}
              </p>
              <button
                onClick={() => navigate('/products')}
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
                Start Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Order #{order.order_number}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.5rem 1rem',
                        background: getStatusColor(order.status) + '20',
                        color: getStatusColor(order.status),
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                      }}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                        Payment: <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{order.payment_status}</span>
                      </div>
                      {order.tracking_number && (
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          Tracking: <strong>{order.tracking_number}</strong>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
                      ₹{order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
