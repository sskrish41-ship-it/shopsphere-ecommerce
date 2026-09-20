import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, RefreshCw, Star, TrendingUp, LayoutDashboard, Plus } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../../services/api';
import { formatINR } from '../../utils/currency';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to load admin stats', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-500 text-xs">Loading Admin Analytics & Revenue Charts...</p>
      </div>
    );
  }

  const { stats, charts, top_products } = data;

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
            ADMINISTRATOR CONTROL PANEL
          </span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mt-1">Dashboard Analytics</h1>
        </div>

        <Link
          to="/admin/products?action=new"
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </Link>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{formatINR(stats.total_revenue || 0)}</div>
            <div className="text-[10px] font-bold text-emerald-500 mt-1">↑ 14.2% vs last month</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.total_orders}</div>
            <div className="text-[10px] font-bold text-amber-500 mt-1">{stats.pending_orders} Pending Processing</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Users</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.total_customers}</div>
            <div className="text-[10px] font-bold text-indigo-500 mt-1">Active Accounts</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Low Stock Alert</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.low_stock_products}</div>
            <div className="text-[10px] font-bold text-rose-500 mt-1">≤ 5 units left</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Revenue Growth Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Revenue Over Time (Past 7 Days)</h3>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">Live Updates</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenue_chart}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales By Category Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Sales By Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.category_chart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="category" stroke="#888888" fontSize={9} />
                <YAxis stroke="#888888" fontSize={10} />
                <Tooltip />
                <Bar dataKey="sales" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top Products Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Top Performing Products</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold uppercase">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {top_products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="p-3 font-bold flex items-center gap-3">
                    <img src={p.primary_image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="truncate max-w-xs text-gray-900 dark:text-white">{p.name}</span>
                  </td>
                  <td className="p-3 font-semibold text-gray-500">{p.category?.name}</td>
                  <td className="p-3 font-black text-gray-900 dark:text-white">{formatINR(p.price)}</td>
                  <td className="p-3 font-bold text-emerald-600">{p.stock_quantity}</td>
                  <td className="p-3 font-bold text-amber-500">★ {p.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
