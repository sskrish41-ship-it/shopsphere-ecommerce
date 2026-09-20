import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 5, size = 'sm', showScore = true }) => {
  const stars = [];
  const fullStars = Math.floor(rating);

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`${size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'} ${
          i <= fullStars
            ? 'fill-amber-400 text-amber-400'
            : 'fill-gray-200 dark:fill-gray-800 text-gray-300 dark:text-gray-700'
        }`}
      />
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">{stars}</div>
      {showScore && <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
};

export default StarRating;
