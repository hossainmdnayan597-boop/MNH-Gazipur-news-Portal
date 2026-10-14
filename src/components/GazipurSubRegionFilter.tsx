import React from 'react';
import { MapPin } from 'lucide-react';
import { GAZIPUR_UPAZILAS } from '../data/initialNews';
import { NewsArticle } from '../types';
import { toBengaliDigits } from '../utils/bengaliUtils';

interface GazipurSubRegionFilterProps {
  selectedUpazila: string;
  onSelectUpazila: (upazila: string) => void;
  articles: NewsArticle[];
}

export const GazipurSubRegionFilter: React.FC<GazipurSubRegionFilterProps> = ({
  selectedUpazila,
  onSelectUpazila,
  articles,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2 sm:mb-0">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
          <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
            <MapPin className="w-4 h-4" />
          </div>
          <span>গাজীপুর জেলা আঞ্চলিক সংবাদ:</span>
        </div>

        {/* Upazila Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {GAZIPUR_UPAZILAS.map((up) => {
            const isSelected = selectedUpazila === up.id;
            const count = up.id === 'all'
              ? articles.length
              : articles.filter(a => a.category.includes(up.id) || a.subCategory?.includes(up.id)).length;

            return (
              <button
                key={up.id}
                onClick={() => onSelectUpazila(up.id)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-sm font-bold'
                    : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>{up.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected 
                    ? 'bg-red-700 text-red-100' 
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {toBengaliDigits(count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
