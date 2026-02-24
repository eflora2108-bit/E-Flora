import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, ProductFormData, Category } from '../../types';
import { SupplierLayout } from '../../components/layout/SupplierLayout';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Plus, X } from 'lucide-react';

export const ProductManagementPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState<ProductFormData>({
    category_id: '',
    name: '',
    description: '',
    price: 0,
    mrp: 0,
    gst_percentage: 18,
    stock_quantity: 0,
    min_order_quantity: 1,
    care_instructions: '',
  });

  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = statusFilter !== 'all' ? { moderation_status: statusFilter } : {};
      const { products: data } = await productService.getMyProducts(params);
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllActive();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err.message);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ['price', 'mrp', 'gst_percentage', 'stock_quantity', 'min_order_quantity'].includes(
        name
      )
        ? parseFloat(value) || 0
        : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
      } else {
        const newProduct = await productService.createProduct(formData);

        // Upload images if provided
        if (imageFiles && imageFiles.length > 0) {
          await productService.uploadImages(newProduct.id, imageFiles);
        }
      }

      setShowForm(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      category_id: product.category_id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      mrp: product.mrp,
      gst_percentage: product.gst_percentage,
      stock_quantity: product.stock_quantity,
      min_order_quantity: product.min_order_quantity,
      care_instructions: product.care_instructions || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setLoading(true);
    try {
      await productService.deleteProduct(id);
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      name: '',
      description: '',
      price: 0,
      mrp: 0,
      gst_percentage: 18,
      stock_quantity: 0,
      min_order_quantity: 1,
      care_instructions: '',
    });
    setImageFiles(null);
    setEditingProduct(null);
  };

  return (
    <SupplierLayout
      title="My Products"
      subtitle="Manage your product listings"
    >
      {/* Header Action */}
      <div className="flex justify-end -mt-4 mb-6">
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className={showForm ? 'btn-ghost border border-gray-200' : 'btn-primary'}
        >
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </>
          )}
        </button>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {showForm && (
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="input-base"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-base"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MRP (₹)</label>
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST (%) *</label>
                <input
                  type="number"
                  name="gst_percentage"
                  value={formData.gst_percentage}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Order Quantity *
                </label>
                <input
                  type="number"
                  name="min_order_quantity"
                  value={formData.min_order_quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="input-base"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Care Instructions
                </label>
                <textarea
                  name="care_instructions"
                  value={formData.care_instructions}
                  onChange={handleChange}
                  rows={3}
                  className="input-base"
                />
              </div>

              {!editingProduct && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImageFiles(e.target.files)}
                    className="input-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload up to 10 images (JPG, PNG, WEBP)
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                statusFilter === status
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        {loading && !showForm ? (
          <LoadingSpinner text="Loading products..." />
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No products found. Add your first product!
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Price</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Stock</th>
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
                      <div className="text-xs text-gray-500">{product.category?.name}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{product.sku}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ₹{Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          product.stock_quantity < 10 ? 'text-red-500' : 'text-gray-600'
                        }`}
                      >
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={product.moderation_status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="btn-danger text-xs px-3 py-1.5"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SupplierLayout>
  );
};
