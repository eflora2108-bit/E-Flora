import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';

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
      alert(err.message || 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  const renderSalesReport = () => {
    if (!reportData) return null;

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Total Orders</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>{reportData.totalOrders}</div>
          </div>
          <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Total Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>{formatCurrency(reportData.totalRevenue)}</div>
          </div>
          <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Average Order Value</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>{formatCurrency(reportData.averageOrderValue)}</div>
          </div>
        </div>

        <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>Subtotal</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{formatCurrency(reportData.totalSubtotal)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>GST</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{formatCurrency(reportData.totalGst)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>Shipping</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{formatCurrency(reportData.totalShipping)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryReport = () => {
    if (!reportData || reportData.length === 0) {
      return <p style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>No category sales data</p>;
    }

    const maxRevenue = Math.max(...reportData.map((item: any) => item.totalRevenue));

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Category</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Orders</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Quantity</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Revenue</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Performance</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item: any) => {
              const percentage = (item.totalRevenue / maxRevenue) * 100;
              return (
                <tr key={item.categoryId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '1rem' }}>{item.categoryName}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{item.orderCount}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{item.totalQuantity}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700' }}>{formatCurrency(item.totalRevenue)}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ width: '100%', background: '#f0f0f0', borderRadius: '4px', height: '8px' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '4px',
                          height: '100%',
                        }}
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
    if (!reportData || reportData.length === 0) {
      return <p style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>No supplier sales data</p>;
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Supplier</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Orders</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Quantity</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item: any) => (
              <tr key={item.supplierId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '1rem', fontWeight: '600' }}>{item.businessName}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>{item.email}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{item.orderCount}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{item.totalQuantity}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700' }}>{formatCurrency(item.totalRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderInventoryReport = () => {
    if (!reportData || reportData.length === 0) {
      return <p style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>No inventory data</p>;
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'out_of_stock':
          return '#ef4444';
        case 'low_stock':
          return '#f59e0b';
        default:
          return '#10b981';
      }
    };

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Product</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>SKU</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Category</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Supplier</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Stock</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item: any) => (
              <tr key={item.productId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '1rem' }}>{item.productName}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>{item.sku}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>{item.categoryName}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>{item.supplierName}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>
                  {item.stockQuantity} / {item.lowStockThreshold}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: getStatusColor(item.stockStatus) + '20',
                      color: getStatusColor(item.stockStatus),
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    {item.stockStatus.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>📈 Reports & Analytics</h1>
          <p style={{ color: '#666' }}>Generate detailed reports and export data</p>
        </div>

        {/* Filters */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            {/* Report Type */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  minWidth: '200px',
                }}
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      width: '100%',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      width: '100%',
                    }}
                  />
                </div>
              </>
            )}

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exporting || loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: exporting ? '#ccc' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: exporting ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {exporting ? 'Exporting...' : '📥 Export CSV'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Report Content */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>
              {reportType === 'sales' && 'Sales Report'}
              {reportType === 'category' && 'Sales by Category'}
              {reportType === 'supplier' && 'Sales by Supplier'}
              {reportType === 'inventory' && 'Inventory Report'}
            </h2>
            {reportType !== 'inventory' && (
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '3rem 0' }}>Loading report...</p>
          ) : (
            <>
              {reportType === 'sales' && renderSalesReport()}
              {reportType === 'category' && renderCategoryReport()}
              {reportType === 'supplier' && renderSupplierReport()}
              {reportType === 'inventory' && renderInventoryReport()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
