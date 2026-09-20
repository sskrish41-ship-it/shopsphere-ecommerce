import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';
import api from '../services/api';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    api.get('/brands').then(res => setBrands(res.data.brands || []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
          OFFICIAL BRAND PARTNERS
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Shop By Brand Directory</h1>
        <p className="text-xs text-gray-500">Discover premium authentic gear from Apple, Nike, Samsung, Bose, Sony, Adidas, LG and Philips.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {brands.map(b => (
          <Link
            key={b.id}
            to={`/shop?brand=${b.slug}`}
            className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gray-50 p-3 overflow-hidden border border-gray-100 mb-4 group-hover:scale-110 transition-transform">
                <img src={b.logo_url} alt={b.name} className="w-full h-full object-contain" />
              </div>

              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">{b.name}</h3>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{b.description}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400">
              <span>{b.product_count || 4}+ Products</span>
              <span className="flex items-center gap-1">Shop Now <ArrowRight className="w-3.5 h-3.5" /></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BrandsPage;
