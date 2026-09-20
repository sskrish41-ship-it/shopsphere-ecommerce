import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, HelpCircle } from 'lucide-react';
import api from '../services/api';

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [query, setQuery] = useState('');
  const [openIdx, setOpenIdx] = useState(null);

  useEffect(() => {
    api.get('/faqs').then(res => {
      setFaqs(res.data.faqs || []);
      setCategories(['All', ...(res.data.categories || [])]);
    });
  }, []);

  const filteredFaqs = faqs.filter(f => {
    const matchesCat = selectedCat === 'All' || f.category === selectedCat;
    const matchesQ = f.question.toLowerCase().includes(query.toLowerCase()) || f.answer.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQ;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-extrabold text-xs uppercase tracking-wider">
          FREQUENTLY ASKED QUESTIONS
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">How Can We Help You?</h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Search questions related to orders, delivery times, payment security, and returns.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Search questions (e.g. tracking, returns)..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold outline-none shadow-sm focus:border-brand-500"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Category Pills */}
      <div className="flex justify-center flex-wrap gap-2">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCat(c)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCat === c ? 'bg-brand-600 text-white shadow' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => (
          <div
            key={faq.id}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm transition-all"
          >
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full p-4 text-left flex items-center justify-between font-bold text-sm text-gray-900 dark:text-white hover:text-brand-600"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-600" /> {faq.question}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openIdx === idx ? 'rotate-180 text-brand-600' : 'text-gray-400'}`} />
            </button>
            {openIdx === idx && (
              <div className="px-4 pb-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-50 dark:border-gray-800/50 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
