import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import api from '../services/api';

const BlogListPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/blogs').then(res => setPosts(res.data.posts || []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-extrabold text-xs uppercase tracking-wider">
          SHOPSPHERE INSIGHTS & GUIDES
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Product Guides & Articles</h1>
        <p className="text-xs text-gray-500">Expert advice on tech setup, running gear, espresso brewing, and ergonomic workspace tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map(post => (
          <div key={post.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img src={post.image_url} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>

            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  <span className="text-brand-600 dark:text-brand-400">{post.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.created_at?.slice(0, 10)}</span>
                </div>

                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white line-clamp-2">{post.title}</h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">{post.summary}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400">
                <span>Written by {post.author}</span>
                <span className="flex items-center gap-1 hover:underline">Read Article <ArrowRight className="w-3.5 h-3.5" /></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogListPage;
