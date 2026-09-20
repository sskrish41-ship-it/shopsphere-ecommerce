import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto shadow-xl">
          <Heart className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Your Wishlist Is Empty</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Save your favorite products to your wishlist so you can quickly buy them later or keep track of price drops!
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 transition-all"
        >
          Discover Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">
        My Saved Wishlist ({wishlist.length} Items)
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map(item => {
          const product = item.product || item;
          if (!product || !product.id) return null;
          return <ProductCard key={product.id} product={product} />;
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
