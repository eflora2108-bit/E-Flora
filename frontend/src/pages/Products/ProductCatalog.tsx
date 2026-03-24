import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ShoppingCart, ChevronLeft, ChevronRight, Leaf, Heart } from 'lucide-react';
import { resolveImageUrl } from '../../utils/image';

export const ProductCatalogPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

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
      setTotalProducts(pagination?.total || data.length);
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

  const getDiscountPercent = (price: number, mrp: number) => {
    if (mrp > price && mrp > 0) {
      return Math.round(((mrp - price) / mrp) * 100);
    }
    return 0;
  };

  const hasActiveFilters = selectedCategory || searchQuery || minPrice > 0 || maxPrice > 0;

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block mb-2 font-semibold text-sm text-gray-800">Search</label>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plants..."
            className="input-base pl-10"
          />
        </form>
      </div>

      {/* Categories */}
      <div>
        <label className="block mb-3 font-semibold text-sm text-gray-800">Categories</label>
        <div className="space-y-1">
          <button
            onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
              !selectedCategory
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block mb-3 font-semibold text-sm text-gray-800">Price Range</label>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs.</span>
            <input
              type="number"
              value={minPrice || ''}
              onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
              placeholder="Min"
              className="input-base pl-9 text-sm"
            />
          </div>
          <span className="flex items-center text-gray-400">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs.</span>
            <input
              type="number"
              value={maxPrice || ''}
              onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 0)}
              placeholder="Max"
              className="input-base pl-9 text-sm"
            />
          </div>
        </div>
        <button
          onClick={() => { setCurrentPage(1); fetchProducts(); }}
          className="w-full btn-primary text-sm py-2"
        >
          Apply Price Filter
        </button>
      </div>

      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <X className="w-4 h-4" />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-primary-600 via-emerald-500 to-teal-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-20 text-6xl animate-float">🌿</div>
          <div className="absolute bottom-4 left-10 text-5xl animate-float stagger-2">🍃</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="w-8 h-8 text-white/80" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">Browse Plants</h1>
            </div>
            <p className="text-white/80 text-lg">
              Discover {totalProducts > 0 ? `${totalProducts}+` : ''} plants from verified nurseries across India
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6 flex-wrap"
          >
            <span className="text-sm text-gray-500 font-medium">Active filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                {categories.find(c => c.id === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory('')} className="hover:text-primary-900"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-primary-900"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {(minPrice > 0 || maxPrice > 0) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                Rs.{minPrice || 0} - Rs.{maxPrice || 'Any'}
                <button onClick={() => { setMinPrice(0); setMaxPrice(0); }} className="hover:text-primary-900"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
          </motion.div>
        )}

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center">!</span>
            )}
          </button>
        </div>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-gray-400" />
                  Filters
                </h3>
              </div>
              <FilterSidebar />
            </div>
          </div>

          {/* Products Grid */}
          <div>
            {loading ? (
              <LoadingSpinner text="Finding the best plants for you..." />
            ) : products.length === 0 ? (
              <EmptyState
                icon={<span className="text-6xl">🌱</span>}
                title="No plants found"
                description="Try adjusting your filters or search to discover more plants."
                actionLabel="Clear All Filters"
                onAction={resetFilters}
              />
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-700">{products.length}</span> of{' '}
                    <span className="font-semibold text-gray-700">{totalProducts}</span> plants
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {products.map((product, i) => {
                    const discount = getDiscountPercent(Number(product.price), Number(product.mrp));
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.4 }}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                        onClick={() => navigate(`/products/${product.slug}`)}
                      >
                        {/* Product Image */}
                        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                          {product.images && product.images[0] ? (
                            <img
                              src={resolveImageUrl(product.images[0])}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-50 to-emerald-50 flex items-center justify-center">
                              <span className="text-6xl opacity-60">🌱</span>
                            </div>
                          )}

                          {/* Discount Badge */}
                          {discount > 0 && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                              {discount}% OFF
                            </div>
                          )}

                          {/* Stock Badge */}
                          {product.stock_quantity === 0 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="bg-white text-gray-800 font-bold text-sm px-4 py-2 rounded-full">Out of Stock</span>
                            </div>
                          )}

                          {/* Quick Actions */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white shadow-md transition-all"
                            >
                              <Heart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-5">
                          <div className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full inline-block mb-2">
                            {product.category?.name || 'Plants'}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {product.name}
                          </h3>

                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-xl font-bold text-gray-900">
                              Rs.{Number(product.price).toFixed(0)}
                            </span>
                            {product.mrp && Number(product.mrp) > Number(product.price) && (
                              <span className="text-sm text-gray-400 line-through">
                                Rs.{Number(product.mrp).toFixed(0)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              product.stock_quantity > 10
                                ? 'bg-emerald-50 text-emerald-600'
                                : product.stock_quantity > 0
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-red-50 text-red-500'
                            }`}>
                              {product.stock_quantity > 10
                                ? 'In Stock'
                                : product.stock_quantity > 0
                                ? `Only ${product.stock_quantity} left`
                                : 'Out of Stock'}
                            </span>
                          </div>

                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!isAuthenticated) {
                                toast.error('Please login to add items to cart');
                                navigate('/login');
                                return;
                              }
                              try {
                                await addToCart(product.id, 1);
                                toast.success(`${product.name} added to cart!`);
                              } catch (err: any) {
                                toast.error(err.message || 'Failed to add to cart');
                              }
                            }}
                            disabled={product.stock_quantity === 0}
                            className={`w-full mt-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                              product.stock_quantity === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg active:scale-[0.98]'
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {product.stock_quantity === 0 ? 'Sold Out' : 'Add to Cart'}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${
                              currentPage === pageNum
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                      }`}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
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
