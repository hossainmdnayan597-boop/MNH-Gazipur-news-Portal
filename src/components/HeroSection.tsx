import React, { useState } from 'react';
import { Clock, Eye, Flame, TrendingUp, Sparkles, Share2 } from 'lucide-react';
import { NewsArticle } from '../types';
import { formatBengaliDate, getRelativeBengaliTime, toBengaliDigits } from '../utils/bengaliUtils';

interface HeroSectionProps {
  articles: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ articles, onOpenArticle }) => {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');

  // Featured lead article
  const leadArticle = articles.find(a => a.isFeatured) || articles[0];

  // Secondary featured articles
  const secondaryArticles = articles
    .filter(a => a.id !== leadArticle?.id)
    .slice(0, 2);

  // Latest sorted by createdAt
  const latestArticles = [...articles]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Popular sorted by views
  const popularArticles = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  if (!leadArticle) return null;

  return (
    <section className="my-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Lead Featured Article & Secondary Featured (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* 1. Main Lead Headline Card */}
          <div 
            onClick={() => onOpenArticle(leadArticle)}
            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
              <img
                src={leadArticle.imageUrl}
                alt={leadArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
              
              {/* Badges on image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  প্রধান সংবাদ
                </span>
                <span className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/20">
                  {leadArticle.category}
                </span>
              </div>

              {/* Lead Headline on bottom overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight mb-2 group-hover:text-red-400 transition-colors font-serif">
                  {leadArticle.title}
                </h2>
                <p className="text-slate-200 text-xs sm:text-sm line-clamp-2 mb-3 max-w-3xl">
                  {leadArticle.summary}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span>{leadArticle.reporter}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {getRelativeBengaliTime(leadArticle.createdAt)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {toBengaliDigits(leadArticle.views)} বার পঠিত
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Secondary Sub-Lead Cards (2 Grid Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {secondaryArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => onOpenArticle(article)}
                className="group cursor-pointer bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-slate-800/80">
                  <span className="truncate">{article.reporter}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-500" />
                    {getRelativeBengaliTime(article.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Trending Tabbed List (Latest vs Most Read) (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-4 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-slate-800 pb-2 mb-3">
            <button
              onClick={() => setActiveTab('latest')}
              className={`flex-1 py-2 text-center text-sm font-bold flex items-center justify-center gap-1.5 transition-colors relative ${
                activeTab === 'latest'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>সর্বশেষ সংবাদ</span>
              {activeTab === 'latest' && (
                <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-red-600"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('popular')}
              className={`flex-1 py-2 text-center text-sm font-bold flex items-center justify-center gap-1.5 transition-colors relative ${
                activeTab === 'popular'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>জনপ্রিয় সংবাদ</span>
              {activeTab === 'popular' && (
                <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-red-600"></div>
              )}
            </button>
          </div>

          {/* List items */}
          <div className="divide-y divide-gray-100 dark:divide-slate-800/80 flex-1">
            {(activeTab === 'latest' ? latestArticles : popularArticles).map((item, index) => (
              <div
                key={item.id}
                onClick={() => onOpenArticle(item)}
                className="py-3 flex items-start gap-3 group cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors"
              >
                {/* Ranking Index */}
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                  index < 3
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-extrabold'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
                }`}>
                  {toBengaliDigits(index + 1)}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">
                      {item.category}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {getRelativeBengaliTime(item.createdAt)}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  {activeTab === 'popular' && (
                    <span className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5 text-amber-500" />
                      {toBengaliDigits(item.views)} পাঠক
                    </span>
                  )}
                </div>

                {/* Micro Thumbnail */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-16 h-14 object-cover rounded-md flex-shrink-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
