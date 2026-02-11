import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';

export const ProductCatalogPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, minPrice, maxPrice, currentPage]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllActive();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err.message);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page: currentPage, limit: 12 };

      if (selectedCategory) params.category_id = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      if (minPrice > 0) params.min_price = minPrice;
      if (maxPrice > 0) params.max_price = maxPrice;

      const { products: data, pagination } = await productService.getPublicProducts(params);
      setProducts(data);
      setTotalPages(pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(0);
    setCurrentPage(1);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e0e0e0', padding: '2rem 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>🌿 Browse Plants</h1>
          <p style={{ color: '#666' }}>Discover plants from verified suppliers</p>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee', color: '#c33', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
          {/* Filters Sidebar */}
          <div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', position: 'sticky', top: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Filters</h3>
                <button
                  onClick={resetFilters}
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: 'transparent',
                    color: '#667eea',
                    border: '1px solid #667eea',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Reset
                </button>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    marginBottom: '0.5rem',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Search
                </button>
              </form>

              {/* Category Filter */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                  Price Range
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="number"
                    value={minPrice || ''}
                    onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Min"
                    style={{ flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                  <input
                    type="number"
                    value={maxPrice || ''}
                    onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Max"
                    style={{ flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </div>
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    fetchProducts();
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>No products found</p>
                <button
                  onClick={resetFilters}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1rem', color: '#666' }}>
                  Showing {products.length} products
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                  }}
                >
                  {products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/products/${product.slug}`)}
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '1px solid #e0e0e0',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Product Image */}
                      <div
                        style={{
                          height: '200px',
                          background: product.images && product.images[0]
                            ? `url(http://localhost:5000${product.images[0]}) center/cover`
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '3rem',
                        }}
                      >
                        {(!product.images || product.images.length === 0) && '🌱'}
                      </div>

                      {/* Product Info */}
                      <div style={{ padding: '1.25rem' }}>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>
                          {product.name}
                        </h3>

                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
                          {product.category?.name}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
                            ₹{product.price.toFixed(2)}
                          </div>
                          {product.mrp && product.mrp > product.price && (
                            <div style={{ fontSize: '0.9rem', color: '#999', textDecoration: 'line-through' }}>
                              ₹{product.mrp.toFixed(2)}
                            </div>
                          )}
                        </div>

                        <div style={{ fontSize: '0.85rem', color: product.stock_quantity > 0 ? '#10b981' : '#ef4444' }}>
                          {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add to cart logic will be implemented in Phase 6
                            alert('Add to cart feature coming soon!');
                          }}
                          disabled={product.stock_quantity === 0}
                          style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '0.75rem',
                            background: product.stock_quantity === 0 ? '#ccc' : '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            cursor: product.stock_quantity === 0 ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '0.5rem 1rem',
                        background: currentPage === 1 ? '#e0e0e0' : '#667eea',
                        color: currentPage === 1 ? '#999' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Previous
                    </button>

                    <div style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', color: '#666' }}>
                      Page {currentPage} of {totalPages}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '0.5rem 1rem',
                        background: currentPage === totalPages ? '#e0e0e0' : '#667eea',
                        color: currentPage === totalPages ? '#999' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
