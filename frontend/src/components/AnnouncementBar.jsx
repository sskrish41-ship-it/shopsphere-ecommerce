import React from 'react';
import { Sparkles, Truck, ShieldCheck, Zap } from 'lucide-react';

const AnnouncementBar = () => {
  return (
    <div className="bg-gradient-to-r from-brand-900 via-brand-700 to-indigo-900 text-white text-xs py-2 px-4 border-b border-brand-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left font-medium">
        <div className="flex items-center gap-2">
          <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider animate-pulse">
            LIMITED DEAL
          </span>
          <span>Extra 20% OFF Flash Sale! Use Code: <strong className="text-yellow-300">FLASHSALE20</strong></span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-brand-100">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-yellow-400" />
            <span>Free Express Shipping over ₹1,999</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>30-Day Money Back Guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>24/7 Dedicated Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
