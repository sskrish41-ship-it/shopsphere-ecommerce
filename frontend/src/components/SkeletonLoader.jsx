import React from 'react';

const SkeletonLoader = ({ count = 4, type = 'card' }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-4 animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
