import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const { addToast } = useToast();

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrder, setMinOrder] = useState(499);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data.coupons || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', {
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_value: discountValue,
        min_order_amount: minOrder
      });
      addToast('Coupon created!', 'success');
      setCode('');
      fetchCoupons();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to create coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await api.delete(`/admin/coupons/${id}`);
      addToast('Coupon deleted', 'info');
      fetchCoupons();
    } catch (err) {
      addToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Coupon & Discount Manager</h1>
        <p className="text-xs text-gray-500 mt-1">Create promotional discount codes for checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Left (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-500" /> Create New Coupon
          </h3>

          <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Coupon Code</label>
              <input
                type="text" placeholder="e.g. SUMMER25" value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold uppercase"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Discount Type</label>
                <select
                  value={discountType} onChange={e => setDiscountType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Discount Value</label>
                <input
                  type="number" value={discountValue}
                  onChange={e => setDiscountValue(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Min Order Amount (₹)</label>
              <input
                type="number" value={minOrder}
                onChange={e => setMinOrder(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
              />
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 text-white font-extrabold text-xs shadow-md">
              Save & Activate Coupon
            </button>
          </form>
        </div>

        {/* Coupons List Right (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Active Promotional Coupons</h3>

          <div className="space-y-3">
            {coupons.map(c => (
              <div key={c.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-sm text-brand-600 dark:text-brand-400 uppercase tracking-wider">{c.code}</span>
                  <div className="text-gray-500 mt-0.5">
                    {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `${formatINR(c.discount_value)} OFF`} • Min Order: {formatINR(c.min_order_amount)}
                  </div>
                </div>

                <button onClick={() => handleDeleteCoupon(c.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminCoupons;
