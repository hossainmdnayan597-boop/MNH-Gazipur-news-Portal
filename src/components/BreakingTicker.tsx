import React, { useState } from 'react';
import { Radio, ChevronRight, ChevronLeft, Pause, Play, Sparkles } from 'lucide-react';
import { NewsArticle } from '../types';

interface BreakingTickerProps {
  articles: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({ articles, onOpenArticle }) => {
  const breakingArticles = articles.filter(a => a.isBreaking);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // If no breaking articles, use latest top 3 articles
  const displayArticles = breakingArticles.length > 0 ? breakingArticles : articles.slice(0, 4);

  if (displayArticles.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayArticles.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayArticles.length) % displayArticles.length);
  };

  const currentItem = displayArticles[currentIndex] || displayArticles[0];

  return (
    <div className="w-full bg-red-50 dark:bg-slate-900 border-b border-red-200 dark:border-slate-800 py-1.5 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Breaking Badge */}
        <div className="flex items-center gap-2 flex-shrink-0 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="tracking-wide">ব্রেকিং নিউজ</span>
        </div>

        {/* Dynamic sliding / marquee content */}
        <div 
          className="flex-1 overflow-hidden relative cursor-pointer group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onClick={() => onOpenArticle(currentItem)}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-red-200 dark:border-slate-700 hidden sm:inline-block">
              {currentItem.category}
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {currentItem.title}
            </p>
          </div>
        </div>

        {/* Carousel / Ticker Controls */}
        <div className="flex items-center gap-1 flex-shrink-0 text-slate-500 dark:text-slate-400">
          <button
            onClick={handlePrev}
            className="p-1 hover:bg-red-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="পূর্ববর্তী ব্রেকিং"
            aria-label="Previous breaking news"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            className="p-1 hover:bg-red-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="পরবর্তী ব্রেকিং"
            aria-label="Next breaking news"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
