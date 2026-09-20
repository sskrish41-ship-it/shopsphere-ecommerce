import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, ShoppingCart, Heart, User, Sun, Moon, Menu, X, ChevronDown,
  Sparkles, Grid, Zap, LogOut, Package, LayoutDashboard,
  Cpu, Shirt, Footprints, Home, Activity, Watch, BookOpen, Gamepad2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { formatINR } from '../utils/currency';
import api from '../services/api';

const categoryIcons = {
  electronics: Cpu,
  fashion: Shirt,
  shoes: Footprints,
  beauty: Sparkles,
  'home-kitchen': Home,
  sports: Activity,
  accessories: Watch,
  grocery: ShoppingCart,
  books: BookOpen,
  gaming: Gamepad2
};

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isDark, toggleTheme } = useTheme();

  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [], brands: [] });
  const [showSearchModal, setShowSearchModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch categories for mega menu
    api.get('/categories')
      .then(res => setCategories(res.data.categories || []))
      .catch(err => console.error(err));
  }, []);

  // Close menus on page route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    setUserDropdownOpen(false);
    setShowSearchModal(false);
  }, [location.pathname]);

  // Live autocomplete search
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const delay = setTimeout(() => {
        api.get(`/products/suggestions?q=${encodeURIComponent(searchTerm)}`)
          .then(res => setSuggestions(res.data))
          .catch(err => console.error(err));
      }, 250);
      return () => clearTimeout(delay);
    } else {
      setSuggestions({ products: [], categories: [], brands: [] });
    }
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearchModal(false);
      setSearchTerm('');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-brand-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  ShopSphere
                </span>
                <span className="text-[10px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase -mt-1">
                  Premium Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Home
              </Link>
              <Link to="/shop" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Shop All
              </Link>

              {/* Categories Mega Menu Trigger */}
              <div
                className="relative py-6"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Categories <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mega Menu Dropdown */}
                {megaMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-[720px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-6 grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    {categories.map((cat) => {
                      const IconComp = categoryIcons[cat.slug] || Grid;
                      return (
                        <Link
                          key={cat.id}
                          to={`/shop?category=${cat.slug}`}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-brand-50 dark:hover:bg-gray-800/60 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 text-sm">
                              {cat.name}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {cat.product_count || 12}+ items
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link to="/shop?is_deal=true" className="text-rose-600 dark:text-rose-400 font-bold hover:text-rose-700 flex items-center gap-1">
                <Zap className="w-4 h-4 text-rose-500 fill-rose-500" /> Flash Deals
              </Link>
              <Link to="/brands" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Brands
              </Link>
              <Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                About
              </Link>
              <Link to="/contact" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Contact
              </Link>
            </nav>

            {/* Right Action Icons & Search */}
            <div className="flex items-center gap-3 sm:gap-4">

              {/* Search Bar Input (Desktop) */}
              <div className="relative hidden md:block w-56 lg:w-72">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Search products, brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowSearchModal(true)}
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-brand-500 dark:focus:border-brand-400 focus:bg-white dark:focus:bg-gray-900 text-sm outline-none transition-all"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </form>

                {/* Live Suggestions Dropdown */}
                {showSearchModal && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-2">
                    {suggestions.categories.length > 0 && (
                      <div className="mb-2">
                        <div className="text-[10px] uppercase font-bold text-gray-400 px-3 py-1">Categories</div>
                        {suggestions.categories.map(c => (
                          <Link key={c.id} to={`/shop?category=${c.slug}`} className="block px-3 py-1.5 text-xs hover:bg-brand-50 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 font-medium">
                            in {c.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    {suggestions.products.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 px-3 py-1">Products</div>
                        {suggestions.products.map(p => (
                          <Link key={p.id} to={`/product/${p.slug}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                            <div className="truncate flex-1 text-xs font-medium text-gray-800 dark:text-gray-200">{p.name}</div>
                            <div className="text-xs font-bold text-brand-600 dark:text-brand-400">{formatINR(p.price)}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark / Light Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
              </button>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-bounce">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Link */}
              <Link
                to="/cart"
                className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User Account / Auth Dropdown */}
              <div className="relative">
                {isAuthenticated ? (
                  <div>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 p-1 rounded-full border-2 border-brand-500/30 hover:border-brand-500 transition-all"
                    >
                      <img
                        src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                        alt={user?.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </button>

                    {/* Account Dropdown Menu */}
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-200">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                          <div className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{user?.full_name}</div>
                          <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                          {isAdmin && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Admin Access
                            </span>
                          )}
                        </div>

                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-semibold">
                            <LayoutDashboard className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <User className="w-4 h-4 text-gray-400" /> My Profile
                        </Link>
                        <Link to="/profile?tab=orders" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <Package className="w-4 h-4 text-gray-400" /> My Orders
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/20 hover:shadow-brand-500/40 transition-all"
                  >
                    <User className="w-4 h-4" /> Sign In
                  </Link>
                )}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">S</div>
                  <span className="text-xl font-extrabold text-gray-900 dark:text-white">ShopSphere</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-base font-semibold">
                <Link to="/" className="py-2 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200">Home</Link>
                <Link to="/shop" className="py-2 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200">Shop All</Link>
                <Link to="/shop?is_deal=true" className="py-2 border-b border-gray-100 dark:border-gray-800 text-rose-600 font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-rose-600" /> Flash Deals
                </Link>
                <Link to="/brands" className="py-2 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200">Brands</Link>
                <Link to="/about" className="py-2 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200">About Us</Link>
                <Link to="/contact" className="py-2 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200">Contact</Link>
                <Link to="/faqs" className="py-2 border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200">FAQs</Link>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={user?.avatar} alt={user?.full_name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-sm text-gray-900 dark:text-white">{user?.full_name}</div>
                      <div className="text-xs text-gray-400">{user?.email}</div>
                    </div>
                  </div>
                  <button onClick={logout} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="block w-full text-center py-3 rounded-xl bg-brand-600 text-white font-bold">
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-800 lg:hidden flex items-center justify-around py-2">
        <Link to="/" className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${location.pathname === '/' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'}`}>
          <Home className="w-5 h-5" /> Home
        </Link>
        <Link to="/shop" className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${location.pathname === '/shop' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'}`}>
          <Grid className="w-5 h-5" /> Shop
        </Link>
        <Link to="/wishlist" className={`relative flex flex-col items-center gap-0.5 text-[10px] font-bold ${location.pathname === '/wishlist' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'}`}>
          <Heart className="w-5 h-5" /> Wishlist
          {wishlistCount > 0 && <span className="absolute -top-1 right-2 w-4 h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>}
        </Link>
        <Link to="/cart" className={`relative flex flex-col items-center gap-0.5 text-[10px] font-bold ${location.pathname === '/cart' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'}`}>
          <ShoppingCart className="w-5 h-5" /> Cart
          {itemCount > 0 && <span className="absolute -top-1 right-1 w-4 h-4 bg-brand-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{itemCount}</span>}
        </Link>
        <Link to={isAuthenticated ? "/profile" : "/login"} className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${location.pathname.startsWith('/profile') ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'}`}>
          <User className="w-5 h-5" /> Account
        </Link>
      </div>
    </>
  );
};

export default Navbar;
