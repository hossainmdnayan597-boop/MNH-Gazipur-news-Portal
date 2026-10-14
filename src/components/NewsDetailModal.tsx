import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Eye, 
  Share2, 
  Printer, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  MessageSquare, 
  Check, 
  Send, 
  ChevronRight,
  Sparkles,
  MapPin,
  Tag
} from 'lucide-react';
import { NewsArticle } from '../types';
import { formatBengaliDateTime, getRelativeBengaliTime, toBengaliDigits } from '../utils/bengaliUtils';
import { incrementArticleViews } from '../services/newsService';

interface NewsDetailModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  allArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  article,
  onClose,
  allArticles,
  onSelectArticle,
}) => {
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<{ id: string; name: string; text: string; date: string }[]>([
    {
      id: 'c1',
      name: 'মো. রফিকুল ইসলাম, জয়দেবপুর',
      text: 'গাজীপুরের সাধারণ মানুষের দীর্ঘদিনের সমস্যা নিয়ে এমন বস্তুনিষ্ঠ সংবাদ প্রকাশের জন্য MNH নিউজ পোর্টালকে ধন্যবাদ।',
      date: '১ ঘণ্টা আগে',
    },
    {
      id: 'c2',
      name: 'তাহমিনা আক্তার, টঙ্গী',
      text: 'প্রশাসনের দ্রুত হস্তক্ষেপ কামনা করছি। শুভকামনা রইল!',
      date: '২ ঘণ্টা আগে',
    }
  ]);

  useEffect(() => {
    if (article) {
      incrementArticleViews(article.id);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article?.id]);

  if (!article) return null;

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${article.title} - MNH Gazipur News\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('আপনার ব্রাউজারে স্পিচ সাপোর্ট নেই।');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(article.title + '. ' + article.summary);
      utterance.lang = 'bn-BD';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      id: 'comm-' + Date.now(),
      name: commentName.trim() || 'নাম প্রকাশে অনিচ্ছুক পাঠক',
      text: commentText.trim(),
      date: 'এইমাত্র',
    };
    setComments([newComment, ...comments]);
    setCommentText('');
    setCommentName('');
  };

  // Related articles from same category
  const relatedArticles = allArticles
    .filter(a => a.id !== article.id && (a.category === article.category || a.subCategory === article.subCategory))
    .slice(0, 3);

  const getFontSizeClass = () => {
    switch (fontSizeLevel) {
      case 'large':
        return 'text-lg leading-relaxed';
      case 'xlarge':
        return 'text-xl leading-loose';
      default:
        return 'text-base leading-relaxed';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Action Top Bar */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded">
              {article.category}
            </span>
            {article.subCategory && (
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                / {article.subCategory}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Font size controller */}
            <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-bold">
              <button
                onClick={() => setFontSizeLevel('normal')}
                className={`px-2 py-1 rounded ${fontSizeLevel === 'normal' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'text-gray-600 dark:text-gray-300'}`}
                title="সাধারণ ফন্ট সাইজ"
              >
                A
              </button>
              <button
                onClick={() => setFontSizeLevel('large')}
                className={`px-2 py-1 rounded ${fontSizeLevel === 'large' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'text-gray-600 dark:text-gray-300'}`}
                title="বড় ফন্ট সাইজ"
              >
                A+
              </button>
              <button
                onClick={() => setFontSizeLevel('xlarge')}
                className={`px-2 py-1 rounded ${fontSizeLevel === 'xlarge' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'text-gray-600 dark:text-gray-300'}`}
                title="অতিরিক্ত বড় ফন্ট"
              >
                A++
              </button>
            </div>

            {/* Read aloud toggle */}
            <button
              onClick={toggleSpeech}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                isSpeaking 
                  ? 'bg-red-600 text-white border-red-600 animate-pulse' 
                  : 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              title="সংবাদটি অডিওতে শুনুন"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSpeaking ? 'বন্ধ করুন' : 'শুনুন'}</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-red-600"
              title="সংবাদ প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-red-100 hover:text-red-600 dark:hover:bg-slate-700 transition-colors ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {/* Headline */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug font-serif">
            {article.title}
          </h1>

          {/* Reporter & Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-gray-100 dark:border-slate-800 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center font-bold text-red-600 dark:text-red-400">
                {article.reporter.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  {article.reporter}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Clock className="w-3 h-3 text-red-500" />
                  <span>প্রকাশ: {formatBengaliDateTime(article.createdAt)}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                <span>{toBengaliDigits(article.views)} বার পঠিত</span>
              </span>
            </div>
          </div>

          {/* Hero Banner Image */}
          <div className="relative rounded-xl overflow-hidden aspect-[16/9] w-full bg-slate-900 shadow">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            {article.subCategory && (
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded">
                ছবি: MNH Gazipur News আর্কাইভ
              </div>
            )}
          </div>

          {/* Summary / Excerpt Highlight */}
          <div className="p-4 rounded-xl bg-red-50/80 dark:bg-red-950/30 border-l-4 border-red-600 text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
            {article.summary}
          </div>

          {/* Full Article Content */}
          <div className={`prose dark:prose-invert max-w-none space-y-4 text-slate-800 dark:text-slate-200 ${getFontSizeClass()}`}>
            {article.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-justify leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-4 border-t border-gray-100 dark:border-slate-800">
              <Tag className="w-3.5 h-3.5 text-gray-400 mr-1" />
              <span className="text-xs text-gray-500 font-semibold mr-1">ট্যাগ:</span>
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full border border-gray-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Social Share Bar */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-red-600" />
              <span>সংবাদটি বন্ধুদের সাথে শেয়ার করুন:</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareFacebook}
                className="px-3 py-1.5 rounded-lg bg-[#1877F2] text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                <span>Facebook</span>
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : null}
                <span>{copied ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
              </button>
            </div>
          </div>

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div className="pt-6 border-t border-gray-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-4 bg-red-600 rounded-sm"></span>
                <span>সম্পর্কিত আরও সংবাদ</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedArticles.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectArticle(rel)}
                    className="group cursor-pointer rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 p-2.5 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] overflow-hidden rounded-lg mb-2">
                        <img 
                          src={rel.imageUrl} 
                          alt={rel.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-2 block">
                      {getRelativeBengaliTime(rel.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reader Comments Section */}
          <div className="pt-6 border-t border-gray-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-600" />
              <span>পাঠক মতামত ({toBengaliDigits(comments.length)})</span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-3 mb-6 bg-gray-50 dark:bg-slate-800/40 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
              <input
                type="text"
                placeholder="আপনার নাম ও এলাকা (ঐচ্ছিক)"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <textarea
                placeholder="সংবাদ সম্পর্কে আপনার শালীন ও গঠনমূলক মতামত লিখুন..."
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              ></textarea>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>মতামত পোস্ট করুন</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comm) => (
                <div key={comm.id} className="p-3 rounded-xl bg-gray-50/70 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{comm.name}</span>
                    <span className="text-[10px] text-gray-500">{comm.date}</span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{comm.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
