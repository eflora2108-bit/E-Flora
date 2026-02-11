import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { invoiceService } from '../../services/invoiceService';
import { Order, OrderStatus, PaymentStatus } from '../../types';

export const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (orderId) {
      fetchOrder();
    }
  }, [isAuthenticated, orderId]);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrderDetails(orderId!);
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      await orderService.cancelOrder(orderId!);
      await fetchOrder(); // Refresh order
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCancelling(false);
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

  const getStatusTimeline = () => {
    if (!order) return [];

    const timeline = [
      { status: 'Ordered', date: order.created_at, completed: true },
      { status: 'Confirmed', date: order.created_at, completed: order.status !== OrderStatus.PENDING },
      { status: 'Shipped', date: order.shipped_at, completed: order.shipped_at !== null },
      { status: 'Delivered', date: order.delivered_at, completed: order.delivered_at !== null },
    ];

    if (order.status === OrderStatus.CANCELLED) {
      return [
        { status: 'Ordered', date: order.created_at, completed: true },
        { status: 'Cancelled', date: order.cancelled_at, completed: true },
      ];
    }

    return timeline;
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '1rem' }}>{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/orders')}
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
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const canCancel = order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>Order #{order.order_number}</h1>
            <p style={{ color: '#666' }}>Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              color: '#667eea',
              border: '1px solid #667eea',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            ← Back to Orders
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Main Content */}
          <div>
            {/* Status Timeline */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Order Status</h2>

              <div style={{ position: 'relative' }}>
                {getStatusTimeline().map((item, index) => (
                  <div key={index} style={{ display: 'flex', marginBottom: index === getStatusTimeline().length - 1 ? 0 : '2rem' }}>
                    {/* Timeline dot and line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '1rem' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: item.completed ? '#10b981' : '#e0e0e0',
                          border: item.completed ? '3px solid #10b981' : '3px solid #e0e0e0',
                        }}
                      />
                      {index < getStatusTimeline().length - 1 && (
                        <div
                          style={{
                            width: '3px',
                            flex: 1,
                            background: item.completed ? '#10b981' : '#e0e0e0',
                            minHeight: '30px',
                          }}
                        />
                      )}
                    </div>
                    {/* Timeline content */}
                    <div style={{ flex: 1, paddingBottom: index === getStatusTimeline().length - 1 ? 0 : '1rem' }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: item.completed ? '#000' : '#999' }}>
                        {item.status}
                      </div>
                      {item.date && (
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          {new Date(item.date).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {order.tracking_number && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f8ff', borderRadius: '8px' }}>
                  <strong>Tracking Number:</strong> {order.tracking_number}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Order Items ({order.items?.length || 0})</h2>

              {order.items && order.items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{item.product_name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                          SKU: {item.product_sku}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          Quantity: {item.quantity} × ₹{item.unit_price.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                          ₹{item.total_amount.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          (incl. GST ₹{item.gst_amount.toFixed(2)})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666' }}>No items found</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Order Summary */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Order Summary</h3>

              <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666' }}>Subtotal</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666' }}>GST</span>
                  <span>₹{order.gst_amount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666' }}>Shipping</span>
                  <span>₹{order.shipping_charges.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700' }}>
                <span>Total</span>
                <span style={{ color: '#667eea' }}>₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment & Status */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Payment & Status</h3>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Order Status</div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: getStatusColor(order.status) + '20',
                    color: getStatusColor(order.status),
                    borderRadius: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}
                >
                  {order.status}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Payment Status</div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: order.payment_status === PaymentStatus.COMPLETED ? '#10b98120' : '#f59e0b20',
                    color: order.payment_status === PaymentStatus.COMPLETED ? '#10b981' : '#f59e0b',
                    borderRadius: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}
                >
                  {order.payment_status}
                </span>
              </div>
            </div>

            {/* Invoice */}
            {order.payment_status === PaymentStatus.COMPLETED && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Invoice</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  Download your GST-compliant invoice for this order
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    onClick={() => navigate(`/invoices/order/${order.id}`)}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>📄</span>
                    <span>View Invoice</span>
                  </button>
                  <button
                    onClick={() => {
                      // Get invoice and download
                      invoiceService.getInvoiceByOrderId(order.id)
                        .then((invoice) => {
                          invoiceService.downloadInvoice(invoice.id);
                        })
                        .catch((err) => {
                          alert(err.message || 'Failed to download invoice');
                        });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: 'transparent',
                      color: '#667eea',
                      border: '1px solid #667eea',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>📥</span>
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: cancelling ? '#ccc' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                }}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
