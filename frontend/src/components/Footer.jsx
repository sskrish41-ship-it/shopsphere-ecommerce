import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Send, Phone, MapPin, ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      addToast('Thank you for subscribing to ShopSphere newsletter!', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-24 lg:pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-gray-800 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl bg-gray-800/40">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Free Express Shipping</div>
              <div className="text-xs text-gray-400">On all orders over ₹1,999</div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl bg-gray-800/40">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Secure Payments</div>
              <div className="text-xs text-gray-400">256-Bit SSL Encrypted</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl bg-gray-800/40">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">30-Day Money Back</div>
              <div className="text-xs text-gray-400">Easy return & exchanges</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl bg-gray-800/40">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Flexible Pay</div>
              <div className="text-xs text-gray-400">Card, UPI, Netbanking & COD</div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-brand-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                ShopSphere
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              ShopSphere is your premier destination for high-performance tech, luxury fashion, home appliances, and athletic gear. Built for speed, security, and elegance.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-2">
              <div className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-brand-400" /> +1 (800) 555-SPHERE</div>
              <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-400" /> New York, NY</div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop All Products</Link></li>
              <li><Link to="/shop?is_deal=true" className="hover:text-rose-400 transition-colors">Flash Deals</Link></li>
              <li><Link to="/brands" className="hover:text-white transition-colors">Featured Brands</Link></li>
              <li><Link to="/blogs" className="hover:text-white transition-colors">Product Guides & Blog</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About ShopSphere</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/profile?tab=orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/faqs" className="hover:text-white transition-colors">Help & FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Stay Connected</h4>
            <p className="text-xs text-gray-400 mb-4">Subscribe for exclusive discount codes, flash sales, and new arrivals.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white focus:border-brand-500 outline-none"
                  required
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                <span>Subscribe</span> <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar & Payments */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <div>© 2026 ShopSphere E-Commerce Inc. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <span className="bg-gray-800 px-2.5 py-1 rounded font-bold text-gray-300">VISA</span>
            <span className="bg-gray-800 px-2.5 py-1 rounded font-bold text-gray-300">MasterCard</span>
            <span className="bg-gray-800 px-2.5 py-1 rounded font-bold text-gray-300">Apple Pay</span>
            <span className="bg-gray-800 px-2.5 py-1 rounded font-bold text-gray-300">UPI / COD</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
