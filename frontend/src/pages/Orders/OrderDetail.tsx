import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { invoiceService } from '../../services/invoiceService';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const OrderDetailPage = () => {
  const { id: orderId } = useParams<{ id: string }>();
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
      toast.success('Order cancelled successfully');
      await fetchOrder(); // Refresh order
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
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
    return <LoadingSpinner fullPage text="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-500 text-lg mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="btn-primary"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const canCancel = order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order #{order.order_number}</h1>
            <p className="text-gray-500">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="btn-secondary"
          >
            &larr; Back to Orders
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Main Content */}
          <div>
            {/* Status Timeline */}
            <div className="bg-white rounded-xl p-8 mb-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>

              <div className="relative">
                {getStatusTimeline().map((item, index) => (
                  <div key={index} className={`flex ${index === getStatusTimeline().length - 1 ? '' : 'mb-8'}`}>
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center mr-4">
                      <div
                        className={`w-5 h-5 rounded-full border-[3px] ${
                          item.completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-gray-200 border-gray-200'
                        }`}
                      />
                      {index < getStatusTimeline().length - 1 && (
                        <div
                          className={`w-[3px] flex-1 min-h-[30px] ${
                            item.completed ? 'bg-emerald-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                    {/* Timeline content */}
                    <div className={`flex-1 ${index === getStatusTimeline().length - 1 ? '' : 'pb-4'}`}>
                      <div className={`font-semibold mb-1 ${item.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                        {item.status}
                      </div>
                      {item.date && (
                        <div className="text-sm text-gray-500">
                          {new Date(item.date).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {order.tracking_number && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
                  <strong>Tracking Number:</strong> {order.tracking_number}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items ({order.items?.length || 0})</h2>

              {order.items && order.items.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-2">{item.product_name}</div>
                        <div className="text-sm text-gray-500 mb-1">
                          SKU: {item.product_sku}
                        </div>
                        <div className="text-sm text-gray-500">
                          Quantity: {item.quantity} x ₹{Number(item.unit_price).toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900 mb-1">
                          ₹{Number(item.total_amount).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          (incl. GST ₹{Number(item.gst_amount).toFixed(2)})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No items found</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Order Summary */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

              <div className="mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">GST</span>
                  <span>₹{Number(order.gst_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Shipping</span>
                  <span>₹{Number(order.shipping_charges).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">₹{Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>

            {/* Payment & Status */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Payment & Status</h3>

              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Order Status</div>
                <StatusBadge status={order.status} size="md" />
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Payment Status</div>
                <StatusBadge status={order.payment_status} size="md" />
              </div>
            </div>

            {/* Invoice */}
            {order.payment_status === PaymentStatus.COMPLETED && (
              <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Invoice</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Download your GST-compliant invoice for this order
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate(`/invoices/order/${order.id}`)}
                    className="btn-primary w-full gap-2"
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
                          toast.error(err.message || 'Failed to download invoice');
                        });
                    }}
                    className="btn-secondary w-full gap-2"
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
                className="btn-danger w-full py-3"
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
