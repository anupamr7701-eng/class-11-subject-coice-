import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Compass, RotateCcw, Printer, UserCheck } from 'lucide-react';

interface HeaderProps {
  progressPercent: number;
  completedCount: number;
  totalCount: number;
  showResult: boolean;
  onReset: () => void;
  onPrint?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progressPercent,
  completedCount,
  totalCount,
  showResult,
  onReset,
  onPrint,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Always visible at or near the very top
          if (currentScrollY <= 40) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY.current + 8) {
            // User scrolled down (content moved up) -> slide header out of view
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY.current - 8) {
            // User scrolled up (content moved down) -> slide header back into view
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      id="smart-slide-header"
      className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs no-print transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2.5 sm:gap-3">
          {/* Logo & Titles */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="min-w-0 flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 leading-none">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600 shrink-0" />
                  <span className="truncate">২০২৬-২৭ ফিউচার-রেডি (Future-Ready) গাইড</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 leading-none">
                  <UserCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">অনুপম রায় দ্বারা তৈরি (Created by Anupam Roy)</span>
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-xs sm:text-base md:text-lg font-bold text-slate-900 leading-snug truncate">
                এআই (AI) যুগে স্ট্রিম সিলেকশন ও ক্যারিয়ার গাইড (Career Stream Guide)
              </h1>
            </div>
          </div>

          {/* Action or Progress Status */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {showResult ? (
              <>
                <button
                  type="button"
                  onClick={onPrint}
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  title="রিপোর্ট (Report) প্রিন্ট বা পিডিএফ (PDF) সেভ করুন"
                >
                  <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                  <span className="hidden sm:inline">পিডিএফ (PDF) / প্রিন্ট (Print)</span>
                  <span className="sm:hidden text-[11px]">PDF</span>
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
                  title="নতুন টেস্ট (Test) শুরু করুন"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">রিসেট (Reset)</span>
                  <span className="sm:hidden text-[11px]">রিসেট</span>
                </button>
              </>
            ) : (
              <div className="text-right shrink-0">
                <span className="text-[11px] sm:text-xs font-medium text-slate-500 block leading-tight">
                  <strong className="text-indigo-600 font-bold">{completedCount}</strong>/{totalCount}
                </span>
                <span className="block text-[10px] sm:text-[11px] text-slate-400 font-mono font-medium leading-none mt-0.5">
                  {progressPercent}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Form completion progress bar */}
        {!showResult && (
          <div className="mt-1.5 sm:mt-2 w-full bg-slate-100 h-1 sm:h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    </header>
  );
};
