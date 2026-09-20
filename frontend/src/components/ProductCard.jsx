import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Zap, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatINR } from '../utils/currency';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product }) => {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0 || product.status === 'out_of_stock';

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await addToCart(product, null, 1);
    if (success) {
      navigate('/cart');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, null, 1);
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
        
        {/* Top Image Box */}
        <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img
            src={product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {product.discount_percent > 0 && (
              <span className="bg-rose-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-md">
                -{product.discount_percent}%
              </span>
            )}
            {product.is_deal && (
              <span className="bg-amber-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md uppercase">
                <Zap className="w-3 h-3 fill-white" /> Deal
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-900/90 text-gray-300 font-bold text-[10px] px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Action Overlay Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-all ${
                inWishlist
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-200 hover:bg-rose-500 hover:text-white'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="w-9 h-9 rounded-full bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-200 hover:bg-brand-600 hover:text-white backdrop-blur-md shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand & Category */}
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-1 font-semibold uppercase tracking-wider">
              <span>{product.brand?.name || 'ShopSphere'}</span>
              <span>{product.category?.name}</span>
            </div>

            {/* Title */}
            <Link to={`/product/${product.slug}`} className="block">
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 line-clamp-2 transition-colors mb-2">
                {product.name}
              </h3>
            </Link>

            {/* Ratings */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 ml-1">{product.rating}</span>
              </div>
              <span className="text-xs text-gray-400">({product.review_count})</span>
            </div>
          </div>

          {/* Pricing & Cart CTAs */}
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                {formatINR(product.price)}
              </span>
              {product.original_price > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatINR(product.original_price)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
};

export default ProductCard;
