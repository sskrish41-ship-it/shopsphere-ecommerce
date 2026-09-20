import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, Truck, Package, ShieldCheck, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const STATUS_STEPS = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for delivery',
  'Delivered'
];

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const { addToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Defective item');
  const [returnComments, setReturnComments] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-500">Loading Order Tracking History...</p>
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.indexOf(order.status);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReturn(true);
    try {
      await api.post(`/orders/${order.id}/return`, {
        reason: returnReason,
        comments: returnComments
      });
      addToast('Return request submitted!', 'success');
      setShowReturnModal(false);
      fetchOrderDetails();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit return', 'error');
    } finally {
      setSubmittingReturn(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/profile?tab=orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-600 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Order #{order.order_number}
          </h1>
          <p className="text-xs text-gray-500 mt-1">Placed on {order.created_at?.slice(0, 10)}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm ${
            order.status === 'Delivered'
              ? 'bg-emerald-500 text-white'
              : order.status === 'Cancelled'
              ? 'bg-rose-500 text-white'
              : 'bg-amber-500 text-white'
          }`}>
            {order.status}
          </span>

          {order.status === 'Delivered' && !order.return_request && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="px-4 py-1.5 rounded-full border border-rose-500 text-rose-500 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              Request Return
            </button>
          )}
        </div>
      </div>

      {/* Visual Timeline Stepper */}
      {order.status !== 'Cancelled' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-sm">
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white mb-8">Delivery Timeline Progress</h3>

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
            
            {/* Connecting line */}
            <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-gray-200 dark:bg-gray-800 z-0" />

            {STATUS_STEPS.map((st, idx) => {
              const isDone = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <div key={st} className="relative z-10 flex md:flex-col items-center gap-3 md:text-center w-full">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isCurrent ? 'text-brand-600 dark:text-brand-400' : isDone ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                      {st}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Log History */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Timestamped Status History</h3>

        <div className="space-y-3">
          {order.history?.map(h => (
            <div key={h.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4 text-xs">
              <div>
                <span className="font-extrabold text-gray-900 dark:text-white block text-sm">{h.status}</span>
                <span className="text-gray-500 mt-1 block">{h.notes}</span>
              </div>
              <span className="text-gray-400 font-bold whitespace-nowrap">{h.timestamp?.slice(0, 16).replace('T', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReturnModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Request Return / Refund</h3>
            
            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold text-xs"
                >
                  <option value="Defective or Damaged">Defective or Damaged Item</option>
                  <option value="Wrong Item Received">Wrong Item Delivered</option>
                  <option value="Size Does Not Fit">Size / Fit Issue</option>
                  <option value="Changed Mind">Changed Mind</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Additional Comments</label>
                <textarea
                  rows="3"
                  placeholder="Provide details for return request..."
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowReturnModal(false)} className="flex-1 py-2.5 rounded-xl border font-bold">Cancel</button>
                <button type="submit" disabled={submittingReturn} className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold">Submit Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderTrackingPage;
