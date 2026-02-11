import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { Product } from '../../types';

export const ProductModerationPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const { products: data } = await productService.getPendingProducts();
      setProducts(data);
      if (data.length > 0 && !selectedProduct) {
        setSelectedProduct(data[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    setError('');
    try {
      await productService.approveProduct(selectedProduct.id);
      await fetchPendingProducts();
      setSelectedProduct(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProduct || !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await productService.rejectProduct(selectedProduct.id, rejectionReason);
      await fetchPendingProducts();
      setSelectedProduct(null);
      setRejectionReason('');
      setShowRejectModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>🔍 Product Moderation</h1>
          <p style={{ color: '#666' }}>Review and approve product listings</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee', color: '#c33', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem' }}>
          {/* Products List */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', height: 'fit-content' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
              Pending Products ({products.length})
            </h2>

            {loading && products.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '2rem 0' }}>Loading...</p>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                <p style={{ color: '#666' }}>No pending products</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      padding: '1rem',
                      border: selectedProduct?.id === product.id ? '2px solid #667eea' : '1px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: selectedProduct?.id === product.id ? '#f0f4ff' : 'white',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{product.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                      SKU: {product.sku}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      Supplier: {product.supplier?.business_name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.5rem', color: '#667eea' }}>
                      ₹{product.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem' }}>
            {!selectedProduct ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📦</div>
                <p>Select a product to review</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ marginBottom: '1rem' }}>{selectedProduct.name}</h2>

                  {/* Product Images */}
                  {selectedProduct.images && selectedProduct.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                      {selectedProduct.images.map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000${image}`}
                          alt={`Product ${index + 1}`}
                          style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                        SKU
                      </label>
                      <div style={{ fontWeight: '500' }}>{selectedProduct.sku}</div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                        Category
                      </label>
                      <div style={{ fontWeight: '500' }}>{selectedProduct.category?.name || 'N/A'}</div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                        Price
                      </label>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#667eea' }}>
                        ₹{selectedProduct.price.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                        MRP
                      </label>
                      <div style={{ fontWeight: '500' }}>
                        {selectedProduct.mrp ? `₹${selectedProduct.mrp.toFixed(2)}` : 'N/A'}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                        GST
                      </label>
                      <div style={{ fontWeight: '500' }}>{selectedProduct.gst_percentage}%</div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                        Stock Quantity
                      </label>
                      <div style={{ fontWeight: '500' }}>{selectedProduct.stock_quantity}</div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                        Min Order Qty
                      </label>
                      <div style={{ fontWeight: '500' }}>{selectedProduct.min_order_quantity}</div>
                    </div>
                  </div>

                  {selectedProduct.description && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                        Description
                      </label>
                      <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '6px', lineHeight: '1.6' }}>
                        {selectedProduct.description}
                      </div>
                    </div>
                  )}

                  {selectedProduct.care_instructions && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                        Care Instructions
                      </label>
                      <div style={{ padding: '1rem', background: '#f0f8ff', borderRadius: '6px', lineHeight: '1.6' }}>
                        {selectedProduct.care_instructions}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Supplier Information</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      Business: {selectedProduct.supplier?.business_name || 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      Email: {selectedProduct.supplier?.email || 'N/A'}
                    </div>
                    {selectedProduct.supplier?.gstin && (
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        GSTIN: {selectedProduct.supplier.gstin}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleApprove}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: loading ? '#ccc' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                    }}
                  >
                    ✓ Approve Product
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: loading ? '#ccc' : '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                    }}
                  >
                    ✕ Reject Product
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Rejection Modal */}
        {showRejectModal && (
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
            onClick={() => setShowRejectModal(false)}
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
              <h2 style={{ marginBottom: '1rem' }}>Reject Product</h2>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                Please provide a reason for rejecting this product. This will be sent to the supplier.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontFamily: 'inherit',
                  marginBottom: '1rem',
                }}
              />

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
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
                  onClick={handleReject}
                  disabled={loading || !rejectionReason.trim()}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: loading || !rejectionReason.trim() ? '#ccc' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: loading || !rejectionReason.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Rejecting...' : 'Reject Product'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
