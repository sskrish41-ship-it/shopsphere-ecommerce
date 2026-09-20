import React from 'react';
import { ShieldCheck, Sparkles, Award, Users, Globe, Truck } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-extrabold text-xs uppercase tracking-wider">
          OUR MISSION & VISION
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight">
          Redefining E-Commerce With Speed, Security & Elegance
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          Founded in 2026, ShopSphere is a next-generation online product marketplace connecting global consumers with verified authentic brands, studio-grade audio equipment, luxury fashion, and smart home technology.
        </p>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gradient-to-r from-brand-900 via-indigo-900 to-purple-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl text-center">
        <div>
          <div className="text-3xl sm:text-5xl font-black text-amber-400">50K+</div>
          <div className="text-xs font-bold text-gray-300 mt-1">Happy Customers</div>
        </div>
        <div>
          <div className="text-3xl sm:text-5xl font-black text-emerald-400">100%</div>
          <div className="text-xs font-bold text-gray-300 mt-1">Authentic Products</div>
        </div>
        <div>
          <div className="text-3xl sm:text-5xl font-black text-cyan-400">24/7</div>
          <div className="text-xs font-bold text-gray-300 mt-1">Dedicated Support</div>
        </div>
        <div>
          <div className="text-3xl sm:text-5xl font-black text-rose-400">30 Days</div>
          <div className="text-xs font-bold text-gray-300 mt-1">Money Back Guarantee</div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Uncompromising Quality</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Every product in our catalog undergoes strict verification to ensure top performance, durability, and genuine warranty coverage.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Lightning Fast Logistics</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Partnered with top tier Express couriers to deliver your orders right to your doorstep with real-time status tracking.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bank-Grade Security</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            We use 256-Bit SSL encryption and tokenized JWT authentication to protect your private data and transactions.
          </p>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
