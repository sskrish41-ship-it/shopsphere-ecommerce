import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw,
  CheckCircle2, MessageSquare, ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import { formatINR } from '../utils/currency';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // description, specs, reviews, qa
  const [loading, setLoading] = useState(true);

  // Review Form Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');

  // Question Form Modal
  const [questionText, setQuestionText] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/slug/${slug}`);
        const p = res.data.product;
        setProduct(p);
        setSelectedImage(p.primary_image || (p.images?.[0]?.image_url));

        if (p.variants?.length > 0) {
          const firstSize = p.variants.find(v => v.size);
          const firstColor = p.variants.find(v => v.color);
          if (firstSize) setSelectedSize(firstSize.size);
          if (firstColor) setSelectedColor(firstColor.color);
        }

        // Fetch recommendations
        const recRes = await api.get(`/products/${p.id}/recommendations`);
        setRecommendations(recRes.data.recommendations || []);
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-bold">Loading Product Specs & Details...</p>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const images = product.images?.length > 0
    ? product.images.map(i => i.image_url)
    : [product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'];

  const getSelectedVariant = () => {
    if (!product.variants || product.variants.length === 0) return null;
    return product.variants.find(v =>
      (selectedSize ? v.size === selectedSize : true) &&
      (selectedColor ? v.color === selectedColor : true)
    ) || product.variants[0];
  };

  const handleAddToCart = () => {
    addToCart(product, getSelectedVariant(), quantity);
  };

  const handleBuyNow = async () => {
    const success = await addToCart(product, getSelectedVariant(), quantity);
    if (success) {
      navigate('/cart');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please login to post a review', 'error');
      navigate('/login');
      return;
    }
    try {
      await api.post(`/reviews/product/${product.id}`, {
        rating: newRating,
        title: newReviewTitle,
        comment: newReviewComment
      });
      addToast('Review submitted successfully!', 'success');
      setShowReviewModal(false);
      setNewReviewTitle('');
      setNewReviewComment('');
      // Reload product
      const res = await api.get(`/products/slug/${slug}`);
      setProduct(res.data.product);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit review', 'error');
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please login to ask a question', 'error');
      return;
    }
    if (!questionText.trim()) return;

    try {
      await api.post(`/products/${product.id}/questions`, { question: questionText });
      addToast('Question submitted! Our support team will respond shortly.', 'success');
      setQuestionText('');
      const res = await api.get(`/products/slug/${slug}`);
      setProduct(res.data.product);
    } catch (err) {
      addToast('Failed to submit question', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Back button */}
      <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
        
        {/* Gallery Column (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl group">
            <img
              src={selectedImage || images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {product.discount_percent > 0 && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                -{product.discount_percent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img ? 'border-brand-600 scale-95 shadow-md' : 'border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-1">
              <span>{product.brand?.name || 'ShopSphere'}</span>
              <span className="text-gray-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <StarRating rating={product.rating} />
              <span className="text-xs text-gray-400">({product.review_count} verified reviews)</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock_quantity} units left)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-baseline gap-4">
            <span className="text-3xl font-black text-gray-900 dark:text-white">
              {formatINR(product.price)}
            </span>
            {product.original_price > product.price && (
              <span className="text-base text-gray-400 line-through">
                {formatINR(product.original_price)}
              </span>
            )}
            {product.discount_percent > 0 && (
              <span className="ml-auto text-xs font-extrabold text-rose-600 bg-rose-100 dark:bg-rose-950/40 px-2.5 py-1 rounded-full">
                Save {formatINR(product.original_price - product.price)}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {product.short_description || product.description}
          </p>

          {/* Variants Selector */}
          {product.variants?.some(v => v.size) && (
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 block">
                Select Size: <strong className="text-brand-600">{selectedSize}</strong>
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(product.variants.filter(v => v.size).map(v => v.size))).map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedSize === size
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Quantity:</span>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-bold"
              >
                -
              </button>
              <span className="px-5 text-sm font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full py-4 rounded-2xl bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" /> Add To Cart
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => toggleWishlist(product)}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isSaved ? 'bg-rose-500 text-white border-rose-500' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-rose-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} /> {isSaved ? 'Saved in Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
              <Truck className="w-5 h-5 text-brand-600 mx-auto mb-1" />
              <span className="font-bold block text-gray-900 dark:text-white">Free Express</span>
              <span className="text-[10px] text-gray-400">On orders over ₹1,999</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="font-bold block text-gray-900 dark:text-white">{product.warranty}</span>
              <span className="text-[10px] text-gray-400">100% Guaranteed</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
              <RefreshCw className="w-5 h-5 text-rose-600 mx-auto mb-1" />
              <span className="font-bold block text-gray-900 dark:text-white">30-Day Returns</span>
              <span className="text-[10px] text-gray-400">{product.return_policy}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs Section: Description, Specifications, Reviews, Q&A */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-sm mb-16">
        <div className="flex border-b border-gray-100 dark:border-gray-800 gap-8 overflow-x-auto no-scrollbar mb-8">
          {[
            { id: 'description', label: 'Description' },
            { id: 'specs', label: 'Specifications' },
            { id: 'reviews', label: `Reviews (${product.reviews?.length || 0})` },
            { id: 'qa', label: `Questions & Answers (${product.questions?.length || 0})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 font-bold text-sm sm:text-base transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'description' && (
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed space-y-4">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {/* Tab 2: Specs */}
        {activeTab === 'specs' && (
          <div className="max-w-2xl">
            {product.specs?.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                {product.specs.map(s => (
                  <div key={s.id} className="grid grid-cols-2 p-3.5 text-xs">
                    <span className="font-bold text-gray-500">{s.key}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Standard specifications apply.</p>
            )}
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">Customer Reviews</h3>
                <p className="text-xs text-gray-500">Verified ratings from real buyers</p>
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md"
              >
                Write A Review
              </button>
            </div>

            {product.reviews?.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map(rev => (
                  <div key={rev.id} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={rev.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">{rev.user_name}</div>
                          <StarRating rating={rev.rating} showScore={false} />
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400">{rev.created_at?.slice(0, 10)}</span>
                    </div>
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white">{rev.title}</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No reviews submitted yet. Be the first to review!</p>
            )}
          </div>
        )}

        {/* Tab 4: Q&A */}
        {activeTab === 'qa' && (
          <div className="space-y-8">
            <form onSubmit={handleQuestionSubmit} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-3">
              <label className="font-bold text-sm text-gray-900 dark:text-white block">Have a question about this product?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs outline-none focus:border-brand-500"
                />
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs">
                  Submit Question
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {product.questions?.map(q => (
                <div key={q.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-600" /> Q: {q.question}
                  </div>
                  {q.answer && (
                    <div className="pl-6 text-gray-600 dark:text-gray-300 bg-brand-50/50 dark:bg-brand-950/30 p-3 rounded-xl">
                      <strong className="text-brand-600 block mb-1">Answer from {q.answered_by}:</strong>
                      {q.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Recommendations Carousel */}
      {recommendations.length > 0 && (
        <section className="mb-16">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
            Frequently Bought Together
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map(rec => (
              <ProductCard key={rec.id} product={rec} />
            ))}
          </div>
        </section>
      )}

      {/* Submit Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Write a Review</h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Rating</label>
                <div className="flex gap-2 text-amber-400 cursor-pointer">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      onClick={() => setNewRating(star)}
                      className={`w-6 h-6 ${star <= newRating ? 'fill-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Review Title</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent sound quality!"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Review Details</label>
                <textarea
                  rows="4"
                  placeholder="Tell us what you liked or disliked..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-bold">
                  Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetailPage;
