import React, { useState } from 'react';
import { X, PhoneCall, Copy, Check, Search, Shield, Flame, HeartPulse, HelpCircle } from 'lucide-react';
import { GAZIPUR_HELPLINES } from '../data/initialNews';

interface HelplineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelplineModal: React.FC<HelplineModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedNum, setCopiedNum] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHelplines = GAZIPUR_HELPLINES.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bengaliName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.number.includes(searchTerm)
  );

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNum(num);
    setTimeout(() => setCopiedNum(null), 2000);
  };

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'hospital':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'police':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'fire':
        return <Flame className="w-4 h-4 text-amber-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800 relative max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              গাজীপুর জরুরি হেল্পলাইন ডিরেক্টরি
            </h3>
            <p className="text-xs text-gray-500">
              জরুরি মুহূর্তে যেকোনো সময় কল অথবা নম্বর কপি করুন
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="হাসপাতাল, থানা বা ফায়ার সার্ভিস খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {filteredHelplines.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5">{getIcon(item.category)}</div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate">
                    {item.bengaliName}
                  </h4>
                  <p className="text-[11px] text-gray-500 truncate">{item.name}</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {item.available}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <a
                  href={`tel:${item.number}`}
                  className="font-mono font-bold text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-red-600 hover:text-white transition-colors"
                >
                  {item.number}
                </a>
                <button
                  onClick={() => handleCopy(item.number)}
                  className="p-1.5 text-gray-400 hover:text-slate-800 dark:hover:text-white rounded"
                  title="কপি করুন"
                >
                  {copiedNum === item.number ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
