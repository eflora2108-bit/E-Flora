import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [metricsData, trendData] = await Promise.all([
        analyticsService.getDashboardMetrics(),
        analyticsService.getRevenueTrend(30),
      ]);
      setMetrics(metricsData);
      setRevenueTrend(trendData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '8px' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>📊 Admin Dashboard</h1>
          <p style={{ color: '#666' }}>Overview of your marketplace performance</p>
        </div>

        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Revenue Card */}
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
              {formatCurrency(metrics?.revenue?.total || 0)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', opacity: 0.9 }}>
              <span>Today: {formatCurrency(metrics?.revenue?.today || 0)}</span>
              <span>Month: {formatCurrency(metrics?.revenue?.thisMonth || 0)}</span>
            </div>
            {metrics?.revenue?.growthPercentage !== undefined && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: '600' }}>
                {metrics.revenue.growthPercentage >= 0 ? '📈' : '📉'} {metrics.revenue.growthPercentage.toFixed(1)}% vs last month
              </div>
            )}
          </div>

          {/* Orders Card */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Orders</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', color: '#667eea' }}>
              {metrics?.orders?.total || 0}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
              <span>Today: {metrics?.orders?.today || 0}</span>
              <span>Month: {metrics?.orders?.thisMonth || 0}</span>
            </div>
          </div>

          {/* Users Card */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Users</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', color: '#667eea' }}>
              {metrics?.users?.total || 0}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: '#666' }}>
              <span>Customers: {metrics?.users?.byRole?.customer || 0}</span>
              <span>Suppliers: {metrics?.users?.byRole?.supplier || 0}</span>
            </div>
          </div>

          {/* Products Card */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Products</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', color: '#667eea' }}>
              {metrics?.products?.total || 0}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: '#666' }}>
              <span>Approved: {metrics?.products?.byStatus?.approved || 0}</span>
              <span style={{ color: '#ef4444' }}>Low Stock: {metrics?.products?.lowStock || 0}</span>
            </div>
          </div>
        </div>

        {/* Pending Actions Alert */}
        {metrics?.pendingActions?.total > 0 && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#856404' }}>⚠️ Pending Actions ({metrics.pendingActions.total})</h3>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {metrics.pendingActions.pendingSuppliers > 0 && (
                <div>
                  <span style={{ fontWeight: '600', color: '#856404' }}>{metrics.pendingActions.pendingSuppliers}</span>
                  <span style={{ color: '#666', marginLeft: '0.5rem' }}>suppliers awaiting verification</span>
                  <button
                    onClick={() => navigate('/admin/suppliers/pending')}
                    style={{
                      marginLeft: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    Review
                  </button>
                </div>
              )}
              {metrics.pendingActions.pendingProducts > 0 && (
                <div>
                  <span style={{ fontWeight: '600', color: '#856404' }}>{metrics.pendingActions.pendingProducts}</span>
                  <span style={{ color: '#666', marginLeft: '0.5rem' }}>products awaiting moderation</span>
                  <button
                    onClick={() => navigate('/admin/products/pending')}
                    style={{
                      marginLeft: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    Review
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Revenue Trend Chart */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Revenue Trend (Last 30 Days)</h3>
            {revenueTrend.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', minWidth: '600px', height: '250px', padding: '1rem 0' }}>
                  {revenueTrend.map((item, index) => {
                    const maxRevenue = Math.max(...revenueTrend.map((d) => d.revenue));
                    const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 200 : 0;
                    return (
                      <div
                        key={index}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: `${height}px`,
                            background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '4px 4px 0 0',
                            position: 'relative',
                            cursor: 'pointer',
                          }}
                          title={`${new Date(item.date).toLocaleDateString()}: ${formatCurrency(item.revenue)}`}
                        />
                        {index % 5 === 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.5rem', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                            {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>No revenue data available</p>
            )}
          </div>

          {/* Top Products */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Top Selling Products</h3>
            {metrics?.topProducts && metrics.topProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {metrics.topProducts.slice(0, 5).map((product: any, index: number) => (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: '#f9f9f9',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        #{index + 1} {product.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {product.totalQuantity} sold
                      </div>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#667eea' }}>
                      {formatCurrency(product.totalRevenue)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>No sales data yet</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginTop: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Orders</h3>
          {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Order #</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Customer</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Total</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentOrders.map((order: any) => (
                    <tr
                      key={order.id}
                      style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                    >
                      <td style={{ padding: '0.75rem', fontWeight: '600' }}>{order.order_number}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                        {order.first_name} {order.last_name}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: '#666' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: '700' }}>
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#10b98120',
                            color: '#10b981',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>No recent orders</p>
          )}
        </div>
      </div>
    </div>
  );
};
