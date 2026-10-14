import React from 'react';
import { 
  Heart, 
  MapPin, 
  Mail, 
  Phone, 
  Facebook, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  ArrowUp
} from 'lucide-react';
import { CATEGORIES, GAZIPUR_UPAZILAS } from '../data/initialNews';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onSelectUpazila: (up: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onSelectUpazila,
  onOpenAdmin,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-900 text-slate-300 mt-16 border-t border-slate-800 transition-colors">
      {/* Upper Footer: Brand, Categories & Contact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 1. About Portal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-extrabold text-lg shadow">
                MNH
              </div>
              <div>
                <h3 className="font-black text-lg text-white font-serif tracking-tight">
                  MNH Gazipur News
                </h3>
                <span className="text-[11px] text-red-400 font-semibold">
                  গাজীপুরের বিশ্বস্ত সংবাদ মাধ্যম
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              &lsquo;MNH Gazipur News Portal&rsquo; গাজীপুর জেলা ও জাতীয় পর্যায়ের সব তাজা সংবাদ, অনুসন্ধানী প্রতিবেদন, উন্নয়ন ও গণমানুষের অধিকারের কথা সবার আগে বস্তুনিষ্ঠভাবে পৌঁছে দিতে অঙ্গীকারবদ্ধ।
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>প্রধান কার্যালয়: জয়দেবপুর বাজার রোড, গাজীপুর সদর, গাজীপুর - ১৭০০</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <span>বার্তা বিভাগ: news@mnhgazipur.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <span>বিজ্ঞাপন ও তথ্য: +৮৮০১৭১২-৩৪৫৬৭৮</span>
              </div>
            </div>
          </div>

          {/* 2. Regional Gazipur Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              গাজীপুর আঞ্চলিক সংবাদ
            </h4>
            <ul className="space-y-2 text-xs">
              {GAZIPUR_UPAZILAS.filter(u => u.id !== 'all').map((up) => (
                <li key={up.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(up.name);
                      onSelectUpazila(up.id);
                      scrollToTop();
                    }}
                    className="hover:text-red-400 transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-red-500">›</span>
                    <span>{up.name} অঞ্চল</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('অপরাধ');
                    scrollToTop();
                  }}
                  className="hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-red-500">›</span>
                  <span>অপরাধ ও আদালত</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('শিক্ষা');
                    scrollToTop();
                  }}
                  className="hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-red-500">›</span>
                  <span>শিক্ষা ও ক্যাম্পাস বার্তা</span>
                </button>
              </li>
            </ul>
          </div>

          {/* 3. Categories & Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              বিভাগসমূহ
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    scrollToTop();
                  }}
                  className="text-left hover:text-red-400 transition-colors truncate"
                >
                  • {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Editorial & Developer Credit */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-red-600 pl-2">
              সম্পাদকীয় ও প্রযুক্তি
            </h4>

            {/* Developer Card */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                  NH
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Md. Nayan Hossen</div>
                  <div className="text-[10px] text-red-400">সম্পাদক ও প্রধান প্রযুক্তি কর্মকর্তা</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                সম্পূর্ণ পোর্টালটি ডিজাইন ও ডেভেলপ করেছেন ইঞ্জিনিয়ার মো. নয়ন হোসেন।
              </p>

              <a
                href="https://www.facebook.com/mdnayan.hossain.1420"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>Facebook প্রোফাইল</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <button
              onClick={scrollToTop}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowUp className="w-3.5 h-3.5 text-red-500" />
              <span>উপরে ফিরে যান (Scroll to Top)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer: Copyright */}
      <div className="bg-slate-950 py-4 px-4 sm:px-6 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            <span 
              onClick={onOpenAdmin} 
              className="cursor-default select-none hover:text-slate-300 transition-colors"
              title="MNH Gazipur News"
            >
              © ২০২৬
            </span>{' '}
            <span className="font-bold text-slate-200">MNH Gazipur News Portal</span>. All rights reserved.
          </p>

          <p className="flex items-center justify-center gap-1">
            <span>ডিজাইন ও ডেভেলপমেন্ট: </span>
            <a
              href="https://www.facebook.com/mdnayan.hossain.1420"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-red-400 hover:underline"
            >
              Md. Nayan Hossen
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
