import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { supplierService } from '../../services/supplierService';
import { orderService } from '../../services/orderService';
import { UserRole, Supplier, Order } from '../../types';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  User,
  Mail,
  Phone,
  Shield,
  Package,
  ShoppingBag,
  Calendar,
  Edit3,
  Save,
  X,
  Building2,
  MapPin,
  FileText,
  Lock,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [supplierProfile, setSupplierProfile] = useState<Supplier | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, delivered: 0 });

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Profile form data
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
      });
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch recent orders for customers
      if (user?.role === UserRole.CUSTOMER || user?.role === UserRole.SUPPLIER) {
        const { orders } = await orderService.getMyOrders();
        setRecentOrders(orders.slice(0, 3));
        setOrderStats({
          total: orders.length,
          pending: orders.filter((o: Order) => o.status === 'pending' || o.status === 'confirmed').length,
          delivered: orders.filter((o: Order) => o.status === 'delivered').length,
        });
      }

      // Fetch supplier profile
      if (user?.role === UserRole.SUPPLIER) {
        try {
          const profile = await supplierService.getProfile();
          setSupplierProfile(profile);
        } catch {
          // Supplier profile might not exist yet
        }
      }
    } catch (err: any) {
      console.error('Error fetching user data:', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.updateProfile(formData);
      await refreshUser();
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully!');
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner fullPage text="Loading profile..." />;
  }

  const memberSince = new Date(user.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-600 via-emerald-500 to-teal-400 rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 text-6xl opacity-10">
            {user.role === UserRole.SUPPLIER ? '🏪' : user.role === UserRole.ADMIN ? '⚙️' : '🌿'}
          </div>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-white/80 mb-3">{user.email}</p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-sm font-medium">
                  <Shield className="w-3.5 h-3.5" />
                  {user.role === UserRole.SUPPLIER ? 'Supplier' : user.role === UserRole.ADMIN ? 'Admin' : 'Customer'}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {memberSince}
                </span>
                {user.email_verified && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-400/30 rounded-full px-3 py-1 text-sm">
                    ✓ Email Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-500" />
                  Personal Information
                </h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        first_name: user.first_name || '',
                        last_name: user.last_name || '',
                        phone: user.phone || '',
                      });
                    }}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="input-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="input-base"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-base"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      className="input-base bg-gray-50 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Full Name</div>
                        <div className="font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="font-medium text-gray-900">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="font-medium text-gray-900">{user.phone || 'Not provided'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Account Type</div>
                        <div className="font-medium text-gray-900 capitalize">{user.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Supplier Business Info */}
            {user.role === UserRole.SUPPLIER && supplierProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <Building2 className="w-5 h-5 text-primary-600" />
                  Business Information
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">Business Name</div>
                        <div className="font-medium text-gray-900">{supplierProfile.business_name}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">Business Type</div>
                        <div className="font-medium text-gray-900">{supplierProfile.business_type || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">GSTIN</div>
                        <div className="font-medium text-gray-900">{supplierProfile.gstin || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">PAN</div>
                        <div className="font-medium text-gray-900">{supplierProfile.pan || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {supplierProfile.business_address && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">Business Address</div>
                        <div className="font-medium text-gray-900">
                          {supplierProfile.business_address}
                          {supplierProfile.city && `, ${supplierProfile.city}`}
                          {supplierProfile.state && `, ${supplierProfile.state}`}
                          {supplierProfile.pincode && ` - ${supplierProfile.pincode}`}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">Verification Status:</span>
                    <StatusBadge status={supplierProfile.verification_status} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Change Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary-500" />
                  Security
                </h2>
                {!showChangePassword && (
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {showChangePassword ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="input-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="input-base"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="input-base"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? 'Changing...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="btn-ghost border border-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-500">
                  Keep your account secure by using a strong password that you don't use elsewhere.
                </p>
              )}
            </motion.div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-500" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="font-bold text-gray-900">{orderStats.total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
                  <span className="text-sm text-amber-700">Pending</span>
                  <span className="font-bold text-amber-700">{orderStats.pending}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-sm text-emerald-700">Delivered</span>
                  <span className="font-bold text-emerald-700">{orderStats.delivered}</span>
                </div>
              </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-500" />
                Recent Orders
              </h3>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <a
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          #{order.order_number}
                        </span>
                        <StatusBadge status={order.status} size="sm" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          ₹{Number(order.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
