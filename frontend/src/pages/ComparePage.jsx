import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, X, ShoppingBag, Star, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';

const ComparePage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const ids = searchParams.get('ids');
    if (ids) {
      api.get(`/products/compare?ids=${ids}`)
        .then(res => setProducts(res.data.products || []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-500">Loading Product Comparison Table...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">No Products Selected For Comparison</h2>
        <p className="text-xs text-gray-500">Select products from the catalog to compare features side-by-side.</p>
        <Link to="/shop" className="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-brand-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">
        Product Comparison Table ({products.length} Items)
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="p-4 text-left font-extrabold text-gray-500 w-48">Feature</th>
              {products.map(p => (
                <th key={p.id} className="p-4 text-center min-w-[220px]">
                  <img src={p.primary_image} alt="" className="w-24 h-24 object-cover rounded-2xl mx-auto mb-3" />
                  <Link to={`/product/${p.slug}`} className="font-extrabold text-sm text-gray-900 dark:text-white hover:text-brand-600 block line-clamp-2">
                    {p.name}
                  </Link>
                  <div className="text-brand-600 font-black text-base mt-2">{formatINR(p.price)}</div>
                  <button
                    onClick={() => addToCart(p, null, 1)}
                    className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-xl font-bold w-full"
                  >
                    Add to Cart
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            <tr>
              <td className="p-4 font-bold text-gray-500">Brand</td>
              {products.map(p => <td key={p.id} className="p-4 text-center font-semibold">{p.brand?.name || '-'}</td>)}
            </tr>
            <tr>
              <td className="p-4 font-bold text-gray-500">Category</td>
              {products.map(p => <td key={p.id} className="p-4 text-center font-semibold">{p.category?.name || '-'}</td>)}
            </tr>
            <tr>
              <td className="p-4 font-bold text-gray-500">Rating</td>
              {products.map(p => (
                <td key={p.id} className="p-4 text-center">
                  <span className="font-extrabold text-amber-500">★ {p.rating}</span> ({p.review_count})
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-gray-500">Stock Status</td>
              {products.map(p => (
                <td key={p.id} className="p-4 text-center">
                  {p.stock_quantity > 0 ? (
                    <span className="text-emerald-600 font-bold">In Stock ({p.stock_quantity})</span>
                  ) : (
                    <span className="text-rose-500 font-bold">Out of Stock</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-gray-500">Warranty</td>
              {products.map(p => <td key={p.id} className="p-4 text-center font-semibold">{p.warranty}</td>)}
            </tr>
            <tr>
              <td className="p-4 font-bold text-gray-500">Return Policy</td>
              {products.map(p => <td key={p.id} className="p-4 text-center font-semibold">{p.return_policy}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
