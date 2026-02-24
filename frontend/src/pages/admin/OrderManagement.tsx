import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Order, OrderStatus } from '../../types';

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

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>📦 Order Management</h1>
          <p style={{ color: '#666' }}>Manage all customer orders</p>
        </div>

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

        {/* Orders Table */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem 0' }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
              <h2 style={{ marginBottom: '1rem' }}>No orders found</h2>
              <p style={{ color: '#666' }}>
                {statusFilter ? `No ${statusFilter} orders` : 'No orders in the system'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Order Number</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Customer</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Total</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Payment</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>{order.order_number}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
                        User ID: {order.user_id.substring(0, 8)}...
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '700' }}>₹{Number(order.total_amount).toFixed(2)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: order.payment_status === 'completed' ? '#10b98120' : '#f59e0b20',
                            color: order.payment_status === 'completed' ? '#10b981' : '#f59e0b',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                          }}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: getStatusColor(order.status) + '20',
                            color: getStatusColor(order.status),
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => openUpdateModal(order)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Update Status Modal */}
        {showUpdateModal && selectedOrder && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowUpdateModal(false)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '1rem' }}>Update Order Status</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Order: <strong>{selectedOrder.order_number}</strong>
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value as OrderStatus })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                >
                  {Object.values(OrderStatus).map((status) => (
                    <option key={status} value={status} style={{ textTransform: 'capitalize' }}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {updateData.status === OrderStatus.SHIPPED && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={updateData.tracking_number}
                    onChange={(e) => setUpdateData({ ...updateData, tracking_number: e.target.value })}
                    placeholder="Enter tracking number"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'transparent',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: loading ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Updating...' : 'Update Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
