import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { useState, useEffect } from 'react';

// Simple router component
const Router = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  return <Routes currentPath={currentPath} navigate={navigate} />;
};

const Routes = ({ currentPath, navigate }: { currentPath: string; navigate: (path: string) => void }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    );
  }

  // Redirect logic
  if (isAuthenticated && (currentPath === '/login' || currentPath === '/register' || currentPath === '/')) {
    return <Dashboard navigate={navigate} />;
  }

  if (!isAuthenticated && currentPath !== '/login' && currentPath !== '/register') {
    window.history.replaceState({}, '', '/login');
    return <LoginPage />;
  }

  switch (currentPath) {
    case '/login':
      return <LoginPage />;
    case '/register':
      return <RegisterPage />;
    case '/dashboard':
    case '/':
      return <Dashboard navigate={navigate} />;
    default:
      return <div>404 - Not Found</div>;
  }
};

const Dashboard = ({ navigate }: { navigate: (path: string) => void }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: '2.5rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{ fontSize: '2rem', color: '#333' }}>
            🌱 eFlora Dashboard
          </h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Logout
          </button>
        </div>

        <div style={{
          padding: '1.5rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#667eea' }}>
            Welcome, {user?.first_name} {user?.last_name}!
          </h2>
          <div style={{ color: '#666', lineHeight: '1.8' }}>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              background: user?.role === 'admin' ? '#dc3545' : user?.role === 'supplier' ? '#28a745' : '#007bff',
              color: 'white',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              {user?.role?.toUpperCase()}
            </span></p>
            <p><strong>Email Verified:</strong> {user?.email_verified ? '✅ Yes' : '❌ No'}</p>
            {!user?.email_verified && (
              <p style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff3cd', borderRadius: '6px', color: '#856404' }}>
                ⚠️ Please verify your email to access all features
              </p>
            )}
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          background: '#e7f3ff',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>✅ Phase 2 Complete: Authentication</h3>
          <ul style={{ lineHeight: '2', color: '#666' }}>
            <li>✅ User registration with role selection</li>
            <li>✅ JWT-based login & authentication</li>
            <li>✅ Protected routes and dashboards</li>
            <li>✅ Token refresh mechanism</li>
            <li>✅ Password strength validation</li>
            <li>✅ Role-based access control (RBAC)</li>
          </ul>
          <p style={{ marginTop: '1rem', fontWeight: '600', color: '#667eea' }}>
            🚀 Next: Phase 3 - Supplier Verification
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
