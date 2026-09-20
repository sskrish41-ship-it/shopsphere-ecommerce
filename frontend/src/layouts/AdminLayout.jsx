import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Ticket, ArrowLeft, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h2 className="text-2xl font-black text-rose-600">Access Restricted</h2>
        <p className="text-xs text-gray-500">You must be logged in as an Administrator to view this control panel.</p>
        <Link to="/login" className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', label: 'Overview Analytics', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products Catalog', icon: Package },
    { path: '/admin/orders', label: 'Orders & Logistics', icon: ShoppingBag },
    { path: '/admin/customers', label: 'Customer Accounts', icon: Users },
    { path: '/admin/coupons', label: 'Coupons & Discounts', icon: Ticket }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 hidden md:flex flex-col justify-between border-r border-gray-800 flex-shrink-0">
        <div className="space-y-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-gray-900 flex items-center justify-center font-extrabold shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block">ShopSphere</span>
              <span className="text-[9px] font-bold tracking-widest text-amber-400 uppercase">Admin Portal</span>
            </div>
          </Link>

          <nav className="space-y-1 text-xs font-bold">
            {navItems.map(item => {
              const IconComp = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-amber-500 text-gray-950 font-black shadow-lg shadow-amber-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <IconComp className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-800 space-y-3">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Return To Storefront
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
