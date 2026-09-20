import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Grid, List, RotateCcw, Search, Star, X, Check } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { formatINR } from '../utils/currency';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedBrands, setSelectedBrands] = useState(searchParams.get('brand') ? searchParams.get('brand').split(',') : []);
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || 0);
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || 250000);
  const [minRating, setMinRating] = useState(searchParams.get('rating') || 0);
  const [minDiscount, setMinDiscount] = useState(searchParams.get('discount') || 0);
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock') === 'true');
  const [isDealOnly, setIsDealOnly] = useState(searchParams.get('is_deal') === 'true');
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(searchParams.get('is_featured') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [page, setPage] = useState(1);

  // UI & Data States
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Load Categories & Brands
  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.categories || []));
    api.get('/brands').then(res => setBrands(res.data.brands || []));
  }, []);

  // Fetch Products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
        if (selectedBrands.length > 0) params.append('brand', selectedBrands.join(','));
        if (minPrice > 0) params.append('min_price', minPrice);
        if (maxPrice < 250000) params.append('max_price', maxPrice);
        if (minRating > 0) params.append('rating', minRating);
        if (minDiscount > 0) params.append('discount', minDiscount);
        if (inStockOnly) params.append('in_stock', 'true');
        if (isDealOnly) params.append('is_deal', 'true');
        if (isFeaturedOnly) params.append('is_featured', 'true');
        params.append('sort', sortBy);
        params.append('page', page);
        params.append('per_page', 12);

        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, selectedCategory, selectedBrands, minPrice, maxPrice, minRating, minDiscount, inStockOnly, isDealOnly, isFeaturedOnly, sortBy, page]);

  // Sync state with URL params
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    if (searchParams.get('category')) setSelectedCategory(searchParams.get('category'));
    if (searchParams.get('is_deal') === 'true') setIsDealOnly(true);
    if (searchParams.get('is_featured') === 'true') setIsFeaturedOnly(true);
  }, [searchParams]);

  const handleBrandToggle = (brandSlug) => {
    setSelectedBrands(prev =>
      prev.includes(brandSlug) ? prev.filter(b => b !== brandSlug) : [...prev, brandSlug]
    );
    setPage(1);
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(250000);
    setMinRating(0);
    setMinDiscount(0);
    setInStockOnly(false);
    setIsDealOnly(false);
    setIsFeaturedOnly(false);
    setSortBy('relevance');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            {selectedCategory !== 'all'
              ? `${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}`
              : query
              ? `Search Results for "${query}"`
              : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showing <strong className="text-gray-900 dark:text-white">{total}</strong> items matching your selection
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-bold flex items-center gap-2"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="popularity">Most Popular</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
              <option value="highest_rated">Highest Rated</option>
              <option value="biggest_discount">Biggest Discount</option>
            </select>
          </div>

          {/* Grid vs List View */}
          <div className="hidden sm:flex border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden p-1 bg-white dark:bg-gray-900">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-gray-500'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-gray-500'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 h-fit shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Filters
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search Box */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 block">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Keywords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium outline-none focus:border-brand-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 block">Categories</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => { setSelectedCategory('all'); setPage(1); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  selectedCategory === 'all' ? 'bg-brand-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>All Categories</span>
                <span>{total}</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedCategory === cat.slug ? 'bg-brand-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="opacity-70">{cat.product_count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Price Range</label>
              <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400">{formatINR(minPrice)} - {formatINR(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="250000"
              step="5000"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 block">Brands</label>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {brands.map(brand => (
                <label key={brand.id} className="flex items-center gap-2 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.slug)}
                    onChange={() => handleBrandToggle(brand.slug)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 block">Minimum Rating</label>
            <div className="flex gap-2">
              {[4, 3, 2].map(r => (
                <button
                  key={r}
                  onClick={() => { setMinRating(minRating === r ? 0 : r); setPage(1); }}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    minRating === r ? 'bg-amber-400 text-gray-900 border-amber-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Star className="w-3 h-3 fill-amber-400" /> {r}+
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <label className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              <span>In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                className="w-4 h-4 rounded text-brand-600"
              />
            </label>
            <label className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              <span>Flash Deals Only</span>
              <input
                type="checkbox"
                checked={isDealOnly}
                onChange={(e) => { setIsDealOnly(e.target.checked); setPage(1); }}
                className="w-4 h-4 rounded text-brand-600"
              />
            </label>
          </div>

        </aside>

        {/* Products Grid Area */}
        <main className="lg:col-span-3">

          {loading ? (
            <SkeletonLoader count={6} />
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 mx-auto flex items-center justify-center text-2xl font-bold">!</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Products Found</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">We couldn't find any products matching your filter criteria. Try resetting your search filters.</p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-bold disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    page === idx + 1
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}

        </main>

      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-600" /> Filters
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 block">Categories</label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => { setSelectedCategory('all'); setPage(1); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                    selectedCategory === 'all' ? 'bg-brand-600 text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      selectedCategory === cat.slug ? 'bg-brand-600 text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Price Limit</label>
                <span className="text-xs font-extrabold text-brand-600">{formatINR(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="250000"
                step="5000"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <button
                onClick={handleClearFilters}
                className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 font-bold text-xs text-rose-600"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
              >
                Apply & View Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
