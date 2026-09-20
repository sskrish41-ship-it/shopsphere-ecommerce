import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Printer, MapPin, Truck } from 'lucide-react';
import api from '../services/api';
import { formatINR } from '../utils/currency';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then(res => setOrder(res.data.order))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading || !order) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-500">Generating Order Details & Receipt...</p>
      </div>
    );
  }

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      
      {/* Success Box */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 sm:p-12 text-center shadow-xl space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Order Confirmed!</h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Thank you for your purchase. We have received your order <strong className="text-gray-900 dark:text-white">#{order.order_number}</strong> and sent a confirmation email.
        </p>

        <div className="pt-2 flex justify-center gap-4">
          <Link
            to={`/orders/${order.id}/track`}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-lg shadow-brand-500/20 flex items-center gap-2"
          >
            <Truck className="w-4 h-4" /> Track Order Real-Time
          </Link>

          <button
            onClick={handlePrintInvoice}
            className="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Printer className="w-4 h-4" /> Print Receipt / Invoice
          </button>
        </div>
      </div>

      {/* Invoice Breakdown Sheet */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-6 gap-4">
          <div>
            <div className="text-xs font-bold text-gray-400">INVOICE NO:</div>
            <div className="text-lg font-black text-gray-900 dark:text-white">{order.order_number}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-gray-400">ORDER DATE:</div>
            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{order.created_at?.slice(0, 10)}</div>
          </div>
        </div>

        {/* Items */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {order.items?.map(item => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <img src={item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'} alt="" className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">{item.product_name}</div>
                  <div className="text-gray-400">Quantity: {item.quantity} × {formatINR(item.price)}</div>
                </div>
              </div>
              <div className="font-extrabold text-sm text-gray-900 dark:text-white">
                {formatINR(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2 text-xs max-w-xs ml-auto">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatINR(order.subtotal || 0)}</span></div>
          {order.discount_amount > 0 && <div className="flex justify-between text-rose-600 font-bold"><span>Discount</span><span>-{formatINR(order.discount_amount)}</span></div>}
          <div className="flex justify-between text-gray-500"><span>GST (18%)</span><span>{formatINR(order.tax_amount || 0)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shipping_fee === 0 ? 'FREE' : formatINR(order.shipping_fee)}</span></div>
          <div className="flex justify-between font-black text-base text-gray-900 dark:text-white pt-2 border-t">
            <span>Total Paid</span>
            <span className="text-brand-600">{formatINR(order.total_amount || 0)}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OrderConfirmationPage;
