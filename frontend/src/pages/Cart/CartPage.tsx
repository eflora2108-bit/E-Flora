import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, loading, error, updateQuantity, removeItem, refreshCart } = useCart();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    refreshCart();
  }, [isAuthenticated]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      await updateQuantity(productId, newQuantity);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemove = async (productId: string) => {
    if (!window.confirm('Remove this item from cart?')) return;
    try {
      await removeItem(productId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>🛒 Shopping Cart</h1>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee', color: '#c33', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        {loading && !cart ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '3rem 0' }}>Loading cart...</p>
        ) : !cart || cart.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', background: 'white', borderRadius: '12px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
            <h2 style={{ marginBottom: '1rem' }}>Your cart is empty</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Add some plants to get started!</p>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '0.875rem 2rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
            {/* Cart Items */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Items ({cart.items.length})</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr auto',
                      gap: '1rem',
                      padding: '1rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                    }}
                  >
                    {/* Product Image */}
                    <div
                      style={{
                        width: '100px',
                        height: '100px',
                        background:
                          item.images && item.images[0]
                            ? `url(http://localhost:5000${item.images[0]}) center/cover`
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2rem',
                      }}
                    >
                      {(!item.images || item.images.length === 0) && '🌱'}
                    </div>

                    {/* Product Info */}
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>{item.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                        SKU: {item.sku}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#667eea' }}>
                          ₹{item.price?.toFixed(2)}
                        </span>
                        {item.mrp && item.mrp > (item.price || 0) && (
                          <span style={{ fontSize: '0.9rem', color: '#999', textDecoration: 'line-through' }}>
                            ₹{item.mrp.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          disabled={loading}
                          style={{
                            width: '32px',
                            height: '32px',
                            background: '#f0f0f0',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          -
                        </button>
                        <span style={{ width: '40px', textAlign: 'center', fontWeight: '600' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          disabled={loading || item.quantity >= (item.stock_quantity || 0)}
                          style={{
                            width: '32px',
                            height: '32px',
                            background: '#f0f0f0',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemove(item.product_id)}
                          disabled={loading}
                          style={{
                            marginLeft: '1rem',
                            padding: '0.5rem 0.75rem',
                            background: 'transparent',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        ₹{item.total_with_gst?.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        (incl. GST ₹{item.gst_amount?.toFixed(2)})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', position: 'sticky', top: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Order Summary</h2>

                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#666' }}>Subtotal</span>
                    <span style={{ fontWeight: '600' }}>₹{cart.summary.subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#666' }}>GST</span>
                    <span style={{ fontWeight: '600' }}>₹{cart.summary.total_gst.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#666' }}>Shipping</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>
                      {cart.summary.subtotal >= 500 ? 'FREE' : '₹50.00'}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                  }}
                >
                  <span>Total</span>
                  <span style={{ color: '#667eea' }}>
                    ₹{(cart.summary.total + (cart.summary.subtotal >= 500 ? 0 : 50)).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: loading ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/products')}
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: 'transparent',
                    color: '#667eea',
                    border: '1px solid #667eea',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
