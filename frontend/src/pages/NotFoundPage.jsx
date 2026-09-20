import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="space-y-6 max-w-md">
        <div className="text-8xl font-black text-brand-600 dark:text-brand-400 tracking-tighter">404</div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Page Not Found</h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          The page or product link you clicked might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/" className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-lg flex items-center gap-2">
            <Home className="w-4 h-4" /> Go to Homepage
          </Link>
          <Link to="/shop" className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs">
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
