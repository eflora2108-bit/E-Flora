import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Menu, X, Search } from 'lucide-react';
import NotificationBell from '../Notifications/NotificationBell';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img src="/Eflora.jpeg" alt="eFlora" className="h-10 w-auto object-contain" />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search plants, seeds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/products" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
              Products
            </Link>
            {user?.role === 'supplier' && (
              <>
                <Link to="/supplier/products" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                  My Products
                </Link>
                <Link to="/supplier/orders" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                  Orders
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                Admin Panel
              </Link>
            )}
            {user?.role === 'customer' && (
              <Link to="/orders" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                My Orders
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                <Link
                  to="/wishlist"
                  className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                <Link
                  to="/cart"
                  className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative group ml-1">
                  <button className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {user?.first_name?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                    <span className="hidden lg:inline text-sm font-medium">{user?.first_name}</span>
                  </button>

                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full capitalize">{user?.role}</span>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        Wishlist
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { handleSearch(); setMobileMenuOpen(false); } }}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl">Products</Link>
              {isAuthenticated && (
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl">My Profile</Link>
              )}
              {user?.role === 'supplier' && (
                <>
                  <Link to="/supplier/products" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl">My Products</Link>
                  <Link to="/supplier/orders" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl">Orders</Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl">Admin Panel</Link>
              )}
              {user?.role === 'customer' && (
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl">My Orders</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
