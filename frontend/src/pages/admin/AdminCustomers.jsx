import React, { useState, useEffect } from 'react';
import { Users, UserX, UserCheck, Search } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/customers');
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.put(`/admin/customers/${id}/toggle-status`);
      addToast(res.data.message, 'info');
      fetchCustomers();
    } catch (err) {
      addToast('Operation failed', 'error');
    }
  };

  const filtered = customers.filter(c => c.full_name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Customer Management</h1>
        <p className="text-xs text-gray-500 mt-1">Manage user accounts, view purchase history & activity</p>
      </div>

      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold uppercase">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="p-4 font-bold flex items-center gap-3">
                    <img src={c.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-gray-900 dark:text-white font-extrabold">{c.full_name}</div>
                      <div className="text-gray-400 text-[10px]">{c.email}</div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-gray-500">{c.phone || 'N/A'}</td>
                  <td className="p-4 font-black text-gray-900 dark:text-white">{c.order_count} Orders</td>
                  <td className="p-4 font-black text-emerald-600">{formatINR(c.total_spent || 0)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        c.is_active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {c.is_active ? 'Disable Account' : 'Enable Account'}
                    </button>
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

export default AdminCustomers;
