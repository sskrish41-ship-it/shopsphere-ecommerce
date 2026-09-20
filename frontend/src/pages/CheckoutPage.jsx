import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, MapPin, CreditCard, Truck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';

const CheckoutPage = () => {
  const { items, subtotal, taxAmount, shippingFee, discountAmount, appliedCoupon, grandTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI Instant Pay');
  const [submitting, setSubmitting] = useState(false);

  // New address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      addToast('Please login to complete checkout', 'error');
      navigate('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    // Load user addresses
    api.get('/auth/addresses')
      .then(res => {
        const addrs = res.data.addresses || [];
        setAddresses(addrs);
        const def = addrs.find(a => a.is_default) || addrs[0];
        if (def) setSelectedAddress(def);
        else setShowAddressForm(true);
      })
      .catch(err => console.error(err));
  }, [isAuthenticated, items]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/addresses', newAddr);
      setAddresses(prev => [...prev, res.data.address]);
      setSelectedAddress(res.data.address);
      setShowAddressForm(false);
      addToast('Address saved', 'success');
    } catch (err) {
      addToast('Failed to save address', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      addToast('Please select or add a shipping address', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        shipping_address: selectedAddress,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.code : null
      });

      const order = res.data.order;
      clearCart();
      addToast('Order placed successfully!', 'success');
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Order creation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Checkout Stepper Bar */}
      <div className="flex justify-between items-center max-w-2xl mx-auto mb-10">
        {[
          { id: 1, label: 'Address' },
          { id: 2, label: 'Delivery' },
          { id: 3, label: 'Payment' },
          { id: 4, label: 'Review & Pay' }
        ].map(s => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= s.id ? 'bg-brand-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
            }`}>
              {s.id}
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step >= s.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Step Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* STEP 1: Address Selection */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-600" /> Step 1: Select Shipping Address
              </h2>

              {!showAddressForm && addresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedAddress?.id === addr.id
                          ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/30'
                          : 'border-gray-100 dark:border-gray-800 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-extrabold text-xs text-gray-900 dark:text-white">{addr.full_name}</span>
                        {addr.is_default && <span className="text-[10px] font-bold bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">Default</span>}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} {addr.postal_code}, {addr.country}
                      </p>
                      <div className="text-[10px] text-gray-400 mt-2">Phone: {addr.phone}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Address Toggle / Form */}
              {showAddressForm ? (
                <form onSubmit={handleAddAddress} className="space-y-4 text-xs pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Add New Address</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text" placeholder="Full Name" value={newAddr.full_name} required
                      onChange={e => setNewAddr({...newAddr, full_name: e.target.value})}
                      className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    />
                    <input
                      type="text" placeholder="Phone Number" value={newAddr.phone} required
                      onChange={e => setNewAddr({...newAddr, phone: e.target.value})}
                      className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  <input
                    type="text" placeholder="Street Address" value={newAddr.street} required
                    onChange={e => setNewAddr({...newAddr, street: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text" placeholder="City" value={newAddr.city} required
                      onChange={e => setNewAddr({...newAddr, city: e.target.value})}
                      className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    />
                    <input
                      type="text" placeholder="State" value={newAddr.state} required
                      onChange={e => setNewAddr({...newAddr, state: e.target.value})}
                      className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    />
                    <input
                      type="text" placeholder="Postal Code" value={newAddr.postal_code} required
                      onChange={e => setNewAddr({...newAddr, postal_code: e.target.value})}
                      className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl">Save Address</button>
                    {addresses.length > 0 && <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2.5 border rounded-xl">Cancel</button>}
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowAddressForm(true)} className="text-xs font-bold text-brand-600 hover:underline">
                  + Add Another Address
                </button>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  disabled={!selectedAddress}
                  onClick={() => setStep(2)}
                  className="px-8 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm disabled:opacity-40"
                >
                  Continue to Delivery →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Option */}
          {step === 2 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-600" /> Step 2: Delivery Method
              </h2>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border-2 border-brand-600 bg-brand-50/40 dark:bg-brand-950/30 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-sm text-gray-900 dark:text-white">Standard Express Shipping</div>
                    <div className="text-xs text-gray-500">Delivered in 3 - 5 Business Days</div>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 border rounded-xl font-bold text-xs">Back</button>
                <button onClick={() => setStep(3)} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm">Continue to Payment →</button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method */}
          {step === 3 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-600" /> Step 3: Select Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {['Credit Card', 'UPI Instant Pay', 'Net Banking', 'Cash on Delivery'].map(pm => (
                  <div
                    key={pm}
                    onClick={() => setPaymentMethod(pm)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer font-bold flex items-center gap-3 transition-all ${
                      paymentMethod === pm ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/30 text-brand-600' : 'border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === pm ? 'border-brand-600 bg-brand-600' : 'border-gray-400'}`} />
                    {pm}
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 border rounded-xl font-bold text-xs">Back</button>
                <button onClick={() => setStep(4)} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm">Review Final Order →</button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Place Order */}
          {step === 4 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Step 4: Final Order Review</h2>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-500">Shipping To:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedAddress?.full_name}, {selectedAddress?.street}, {selectedAddress?.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-500">Payment Mode:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{paymentMethod}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-base shadow-xl flex items-center justify-center gap-2"
              >
                {submitting ? 'Processing Order...' : `Confirm & Pay ${formatINR(grandTotal)}`}
              </button>
            </div>
          )}

        </div>

        {/* Sidebar Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
            <h3 className="font-black text-sm text-gray-900 dark:text-white border-b pb-3">Items in Order ({items.length})</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.product?.primary_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 truncate">
                    <div className="font-bold truncate">{item.product?.name}</div>
                    <div className="text-[10px] text-gray-400">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-bold">{formatINR((item.variant?.price_override || item.product?.price || 0) * item.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t space-y-2">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-rose-600 font-bold"><span>Discount</span><span>-{formatINR(discountAmount)}</span></div>}
              <div className="flex justify-between text-gray-500"><span>GST (18%)</span><span>{formatINR(taxAmount)}</span></div>
              <div className="flex justify-between font-black text-sm text-gray-900 dark:text-white pt-2 border-t">
                <span>Total</span>
                <span className="text-brand-600">{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
