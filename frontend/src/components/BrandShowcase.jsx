import React from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';

const BrandShowcase = ({ brands = [] }) => {
  return (
    <section className="mb-16 bg-gray-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            <Award className="w-4 h-4" /> Official Brand Partners
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Shop By Top Global Brands
          </h2>
        </div>
        <Link to="/brands" className="text-sm font-bold text-brand-400 hover:text-brand-300">
          Explore All Brands →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            to={`/shop?brand=${brand.slug}`}
            className="group p-4 rounded-2xl bg-gray-800/60 border border-gray-700/50 hover:border-brand-500 hover:bg-gray-800 transition-all text-center flex flex-col items-center justify-center gap-2"
          >
            <div className="w-12 h-12 rounded-xl bg-white p-2 overflow-hidden shadow group-hover:scale-110 transition-transform">
              <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-bold text-gray-200 group-hover:text-brand-400 transition-colors">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BrandShowcase;
