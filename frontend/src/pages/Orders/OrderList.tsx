import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Calendar, CreditCard, Truck, ShoppingBag } from 'lucide-react';

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

  if (!isAuthenticated) {
    return null;
  }

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusIcons: Record<string, JSX.Element> = {
    pending: <Package className="w-4 h-4" />,
    confirmed: <ShoppingBag className="w-4 h-4" />,
    shipped: <Truck className="w-4 h-4" />,
    delivered: <ChevronRight className="w-4 h-4" />,
    cancelled: <ChevronRight className="w-4 h-4" />,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-primary-700 via-primary-600 to-emerald-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-6 right-24 text-6xl animate-float">📦</div>
          <div className="absolute bottom-4 left-16 text-5xl animate-float stagger-2">🛍️</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-white/80" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">My Orders</h1>
            </div>
            <p className="text-white/80 text-lg">
              Track and manage your plant orders
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

        {/* Order Stats Summary */}
        {orders.length > 0 && !statusFilter && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{orders.length}</span>
              </div>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{statusCounts['pending'] || 0}</span>
              </div>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{statusCounts['shipped'] || 0}</span>
              </div>
              <p className="text-sm text-gray-500">Shipped</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <ChevronRight className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{statusCounts['delivered'] || 0}</span>
              </div>
              <p className="text-sm text-gray-500">Delivered</p>
            </div>
          </motion.div>
        )}

        {/* Status Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6"
        >
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter(undefined)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                !statusFilter
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All Orders
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${!statusFilter ? 'bg-white/20' : 'bg-gray-100'}`}>
                {orders.length}
              </span>
            </button>
            {Object.values(OrderStatus).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {statusIcons[status]}
                {status}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Orders List */}
        {loading ? (
          <LoadingSpinner text="Loading your orders..." />
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <EmptyState
              icon={<span className="text-6xl">📦</span>}
              title="No orders found"
              description={statusFilter ? `No ${statusFilter} orders right now` : "You haven't placed any orders yet. Start shopping to see your orders here!"}
              actionLabel="Browse Plants"
              onAction={() => navigate('/products')}
            />
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left - Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            #{order.order_number}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(order.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" />
                              <span className="capitalize">{order.payment_status}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {order.tracking_number && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Truck className="w-4 h-4 text-primary-500" />
                          <span className="text-gray-500">Tracking:</span>
                          <span className="font-mono font-semibold text-gray-700">{order.tracking_number}</span>
                        </div>
                      )}
                    </div>

                    {/* Right - Status & Amount */}
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                      <StatusBadge status={order.status} size="md" />
                      <div className="text-2xl font-bold text-gray-900">
                        Rs.{Number(order.total_amount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="h-1 bg-gradient-to-r from-primary-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
