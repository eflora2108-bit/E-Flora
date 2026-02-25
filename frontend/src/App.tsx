import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/layout/Layout';

// Home
import { HomePage } from './pages/Home/HomePage';

// Auth Pages
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { ResetPasswordPage } from './pages/ResetPassword';

// Product Pages
import { ProductCatalogPage } from './pages/Products/ProductCatalog';
import { ProductDetailPage } from './pages/Products/ProductDetail';

// Cart & Checkout
import { CartPage } from './pages/Cart/CartPage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';

// Orders & Invoices
import { OrderListPage } from './pages/Orders/OrderList';
import { OrderDetailPage } from './pages/Orders/OrderDetail';
import { OrderSuccessPage } from './pages/Orders/OrderSuccess';
import { InvoiceViewPage } from './pages/Invoices/InvoiceView';

// Wishlist
import WishlistPage from './pages/Wishlist/WishlistPage';

// Profile
import { ProfilePage } from './pages/Profile/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/Dashboard';
import { ProductModerationPage } from './pages/admin/ProductModeration';
import { AdminSupplierVerification } from './pages/admin/SupplierVerification';
import { OrderManagementPage } from './pages/admin/OrderManagement';
import { AdminReportsPage } from './pages/admin/Reports';

// Supplier Pages
import { SupplierSetupPage } from './pages/supplier/SupplierSetup';
import { ProductManagementPage } from './pages/supplier/ProductManagement';
import { SupplierOrdersPage } from './pages/supplier/SupplierOrders';
import { InventoryDashboardPage } from './pages/supplier/InventoryDashboard';

// Protected Route Component
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '12px',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            {/* Home Page */}
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                <Layout showHeader={false} showFooter={false}>
                  <LoginPage />
                </Layout>
              }
            />
            <Route
              path="/register"
              element={
                <Layout showHeader={false} showFooter={false}>
                  <RegisterPage />
                </Layout>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <Layout showHeader={false} showFooter={false}>
                  <ForgotPasswordPage />
                </Layout>
              }
            />
            <Route
              path="/reset-password"
              element={
                <Layout showHeader={false} showFooter={false}>
                  <ResetPasswordPage />
                </Layout>
              }
            />

            {/* Product Routes (Public) */}
            <Route
              path="/products"
              element={
                <Layout>
                  <ProductCatalogPage />
                </Layout>
              }
            />
            <Route
              path="/products/:slug"
              element={
                <Layout>
                  <ProductDetailPage />
                </Layout>
              }
            />

            {/* Protected Customer Routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CartPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CheckoutPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Layout>
                    <WishlistPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrderListPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrderDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-success"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrderSuccessPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InvoiceViewPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - AdminLayout is rendered inside each page */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/pending"
              element={
                <ProtectedRoute requireAdmin>
                  <ProductModerationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/suppliers/pending"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminSupplierVerification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute requireAdmin>
                  <OrderManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Supplier Routes - SupplierLayout is rendered inside each page */}
            <Route
              path="/supplier/setup"
              element={
                <ProtectedRoute requireSupplier>
                  <SupplierSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supplier/products"
              element={
                <ProtectedRoute requireSupplier>
                  <ProductManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supplier/orders"
              element={
                <ProtectedRoute requireSupplier>
                  <SupplierOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supplier/inventory"
              element={
                <ProtectedRoute requireSupplier>
                  <InventoryDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
