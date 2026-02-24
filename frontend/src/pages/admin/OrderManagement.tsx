import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable } from '../../components/ui/DataTable';

export const OrderManagementPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: OrderStatus.CONFIRMED,
    tracking_number: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await api.get('/orders/admin/all', { params });
      setOrders(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    setLoading(true);
    setError('');
    try {
      await api.put(`/orders/admin/${selectedOrder.id}/status`, updateData);
      setShowUpdateModal(false);
      setSelectedOrder(null);
      setUpdateData({ status: OrderStatus.CONFIRMED, tracking_number: '' });
      await fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      tracking_number: order.tracking_number || '',
    });
    setShowUpdateModal(true);
  };

  const filterButtons = [
    { label: 'All Orders', value: undefined },
    ...Object.values(OrderStatus).map((s) => ({ label: s, value: s })),
  ];

  const orderColumns = [
    {
      key: 'order_number',
      header: 'Order Number',
      render: (order: Order) => (
        <span className="font-semibold text-gray-900">{order.order_number}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (order: Order) => (
        <span className="text-sm text-gray-500">
          {new Date(order.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'user_id',
      header: 'Customer',
      render: (order: Order) => (
        <span className="text-sm text-gray-500">
          User ID: {order.user_id.substring(0, 8)}...
        </span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (order: Order) => (
        <span className="font-bold text-gray-900">₹{Number(order.total_amount).toFixed(2)}</span>
      ),
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (order: Order) => <StatusBadge status={order.payment_status} size="sm" />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => <StatusBadge status={order.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order: Order) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openUpdateModal(order);
          }}
          className="btn-primary text-xs px-3 py-1.5"
        >
          Update Status
        </button>
      ),
    },
  ];

  return (
    <AdminLayout title="Order Management" subtitle="Manage all customer orders">
      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {/* Status Filter */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={() => setStatusFilter(btn.value as OrderStatus | undefined)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                statusFilter === btn.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        {loading ? (
          <LoadingSpinner text="Loading orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<span className="text-5xl">📦</span>}
            title="No orders found"
            description={statusFilter ? `No ${statusFilter} orders` : 'No orders in the system'}
          />
        ) : (
          <DataTable columns={orderColumns} data={orders} emptyMessage="No orders found" />
        )}
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={showUpdateModal && !!selectedOrder}
        onClose={() => setShowUpdateModal(false)}
        title="Update Order Status"
      >
        <p className="text-gray-500 mb-6">
          Order: <strong className="text-gray-900">{selectedOrder?.order_number}</strong>
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={updateData.status}
            onChange={(e) =>
              setUpdateData({ ...updateData, status: e.target.value as OrderStatus })
            }
            className="input-base"
          >
            {Object.values(OrderStatus).map((status) => (
              <option key={status} value={status} className="capitalize">
                {status}
              </option>
            ))}
          </select>
        </div>

        {updateData.status === OrderStatus.SHIPPED && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tracking Number
            </label>
            <input
              type="text"
              value={updateData.tracking_number}
              onChange={(e) =>
                setUpdateData({ ...updateData, tracking_number: e.target.value })
              }
              placeholder="Enter tracking number"
              className="input-base"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setShowUpdateModal(false)}
            className="btn-ghost flex-1 border border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Updating...' : 'Update Order'}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
};
