import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, CreditCard, Leaf, Search, ArrowRight, Star, ChevronRight, Sprout, TreePine, Users, Store } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../contexts/AuthContext';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, catsRes] = await Promise.all([
        productService.getPublicProducts({ page: 1, limit: 8 }),
        categoryService.getAllActive(),
      ]);
      setFeaturedProducts(productsRes.products || []);
      setCategories(catsRes || []);
    } catch (err) {
      console.error('Failed to load homepage data:', err);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const features = [
    { icon: <Truck className="w-6 h-6" />, title: 'Free Shipping', desc: 'On orders above Rs.500', color: 'bg-emerald-100 text-emerald-600' },
    { icon: <ShieldCheck className="w-6 h-6" />, title: 'Verified Sellers', desc: 'Every supplier verified', color: 'bg-teal-100 text-teal-600' },
    { icon: <CreditCard className="w-6 h-6" />, title: 'Secure Payment', desc: 'Safe & encrypted', color: 'bg-green-100 text-green-600' },
    { icon: <Leaf className="w-6 h-6" />, title: 'Plant Care Tips', desc: 'Expert guidance included', color: 'bg-lime-100 text-lime-600' },
  ];

  const stats = [
    { icon: <Sprout className="w-6 h-6" />, value: '10,000+', label: 'Plants Listed', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: <Store className="w-6 h-6" />, value: '500+', label: 'Verified Nurseries', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: <Users className="w-6 h-6" />, value: '50,000+', label: 'Happy Customers', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: <TreePine className="w-6 h-6" />, value: '100+', label: 'Plant Categories', color: 'text-lime-600', bg: 'bg-lime-50' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', text: 'Amazing collection of indoor plants! Fast delivery and healthy plants. The packaging was superb.', rating: 5, location: 'Mumbai' },
    { name: 'Rahul Mehta', text: 'Best marketplace for rare plant varieties. Excellent packaging and the plants arrived fresh!', rating: 5, location: 'Delhi' },
    { name: 'Ananya Gupta', text: 'Great quality nursery plants at competitive prices. Customer support is very responsive.', rating: 4, location: 'Bangalore' },
  ];

  const categoryGradients = [
    'from-emerald-400 to-teal-500',
    'from-green-400 to-emerald-500',
    'from-teal-400 to-cyan-500',
    'from-lime-400 to-green-500',
    'from-cyan-400 to-teal-500',
    'from-emerald-500 to-green-600',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-emerald-500 bg-300% animate-gradient">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 text-8xl opacity-10 animate-float">🌿</div>
          <div className="absolute top-32 right-20 text-6xl opacity-10 animate-float stagger-2">🌱</div>
          <div className="absolute bottom-20 left-1/4 text-7xl opacity-10 animate-float stagger-3">🍃</div>
          <div className="absolute bottom-10 right-1/3 text-5xl opacity-10 animate-float stagger-4">🌺</div>
          {/* Radial gradient overlay for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6 px-5 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20"
            >
              🌿 India's #1 Plant Marketplace
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Bring Nature
              <br />
              <span className="text-yellow-300 drop-shadow-sm">Home Today</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover thousands of plants, seeds, and gardening supplies from verified nurseries across India
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-10">
              <div className="flex bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden ring-4 ring-white/20">
                <div className="flex-1 flex items-center px-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for plants, seeds, tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-3 py-4 text-gray-700 outline-none text-base"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-8 bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/products')}
                className="px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                Browse Plants
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </motion.button>
              {!isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-white/20 text-white border-2 border-white/50 rounded-xl font-bold text-lg hover:bg-white/30 transition-all backdrop-blur-sm"
                >
                  Become a Seller
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 68C120 56 240 32 360 24C480 16 600 24 720 36C840 48 960 64 1080 64C1200 64 1320 48 1380 40L1440 32V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#f0fdf4"/>
          </svg>
        </div>
      </section>

      {/* Stats Counter Section - floats over wave */}
      <section className="bg-primary-50 pt-4 pb-16">
        <div className="max-w-5xl mx-auto px-4 -mt-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl border border-primary-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bg} ${stat.color} mb-3`}>
                  {stat.icon}
                </div>
                <div className={`text-2xl md:text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-16 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 ${feat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feat.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{feat.title}</h3>
                <p className="text-sm text-gray-500">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      {categories.length > 0 && (
        <section className="py-16 bg-white relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #16a34a 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block mb-3 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full uppercase tracking-wider">Categories</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Shop by Category</h2>
              <p className="text-gray-500 max-w-lg mx-auto">Find the perfect plants for every space and occasion</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="cursor-pointer"
                  onClick={() => navigate(`/products?category=${cat.id}`)}
                >
                  <div className={`bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]} rounded-2xl p-6 text-white text-center h-36 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-shadow`}>
                    <div className="text-3xl mb-2">{cat.icon || '🌿'}</div>
                    <h3 className="font-bold text-sm">{cat.name}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-primary-50/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="inline-block mb-2 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full uppercase tracking-wider">Featured</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Fresh Arrivals</h2>
                <p className="text-gray-500">Handpicked selections just for you</p>
              </div>
              <button
                onClick={() => navigate('/products')}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors shadow-sm group"
              >
                View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product, i) => {
                const discount = product.mrp && Number(product.mrp) > Number(product.price)
                  ? Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100)
                  : 0;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/products/${product.slug}`)}
                  >
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-50 to-emerald-50 flex items-center justify-center">
                          <span className="text-5xl opacity-60">🌱</span>
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                          {discount}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-medium text-primary-600 mb-1">{product.category_name}</p>
                      <h3 className="font-semibold text-gray-900 mb-2 truncate group-hover:text-primary-600 transition-colors">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary-700">Rs.{Number(product.price).toFixed(0)}</span>
                        {product.mrp && Number(product.mrp) > Number(product.price) && (
                          <span className="text-sm text-gray-400 line-through">Rs.{Number(product.mrp).toFixed(0)}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center mt-10 md:hidden">
              <button onClick={() => navigate('/products')} className="btn-primary text-base px-8 py-3">
                View All Products <ArrowRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Why eFlora */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative large leaf background */}
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 text-[200px] opacity-[0.03] rotate-12">🌿</div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-500 to-emerald-600 rounded-3xl p-12 text-center shadow-2xl shadow-primary-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.15),transparent_60%)]" />
                <div className="relative">
                  <div className="text-8xl mb-4">🌿</div>
                  <p className="text-white text-xl font-bold">10,000+ Plants</p>
                  <p className="text-white/80">From 500+ Verified Nurseries</p>
                </div>
                <div className="text-6xl absolute top-6 right-6 animate-float opacity-80">🌸</div>
                <div className="text-4xl absolute bottom-8 left-8 animate-float stagger-2 opacity-80">🍃</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block mb-3 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full uppercase tracking-wider">Why eFlora</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Why Choose eFlora?</h2>
              <div className="space-y-4">
                {[
                  { title: 'Direct from Nurseries', desc: 'Buy directly from verified nurseries across India. No middlemen, fresh plants guaranteed.', emoji: '🌿' },
                  { title: 'Quality Guaranteed', desc: 'Every plant is inspected and ships with a health guarantee for your peace of mind.', emoji: '✅' },
                  { title: 'Expert Plant Care', desc: 'Get detailed care instructions with every purchase and access to our plant experts.', emoji: '📚' },
                  { title: 'B2B & B2C Marketplace', desc: "Whether you're a home gardener or a business, we have the right plants for you.", emoji: '🏪' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex gap-4 p-4 rounded-xl bg-primary-50/50 border border-primary-100/50 hover:bg-primary-50 hover:border-primary-100 transition-all"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 text-xl shadow-sm">
                      {item.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-b from-primary-50/50 to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block mb-3 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
            <p className="text-gray-500">Trusted by plant lovers across India</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((test, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 relative shadow-sm hover:shadow-lg transition-all border border-gray-100"
              >
                <div className="text-5xl text-primary-200 absolute top-4 right-6 font-serif">"</div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: test.rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                  {Array.from({ length: 5 - test.rating }).map((_, j) => (
                    <Star key={`e-${j}`} className="w-5 h-5 text-gray-200" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{test.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block text-sm">{test.name}</span>
                    <span className="text-xs text-gray-500">{test.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-700 via-primary-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 text-7xl opacity-10 animate-float">🌿</div>
          <div className="absolute bottom-10 right-20 text-6xl opacity-10 animate-float stagger-2">🌱</div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Join the Green Revolution</h2>
            <p className="text-white/80 mb-10 text-lg max-w-xl mx-auto">
              Start your garden today or become a seller and reach thousands of plant lovers across India
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/products')}
                className="px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                Start Shopping
              </motion.button>
              {!isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
                >
                  Create Account
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
