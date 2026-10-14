import React, { useState } from 'react';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  PhoneCall, 
  Vote, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertTriangle,
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { GAZIPUR_HELPLINES, GAZIPUR_PRAYER_TIMES, INITIAL_POLL } from '../data/initialNews';
import { toBengaliDigits } from '../utils/bengaliUtils';
import { ReaderPoll } from '../types';
import { NewsletterWidget } from './NewsletterWidget';

export const SidebarWidgets: React.FC = () => {
  // Weather state (Gazipur)
  const weather = {
    city: 'গাজীপুর, ঢাকা',
    temp: 28,
    condition: 'আংশিক মেঘলা',
    humidity: 74,
    windSpeed: 12,
    airQuality: 'পরিমিত (AQI ৮৫)',
    high: 31,
    low: 24,
  };

  // Poll State
  const [poll, setPoll] = useState<ReaderPoll>(() => {
    try {
      const saved = localStorage.getItem('mnh_gazipur_poll');
      return saved ? JSON.parse(saved) : INITIAL_POLL;
    } catch {
      return INITIAL_POLL;
    }
  });
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(() => {
    try {
      return localStorage.getItem('mnh_gazipur_voted_opt');
    } catch {
      return null;
    }
  });
  const [voted, setVoted] = useState(Boolean(selectedPollOption));

  const handleVote = (optionId: string) => {
    if (voted) return;
    const updatedOptions = poll.options.map(opt => 
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );
    const updatedPoll = {
      ...poll,
      options: updatedOptions,
      totalVotes: poll.totalVotes + 1,
    };
    setPoll(updatedPoll);
    setSelectedPollOption(optionId);
    setVoted(true);
    try {
      localStorage.setItem('mnh_gazipur_poll', JSON.stringify(updatedPoll));
      localStorage.setItem('mnh_gazipur_voted_opt', optionId);
    } catch (e) {
      console.error(e);
    }
  };

  // Helpline copy state
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const copyHelpline = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <aside className="space-y-6">
      {/* 1. GAZIPUR WEATHER WIDGET */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 rounded-2xl text-white p-5 shadow-lg relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">আবহাওয়া বার্তা</span>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>{weather.city}</span>
            </h3>
          </div>
          <CloudSun className="w-9 h-9 text-amber-300 animate-pulse" />
        </div>

        <div className="flex items-baseline gap-3 my-2">
          <span className="text-4xl font-extrabold font-mono tracking-tight">
            {toBengaliDigits(weather.temp)}°সে
          </span>
          <span className="text-sm font-medium text-blue-100">{weather.condition}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/15 text-xs text-blue-100">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-300" />
            <span>আর্দ্রতা: {toBengaliDigits(weather.humidity)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-blue-300" />
            <span>বাতাস: {toBengaliDigits(weather.windSpeed)} কিমি/ঘণ্টা</span>
          </div>
          <div className="col-span-2 text-[11px] text-blue-200 bg-white/10 px-2 py-1 rounded mt-1">
            বায়ুর মান: {weather.airQuality}
          </div>
        </div>
      </div>

      {/* 2. DAILY NEWSLETTER SUBSCRIPTION FORM */}
      <NewsletterWidget />

      {/* 3. GAZIPUR EMERGENCY HELPLINE NUMBERS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">গাজীপুর জরুরি হেল্পলাইন</h3>
              <p className="text-[11px] text-gray-500">প্রয়োজনে যেকোনো সময় কল করুন</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {GAZIPUR_HELPLINES.map((item) => {
            const isCopied = copiedNumber === item.number;
            return (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 hover:bg-red-50/60 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                    {item.bengaliName}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {item.available}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={`tel:${item.number}`}
                    className="font-mono font-bold text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-red-600 hover:text-white transition-colors"
                    title="সরাসরি কল করুন"
                  >
                    {item.number}
                  </a>
                  <button
                    onClick={() => copyHelpline(item.number)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    title="নম্বরটি কপি করুন"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. READER OPINION / POLL SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
            <Vote className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              জনমত জরিপ
            </span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">পাঠকের মতামত</h3>
          </div>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mb-4 leading-relaxed">
          {poll.question}
        </p>

        {/* Options */}
        <div className="space-y-2.5">
          {poll.options.map((option) => {
            const percent = poll.totalVotes > 0 
              ? Math.round((option.votes / poll.totalVotes) * 100) 
              : 0;
            const isUserChoice = selectedPollOption === option.id;

            return (
              <div
                key={option.id}
                onClick={() => !voted && handleVote(option.id)}
                className={`relative overflow-hidden p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  voted
                    ? isUserChoice
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 font-bold'
                      : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40'
                    : 'border-gray-200 dark:border-slate-700 hover:border-red-400 hover:bg-red-50/30'
                }`}
              >
                {/* Result fill progress bar */}
                {voted && (
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-700 opacity-20 ${
                      isUserChoice ? 'bg-red-600' : 'bg-slate-500 dark:bg-slate-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  ></div>
                )}

                <div className="relative flex justify-between items-center z-10">
                  <div className="flex items-center gap-2">
                    {isUserChoice && <CheckCircle2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
                    <span className="text-slate-800 dark:text-slate-200">{option.text}</span>
                  </div>
                  {voted && (
                    <span className="font-mono font-bold text-red-600 dark:text-red-400 ml-2">
                      {toBengaliDigits(percent)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-gray-500">
          <span>মোট ভোট: {toBengaliDigits(poll.totalVotes)} টি</span>
          {voted ? (
            <span className="text-green-600 font-semibold">আপনার ভোট গৃহীত হয়েছে</span>
          ) : (
            <span className="text-red-500 font-semibold">মতামত দিতে ক্লিক করুন</span>
          )}
        </div>
      </div>

      {/* 4. ADVERTISEMENT BANNER PLACEHOLDER */}
      <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-6 text-center">
        <Sparkles className="w-6 h-6 text-red-500 mx-auto mb-2" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
          বিজ্ঞাপন স্থান (৩০০ × ২৫০)
        </span>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
          গাজীপুরের হাজারো পাঠকের কাছে আপনার ব্র্যান্ড পৌঁছে দিন।
        </p>
        <button 
          onClick={() => alert('বিজ্ঞাপনের জন্য ইমেইল করুন: ads@mnhgazipur.com অথবা কল করুন: 01700-000000')}
          className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center justify-center gap-1 mx-auto"
        >
          <span>বিজ্ঞাপনের দরদাম জানুন</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
