import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, TrendingUp, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import HeroBanner from '../components/HeroBanner';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import DealCountdown from '../components/DealCountdown';
import BrandShowcase from '../components/BrandShowcase';
import CustomerReviews from '../components/CustomerReviews';
import SkeletonLoader from '../components/SkeletonLoader';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [catRes, brandRes, dealsRes, trendRes, featRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
          api.get('/products?is_deal=true&per_page=8'),
          api.get('/products?is_trending=true&per_page=8'),
          api.get('/products?is_featured=true&per_page=8')
        ]);

        setCategories(catRes.data.categories || []);
        setBrands(brandRes.data.brands || []);
        setFlashDeals(dealsRes.data.products || []);
        setTrendingProducts(trendRes.data.products || []);
        setFeaturedProducts(featRes.data.products || []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Hero Banner */}
      <HeroBanner />

      {/* Category Grid */}
      <CategoryGrid categories={categories} />

      {/* Flash Deals Section */}
      <section className="mb-16 bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 dark:from-rose-950/20 dark:via-red-950/20 dark:to-amber-950/20 rounded-3xl p-6 sm:p-8 border border-rose-200/60 dark:border-rose-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                LIMITED TIME
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-rose-600 fill-rose-600" /> Flash Deals
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Deep discounts on top items. Prices reset when countdown reaches zero!
            </p>
          </div>

          <div className="flex items-center gap-4">
            <DealCountdown />
            <Link to="/shop?is_deal=true" className="hidden sm:inline-flex text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">
              View All Deals →
            </Link>
          </div>
        </div>

        {loading ? (
          <SkeletonLoader count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {flashDeals.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Trending Products Carousel / Grid */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-1">
              <TrendingUp className="w-4 h-4" /> HOT RIGHT NOW
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Trending Products
            </h2>
          </div>
          <Link to="/shop?sort=popularity" className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="mb-16 relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-900 via-indigo-900 to-purple-900 text-white p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl text-center md:text-left">
          <span className="px-3 py-1 rounded-full bg-amber-400 text-gray-900 text-xs font-extrabold uppercase">
            MEMBER EXCLUSIVE
          </span>
          <h3 className="text-2xl sm:text-4xl font-black">
            Get $50 Instant Credit On Your First Order Over $300
          </h3>
          <p className="text-sm text-brand-100">
            Use code <strong className="text-amber-300 font-extrabold">SAVEMORE50</strong> during checkout. Includes free express delivery.
          </p>
          <div className="pt-2">
            <Link to="/shop" className="inline-flex px-6 py-3 rounded-xl bg-white text-gray-900 font-extrabold text-sm hover:bg-gray-100 transition-all shadow-lg">
              Claim Your Coupon Now
            </Link>
          </div>
        </div>
        <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl flex-shrink-0">
          <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400" alt="Promo" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">
              <Award className="w-4 h-4" /> HANDPICKED FOR YOU
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Featured Best Sellers
            </h2>
          </div>
          <Link to="/shop?is_featured=true" className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            Browse Featured <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Brand Showcase */}
      <BrandShowcase brands={brands} />

      {/* Customer Reviews */}
      <CustomerReviews />

    </div>
  );
};

export default HomePage;
