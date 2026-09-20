import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Bell, Lock, Heart, LogOut, CheckCircle2, Truck, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'profile';

  // Profile Form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Addresses State
  const [addresses, setAddresses] = useState([]);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (activeTab === 'orders') {
      setOrdersLoading(true);
      api.get('/orders')
        .then(res => setOrders(res.data.orders || []))
        .catch(err => console.error(err))
        .finally(() => setOrdersLoading(false));
    } else if (activeTab === 'notifications') {
      api.get('/notifications')
        .then(res => {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unread_count || 0);
        });
    } else if (activeTab === 'addresses') {
      api.get('/auth/addresses').then(res => setAddresses(res.data.addresses || []));
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await updateProfile({ full_name: fullName, phone });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/change-password', { current_password: currentPassword, new_password: newPassword });
      addToast('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update password', 'error');
    }
  };

  const handleMarkNotifRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm text-center">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt={user?.full_name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-brand-500/20"
            />
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">{user?.full_name}</h3>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-3 shadow-sm space-y-1">
            {[
              { id: 'profile', label: 'Personal Information', icon: User },
              { id: 'orders', label: 'My Orders', icon: Package },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
              { id: 'notifications', label: `Notifications (${unreadCount})`, icon: Bell },
              { id: 'security', label: 'Change Password', icon: Lock }
            ].map(tab => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSearchParams({ tab: tab.id })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <IconComp className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Content Area (9 cols) */}
        <div className="lg:col-span-9">

          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Personal Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs max-w-lg">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 font-bold text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                  />
                </div>
                <button type="submit" className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Orders */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">My Order History</h2>

              {ordersLoading ? (
                <div className="text-center py-10 text-xs font-bold text-gray-400">Loading Orders...</div>
              ) : orders.length === 0 ? (
                <p className="text-xs text-gray-500">You haven't placed any orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800 text-xs">
                        <div>
                          <span className="font-extrabold text-sm text-gray-900 dark:text-white">#{order.order_number}</span>
                          <span className="text-gray-400 block text-[10px]">{order.created_at?.slice(0, 10)}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {order.items?.map(item => (
                          <div key={item.id} className="flex items-center gap-3 text-xs">
                            <img src={item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div className="flex-1 truncate font-bold text-gray-800 dark:text-gray-200">{item.product_name}</div>
                            <div className="font-bold text-gray-900 dark:text-white">{formatINR(item.price)} × {item.quantity}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
                        <span className="font-extrabold text-gray-900 dark:text-white">Total: {formatINR(order.total_amount || 0)}</span>
                        <Link to={`/orders/${order.id}/track`} className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" /> Track Package
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Addresses */}
          {activeTab === 'addresses' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Saved Addresses</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {addresses.map(addr => (
                  <div key={addr.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="font-extrabold text-sm">{addr.full_name}</div>
                    <p className="text-gray-500">{addr.street}, {addr.city}, {addr.state} {addr.postal_code}</p>
                    <div className="text-[10px] text-gray-400">Phone: {addr.phone}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Notifications Center</h2>
              <div className="space-y-3 text-xs">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkNotifRead(n.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      n.is_read ? 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20' : 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30'
                    }`}
                  >
                    <div className="font-extrabold text-gray-900 dark:text-white text-sm mb-1">{n.title}</div>
                    <p className="text-gray-600 dark:text-gray-300">{n.message}</p>
                    <span className="text-[10px] text-gray-400 mt-2 block">{n.created_at?.slice(0, 16).replace('T', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Security */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-lg">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                    required
                    minLength={6}
                  />
                </div>
                <button type="submit" className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md">
                  Update Password
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
