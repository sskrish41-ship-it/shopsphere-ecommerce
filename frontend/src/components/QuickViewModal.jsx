import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingCart, Heart, ShieldCheck, Truck, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatINR } from '../utils/currency';

const QuickViewModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.primary_image);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;

  const images = product.images?.length > 0
    ? product.images.map(i => i.image_url)
    : [product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 z-10 grid grid-cols-1 md:grid-cols-2 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Column */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/40 flex flex-col items-center justify-between">
          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <img
              src={selectedImage || images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar w-full justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-brand-600 dark:text-brand-400 font-bold mb-1">
              {product.brand?.name || 'ShopSphere'}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug">
              {product.name}
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center text-amber-400 text-sm font-bold">
                <Star className="w-4 h-4 fill-amber-400 mr-1" />
                {product.rating}
              </div>
              <span className="text-xs text-gray-400">({product.review_count} reviews)</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-auto flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> In Stock ({product.stock_quantity})
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {formatINR(product.price)}
              </span>
              {product.original_price > product.price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatINR(product.original_price)}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-6 line-clamp-3">
              {product.short_description || product.description}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Quantity:</span>
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  addToCart(product, null, quantity);
                  onClose();
                }}
                disabled={isOutOfStock}
                className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-xl border transition-all ${
                  isSaved ? 'bg-rose-500 text-white border-rose-500' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-rose-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
              </button>
            </div>

            <Link
              to={`/product/${product.slug}`}
              onClick={onClose}
              className="block w-full text-center py-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View Full Product Details →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default QuickViewModal;
