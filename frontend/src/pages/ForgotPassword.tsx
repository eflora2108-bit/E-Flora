import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { ErrorAlert } from '../components/ui/ErrorAlert';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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
            <h2 className="text-4xl font-bold mb-4">Reset Your Password</h2>
            <p className="text-xl text-white/80 max-w-md">
              Don't worry, it happens to the best of us. We'll help you get back in.
            </p>
          </motion.div>

          <div className="absolute top-16 left-12 text-6xl opacity-20 animate-float stagger-2">🔑</div>
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

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
              </div>
              <p className="text-gray-500 mb-6">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                Please check your inbox and spam folder.
              </p>
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-8">
                <p className="text-sm text-primary-800">
                  The reset link will expire in 1 hour. If you don't receive an email, try again or contact support.
                </p>
              </div>
              <div className="space-y-3">
                <Link
                  to="/reset-password"
                  className="btn-primary w-full py-3 text-base block text-center"
                >
                  I have a reset token
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-primary-600 font-semibold hover:text-primary-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-500 mb-8">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
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
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-500">
                <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
