import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { SupplierLayout } from '../../components/layout/SupplierLayout';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';

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
    <SupplierLayout title="My Orders" subtitle="Orders containing your products">
      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        {loading ? (
          <LoadingSpinner text="Loading orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<span className="text-5xl">📦</span>}
            title="No orders yet"
            description="Orders containing your products will appear here"
          />
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="font-semibold text-gray-900 mb-0.5">
                      Order #{order.order_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      Placed on {new Date(order.order_date).toLocaleDateString()}
                    </div>
                  </div>
                  <StatusBadge status={order.order_status} size="md" />
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">
                    Your Products in This Order:
                  </h4>
                  <div className="flex flex-col gap-3">
                    {order.items.map((item: SupplierOrderItem) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start p-4 bg-gray-50 rounded-xl"
                      >
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">
                            {item.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {item.product_sku} &bull; Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            ₹{Number(item.total_amount).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            (incl. GST ₹{Number(item.gst_amount).toFixed(2)})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fulfillment Actions */}
                  {order.order_status === 'confirmed' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                      <div className="text-sm font-semibold text-blue-800 mb-1">
                        Ready to Ship
                      </div>
                      <div className="text-sm text-blue-600">
                        Contact admin to mark this order as shipped with tracking details
                      </div>
                    </div>
                  )}

                  {order.order_status === 'shipped' && (
                    <div className="mt-4 p-4 bg-emerald-50 rounded-xl">
                      <div className="text-sm font-semibold text-emerald-800">
                        Shipped
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SupplierLayout>
  );
};
