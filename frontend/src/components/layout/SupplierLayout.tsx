import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  Store,
  Menu,
  X,
} from 'lucide-react';

interface SupplierLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const navItems = [
  { icon: Package, label: 'My Products', path: '/supplier/products' },
  { icon: ShoppingBag, label: 'Orders', path: '/supplier/orders' },
  { icon: BarChart3, label: 'Inventory', path: '/supplier/inventory' },
  { icon: Settings, label: 'Setup', path: '/supplier/setup' },
];

export const SupplierLayout = ({ children, title, subtitle }: SupplierLayoutProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Branding */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <Link to="/supplier/products" className="flex items-center gap-2">
            <img src="/Eflora.jpeg" alt="eFlora" className="h-8 w-auto object-contain" />
            <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              Supplier
            </span>
          </Link>
          <button
            className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={active ? 'sidebar-link-active' : 'sidebar-link'}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom link */}
        <div className="px-3 py-4 border-t border-gray-100">
          <Link
            to="/products"
            className="sidebar-link text-gray-400 hover:text-primary-600"
          >
            <Store className="w-5 h-5" />
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:ml-64 min-h-screen">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b border-gray-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg mr-3"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Desktop page header */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};
