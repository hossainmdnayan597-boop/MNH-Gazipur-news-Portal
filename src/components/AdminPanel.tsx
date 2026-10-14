import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Settings, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  TrendingUp, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  Image as ImageIcon,
  ExternalLink,
  Flame,
  X,
  RefreshCw,
  Sliders,
  FolderTree
} from 'lucide-react';
import { NewsArticle } from '../types';
import { 
  createArticle, 
  updateArticle, 
  deleteArticle, 
  resetToInitialArticles 
} from '../services/newsService';
import { 
  AdminUser, 
  DEFAULT_ADMIN, 
  loginAdmin, 
  logoutAdmin, 
  subscribeToAuth 
} from '../services/authService';
import { 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  isFirebaseConfigured, 
  DEFAULT_FIREBASE_CONFIG 
} from '../services/firebaseConfig';
import { CATEGORIES } from '../data/initialNews';
import { formatBengaliDate, toBengaliDigits } from '../utils/bengaliUtils';

interface AdminPanelProps {
  articles: NewsArticle[];
  onClose: () => void;
  onOpenArticle: (article: NewsArticle) => void;
}

// Preset photo options for quick pick
const IMAGE_PRESETS = [
  { label: 'বিআরটি / যোগাযোগ', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80' },
  { label: 'টঙ্গী / তুরাগ নদী', url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1000&q=80' },
  { label: 'হাইটেক সিটি / প্রযুক্তি', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80' },
  { label: 'শ্রীপুর কৃষি / প্রকৃতি', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80' },
  { label: 'ডুয়েট ক্যাম্পাস / শিক্ষা', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80' },
  { label: 'খেলাধুলা / ক্রিকেট', url: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1000&q=80' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  articles,
  onClose,
  onOpenArticle,
}) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'manage' | 'firebase'>('dashboard');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@mnhgazipur.com');
  const [loginPassword, setLoginPassword] = useState('admin123456');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Toast / notification banner
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Article Form State (Create / Edit)
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('গাজীপুর সদর');
  const [subCategory, setSubCategory] = useState('');
  const [reporter, setReporter] = useState('মো. নয়ন হোসেন, প্রধান সম্পাদক');
  const [imageUrl, setImageUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirm modal
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);

  // Table search & filter
  const [filterCategory, setFilterCategory] = useState('all');
  const [tableSearch, setTableSearch] = useState('');

  // Firebase Config Form
  const [fbConfig, setFbConfig] = useState(getSavedFirebaseConfig());
  const [fbSaveSuccess, setFbSaveSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const user = await loginAdmin(loginEmail, loginPassword);
      setCurrentUser(user);
      showToast('অ্যাডমিন প্যানেলে স্বাগতম, মো. নয়ন হোসেন!');
    } catch (err: any) {
      setLoginError(err.message || 'লগইন ব্যর্থ হয়েছে');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setCurrentUser(null);
    showToast('সফলভাবে লগআউট হয়েছে');
  };

  // Populate form for editing
  const handleEditClick = (article: NewsArticle) => {
    setEditingArticleId(article.id);
    setTitle(article.title);
    setCategory(article.category);
    setSubCategory(article.subCategory || '');
    setReporter(article.reporter);
    setImageUrl(article.imageUrl);
    setSummary(article.summary);
    setContent(article.content);
    setTagsStr(article.tags.join(', '));
    setIsFeatured(article.isFeatured);
    setIsBreaking(article.isBreaking);
    setActiveTab('create');
  };

  // Reset form
  const resetForm = () => {
    setEditingArticleId(null);
    setTitle('');
    setCategory('গাজীপুর সদর');
    setSubCategory('');
    setReporter('মো. নয়ন হোসেন, প্রধান সম্পাদক');
    setImageUrl('');
    setSummary('');
    setContent('');
    setTagsStr('');
    setIsFeatured(false);
    setIsBreaking(false);
  };

  // Submit article
  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('শিরোনাম এবং মূল সংবাদ অবশ্যই পূরণ করতে হবে!', 'error');
      return;
    }

    setIsSubmitting(true);
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const fallbackImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1000&q=80';

    try {
      if (editingArticleId) {
        await updateArticle(editingArticleId, {
          title,
          category,
          subCategory,
          reporter,
          imageUrl: fallbackImage,
          summary: summary.trim() || title.substring(0, 120),
          content,
          tags,
          isFeatured,
          isBreaking,
        });
        showToast('সংবাদ সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await createArticle({
          title,
          category,
          subCategory,
          reporter,
          imageUrl: fallbackImage,
          summary: summary.trim() || title.substring(0, 120),
          content,
          tags,
          isFeatured,
          isBreaking,
          createdAt: new Date().toISOString(),
        });
        showToast('নতুন সংবাদ সফলভাবে প্রকাশিত হয়েছে!');
      }
      resetForm();
      setActiveTab('manage');
    } catch (err) {
      console.error(err);
      showToast('সংবাদ সংরক্ষণ করতে ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete article
  const confirmDelete = async () => {
    if (!articleToDelete) return;
    try {
      await deleteArticle(articleToDelete.id);
      showToast('সংবাদ মুছে ফেলা হয়েছে!');
      setArticleToDelete(null);
    } catch (err) {
      showToast('মুছতে সমস্যা হয়েছে', 'error');
    }
  };

  // Save Firebase Config
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(fbConfig);
    setFbSaveSuccess(true);
    showToast('Firebase কনফিগারেশন সংরক্ষিত হয়েছে! পৃষ্ঠা রিলোড হচ্ছে...');
  };

  // Filtered table articles
  const tableArticles = articles.filter((a) => {
    const matchCategory = filterCategory === 'all' || a.category === filterCategory;
    const matchSearch =
      tableSearch === '' ||
      a.title.toLowerCase().includes(tableSearch.toLowerCase()) ||
      a.reporter.toLowerCase().includes(tableSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Calculate statistics
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalFeatured = articles.filter(a => a.isFeatured).length;
  const totalBreaking = articles.filter(a => a.isBreaking).length;
  const categoriesCount = CATEGORIES.length - 1; // excluding 'সব খবর'

  // If not authenticated, render Login Screen
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-red-600/30">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
              MNH Gazipur News Admin
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              গাজীপুরের বিশ্বস্ত সংবাদ মাধ্যম | অ্যাডমিন প্যানেল লগইন
            </p>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs">
            <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>এডমিন এক্সেস তথ্য (Md. Nayan Hossen):</span>
            </div>
            <div className="text-amber-700 dark:text-amber-400 font-mono space-y-0.5">
              <div>ইমেইল: <span className="font-bold">admin@mnhgazipur.com</span></div>
              <div>পাসওয়ার্ড: <span className="font-bold">admin123456</span></div>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                অ্যাডমিন ইমেইল
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@mnhgazipur.com"
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                পাসওয়ার্ড
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold text-xs rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>লগইন করুন</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 text-center text-[11px] text-gray-500">
            ডেভেলপার: <span className="font-bold text-slate-700 dark:text-slate-300">Md. Nayan Hossen</span>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100 dark:bg-slate-950 flex flex-col">
      {/* Toast Banner */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold text-white transition-all duration-300 ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ADMIN HEADER BAR */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-bold text-base shadow">
            MNH
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <span>MNH Gazipur News Admin</span>
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono">
                v2.0 PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              গাজীপুরের বিশ্বস্ত সংবাদ মাধ্যম | সেন্ট্রাল কন্ট্রোল ড্যাশবোর্ড
            </p>
          </div>
        </div>

        {/* Profile & Exit */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2.5">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
            <div className="text-left">
              <div className="text-xs font-bold text-white">{currentUser.displayName}</div>
              <div className="text-[10px] text-red-400 font-semibold">{currentUser.role}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            title="লগআউট"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">লগআউট</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow"
          >
            <Eye className="w-4 h-4" />
            <span>লাইভ পোর্টাল দেখুন</span>
          </button>
        </div>
      </header>

      {/* ADMIN BODY LAYOUT */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-60 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 p-3 sm:p-4 flex md:flex-col justify-between overflow-x-auto md:overflow-visible">
          <nav className="flex md:flex-col gap-1.5 w-full">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors w-full text-left whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ড্যাশবোর্ড ওভারভিউ</span>
            </button>

            <button
              onClick={() => {
                resetForm();
                setActiveTab('create');
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors w-full text-left whitespace-nowrap ${
                activeTab === 'create'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{editingArticleId ? 'সংবাদ সম্পাদনা' : 'নতুন সংবাদ লিখুন'}</span>
            </button>

            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors w-full text-left whitespace-nowrap ${
                activeTab === 'manage'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>সকল সংবাদ পরিচালনা ({toBengaliDigits(articles.length)})</span>
            </button>

            <button
              onClick={() => setActiveTab('firebase')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors w-full text-left whitespace-nowrap ${
                activeTab === 'firebase'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Firebase ডাটাবেজ সংযোগ</span>
            </button>
          </nav>

          {/* Quick System Status Card */}
          <div className="hidden md:block p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 text-[11px] space-y-1 mt-4">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured() ? 'bg-green-500' : 'bg-amber-500'}`}></span>
              <span>{isFirebaseConfigured() ? 'Firebase Live Connected' : 'লোকাল মেমোরি মোড'}</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {isFirebaseConfigured() ? 'Firestore "news_articles" যুক্ত' : 'নিরাপদ অফলাইন ও ব্রাউজার স্টোরেজ চালু'}
            </p>
          </div>
        </aside>

        {/* MAIN TAB CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
                  স্বাগতম, {currentUser.displayName}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  MNH Gazipur News Portal এর প্রধান পরিচালনা কেন্দ্র।
                </p>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold">মোট প্রকাশিত সংবাদ</span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                      {toBengaliDigits(articles.length)}
                    </div>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-950/80 text-red-600 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold">প্রধান সংবাদ (Featured)</span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                      {toBengaliDigits(totalFeatured)}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-100 dark:bg-amber-950/80 text-amber-600 rounded-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold">ব্রেকিং নিউজ</span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                      {toBengaliDigits(totalBreaking)}
                    </div>
                  </div>
                  <div className="p-3 bg-rose-100 dark:bg-rose-950/80 text-rose-600 rounded-xl">
                    <Flame className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold">মোট পাঠক ভিউ</span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                      {toBengaliDigits(totalViews)}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-950/80 text-blue-600 rounded-xl">
                    <Eye className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    সর্বশেষ প্রকাশিত সংবাদসমূহ
                  </h3>
                  <button
                    onClick={() => setActiveTab('manage')}
                    className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline"
                  >
                    সবগুলো দেখুন
                  </button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {articles.slice(0, 5).map((a) => (
                    <div key={a.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={a.imageUrl}
                          alt={a.title}
                          className="w-12 h-10 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                            {a.title}
                          </h4>
                          <span className="text-[10px] text-gray-400">
                            বিভাগ: {a.category} • {formatBengaliDate(a.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleEditClick(a)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded"
                          title="সম্পাদনা"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenArticle(a)}
                          className="p-1.5 text-slate-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded"
                          title="সংবাদ প্রিভিউ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer Attribution Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm">ওয়েবসাইট ও পোর্টাল নির্মাতা: Md. Nayan Hossen</h4>
                  <p className="text-xs text-red-200 mt-0.5">
                    MNH Gazipur News Portal • সর্বস্বত্ব সংরক্ষিত © ২০২৬
                  </p>
                </div>
                <a
                  href="https://www.facebook.com/mdnayan.hossain.1420"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-1.5"
                >
                  <span>Facebook Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE / EDIT ARTICLE */}
          {activeTab === 'create' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm max-w-4xl">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
                    {editingArticleId ? 'সংবাদ সম্পাদনা করুন' : 'নতুন সংবাদ প্রকাশ করুন'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    গাজীপুর ও জাতীয় সংবাদের তথ্যসমূহ সঠিকভাবে পূরণ করুন
                  </p>
                </div>
                {editingArticleId && (
                  <button
                    onClick={resetForm}
                    className="text-xs text-red-600 hover:underline"
                  >
                    বাতিল করে নতুন শুরু করুন
                  </button>
                )}
              </div>

              <form onSubmit={handleArticleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    সংবাদের শিরোনাম (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="যেমন: জয়দেবপুর চৌরাস্তায় যানজট নিরসনে নতুন ট্রাফিক পরিকল্পনা..."
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white font-serif"
                  />
                </div>

                {/* Category & Reporter Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      বিভাগ (Category) *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                    >
                      {CATEGORIES.filter(c => c !== 'সব খবর').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      উপ-বিভাগ / এলাকা (Sub-Category)
                    </label>
                    <input
                      type="text"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      placeholder="যেমন: আইন-শৃঙ্খলা / যোগাযোগ"
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      প্রতিবেদক (Reporter) *
                    </label>
                    <input
                      type="text"
                      required
                      value={reporter}
                      onChange={(e) => setReporter(e.target.value)}
                      placeholder="যেমন: স্টাফ রিপোর্টার, গাজীপুর"
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Image URL & Preset Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    ছবির লিঙ্ক (Image URL)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white mb-2"
                  />

                  {/* Preset quick picker */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      দ্রুত ছবি নির্বাচন:
                    </span>
                    {IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setImageUrl(preset.url)}
                        className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Preview of chosen image */}
                  {imageUrl && (
                    <div className="mt-3 relative w-36 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Short Summary */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    সংক্ষিপ্ত সারসংক্ষেপ (Excerpt / Summary)
                  </label>
                  <textarea
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="সংবাদের মূল আকর্ষণীয় ২-৩ লাইন সারসংক্ষেপ..."
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                  ></textarea>
                </div>

                {/* Full Article Content */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    সম্পূর্ণ সংবাদ বিবরণী (Full Content) *
                  </label>
                  <textarea
                    rows={7}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="বিস্তারিত সংবাদ লিখুন (প্যারাগ্রাফ আলাদা করতে দুইবার এন্টার চাপুন)..."
                    className="w-full px-3 py-2.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white leading-relaxed"
                  ></textarea>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    ট্যাগ বা কি-ওয়ার্ড (কমা দিয়ে আলাদা করুন)
                  </label>
                  <input
                    type="text"
                    value={tagsStr}
                    onChange={(e) => setTagsStr(e.target.value)}
                    placeholder="গাজীপুর সদর, উন্নয়ন, বিআরটি, সড়ক"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Featured & Breaking Toggles */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      প্রধান সংবাদ (Featured News) হিসেবে প্রদর্শন
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBreaking}
                      onChange={(e) => setIsBreaking(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">
                      ব্রেকিং নিউজ টিকারে প্রদর্শন (Breaking News Ticker)
                    </span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>সংরক্ষণ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>{editingArticleId ? 'আপডেট করুন' : 'এখনই প্রকাশ করুন'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                  >
                    রিসেট
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: MANAGE ALL NEWS ARTICLES */}
          {activeTab === 'manage' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Filter and Search Bar */}
              <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">বিভাগ:</span>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                  >
                    <option value="all">সকল বিভাগ ({toBengaliDigits(articles.length)})</option>
                    {CATEGORIES.filter(c => c !== 'সব খবর').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="শিরোনাম বা রিপোর্টার দিয়ে খুঁজুন..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-gray-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">ছবি ও শিরোনাম</th>
                      <th className="px-4 py-3">বিভাগ</th>
                      <th className="px-4 py-3">প্রতিবেদক</th>
                      <th className="px-4 py-3">তারিখ</th>
                      <th className="px-4 py-3">স্ট্যাটাস</th>
                      <th className="px-4 py-3">ভিউ</th>
                      <th className="px-4 py-3 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {tableArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <img
                            src={article.imageUrl}
                            alt=""
                            className="w-12 h-10 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <span className="font-bold text-slate-900 dark:text-white line-clamp-1 block">
                              {article.title}
                            </span>
                            <span className="text-[10px] text-gray-400 line-clamp-1">
                              {article.summary}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-medium text-[11px]">
                            {article.category}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {article.reporter}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-[11px]">
                          {formatBengaliDate(article.createdAt)}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap space-x-1">
                          {article.isFeatured && (
                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              প্রধান
                            </span>
                          )}
                          {article.isBreaking && (
                            <span className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              ব্রেকিং
                            </span>
                          )}
                          {!article.isFeatured && !article.isBreaking && (
                            <span className="text-gray-400 text-[10px]">সাধারণ</span>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-600 dark:text-gray-300">
                          {toBengaliDigits(article.views)}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right space-x-1">
                          <button
                            onClick={() => onOpenArticle(article)}
                            className="p-1.5 text-slate-600 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-slate-800"
                            title="প্রিভিউ দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditClick(article)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setArticleToDelete(article)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FIREBASE SETUP & CONFIGURATION */}
          {activeTab === 'firebase' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm max-w-3xl space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-5 h-5 text-red-600" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
                    Firebase Firestore & Authentication কনফিগারেশন
                  </h2>
                </div>
                <p className="text-xs text-gray-500">
                  আপনার নিজস্ব Firebase প্রজেক্টের ক্রিডেনশিয়াল বসিয়ে সরাসরি ক্লাউড ডাটাবেজ (Firestore) ও অথেনটিকেশনের সাথে সংযুক্ত করুন।
                </p>
              </div>

              {/* Status indicator */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                isFirebaseConfigured()
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 text-amber-800 dark:text-amber-300'
              }`}>
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">
                    {isFirebaseConfigured() ? 'Firebase Live Connected' : 'বর্তমানে লোকাল স্টোরেজ মোড সক্রিয়'}
                  </div>
                  <p className="mt-1 leading-relaxed">
                    {isFirebaseConfigured()
                      ? 'অ্যাপটি সরাসরি আপনার Firestore ডাটাবেজের "news_articles" কালেকশন থেকে রিয়েল-টাইম ডাটা গ্রহণ এবং প্রকাশ করছে।'
                      : 'Firebase কনফিগারেশন এখনো সেটআপ করা হয়নি। তাই সিস্টেমটি কোনো ত্রুটি ছাড়াই দ্রুতগতির লোকাল মেমোরি ও ব্রাউজার স্টোরেজ দিয়ে ১০০% সচল রয়েছে। নিচে আপনার তথ্য পেস্ট করুন।'}
                  </p>
                </div>
              </div>

              {/* Configuration Form */}
              <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      apiKey
                    </label>
                    <input
                      type="text"
                      value={fbConfig.apiKey}
                      onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      projectId
                    </label>
                    <input
                      type="text"
                      value={fbConfig.projectId}
                      onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                      placeholder="mnh-gazipur-news"
                      className="w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      authDomain
                    </label>
                    <input
                      type="text"
                      value={fbConfig.authDomain}
                      onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                      placeholder="mnh-gazipur-news.firebaseapp.com"
                      className="w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      storageBucket
                    </label>
                    <input
                      type="text"
                      value={fbConfig.storageBucket}
                      onChange={(e) => setFbConfig({ ...fbConfig, storageBucket: e.target.value })}
                      placeholder="mnh-gazipur-news.appspot.com"
                      className="w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      messagingSenderId
                    </label>
                    <input
                      type="text"
                      value={fbConfig.messagingSenderId}
                      onChange={(e) => setFbConfig({ ...fbConfig, messagingSenderId: e.target.value })}
                      placeholder="123456789"
                      className="w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      appId
                    </label>
                    <input
                      type="text"
                      value={fbConfig.appId}
                      onChange={(e) => setFbConfig({ ...fbConfig, appId: e.target.value })}
                      placeholder="1:123456789:web:abcd..."
                      className="w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    <span>Firebase সংযোগ সংরক্ষণ করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetToInitialArticles();
                      showToast('গাজীপুরের নমুনা সংবাদসমূহ রিস্টোর করা হয়েছে!');
                    }}
                    className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>নমুনা সংবাদ রিস্টোর করুন</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 text-center border border-gray-200 dark:border-slate-800 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              সংবাদটি মুছে ফেলতে চান?
            </h3>
            <p className="text-xs text-gray-500 mb-4 line-clamp-2">
              &ldquo;{articleToDelete.title}&rdquo; সংবাদটি মুছে ফেললে তা পোর্টাল থেকে স্থায়ীভাবে অপসারণ করা হবে।
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setArticleToDelete(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-3 px-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          <span>MNH Gazipur News Portal Admin • © ২০২৬ সর্বস্বত্ব সংরক্ষিত</span>
        </div>
        <div>
          <span>নির্মাতা: </span>
          <a
            href="https://www.facebook.com/mdnayan.hossain.1420"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 font-bold hover:underline"
          >
            Md. Nayan Hossen
          </a>
        </div>
      </footer>
    </div>
  );
};
