import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Ticket, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';

const CartPage = () => {
  const {
    items,
    subtotal,
    taxAmount,
    shippingFee,
    discountAmount,
    appliedCoupon,
    grandTotal,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    clearCart
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    await applyCoupon(couponInput.trim());
    setApplying(false);
    setCouponInput('');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center mx-auto shadow-xl">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Your Cart Is Empty</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Explore our wide selection of high performance laptops, audio headsets, athletic sneakers, and designer watches.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 transition-all"
        >
          Explore Shop <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">
        Shopping Cart ({items.reduce((acc, i) => acc + i.quantity, 0)} Items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map(item => {
                const product = item.product || {};
                const variant = item.variant || {};
                const price = variant.price_override || product.price || 0;
                const availableStock = variant.stock_quantity || product.stock_quantity || 10;

                return (
                  <div key={item.id} className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.primary_image || (product.images?.[0]?.image_url) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'}
                        alt={product.name}
                        className="w-20 h-20 rounded-2xl object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {product.brand?.name || 'ShopSphere'}
                        </span>
                        <Link to={`/product/${product.slug}`} className="block font-bold text-sm text-gray-900 dark:text-white hover:text-brand-600">
                          {product.name}
                        </Link>
                        {variant.size && <span className="text-xs text-gray-400">Size: {variant.size} </span>}
                        {variant.color && <span className="text-xs text-gray-400">Color: {variant.color}</span>}
                        <div className="text-xs font-bold text-gray-900 dark:text-white sm:hidden">
                          {formatINR(price)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= availableStock}
                          className="px-3 py-1 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <div className="hidden sm:block text-right">
                        <div className="font-extrabold text-sm text-gray-900 dark:text-white">
                          {formatINR(price * item.quantity)}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {formatINR(price)} each
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <button
                onClick={clearCart}
                className="text-xs font-bold text-gray-500 hover:text-rose-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Cart
              </button>
              <Link to="/shop" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-black text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">
              Order Summary
            </h3>

            {/* Coupon Box */}
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Ticket className="w-4 h-4 text-brand-600" /> Apply Coupon Code
              </label>

              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300">
                      {appliedCoupon.code}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      Saved {formatINR(discountAmount)}
                    </div>
                  </div>
                  <button onClick={removeCoupon} className="text-xs font-bold text-rose-600 hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold outline-none uppercase"
                  />
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-gray-800 text-white font-bold text-xs hover:bg-gray-800"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatINR(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>GST (18%)</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatINR(taxAmount)}</span>
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping Fee</span>
                <span className="font-bold text-emerald-600">
                  {shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-baseline text-base font-black text-gray-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-xl text-brand-600 dark:text-brand-400">{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2 transition-all"
            >
              Proceed To Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-gray-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> 256-Bit Encrypted Secure Checkout
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
