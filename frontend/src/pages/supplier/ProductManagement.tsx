import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, ProductFormData, Category, ProductModerationStatus } from '../../types';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ['price', 'mrp', 'gst_percentage', 'stock_quantity', 'min_order_quantity'].includes(name)
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

  const getStatusBadge = (status: ProductModerationStatus) => {
    const colors = {
      [ProductModerationStatus.PENDING]: '#f59e0b',
      [ProductModerationStatus.APPROVED]: '#10b981',
      [ProductModerationStatus.REJECTED]: '#ef4444',
    };
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: '600',
        background: colors[status] + '20',
        color: colors[status],
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>🌱 My Products</h1>
            <p style={{ color: '#666' }}>Manage your product listings</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee', color: '#c33', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        {showForm && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category *</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>MRP (₹)</label>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>GST (%) *</label>
                  <input
                    type="number"
                    name="gst_percentage"
                    value={formData.gst_percentage}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    required
                    min="0"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Min Order Quantity *</label>
                  <input
                    type="number"
                    name="min_order_quantity"
                    value={formData.min_order_quantity}
                    onChange={handleChange}
                    required
                    min="1"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Care Instructions</label>
                  <textarea
                    name="care_instructions"
                    value={formData.care_instructions}
                    onChange={handleChange}
                    rows={3}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit' }}
                  />
                </div>

                {!editingProduct && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setImageFiles(e.target.files)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                      Upload up to 10 images (JPG, PNG, WEBP)
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  padding: '0.875rem',
                  background: loading ? '#ccc' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
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
                  fontWeight: '500',
                  textTransform: 'capitalize',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Products List */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          {loading && !showForm ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Loading products...</p>
          ) : products.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No products found. Add your first product!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Product</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>SKU</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Price</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Stock</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{product.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{product.category?.name}</div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>{product.sku}</td>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>₹{product.price.toFixed(2)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ color: product.stock_quantity < 10 ? '#ef4444' : '#666' }}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>{getStatusBadge(product.moderation_status)}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEdit(product)}
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
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                            }}
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
      </div>
    </div>
  );
};
