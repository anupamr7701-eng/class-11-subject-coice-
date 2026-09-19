import React from 'react';
import { SectionData } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

interface SectionNavProps {
  sections: SectionData[];
  currentSectionIndex: number;
  onSelectSection: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isLastSection: boolean;
  completedSectionIds: number[];
  viewAllMode: boolean;
  onToggleViewAll: () => void;
  isSubmitting?: boolean;
}

export const SectionNav: React.FC<SectionNavProps> = ({
  sections,
  currentSectionIndex,
  onSelectSection,
  onNext,
  onPrev,
  onSubmit,
  isLastSection,
  completedSectionIds,
  viewAllMode,
  onToggleViewAll,
  isSubmitting,
}) => {
  return (
    <div className="my-8 space-y-4 no-print">
      {/* Section Pill Tabs */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2 px-1 text-xs text-slate-500 font-medium">
          <span>সেকশন নির্বাচন (Section Selection):</span>
          <button
            type="button"
            onClick={onToggleViewAll}
            className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 cursor-pointer"
          >
            {viewAllMode ? 'ধাপে ধাপে দেখুন (Step-by-step)' : 'সব প্রশ্ন একসাথে দেখুন (View All Questions)'}
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {sections.map((sec, idx) => {
            const isActive = currentSectionIndex === idx && !viewAllMode;
            const isCompleted = completedSectionIds.includes(sec.id);

            return (
              <button
                key={sec.id}
                type="button"
                id={`section-tab-${sec.id}`}
                onClick={() => onSelectSection(idx)}
                className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title={sec.title}
              >
                <div className="flex items-center gap-1">
                  <span>সেকশন (Section) {sec.id}</span>
                  {isCompleted && !isActive && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {!viewAllMode && currentSectionIndex > 0 ? (
          <button
            type="button"
            id="prev-section-btn"
            onClick={onPrev}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>পূর্ববর্তী সেকশন (Previous Section)</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3 ml-auto">
          {!viewAllMode && !isLastSection ? (
            <button
              type="button"
              id="next-section-btn"
              onClick={onNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-100 cursor-pointer"
            >
              <span>পরবর্তী সেকশন (Next Section)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="submit-form-btn"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>বিশ্লেষণ চলছে (Analyzing Result)...</span>
                </>
              ) : (
                <>
                  <span>জমা দিন ও রেজাল্ট দেখুন (Submit & View Result)</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
