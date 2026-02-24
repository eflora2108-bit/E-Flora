import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { StatsCard } from '../../components/ui/StatsCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';

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
      <AdminLayout title="Dashboard" subtitle="Overview of your marketplace performance">
        <LoadingSpinner fullPage={false} text="Loading dashboard..." />
      </AdminLayout>
    );
  }

  if (error && !metrics) {
    return (
      <AdminLayout title="Dashboard" subtitle="Overview of your marketplace performance">
        <ErrorAlert message={error} />
      </AdminLayout>
    );
  }

  const formatCurrency = (amount: number | string) => `₹${Number(amount).toFixed(2)}`;

  const recentOrderColumns = [
    {
      key: 'order_number',
      header: 'Order #',
      render: (order: any) => (
        <span className="font-semibold text-gray-900">{order.order_number}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (order: any) => (
        <span className="text-sm text-gray-600">
          {order.first_name} {order.last_name}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (order: any) => (
        <span className="text-sm text-gray-500">
          {new Date(order.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (order: any) => (
        <span className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: any) => <StatusBadge status={order.status} size="sm" />,
    },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Overview of your marketplace performance">
      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(metrics?.revenue?.total || 0)}
          subtitle={`Today: ${formatCurrency(metrics?.revenue?.today || 0)} | Month: ${formatCurrency(metrics?.revenue?.thisMonth || 0)}`}
          icon={<DollarSign className="w-5 h-5" />}
          trend={metrics?.revenue?.growthPercentage}
          gradient
        />
        <StatsCard
          title="Total Orders"
          value={metrics?.orders?.total || 0}
          subtitle={`Today: ${metrics?.orders?.today || 0} | Month: ${metrics?.orders?.thisMonth || 0}`}
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <StatsCard
          title="Total Users"
          value={metrics?.users?.total || 0}
          subtitle={`Customers: ${metrics?.users?.byRole?.customer || 0} | Suppliers: ${metrics?.users?.byRole?.supplier || 0}`}
          icon={<Users className="w-5 h-5" />}
        />
        <StatsCard
          title="Total Products"
          value={metrics?.products?.total || 0}
          subtitle={`Approved: ${metrics?.products?.byStatus?.approved || 0} | Low Stock: ${metrics?.products?.lowStock || 0}`}
          icon={<Package className="w-5 h-5" />}
        />
      </div>

      {/* Pending Actions Alert */}
      {metrics?.pendingActions?.total > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">
            Pending Actions ({metrics.pendingActions.total})
          </h3>
          <div className="flex flex-wrap gap-4">
            {metrics.pendingActions.pendingSuppliers > 0 && (
              <div className="flex items-center gap-3">
                <span className="font-semibold text-amber-800">
                  {metrics.pendingActions.pendingSuppliers}
                </span>
                <span className="text-gray-600">suppliers awaiting verification</span>
                <button
                  onClick={() => navigate('/admin/suppliers/pending')}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  Review
                </button>
              </div>
            )}
            {metrics.pendingActions.pendingProducts > 0 && (
              <div className="flex items-center gap-3">
                <span className="font-semibold text-amber-800">
                  {metrics.pendingActions.pendingProducts}
                </span>
                <span className="text-gray-600">products awaiting moderation</span>
                <button
                  onClick={() => navigate('/admin/products/pending')}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend (Last 30 Days)</h3>
          {revenueTrend.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex items-end gap-1 min-w-[600px] h-[250px] py-4">
                {revenueTrend.map((item, index) => {
                  const maxRevenue = Math.max(...revenueTrend.map((d) => d.revenue));
                  const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 200 : 0;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center justify-end"
                    >
                      <div
                        className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ height: `${height}px` }}
                        title={`${new Date(item.date).toLocaleDateString()}: ${formatCurrency(item.revenue)}`}
                      />
                      {index % 5 === 0 && (
                        <div className="text-[10px] text-gray-400 mt-2 -rotate-45 whitespace-nowrap origin-top-left">
                          {new Date(item.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No revenue data available</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Selling Products</h3>
          {metrics?.topProducts && metrics.topProducts.length > 0 ? (
            <div className="flex flex-col gap-3">
              {metrics.topProducts.slice(0, 5).map((product: any, index: number) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      #{index + 1} {product.name}
                    </div>
                    <div className="text-xs text-gray-500">{product.totalQuantity} sold</div>
                  </div>
                  <div className="text-sm font-bold text-primary-700 ml-3">
                    {formatCurrency(product.totalRevenue)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales data yet</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Orders</h3>
        <DataTable
          columns={recentOrderColumns}
          data={metrics?.recentOrders || []}
          onRowClick={(order: any) => navigate(`/admin/orders/${order.id}`)}
          emptyMessage="No recent orders"
        />
      </div>
    </AdminLayout>
  );
};
