import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BreakingTicker } from './components/BreakingTicker';
import { HeroSection } from './components/HeroSection';
import { GazipurSubRegionFilter } from './components/GazipurSubRegionFilter';
import { NewsGrid } from './components/NewsGrid';
import { SidebarWidgets } from './components/SidebarWidgets';
import { NewsDetailModal } from './components/NewsDetailModal';
import { AdminPanel } from './components/AdminPanel';
import { HelplineModal } from './components/HelplineModal';
import { Footer } from './components/Footer';
import { NewsArticle } from './types';
import { subscribeToArticles } from './services/newsService';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string>('সব খবর');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals & Panels
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mnh_dark_mode');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('mnh_dark_mode', JSON.stringify(darkMode));
    } catch (e) {
      console.error(e);
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Real-time Firestore & Local Sync Listener
  useEffect(() => {
    const unsubscribe = subscribeToArticles((items) => {
      setArticles(items);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Admin open / close handlers with URL syncing (#admin & /@admin)
  const handleOpenAdmin = () => {
    setIsAdminOpen(true);
    if (window.location.hash !== '#admin') {
      window.location.hash = 'admin';
    }
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash.includes('admin') || window.location.pathname.includes('@admin')) {
      const cleanPath = window.location.pathname.replace(/\/@admin\/?/gi, '/') || '/';
      window.history.replaceState(null, '', cleanPath);
    }
  };

  // Secret admin access: #admin in URL, /@admin, keyboard shortcut (Ctrl + Shift + A), or hash
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(prev => {
          if (!prev) {
            window.location.hash = 'admin';
          } else {
            handleCloseAdmin();
          }
          return !prev;
        });
      }
    };

    const checkAdminTrigger = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      // Check if #admin, @admin, or /@admin was given in URL
      if (
        hash === '#admin' ||
        hash.includes('admin') ||
        path.includes('/@admin') || 
        path === '/@admin' ||
        path.endsWith('@admin') ||
        search.includes('@admin') || 
        search.includes('admin=true')
      ) {
        setIsAdminOpen(true);
      }
    };

    checkAdminTrigger();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', checkAdminTrigger);
    window.addEventListener('popstate', checkAdminTrigger);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkAdminTrigger);
      window.removeEventListener('popstate', checkAdminTrigger);
    };
  }, []);

  // Filter articles based on active criteria
  const filteredArticles = articles.filter((article) => {
    // 1. Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = article.title.toLowerCase().includes(query);
      const matchSummary = article.summary.toLowerCase().includes(query);
      const matchCategory = article.category.toLowerCase().includes(query);
      const matchReporter = article.reporter.toLowerCase().includes(query);
      if (!matchTitle && !matchSummary && !matchCategory && !matchReporter) {
        return false;
      }
    }

    // 2. Upazila filter
    if (selectedUpazila !== 'all') {
      const matchUp = 
        article.category.includes(selectedUpazila) || 
        article.subCategory?.includes(selectedUpazila) ||
        article.title.includes(selectedUpazila);
      if (!matchUp) return false;
    }

    // 3. Category filter
    if (currentCategory !== 'সব খবর') {
      const matchCat = 
        article.category === currentCategory || 
        article.subCategory === currentCategory;
      if (!matchCat) return false;
    }

    return true;
  });

  const handleResetFilters = () => {
    setCurrentCategory('সব খবর');
    setSelectedUpazila('all');
    setSearchQuery('');
  };

  const isHomeView = currentCategory === 'সব খবর' && selectedUpazila === 'all' && !searchQuery.trim();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Portal Header */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        articles={articles}
        onOpenArticle={(art) => setActiveArticle(art)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenHelpline={() => setIsHelplineOpen(true)}
        selectedUpazila={selectedUpazila}
        onSelectUpazila={setSelectedUpazila}
      />

      {/* 2. Breaking News Ticker */}
      <BreakingTicker
        articles={articles}
        onOpenArticle={(art) => setActiveArticle(art)}
      />

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
            <p className="text-sm font-semibold text-gray-500">
              গাজীপুরের তাজা সংবাদ লোড হচ্ছে...
            </p>
          </div>
        ) : (
          <>
            {/* Show Featured Lead Hero on Home View */}
            {isHomeView && (
              <HeroSection
                articles={articles}
                onOpenArticle={(art) => setActiveArticle(art)}
              />
            )}

            {/* Gazipur Regional Filter Pills */}
            <GazipurSubRegionFilter
              selectedUpazila={selectedUpazila}
              onSelectUpazila={(up) => {
                setSelectedUpazila(up);
                if (up !== 'all') {
                  setCurrentCategory(up);
                } else {
                  setCurrentCategory('সব খবর');
                }
              }}
              articles={articles}
            />

            {/* 2-Column Responsive News Portal Layout (Grid 8 Cols + Sidebar 4 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Main Feed Section (8 Cols) */}
              <div className="lg:col-span-8">
                <NewsGrid
                  articles={filteredArticles}
                  onOpenArticle={(art) => setActiveArticle(art)}
                  currentCategory={selectedUpazila !== 'all' ? selectedUpazila : currentCategory}
                  onResetFilters={handleResetFilters}
                />
              </div>

              {/* Sidebar Section (4 Cols) */}
              <div className="lg:col-span-4 sticky top-16">
                <SidebarWidgets />
              </div>
            </div>
          </>
        )}
      </main>

      {/* 4. Portal Footer with Md. Nayan Hossen credits */}
      <Footer
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSelectedUpazila('all');
        }}
        onSelectUpazila={(up) => {
          setSelectedUpazila(up);
          setCurrentCategory(up);
        }}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 5. Modals */}
      {/* Full News Reading View Modal */}
      {activeArticle && (
        <NewsDetailModal
          article={activeArticle}
          onClose={() => setActiveArticle(null)}
          allArticles={articles}
          onSelectArticle={(art) => setActiveArticle(art)}
        />
      )}

      {/* Emergency Helpline Modal */}
      <HelplineModal
        isOpen={isHelplineOpen}
        onClose={() => setIsHelplineOpen(false)}
      />

      {/* Full Admin Management Panel */}
      {isAdminOpen && (
        <AdminPanel
          articles={articles}
          onClose={handleCloseAdmin}
          onOpenArticle={(art) => {
            handleCloseAdmin();
            setActiveArticle(art);
          }}
        />
      )}
    </div>
  );
}
