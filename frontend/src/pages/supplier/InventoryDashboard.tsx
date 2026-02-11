import { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventoryService';
import { productService } from '../../services/productService';
import { Product, InventoryLog, InventoryStats, InventoryChangeType } from '../../types';

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

  const getChangeTypeColor = (type: InventoryChangeType) => {
    const colors = {
      [InventoryChangeType.PURCHASE]: '#10b981',
      [InventoryChangeType.SALE]: '#3b82f6',
      [InventoryChangeType.RETURN]: '#f59e0b',
      [InventoryChangeType.ADJUSTMENT]: '#8b5cf6',
      [InventoryChangeType.DAMAGED]: '#ef4444',
    };
    return colors[type] || '#666';
  };

  const getStockStatusColor = (stock: number, threshold: number) => {
    if (stock === 0) return '#ef4444';
    if (stock <= threshold) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>📊 Inventory Dashboard</h1>
          <p style={{ color: '#666' }}>Manage your stock and track inventory changes</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Products</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>{stats.total_products}</div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Stock</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>{stats.total_stock}</div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Low Stock Items</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>{stats.low_stock_count}</div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Out of Stock</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>{stats.out_of_stock_count}</div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Avg Stock/Product</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>
                {parseFloat(stats.avg_stock).toFixed(1)}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee', color: '#c33', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{ background: 'white', borderRadius: '12px', marginBottom: '1rem', padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem' }}>
            {(['overview', 'logs', 'low-stock'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.5rem 1rem',
                  background: activeTab === tab ? '#667eea' : 'transparent',
                  color: activeTab === tab ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Current Stock Levels</h2>
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '2rem 0' }}>Loading...</p>
              ) : products.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '2rem 0' }}>No products found</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Product</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>SKU</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Current Stock</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Threshold</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: '500' }}>{product.name}</div>
                          </td>
                          <td style={{ padding: '1rem', color: '#666' }}>{product.sku}</td>
                          <td style={{ padding: '1rem' }}>
                            <span
                              style={{
                                fontWeight: '700',
                                color: getStockStatusColor(
                                  product.stock_quantity,
                                  product.low_stock_threshold || 10
                                ),
                              }}
                            >
                              {product.stock_quantity}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: '#666' }}>{product.low_stock_threshold || 10}</td>
                          <td style={{ padding: '1rem' }}>
                            {product.stock_quantity === 0 ? (
                              <span style={{ color: '#ef4444', fontWeight: '600' }}>Out of Stock</span>
                            ) : product.stock_quantity <= (product.low_stock_threshold || 10) ? (
                              <span style={{ color: '#f59e0b', fontWeight: '600' }}>Low Stock</span>
                            ) : (
                              <span style={{ color: '#10b981', fontWeight: '600' }}>In Stock</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowAdjustModal(true);
                              }}
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
              <h2 style={{ marginBottom: '1.5rem' }}>Stock Movement History</h2>

              {logs.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '2rem 0' }}>No inventory logs found</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Product</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Type</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Change</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Previous</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>New</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#666' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: '500' }}>{log.product_name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{log.sku}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span
                              style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                background: getChangeTypeColor(log.change_type) + '20',
                                color: getChangeTypeColor(log.change_type),
                                textTransform: 'capitalize',
                              }}
                            >
                              {log.change_type}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: '1rem',
                              fontWeight: '700',
                              color: log.quantity_change > 0 ? '#10b981' : '#ef4444',
                            }}
                          >
                            {log.quantity_change > 0 ? '+' : ''}
                            {log.quantity_change}
                          </td>
                          <td style={{ padding: '1rem', color: '#666' }}>{log.previous_stock}</td>
                          <td style={{ padding: '1rem', fontWeight: '600' }}>{log.new_stock}</td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#666' }}>
                            {log.notes || '-'}
                          </td>
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
              <h2 style={{ marginBottom: '1.5rem' }}>Low Stock Alerts</h2>

              {lowStockProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <p style={{ color: '#666', fontSize: '1.1rem' }}>All products are well stocked!</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Product</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>SKU</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Current Stock</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Threshold</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map((product) => (
                        <tr key={product.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: '500' }}>{product.name}</div>
                          </td>
                          <td style={{ padding: '1rem', color: '#666' }}>{product.sku}</td>
                          <td style={{ padding: '1rem' }}>
                            <span
                              style={{
                                fontWeight: '700',
                                color: product.stock_quantity === 0 ? '#ef4444' : '#f59e0b',
                              }}
                            >
                              {product.stock_quantity}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: '#666' }}>{product.low_stock_threshold || 10}</td>
                          <td style={{ padding: '1rem' }}>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowAdjustModal(true);
                              }}
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
        {showAdjustModal && selectedProduct && (
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
            onClick={() => {
              setShowAdjustModal(false);
              setSelectedProduct(null);
            }}
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
              <h2 style={{ marginBottom: '1rem' }}>Adjust Stock</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Product: <strong>{selectedProduct.name}</strong>
                <br />
                Current Stock: <strong>{selectedProduct.stock_quantity}</strong>
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Change Type
                </label>
                <select
                  value={adjustmentData.change_type}
                  onChange={(e) =>
                    setAdjustmentData({ ...adjustmentData, change_type: e.target.value as InventoryChangeType })
                  }
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                >
                  <option value={InventoryChangeType.PURCHASE}>Purchase (Incoming Stock)</option>
                  <option value={InventoryChangeType.ADJUSTMENT}>Manual Adjustment</option>
                  <option value={InventoryChangeType.DAMAGED}>Damaged/Lost</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Quantity Change
                </label>
                <input
                  type="number"
                  value={adjustmentData.quantity_change}
                  onChange={(e) =>
                    setAdjustmentData({ ...adjustmentData, quantity_change: parseInt(e.target.value) || 0 })
                  }
                  placeholder="Enter positive or negative number"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                />
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                  New Stock: {selectedProduct.stock_quantity + adjustmentData.quantity_change}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Notes</label>
                <textarea
                  value={adjustmentData.notes}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, notes: e.target.value })}
                  placeholder="Reason for adjustment..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedProduct(null);
                  }}
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
                  onClick={handleAdjustStock}
                  disabled={loading || adjustmentData.quantity_change === 0}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: loading || adjustmentData.quantity_change === 0 ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: loading || adjustmentData.quantity_change === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Adjusting...' : 'Confirm Adjustment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
