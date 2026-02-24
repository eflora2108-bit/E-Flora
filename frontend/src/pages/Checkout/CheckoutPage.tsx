import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { addressService } from '../../services/addressService';
import { toast } from 'react-hot-toast';
import { checkoutService } from '../../services/checkoutService';
import { paymentService } from '../../services/paymentService';
import { Address, AddressType, AddressFormData } from '../../types';
import { ErrorAlert } from '../../components/ui/ErrorAlert';

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex mb-8 gap-4">
          {['Shipping', 'Review', 'Payment'].map((label, index) => (
            <div
              key={label}
              className={`flex-1 py-4 rounded-lg text-center font-semibold transition-all ${
                step > index + 1
                  ? 'bg-primary-600 text-white shadow-md'
                  : step === index + 1
                  ? 'bg-white text-primary-600 border-2 border-primary-500 shadow-sm'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {index + 1}. {label}
            </div>
          ))}
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

        {/* Step 1: Shipping Address */}
        {step === 1 && (
          <div className="bg-white rounded-xl p-8 shadow-sm animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>

            {addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No shipping addresses found</p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="btn-primary"
                >
                  + Add New Address
                </button>
              </div>
            ) : !showAddressForm ? (
              <>
                <div className="flex flex-col gap-4 mb-6">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-2 border-primary-500 bg-primary-50 shadow-sm'
                          : 'border border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{addr.full_name}</div>
                      <div className="text-sm text-gray-500">
                        {addr.address_line1}
                        {addr.address_line2 && `, ${addr.address_line2}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </div>
                      <div className="text-sm text-gray-500">Phone: {addr.phone}</div>
                      {addr.is_default && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddressForm(true)}
                  className="btn-secondary mb-6"
                >
                  + Add New Address
                </button>

                <button
                  onClick={handleContinueToReview}
                  disabled={!selectedAddressId || loading}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                    !selectedAddressId || loading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg cursor-pointer'
                  }`}
                >
                  {loading ? 'Loading...' : 'Continue to Review'}
                </button>
              </>
            ) : (
              <div>
                <div className="grid gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={addressForm.full_name}
                    onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                    className="input-base"
                  />
                  <input
                    type="tel"
                    placeholder="Phone *"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="input-base"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 1 *"
                    value={addressForm.address_line1}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                    className="input-base"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={addressForm.address_line2}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                    className="input-base"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="City *"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="input-base"
                    />
                    <input
                      type="text"
                      placeholder="State *"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="input-base"
                    />
                    <input
                      type="text"
                      placeholder="Pincode *"
                      maxLength={6}
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="input-base"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 py-3 bg-transparent text-gray-500 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAddress}
                    disabled={loading}
                    className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                      loading
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 cursor-pointer'
                    }`}
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
          <div className="bg-white rounded-xl p-8 shadow-sm animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Order</h2>

            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
              {addresses.find((a) => a.id === selectedAddressId) && (
                <div className="text-sm text-gray-500 leading-relaxed">
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

            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items ({cart.items.length})</h3>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-semibold text-gray-900">₹{Number(item.total_with_gst || 0).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Price Summary</h3>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>Subtotal</span>
                <span>₹{Number(orderTotals.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>GST</span>
                <span>₹{Number(orderTotals.total_gst).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>Shipping Charges</span>
                <span className={orderTotals.shipping_charges === 0 ? 'text-emerald-500 font-medium' : ''}>
                  {orderTotals.shipping_charges === 0 ? 'FREE' : `₹${Number(orderTotals.shipping_charges).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t-2 border-gray-200 text-lg font-bold">
                <span>Grand Total</span>
                <span className="text-primary-600">₹{Number(orderTotals.grand_total).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-transparent text-gray-500 border border-gray-300 rounded-lg font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className={`flex-[2] py-3 rounded-lg font-bold text-white transition-all ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg cursor-pointer'
                }`}
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
