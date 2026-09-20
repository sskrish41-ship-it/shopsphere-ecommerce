import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const DealCountdown = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 1, hours: 14, minutes: 30, seconds: 45 });

  useEffect(() => {
    const target = endTime ? new Date(endTime).getTime() : new Date().getTime() + (2 * 24 * 60 * 60 * 1000);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
      <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
      <span className="hidden sm:inline text-rose-500 font-extrabold uppercase tracking-wider">Ends In:</span>

      <div className="flex items-center gap-1">
        <div className="bg-rose-500 text-white px-2 py-1 rounded-lg text-xs font-extrabold shadow">
          {String(timeLeft.days).padStart(2, '0')}d
        </div>
        <span>:</span>
        <div className="bg-gray-900 dark:bg-gray-800 text-white px-2 py-1 rounded-lg text-xs font-extrabold shadow">
          {String(timeLeft.hours).padStart(2, '0')}h
        </div>
        <span>:</span>
        <div className="bg-gray-900 dark:bg-gray-800 text-white px-2 py-1 rounded-lg text-xs font-extrabold shadow">
          {String(timeLeft.minutes).padStart(2, '0')}m
        </div>
        <span>:</span>
        <div className="bg-rose-600 text-white px-2 py-1 rounded-lg text-xs font-extrabold shadow animate-pulse">
          {String(timeLeft.seconds).padStart(2, '0')}s
        </div>
      </div>
    </div>
  );
};

export default DealCountdown;
