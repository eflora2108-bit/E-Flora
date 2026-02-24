import { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventoryService';
import { productService } from '../../services/productService';
import { Product, InventoryLog, InventoryStats, InventoryChangeType } from '../../types';
import { SupplierLayout } from '../../components/layout/SupplierLayout';
import { StatsCard } from '../../components/ui/StatsCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Package, Layers, AlertTriangle, XCircle, BarChart3 } from 'lucide-react';

export const InventoryDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'low-stock'>('overview');
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Stock adjustment modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentData, setAdjustmentData] = useState({
    quantity_change: 0,
    change_type: InventoryChangeType.ADJUSTMENT,
    notes: '',
  });

  useEffect(() => {
    fetchStats();
    fetchProducts();
    fetchLogs();
    fetchLowStockProducts();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await inventoryService.getInventoryStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err.message);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { products: data } = await productService.getMyProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { logs: data } = await inventoryService.getSupplierLogs(1, 100);
      setLogs(data);
    } catch (err: any) {
      console.error('Failed to fetch logs:', err.message);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const data = await inventoryService.getLowStockProducts();
      setLowStockProducts(data);
    } catch (err: any) {
      console.error('Failed to fetch low stock products:', err.message);
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    setError('');
    try {
      await inventoryService.adjustStock(
        selectedProduct.id,
        adjustmentData.quantity_change,
        adjustmentData.change_type,
        adjustmentData.notes
      );

      setShowAdjustModal(false);
      setSelectedProduct(null);
      setAdjustmentData({
        quantity_change: 0,
        change_type: InventoryChangeType.ADJUSTMENT,
        notes: '',
      });

      // Refresh data
      fetchStats();
      fetchProducts();
      fetchLogs();
      fetchLowStockProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getChangeTypeBg = (type: InventoryChangeType) => {
    const map: Record<string, string> = {
      [InventoryChangeType.PURCHASE]: 'bg-emerald-100 text-emerald-700',
      [InventoryChangeType.SALE]: 'bg-blue-100 text-blue-700',
      [InventoryChangeType.RETURN]: 'bg-amber-100 text-amber-700',
      [InventoryChangeType.ADJUSTMENT]: 'bg-purple-100 text-purple-700',
      [InventoryChangeType.DAMAGED]: 'bg-red-100 text-red-700',
    };
    return map[type] || 'bg-gray-100 text-gray-600';
  };

  const getStockStatusColor = (stock: number, threshold: number) => {
    if (stock === 0) return 'text-red-500';
    if (stock <= threshold) return 'text-amber-500';
    return 'text-emerald-500';
  };

  return (
    <SupplierLayout title="Inventory Dashboard" subtitle="Manage your stock and track inventory changes">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          <StatsCard
            title="Total Products"
            value={stats.total_products}
            icon={<Package className="w-5 h-5" />}
          />
          <StatsCard
            title="Total Stock"
            value={stats.total_stock}
            icon={<Layers className="w-5 h-5" />}
          />
          <StatsCard
            title="Low Stock Items"
            value={stats.low_stock_count}
            icon={<AlertTriangle className="w-5 h-5" />}
          />
          <StatsCard
            title="Out of Stock"
            value={stats.out_of_stock_count}
            icon={<XCircle className="w-5 h-5" />}
          />
          <StatsCard
            title="Avg Stock/Product"
            value={Number(stats.avg_stock).toFixed(1)}
            icon={<BarChart3 className="w-5 h-5" />}
          />
        </div>
      )}

      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 p-4">
        <div className="flex gap-2 border-b-2 border-gray-100 pb-3">
          {(['overview', 'logs', 'low-stock'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Current Stock Levels</h2>
            </div>

            {loading ? (
              <LoadingSpinner text="Loading..." />
            ) : products.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No products found</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">SKU</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">
                        Current Stock
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Threshold</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="bg-white hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{product.sku}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-bold ${getStockStatusColor(
                              product.stock_quantity,
                              product.low_stock_threshold || 10
                            )}`}
                          >
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {product.low_stock_threshold || 10}
                        </td>
                        <td className="px-4 py-3">
                          {product.stock_quantity === 0 ? (
                            <span className="text-red-500 font-semibold text-xs">Out of Stock</span>
                          ) : product.stock_quantity <= (product.low_stock_threshold || 10) ? (
                            <span className="text-amber-500 font-semibold text-xs">Low Stock</span>
                          ) : (
                            <span className="text-emerald-500 font-semibold text-xs">In Stock</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowAdjustModal(true);
                            }}
                            className="btn-primary text-xs px-3 py-1.5"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Inventory Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Stock Movement History</h2>

            {logs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No inventory logs found</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Change</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Previous</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">New</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="bg-white hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{log.product_name}</div>
                          <div className="text-xs text-gray-500">{log.sku}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getChangeTypeBg(
                              log.change_type
                            )}`}
                          >
                            {log.change_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-bold ${
                              log.quantity_change > 0 ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            {log.quantity_change > 0 ? '+' : ''}
                            {log.quantity_change}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{log.previous_stock}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{log.new_stock}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{log.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Low Stock Tab */}
        {activeTab === 'low-stock' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Low Stock Alerts</h2>

            {lowStockProducts.length === 0 ? (
              <EmptyState
                icon={<span className="text-5xl">✅</span>}
                title="All products are well stocked!"
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">SKU</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">
                        Current Stock
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Threshold</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lowStockProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="bg-white hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{product.sku}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-bold ${
                              product.stock_quantity === 0 ? 'text-red-500' : 'text-amber-500'
                            }`}
                          >
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {product.low_stock_threshold || 10}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowAdjustModal(true);
                            }}
                            className="btn-primary text-xs px-3 py-1.5"
                          >
                            Restock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={showAdjustModal && !!selectedProduct}
        onClose={() => {
          setShowAdjustModal(false);
          setSelectedProduct(null);
        }}
        title="Adjust Stock"
      >
        <p className="text-gray-500 mb-1">
          Product: <strong className="text-gray-900">{selectedProduct?.name}</strong>
        </p>
        <p className="text-gray-500 mb-6">
          Current Stock: <strong className="text-gray-900">{selectedProduct?.stock_quantity}</strong>
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Change Type</label>
          <select
            value={adjustmentData.change_type}
            onChange={(e) =>
              setAdjustmentData({
                ...adjustmentData,
                change_type: e.target.value as InventoryChangeType,
              })
            }
            className="input-base"
          >
            <option value={InventoryChangeType.PURCHASE}>Purchase (Incoming Stock)</option>
            <option value={InventoryChangeType.ADJUSTMENT}>Manual Adjustment</option>
            <option value={InventoryChangeType.DAMAGED}>Damaged/Lost</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Change</label>
          <input
            type="number"
            value={adjustmentData.quantity_change}
            onChange={(e) =>
              setAdjustmentData({
                ...adjustmentData,
                quantity_change: parseInt(e.target.value) || 0,
              })
            }
            placeholder="Enter positive or negative number"
            className="input-base"
          />
          <p className="text-xs text-gray-500 mt-1">
            New Stock:{' '}
            {(selectedProduct?.stock_quantity || 0) + adjustmentData.quantity_change}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={adjustmentData.notes}
            onChange={(e) =>
              setAdjustmentData({ ...adjustmentData, notes: e.target.value })
            }
            placeholder="Reason for adjustment..."
            rows={3}
            className="input-base"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowAdjustModal(false);
              setSelectedProduct(null);
            }}
            className="btn-ghost flex-1 border border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAdjustStock}
            disabled={loading || adjustmentData.quantity_change === 0}
            className="btn-primary flex-1"
          >
            {loading ? 'Adjusting...' : 'Confirm Adjustment'}
          </button>
        </div>
      </Modal>
    </SupplierLayout>
  );
};
