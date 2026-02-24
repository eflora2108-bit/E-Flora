import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { toast } from 'react-hot-toast';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { StatsCard } from '../../components/ui/StatsCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Download, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

type ReportType = 'sales' | 'category' | 'supplier' | 'inventory';

export const AdminReportsPage = () => {
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadReport();
    }
  }, [reportType, startDate, endDate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');

      setReportData(null);

      let data;
      switch (reportType) {
        case 'sales':
          data = await analyticsService.getSalesReport(startDate, endDate);
          break;
        case 'category':
          data = await analyticsService.getSalesByCategory(startDate, endDate);
          break;
        case 'supplier':
          data = await analyticsService.getSalesBySupplier(startDate, endDate);
          break;
        case 'inventory':
          data = await analyticsService.getInventoryReport();
          break;
      }

      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await analyticsService.exportReport(reportType, startDate, endDate);
    } catch (err: any) {
      toast.error(err.message || 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${Number(amount).toFixed(2)}`;

  const renderSalesReport = () => {
    if (!reportData) return null;

    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Total Orders"
            value={reportData.totalOrders}
            icon={<ShoppingCart className="w-5 h-5" />}
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(reportData.totalRevenue)}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatsCard
            title="Average Order Value"
            value={formatCurrency(reportData.averageOrderValue)}
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Subtotal</div>
              <div className="text-xl font-semibold text-gray-900">
                {formatCurrency(reportData.totalSubtotal)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">GST</div>
              <div className="text-xl font-semibold text-gray-900">
                {formatCurrency(reportData.totalGst)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Shipping</div>
              <div className="text-xl font-semibold text-gray-900">
                {formatCurrency(reportData.totalShipping)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryReport = () => {
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
      return <p className="text-gray-500 text-center py-8">No category sales data</p>;
    }

    const maxRevenue = Math.max(...reportData.map((item: any) => item.totalRevenue));

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Orders</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Quantity</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Revenue</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reportData.map((item: any) => {
              const percentage = (item.totalRevenue / maxRevenue) * 100;
              return (
                <tr key={item.categoryId} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-900">{item.categoryName}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{item.orderCount}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{item.totalQuantity}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {formatCurrency(item.totalRevenue)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full h-2 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSupplierReport = () => {
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
      return <p className="text-gray-500 text-center py-8">No supplier sales data</p>;
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Supplier</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Orders</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Quantity</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reportData.map((item: any) => (
              <tr key={item.supplierId} className="bg-white hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900">{item.businessName}</td>
                <td className="px-4 py-3 text-gray-500">{item.email}</td>
                <td className="px-4 py-3 text-right text-gray-600">{item.orderCount}</td>
                <td className="px-4 py-3 text-right text-gray-600">{item.totalQuantity}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">
                  {formatCurrency(item.totalRevenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderInventoryReport = () => {
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
      return <p className="text-gray-500 text-center py-8">No inventory data</p>;
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">SKU</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Supplier</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Stock</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reportData.map((item: any) => (
              <tr key={item.productId} className="bg-white hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-900">{item.productName}</td>
                <td className="px-4 py-3 text-gray-500">{item.sku}</td>
                <td className="px-4 py-3 text-gray-500">{item.categoryName}</td>
                <td className="px-4 py-3 text-gray-500">{item.supplierName}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {item.stockQuantity} / {item.lowStockThreshold}
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={item.stockStatus.replace('_', ' ')} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const reportTitles: Record<ReportType, string> = {
    sales: 'Sales Report',
    category: 'Sales by Category',
    supplier: 'Sales by Supplier',
    inventory: 'Inventory Report',
  };

  return (
    <AdminLayout title="Reports & Analytics" subtitle="Generate detailed reports and export data">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="input-base"
            >
              <option value="sales">Sales Report</option>
              <option value="category">Sales by Category</option>
              <option value="supplier">Sales by Supplier</option>
              <option value="inventory">Inventory Report</option>
            </select>
          </div>

          {/* Date Range (hide for inventory report) */}
          {reportType !== 'inventory' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-base"
                />
              </div>
            </>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-lg font-semibold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {/* Report Content */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{reportTitles[reportType]}</h2>
          {reportType !== 'inventory' && (
            <p className="text-sm text-gray-500">
              {new Date(startDate).toLocaleDateString()} -{' '}
              {new Date(endDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading report..." />
        ) : (
          <>
            {reportType === 'sales' && renderSalesReport()}
            {reportType === 'category' && renderCategoryReport()}
            {reportType === 'supplier' && renderSupplierReport()}
            {reportType === 'inventory' && renderInventoryReport()}
          </>
        )}
      </div>
    </AdminLayout>
  );
};
