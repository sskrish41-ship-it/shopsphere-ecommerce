import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';

const ALL_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for delivery',
  'Delivered',
  'Cancelled',
  'Return requested',
  'Returned',
  'Refunded'
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/orders?status=${filterStatus}`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      addToast(`Order status updated to ${newStatus}`, 'success');
      fetchOrders();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleReturnAction = async (returnId, status) => {
    try {
      await api.put(`/admin/returns/${returnId}`, { status });
      addToast(`Return request ${status}`, 'success');
      fetchOrders();
    } catch (err) {
      addToast('Operation failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Order Management</h1>
          <p className="text-xs text-gray-500 mt-1">Track orders, update delivery progress, and process returns</p>
        </div>

        {/* Filter Dropdown */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold"
        >
          <option value="all">All Order Statuses</option>
          {ALL_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold uppercase">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="p-4 font-black text-gray-900 dark:text-white">{o.order_number}</td>
                  <td className="p-4 font-bold">
                    <div>{o.user_name}</div>
                    <div className="text-[10px] text-gray-400">{o.user_email}</div>
                  </td>
                  <td className="p-4 font-black text-gray-900 dark:text-white">{formatINR(o.total_amount || 0)}</td>
                  <td className="p-4">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{o.payment_method}</span>
                    <span className={`block text-[10px] font-bold ${o.payment_status === 'Paid' ? 'text-emerald-600' : 'text-amber-500'}`}>{o.payment_status}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                      o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : o.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {o.status}
                    </span>

                    {/* Return request alert */}
                    {o.return_request && (
                      <div className="mt-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-[10px] space-y-1">
                        <span className="font-bold text-rose-600">Return Requested: {o.return_request.reason}</span>
                        {o.return_request.status === 'Requested' && (
                          <div className="flex gap-1 pt-1">
                            <button onClick={() => handleReturnAction(o.return_request.id, 'Approved')} className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold">Approve</button>
                            <button onClick={() => handleReturnAction(o.return_request.id, 'Rejected')} className="px-2 py-0.5 bg-rose-600 text-white rounded font-bold">Reject</button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold"
                    >
                      {ALL_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminOrders;
