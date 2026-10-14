import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { addNewsletterSubscriber } from '../services/subscriberService';

export const NewsletterWidget: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await addNewsletterSubscriber(email);
      if (res.success) {
        setStatus({ type: 'success', message: res.message });
        setSubscribedEmail(email);
        setEmail('');
      } else {
        setStatus({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setStatus({ 
        type: 'error', 
        message: err.message || 'সাবস্ক্রিপশন সম্পন্ন করতে ত্রুটি হয়েছে। পুনরায় চেষ্টা করুন।' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 rounded-2xl text-white p-5 shadow-lg border border-red-500/30 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/15 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-2.5 mb-3">
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/40">
              Daily Newsletter
            </span>
          </div>
          <h3 className="font-bold text-base text-white mt-0.5 font-serif">
            দৈনিক নিউজলেটার
          </h3>
        </div>
      </div>

      <p className="relative z-10 text-xs text-slate-300 leading-relaxed mb-4">
        প্রতিদিন সকালের সেরা খবর ও গাজীপুরের ব্রেকিং আপডেট সরাসরি আপনার ইমেইল ইনবক্সে পেতে বিনামূল্যে সাবস্ক্রাইব করুন।
      </p>

      {/* Success State */}
      {status?.type === 'success' ? (
        <div className="relative z-10 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>সাবস্ক্রিপশন সফল হয়েছে!</span>
          </div>
          <p className="text-[11px] leading-relaxed text-emerald-100">
            <span className="font-mono font-semibold">{subscribedEmail}</span> ঠিকানায় দৈনিক সংবাদ সংকলন পাঠানো হবে।
          </p>
          <button
            onClick={() => setStatus(null)}
            className="text-[10px] text-emerald-400 hover:underline font-semibold block pt-1"
          >
            অন্য আরেকটি ইমেইল সাবস্ক্রাইব করুন
          </button>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="relative z-10 space-y-2.5">
          {status?.type === 'error' && (
            <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-600/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{status.message}</span>
            </div>
          )}

          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="আপনার ইমেইল লিখুন (name@example.com)..."
              disabled={isSubmitting}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-slate-400 disabled:opacity-50"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>সংরক্ষণ করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>সাবস্ক্রাইব করুন</span>
                <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Privacy Note */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
            <ShieldCheck className="w-3 h-3 text-red-400" />
            <span>আমরা স্প্যাম অপছন্দ করি। যেকোনো সময় আনসাবস্ক্রাইব করা যাবে।</span>
          </div>
        </form>
      )}
    </div>
  );
};
