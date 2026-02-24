import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { addressService } from '../../services/addressService';
import { toast } from 'react-hot-toast';
import { checkoutService } from '../../services/checkoutService';
import { paymentService } from '../../services/paymentService';
import { Address, AddressType, AddressFormData } from '../../types';

// Declare Razorpay global type
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, refreshCart } = useCart();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderTotals, setOrderTotals] = useState<any>(null);

  const [addressForm, setAddressForm] = useState<AddressFormData>({
    address_type: AddressType.SHIPPING,
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    refreshCart();
    fetchAddresses();
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const data = await addressService.getAddressesByType(AddressType.SHIPPING);
      setAddresses(data);
      if (data.length > 0 && !selectedAddressId) {
        const defaultAddr = data.find((a) => a.is_default) || data[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err: any) {
      console.error('Failed to fetch addresses:', err.message);
    }
  };

  const handleAddAddress = async () => {
    setLoading(true);
    setError('');
    try {
      const newAddress = await addressService.createAddress(addressForm);
      await fetchAddresses();
      setSelectedAddressId(newAddress.id);
      setShowAddressForm(false);
      setAddressForm({
        address_type: AddressType.SHIPPING,
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToReview = async () => {
    if (!selectedAddressId) {
      setError('Please select a shipping address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const totals = await checkoutService.calculateTotals(selectedAddressId);
      setOrderTotals(totals);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Initiate payment (creates order)
      const paymentData = await paymentService.initiatePayment(selectedAddressId);

      // Check if Razorpay key is configured
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (razorpayKey && razorpayKey !== 'rzp_test_YOUR_KEY_ID') {
        // Real Razorpay flow
        const scriptLoaded = await paymentService.loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
        }

        const options = {
          key: razorpayKey,
          amount: paymentData.amount * 100,
          currency: paymentData.currency,
          name: 'eFlora Marketplace',
          description: `Order ${paymentData.order_number}`,
          order_id: paymentData.razorpay_order_id,
          handler: async function (response: any) {
            try {
              await paymentService.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              await refreshCart();
              navigate('/order-success', { state: { orderId: paymentData.order_id } });
            } catch (err: any) {
              setError(err.message);
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: addresses.find((a) => a.id === selectedAddressId)?.full_name || '',
            contact: addresses.find((a) => a.id === selectedAddressId)?.phone || '',
          },
          theme: { color: '#667eea' },
          modal: {
            ondismiss: function () {
              setLoading(false);
              setError('Payment cancelled');
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        // Mock payment flow for development (no Razorpay credentials)
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const mockSignature = 'mock_signature_for_development';

        await paymentService.verifyPayment(
          paymentData.razorpay_order_id,
          mockPaymentId,
          mockSignature
        );

        await refreshCart();
        toast.success('Order placed successfully!');
        navigate('/order-success', { state: { orderId: paymentData.order_id } });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !cart) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>💳 Checkout</h1>

        {/* Progress Steps */}
        <div style={{ display: 'flex', marginBottom: '2rem', gap: '1rem' }}>
          {['Shipping', 'Review', 'Payment'].map((label, index) => (
            <div
              key={label}
              style={{
                flex: 1,
                padding: '1rem',
                background: step > index ? '#667eea' : step === index + 1 ? 'white' : '#f0f0f0',
                color: step > index ? 'white' : step === index + 1 ? '#667eea' : '#999',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '600',
                border: step === index + 1 ? '2px solid #667eea' : 'none',
              }}
            >
              {index + 1}. {label}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee', color: '#c33', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        {/* Step 1: Shipping Address */}
        {step === 1 && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Shipping Address</h2>

            {addresses.length === 0 && !showAddressForm ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ color: '#666', marginBottom: '1rem' }}>No shipping addresses found</p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  + Add New Address
                </button>
              </div>
            ) : !showAddressForm ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      style={{
                        padding: '1rem',
                        border: selectedAddressId === addr.id ? '2px solid #667eea' : '1px solid #e0e0e0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: selectedAddressId === addr.id ? '#f0f4ff' : 'white',
                      }}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{addr.full_name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {addr.address_line1}
                        {addr.address_line2 && `, ${addr.address_line2}`}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {addr.city}, {addr.state} - {addr.pincode}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>Phone: {addr.phone}</div>
                      {addr.is_default && (
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            background: '#10b981',
                            color: 'white',
                            fontSize: '0.75rem',
                            borderRadius: '4px',
                          }}
                        >
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddressForm(true)}
                  style={{
                    marginBottom: '1.5rem',
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    color: '#667eea',
                    border: '1px solid #667eea',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  + Add New Address
                </button>

                <button
                  onClick={handleContinueToReview}
                  disabled={!selectedAddressId || loading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: !selectedAddressId || loading ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: !selectedAddressId || loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Loading...' : 'Continue to Review'}
                </button>
              </>
            ) : (
              <div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={addressForm.full_name}
                    onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                    style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone *"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                  <input
                    type="text"
                    placeholder="Address Line 1 *"
                    value={addressForm.address_line1}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                    style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={addressForm.address_line2}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                    style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <input
                      type="text"
                      placeholder="City *"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                    <input
                      type="text"
                      placeholder="State *"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                    <input
                      type="text"
                      placeholder="Pincode *"
                      maxLength={6}
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => setShowAddressForm(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'transparent',
                      color: '#666',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAddress}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: loading ? '#ccc' : '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Review Order */}
        {step === 2 && orderTotals && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Review Your Order</h2>

            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Shipping Address</h3>
              {addresses.find((a) => a.id === selectedAddressId) && (
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {addresses.find((a) => a.id === selectedAddressId)!.full_name}
                  <br />
                  {addresses.find((a) => a.id === selectedAddressId)!.address_line1}
                  {addresses.find((a) => a.id === selectedAddressId)!.address_line2 &&
                    `, ${addresses.find((a) => a.id === selectedAddressId)!.address_line2}`}
                  <br />
                  {addresses.find((a) => a.id === selectedAddressId)!.city},{' '}
                  {addresses.find((a) => a.id === selectedAddressId)!.state} -{' '}
                  {addresses.find((a) => a.id === selectedAddressId)!.pincode}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Order Items ({cart.items.length})</h3>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600' }}>{item.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: '600' }}>₹{item.total_with_gst?.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>Price Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Subtotal</span>
                <span>₹{orderTotals.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>GST</span>
                <span>₹{orderTotals.total_gst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Shipping Charges</span>
                <span style={{ color: orderTotals.shipping_charges === 0 ? '#10b981' : 'inherit' }}>
                  {orderTotals.shipping_charges === 0 ? 'FREE' : `₹${orderTotals.shipping_charges.toFixed(2)}`}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '2px solid #ddd',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                }}
              >
                <span>Grand Total</span>
                <span style={{ color: '#667eea' }}>₹{orderTotals.grand_total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'transparent',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '1rem',
                  background: loading ? '#ccc' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Processing Payment...' : (
                  import.meta.env.VITE_RAZORPAY_KEY_ID && import.meta.env.VITE_RAZORPAY_KEY_ID !== 'rzp_test_YOUR_KEY_ID'
                    ? 'Pay with Razorpay'
                    : 'Place Order (Demo Payment)'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
