import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';

const reviewsData = [
  {
    id: 1,
    name: 'Emily Watson',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    title: 'Flawless Checkout & Ultra-Fast Delivery!',
    comment: 'Ordered the Bose noise canceling headphones yesterday and received them in pristine condition this morning. The active noise cancellation is unreal.',
    productName: 'Ultra Noise-Canceling Wireless Headphones Pro',
    date: '2 days ago'
  },
  {
    id: 2,
    name: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    title: 'Top Notch Quality & Authentic Products',
    comment: 'ShopSphere has completely replaced other online stores for me. Customer service answered my question within 5 minutes and coupon discounts are real!',
    productName: 'SphereBook Pro M3 Max',
    date: '1 week ago'
  },
  {
    id: 3,
    name: 'Sophia Martinez',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    title: 'Love the Return Policy & Live Order Tracking',
    comment: 'The order status stepper let me watch my delivery driver in real time. Very transparent shopping experience. Will shop again!',
    productName: 'Air Zoom Speed Performance Running Shoes',
    date: '3 days ago'
  }
];

const CustomerReviews = () => {
  return (
    <section className="mb-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          Loved By Over 50,000+ Customers
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Read verified feedback from real shoppers about their ShopSphere experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviewsData.map((rev) => (
          <div
            key={rev.id}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                </span>
              </div>

              <h4 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                "{rev.title}"
              </h4>

              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {rev.comment}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={rev.avatar} alt={rev.name} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-xs text-gray-900 dark:text-white">{rev.name}</div>
                  <div className="text-[10px] text-gray-400">{rev.date}</div>
                </div>
              </div>
              <Quote className="w-6 h-6 text-gray-200 dark:text-gray-800" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CustomerReviews;
