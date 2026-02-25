import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Key, ArrowLeft, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import toast from 'react-hot-toast';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Reset token is required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, newPassword);
      toast.success('Password reset successful! Please log in with your new password.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-emerald-500 to-teal-400 relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="bg-white rounded-2xl px-4 py-2 shadow-lg mb-6 inline-block">
              <img src="/Eflora.jpeg" alt="eFlora" className="h-14 w-auto object-contain" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Set New Password</h2>
            <p className="text-xl text-white/80 max-w-md">
              Choose a strong password to keep your account secure.
            </p>
          </motion.div>

          <div className="absolute top-16 left-12 text-6xl opacity-20 animate-float stagger-2">🔒</div>
          <div className="absolute bottom-20 right-16 text-5xl opacity-20 animate-float stagger-3">🌿</div>
          <div className="absolute top-1/3 right-12 text-4xl opacity-20 animate-float stagger-4">🍃</div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center mb-8">
            <img src="/Eflora.jpeg" alt="eFlora" className="h-12 w-auto object-contain" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-500 mb-8">Enter your reset token and choose a new password.</p>

          {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reset Token</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  placeholder="Paste your reset token"
                  className="input-base pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Create a new password"
                  className="input-base pl-11"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Min 8 chars, with uppercase, lowercase, number & special char</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your new password"
                  className="input-base pl-11"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Reset Password <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
