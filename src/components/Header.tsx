import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Search, 
  Menu, 
  X, 
  Clock, 
  CloudSun, 
  PhoneCall, 
  Lock, 
  Radio, 
  Sparkles,
  ChevronDown,
  Layers,
  Flame,
  Bookmark
} from 'lucide-react';
import { getLiveBengaliHeaderDate, toBengaliDigits } from '../utils/bengaliUtils';
import { CATEGORIES, GAZIPUR_UPAZILAS, GAZIPUR_PRAYER_TIMES } from '../data/initialNews';
import { NewsArticle } from '../types';

interface HeaderProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  articles: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAdmin: () => void;
  onOpenHelpline: () => void;
  selectedUpazila: string;
  onSelectUpazila: (upazila: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  articles,
  onOpenArticle,
  darkMode,
  onToggleDarkMode,
  onOpenAdmin,
  onOpenHelpline,
  selectedUpazila,
  onSelectUpazila,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [liveDate, setLiveDate] = useState(getLiveBengaliHeaderDate());
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [showGazipurMenu, setShowGazipurMenu] = useState(false);
  const [showPrayerPopover, setShowPrayerPopover] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const mins = now.getMinutes();
      const secs = now.getSeconds();
      const ampm = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
      const displayHours = hours % 12 || 12;
      setCurrentTimeStr(
        `${toBengaliDigits(displayHours)}:${mins < 10 ? '০' : ''}${toBengaliDigits(mins)}:${secs < 10 ? '০' : ''}${toBengaliDigits(secs)} ${ampm}`
      );
      setLiveDate(getLiveBengaliHeaderDate());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtered search preview articles
  const searchResults = searchQuery.trim()
    ? articles.filter(
        a =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors duration-200">
      {/* 1. TOP HEADER BAR */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Live Date, Time & Gazipur Weather */}
          <div className="flex items-center flex-wrap gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span>{liveDate}</span>
              <span className="hidden md:inline text-slate-500">|</span>
              <span className="hidden md:inline text-red-400 font-semibold">{currentTimeStr}</span>
            </span>

            <span className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded text-amber-300">
              <CloudSun className="w-3.5 h-3.5" />
              <span>গাজীপুর: ২৮°সে ⛅ আংশিক মেঘলা</span>
            </span>
          </div>

          {/* Quick Links & Utilities */}
          <div className="flex items-center gap-3">
            {/* Namaz Popover Button */}
            <div className="relative">
              <button 
                onClick={() => setShowPrayerPopover(!showPrayerPopover)}
                className="hover:text-red-400 transition-colors flex items-center gap-1"
                title="গাজীপুরের আজকের নামাজের সময়সূচি"
              >
                <span>নামাজ সূচি</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showPrayerPopover && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg shadow-xl p-3 border border-gray-200 dark:border-slate-700 z-50">
                  <div className="font-bold border-b pb-1 mb-2 text-red-600 dark:text-red-400 flex items-center justify-between">
                    <span>আজকের নামাজ (গাজীপুর)</span>
                    <button onClick={() => setShowPrayerPopover(false)} className="text-gray-400 hover:text-gray-600">×</button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {GAZIPUR_PRAYER_TIMES.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-0.5 border-b border-gray-100 dark:border-slate-700/50">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-600 dark:text-gray-300 font-mono">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Helpline quick trigger */}
            <button 
              onClick={onOpenHelpline} 
              className="hover:text-amber-400 transition-colors flex items-center gap-1 font-medium text-amber-300"
            >
              <PhoneCall className="w-3 h-3" />
              <span>জরুরি সেবা</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title={darkMode ? 'লাইট মোডে পরিবর্তন' : 'ডার্ক মোডে পরিবর্তন'}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN BRANDING & HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Slogan */}
          <div 
            onClick={() => {
              onSelectCategory('সব খবর');
              onSelectUpazila('all');
            }}
            className="cursor-pointer group flex items-center gap-3 text-center md:text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl tracking-tighter">MNH</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-serif">
                  MNH Gazipur News
                </h1>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded">
                  Live
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                গাজীপুরের বিশ্বস্ত ও নিরপেক্ষ সংবাদ মাধ্যম | সত্য ও সাহসের প্রতীক
              </p>
            </div>
          </div>

          {/* Advertisement / Announcement Banner */}
          <div className="w-full md:w-auto flex-1 max-w-md hidden lg:flex items-center justify-center p-3 rounded-xl border border-dashed border-red-300 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20">
            <div className="text-center">
              <div className="text-xs font-semibold text-red-700 dark:text-red-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MNH গাজীপুর নিউজ পোর্টাল বিজ্ঞাপন স্পেস</span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                আপনার ব্যবসায়ের প্রসারে বিজ্ঞাপন দিতে যোগাযোগ করুন: <span className="font-bold text-slate-800 dark:text-slate-200">০১৭০০-০০০০০০</span>
              </p>
            </div>
          </div>

          {/* Search Trigger (Mobile/Desktop) */}
          <div className="relative w-full md:w-64">
            <div className="relative">
              <input
                type="text"
                placeholder="সংবাদ খুঁজুন..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown */}
            {searchQuery.trim() && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
                <div className="p-2 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center text-xs text-gray-500">
                  <span>অনুসন্ধান ফলাফল ({toBengaliDigits(searchResults.length)} টি)</span>
                  <button onClick={() => onSearchChange('')} className="text-red-500 hover:underline">
                    মুছে ফেলুন
                  </button>
                </div>
                {searchResults.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700/50">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onOpenArticle(item);
                          onSearchChange('');
                        }}
                        className="p-2.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer flex gap-2.5 items-start transition-colors"
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-12 h-12 rounded object-cover flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-medium px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{item.summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-500">
                    কোনো সংবাদ পাওয়া যায়নি
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. STICKY MAIN NAVIGATION */}
      <nav className="sticky top-0 z-40 bg-red-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Desktop Categories */}
          <div className="hidden lg:flex items-center space-x-1 font-medium text-sm overflow-x-auto py-0.5 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = currentCategory === cat && selectedUpazila === 'all';
              const isGazipurSub = ['গাজীপুর সদর', 'টঙ্গী', 'কালিয়াকৈর', 'শ্রীপুর', 'কাপাসিয়া'].includes(cat);
              
              return (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    if (isGazipurSub) {
                      onSelectUpazila(cat);
                    } else {
                      onSelectUpazila('all');
                    }
                  }}
                  className={`px-3 py-2.5 rounded-none whitespace-nowrap transition-colors relative ${
                    isActive || (isGazipurSub && selectedUpazila === cat)
                      ? 'bg-red-900/80 font-bold border-b-2 border-white'
                      : 'hover:bg-red-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Gazipur Upazilas Dropdown for fast region switch */}
          <div className="relative hidden md:flex items-center">
            <button
              onClick={() => setShowGazipurMenu(!showGazipurMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-800/80 hover:bg-red-900 rounded text-xs font-semibold transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>উপজেলা: {selectedUpazila === 'all' ? 'সকল' : selectedUpazila}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showGazipurMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-50 py-1">
                {GAZIPUR_UPAZILAS.map((up) => (
                  <button
                    key={up.id}
                    onClick={() => {
                      onSelectUpazila(up.id);
                      if (up.id !== 'all') {
                        onSelectCategory(up.name);
                      } else {
                        onSelectCategory('সব খবর');
                      }
                      setShowGazipurMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 dark:hover:bg-slate-700 flex justify-between items-center ${
                      selectedUpazila === up.id ? 'font-bold text-red-600 dark:text-red-400 bg-red-50/50' : ''
                    }`}
                  >
                    <span>{up.name}</span>
                    {selectedUpazila === up.id && <span className="text-red-500 text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center justify-between w-full py-2">
            <button
              onClick={() => onSelectCategory('সব খবর')}
              className="font-bold text-sm text-white flex items-center gap-1"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>{currentCategory}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded hover:bg-red-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-red-800 border-t border-red-700 px-4 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-1.5 text-sm">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    if (['গাজীপুর সদর', 'টঙ্গী', 'কালিয়াকৈর', 'শ্রীপুর', 'কাপাসিয়া'].includes(cat)) {
                      onSelectUpazila(cat);
                    } else {
                      onSelectUpazila('all');
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded text-xs font-medium ${
                    currentCategory === cat ? 'bg-red-950 font-bold' : 'hover:bg-red-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-red-700">
              <button
                onClick={() => {
                  onOpenHelpline();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-600 hover:bg-amber-700 rounded text-xs font-semibold text-white transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>গাজীপুর জরুরি সেবা ডিরেক্টরি</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
