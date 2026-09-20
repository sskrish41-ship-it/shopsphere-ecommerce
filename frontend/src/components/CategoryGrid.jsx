import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Shirt, Footprints, Sparkles, Home, Activity, Watch, ShoppingCart, BookOpen, Gamepad2, Grid, ArrowRight } from 'lucide-react';

const categoryIcons = {
  electronics: Cpu,
  fashion: Shirt,
  shoes: Footprints,
  beauty: Sparkles,
  'home-kitchen': Home,
  sports: Activity,
  accessories: Watch,
  grocery: ShoppingCart,
  books: BookOpen,
  gaming: Gamepad2
};

const CategoryGrid = ({ categories = [] }) => {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Explore Product Categories
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse our wide selection of top-rated items across popular categories
          </p>
        </div>
        <Link to="/shop" className="hidden sm:flex items-center gap-1 text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const IconComp = categoryIcons[cat.slug] || Grid;
          return (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3 relative">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-white/90 dark:bg-gray-900/90 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-md">
                  <IconComp className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-xs text-gray-400">
                  {cat.product_count || 12}+ Items
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;
