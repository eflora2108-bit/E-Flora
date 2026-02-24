import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface SupplierOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  gst_amount: number;
  total_amount: number;
  order_number: string;
  order_status: string;
  order_date: string;
}

export const SupplierOrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const [orderItems, setOrderItems] = useState<SupplierOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/orders/supplier/orders');
      setOrderItems(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#10b981',
      delivered: '#059669',
      cancelled: '#ef4444',
      returned: '#ef4444',
    };
    return colors[status.toLowerCase()] || '#666';
  };

  // Group order items by order
  const groupedOrders = orderItems.reduce((acc, item) => {
    if (!acc[item.order_id]) {
      acc[item.order_id] = {
        order_id: item.order_id,
        order_number: item.order_number,
        order_status: item.order_status,
        order_date: item.order_date,
        items: [],
      };
    }
    acc[item.order_id].items.push(item);
    return acc;
  }, {} as { [key: string]: any });

  const orders = Object.values(groupedOrders);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>📦 My Orders</h1>
          <p style={{ color: '#666' }}>Orders containing your products</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee', color: '#c33', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem 0' }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
              <h2 style={{ marginBottom: '1rem' }}>No orders yet</h2>
              <p style={{ color: '#666' }}>Orders containing your products will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Order Header */}
                  <div
                    style={{
                      padding: '1rem 1.5rem',
                      background: '#f9f9f9',
                      borderBottom: '1px solid #e0e0e0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        Order #{order.order_number}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        Placed on {new Date(order.order_date).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.5rem 1rem',
                        background: getStatusColor(order.order_status) + '20',
                        color: getStatusColor(order.order_status),
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                      }}
                    >
                      {order.order_status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div style={{ padding: '1.5rem' }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>Your Products in This Order:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {order.items.map((item: SupplierOrderItem) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.75rem',
                            background: '#f9f9f9',
                            borderRadius: '6px',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.product_name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              SKU: {item.product_sku} • Qty: {item.quantity}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '700' }}>₹{Number(item.total_amount).toFixed(2)}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              (incl. GST ₹{Number(item.gst_amount).toFixed(2)})
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Fulfillment Actions */}
                    {order.order_status === 'confirmed' && (
                      <div style={{ marginTop: '1rem', padding: '1rem', background: '#e7f3ff', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                          ✓ Ready to Ship
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          Contact admin to mark this order as shipped with tracking details
                        </div>
                      </div>
                    )}

                    {order.order_status === 'shipped' && (
                      <div style={{ marginTop: '1rem', padding: '1rem', background: '#d1fae5', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#065f46' }}>
                          ✓ Shipped
                        </div>
                      </div>
                    )}
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
