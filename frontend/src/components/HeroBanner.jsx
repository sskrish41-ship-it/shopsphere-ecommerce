import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, ShieldCheck, Award } from 'lucide-react';

const slides = [
  {
    id: 1,
    badge: 'NEW GENERATION TECH 2026',
    title: 'Experience The Power Of Next-Gen Innovation',
    description: 'Immerse yourself in lossless spatial audio, 4K OLED displays, and ultra-speed gaming hardware. Up to 40% OFF this week only.',
    ctaPrimary: 'Shop Now',
    ctaPrimaryLink: '/shop?category=electronics',
    ctaSecondary: 'Explore Products',
    ctaSecondaryLink: '/shop',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000',
    gradient: 'from-brand-900 via-indigo-900 to-purple-950'
  },
  {
    id: 2,
    badge: 'EXCLUSIVE ATHLETIC COLLECTION',
    title: 'Unleash Peak Athletic Speed & Performance',
    description: 'Engineered with responsive ZoomAir cushioning and Flyknit breathability. Designed for champions on every marathon.',
    ctaPrimary: 'Shop Shoes',
    ctaPrimaryLink: '/shop?category=shoes',
    ctaSecondary: 'View All Deals',
    ctaSecondaryLink: '/shop?is_deal=true',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000',
    gradient: 'from-rose-950 via-slate-900 to-red-950'
  }
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl mb-12">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90 transition-all duration-700`} />

      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Text */}
        <div className="lg:col-span-7 space-y-6 z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wider text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            {slide.badge}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
            {slide.title}
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {slide.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              to={slide.ctaPrimaryLink}
              className="px-8 py-4 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 font-extrabold text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
            >
              {slide.ctaPrimary} <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={slide.ctaSecondaryLink}
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-sm transition-all"
            >
              {slide.ctaSecondary}
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="pt-8 flex items-center justify-center lg:justify-start gap-6 text-xs font-medium text-gray-300 border-t border-white/10">
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Genuine Brands</div>
            <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Same-Day Dispatch</div>
            <div className="flex items-center gap-1.5"><Award className="w-4 h-4 text-cyan-400" /> 1-Year Warranty</div>
          </div>
        </div>

        {/* Right Image */}
        <div className="lg:col-span-5 relative z-10 flex justify-center">
          <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl flex items-center justify-between text-xs">
              <span className="font-bold">Verified Top Seller</span>
              <span className="font-extrabold text-amber-400">★ 4.9 / 5.0</span>
            </div>
          </div>
        </div>

      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === idx ? 'bg-white w-8' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
