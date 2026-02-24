import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { CheckCircle, XCircle } from 'lucide-react';

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
    <AdminLayout title="Product Moderation" subtitle="Review and approve product listings">
      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 mt-4">
        {/* Products List */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Products ({products.length})
          </h2>

          {loading && products.length === 0 ? (
            <LoadingSpinner text="Loading..." size="sm" />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<CheckCircle className="w-12 h-12 text-emerald-400" />}
              title="No pending products"
              description="All products have been reviewed"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                    selectedProduct?.id === product.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">{product.name}</div>
                  <div className="text-sm text-gray-500 mb-1">SKU: {product.sku}</div>
                  <div className="text-sm text-gray-500">
                    Supplier: {product.supplier?.business_name || 'Unknown'}
                  </div>
                  <div className="text-sm font-semibold text-primary-700 mt-2">
                    ₹{Number(product.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
          {!selectedProduct ? (
            <EmptyState
              icon={<span className="text-5xl">📦</span>}
              title="Select a product to review"
              description="Choose a product from the list to view its details"
            />
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedProduct.name}</h2>

                {/* Product Images */}
                {selectedProduct.images && selectedProduct.images.length > 0 && (
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {selectedProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000${image}`}
                        alt={`Product ${index + 1}`}
                        className="w-[150px] h-[150px] object-cover rounded-xl border border-gray-200"
                      />
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">SKU</label>
                    <div className="font-medium text-gray-900">{selectedProduct.sku}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Category</label>
                    <div className="font-medium text-gray-900">
                      {selectedProduct.category?.name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Price</label>
                    <div className="font-semibold text-lg text-primary-700">
                      ₹{Number(selectedProduct.price).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">MRP</label>
                    <div className="font-medium text-gray-900">
                      {selectedProduct.mrp ? `₹${Number(selectedProduct.mrp).toFixed(2)}` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">GST</label>
                    <div className="font-medium text-gray-900">{selectedProduct.gst_percentage}%</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Stock Quantity</label>
                    <div className="font-medium text-gray-900">{selectedProduct.stock_quantity}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Min Order Qty</label>
                    <div className="font-medium text-gray-900">{selectedProduct.min_order_quantity}</div>
                  </div>
                </div>

                {selectedProduct.description && (
                  <div className="mb-6">
                    <label className="block text-sm text-gray-500 mb-2">Description</label>
                    <div className="p-4 bg-gray-50 rounded-xl leading-relaxed text-gray-700">
                      {selectedProduct.description}
                    </div>
                  </div>
                )}

                {selectedProduct.care_instructions && (
                  <div className="mb-6">
                    <label className="block text-sm text-gray-500 mb-2">Care Instructions</label>
                    <div className="p-4 bg-blue-50 rounded-xl leading-relaxed text-gray-700">
                      {selectedProduct.care_instructions}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm font-semibold text-gray-900 mb-2">
                    Supplier Information
                  </div>
                  <div className="text-sm text-gray-600">
                    Business: {selectedProduct.supplier?.business_name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Email: {selectedProduct.supplier?.email || 'N/A'}
                  </div>
                  {selectedProduct.supplier?.gstin && (
                    <div className="text-sm text-gray-600">
                      GSTIN: {selectedProduct.supplier.gstin}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-base hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Product
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl font-semibold text-base hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Product
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
        }}
        title="Reject Product"
      >
        <p className="text-gray-500 mb-4">
          Please provide a reason for rejecting this product. This will be sent to the supplier.
        </p>

        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Enter rejection reason..."
          rows={4}
          className="input-base mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowRejectModal(false);
              setRejectionReason('');
            }}
            className="btn-ghost flex-1 border border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={loading || !rejectionReason.trim()}
            className="btn-danger flex-1"
          >
            {loading ? 'Rejecting...' : 'Reject Product'}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
};
