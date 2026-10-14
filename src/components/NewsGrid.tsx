import React, { useState } from 'react';
import { Clock, Eye, Share2, Bookmark, Check, Sparkles, AlertCircle, ArrowUpDown } from 'lucide-react';
import { NewsArticle } from '../types';
import { formatBengaliDate, getRelativeBengaliTime, toBengaliDigits } from '../utils/bengaliUtils';

interface NewsGridProps {
  articles: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
  currentCategory: string;
  onResetFilters: () => void;
}

export const NewsGrid: React.FC<NewsGridProps> = ({
  articles,
  onOpenArticle,
  currentCategory,
  onResetFilters,
}) => {
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mnh_bookmarked_news');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter(i => i !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(updated);
    try {
      localStorage.setItem('mnh_bookmarked_news', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (e: React.MouseEvent, article: NewsArticle) => {
    e.stopPropagation();
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${article.title}\n${url}`);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Sort articles
  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.views - a.views;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Section Header with Category Title & Sorting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-red-600 pb-2 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-red-600 rounded-sm"></div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
            {currentCategory === 'সব খবর' ? 'সকল তাজা সংবাদ' : currentCategory}
          </h2>
          <span className="text-xs bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 rounded-full ml-1">
            {toBengaliDigits(articles.length)} টি সংবাদ
          </span>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-gray-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> সাজান:
          </span>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-2.5 py-1 rounded transition-colors ${
              sortBy === 'newest'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            সর্বশেষ
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-2.5 py-1 rounded transition-colors ${
              sortBy === 'popular'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            সর্বাধিক পঠিত
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      {sortedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedArticles.map((article) => {
            const isBookmarked = bookmarkedIds.includes(article.id);
            const isCopied = copiedId === article.id;

            return (
              <article
                key={article.id}
                onClick={() => onOpenArticle(article)}
                className="group cursor-pointer bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Article Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Category pill */}
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow">
                      {article.category}
                    </span>

                    {/* Breaking / Featured label */}
                    {article.isBreaking && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow uppercase">
                        ব্রেকিং
                      </span>
                    )}

                    {/* Bookmark quick icon */}
                    <button
                      onClick={(e) => toggleBookmark(e, article.id)}
                      className={`absolute bottom-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                        isBookmarked 
                          ? 'bg-red-600 text-white' 
                          : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                      title={isBookmarked ? 'বুকমার্ক সরানো হয়েছে' : 'পড়ে পড়ার জন্য সংরক্ষণ করুন'}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mt-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="px-4 py-3 bg-gray-50/60 dark:bg-slate-800/40 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2 truncate">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-500" />
                      {getRelativeBengaliTime(article.createdAt)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {toBengaliDigits(article.views)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleShare(e, article)}
                      className="p-1 hover:text-red-600 transition-colors"
                      title="শেয়ার করুন"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 p-8 sm:p-12 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
            কোনো সংবাদ খুঁজে পাওয়া যায়নি
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
            বর্তমানে &ldquo;{currentCategory}&rdquo; বিভাগে কোনো সংবাদ প্রকাশিত হয়নি অথবা অনুসন্ধান মানদণ্ডের সাথে মেলেনি।
          </p>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
          >
            সব সংবাদ দেখুন
          </button>
        </div>
      )}
    </div>
  );
};
