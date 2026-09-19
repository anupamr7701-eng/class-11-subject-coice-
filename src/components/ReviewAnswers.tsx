import React from 'react';
import { QUESTIONS } from '../data/questions';
import { UserResponses } from '../types';
import { X, ArrowLeft, CheckCircle2, UserCheck } from 'lucide-react';

interface ReviewAnswersProps {
  responses: UserResponses;
  onClose: () => void;
  onEdit: () => void;
}

export const ReviewAnswers: React.FC<ReviewAnswersProps> = ({
  responses,
  onClose,
  onEdit,
}) => {
  const getAnswerDisplay = (qId: number): string => {
    switch (qId) {
      case 1:
        return responses.name || '(প্রদান করা হয়নি)';
      case 2: {
        const opt = QUESTIONS[1].options?.find((o) => o.value === responses.currentClass);
        return opt ? opt.label : '-';
      }
      case 3: {
        const opt = QUESTIONS[2].options?.find((o) => o.value === responses.locationTier);
        return opt ? opt.label : '-';
      }
      case 4: {
        const opt = QUESTIONS[3].options?.find((o) => o.value === responses.board);
        return opt ? opt.label : '-';
      }
      case 5:
        return `${responses.interestScience ?? '-'}/১০ (Scale)`;
      case 6:
        return `${responses.interestCommerce ?? '-'}/১০ (Scale)`;
      case 7:
        return `${responses.interestArts ?? '-'}/১০ (Scale)`;
      case 8:
        return `${responses.interestTech ?? '-'}/১০ (Scale)`;
      case 9:
        return `${responses.interestCommunication ?? '-'}/১০ (Scale)`;
      case 10:
        return `${responses.aptitudeMath ?? '-'}/১০ (Scale)`;
      case 11:
        return `${responses.aptitudePhysics ?? '-'}/১০ (Scale)`;
      case 12:
        return `${responses.aptitudeLogic ?? '-'}/১০ (Scale)`;
      case 13:
        return `${responses.aptitudeLanguage ?? '-'}/১০ (Scale)`;
      case 14:
        return `${responses.aptitudeCreativity ?? '-'}/১০ (Scale)`;
      case 15: {
        const opt = QUESTIONS[14].options?.find((o) => o.value === responses.learningMethod);
        return opt ? opt.label : '-';
      }
      case 16: {
        const opt = QUESTIONS[15].options?.find((o) => o.value === responses.futureField);
        return opt ? opt.label : '-';
      }
      case 17: {
        const opt = QUESTIONS[16].options?.find((o) => o.value === responses.careerPriority);
        return opt ? opt.label : '-';
      }
      case 18: {
        const opt = QUESTIONS[17].options?.find((o) => o.value === responses.aiAttitude);
        return opt ? opt.label : '-';
      }
      case 19: {
        const opt = QUESTIONS[18].options?.find((o) => o.value === responses.competitionTolerance);
        return opt ? opt.label : '-';
      }
      case 20: {
        const opt = QUESTIONS[19].options?.find((o) => o.value === responses.familyFinance);
        return opt ? opt.label : '-';
      }
      case 21: {
        const opt = QUESTIONS[20].options?.find((o) => o.value === responses.parentsPreference);
        return opt ? opt.label : '-';
      }
      case 22: {
        const opt = QUESTIONS[21].options?.find((o) => o.value === responses.coachingAffordability);
        return opt ? opt.label : '-';
      }
      case 23: {
        const opt = QUESTIONS[22].options?.find((o) => o.value === responses.learnerType);
        return opt ? opt.label : '-';
      }
      case 24: {
        if (!responses.confusions || responses.confusions.length === 0) return '(কোনোটি নির্বাচিত নয়)';
        const labels = responses.confusions.map((val) => {
          const opt = QUESTIONS[23].options?.find((o) => o.value === val);
          return opt ? opt.label : val;
        });
        return labels.join('; ');
      }
      case 25:
        return responses.specificConcern || '(কোনো মন্তব্য নেই)';
      case 26:
        return responses.email || '-';
      case 27: {
        const opt = QUESTIONS[26].options?.find((o) => o.value === responses.wantUpdates);
        return opt ? opt.label : '-';
      }
      default:
        return '-';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                অনুপম রায় দ্বারা তৈরি (Created by Anupam Roy)
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              আপনার জমাকৃত উত্তরসমূহের তালিকা (Review Answers)
            </h3>
            <p className="text-xs text-slate-500">
              মোট ২৭টি প্রশ্নের জন্য আপনার নির্বাচিত বিকল্পসমূহ (Selected Options)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {QUESTIONS.map((q) => (
            <div
              key={q.id}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60"
            >
              <div className="text-xs font-bold text-indigo-700 mb-1">
                প্রশ্ন (Question) {q.number}: {q.title}
              </div>
              <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{getAnswerDisplay(q.id)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 flex items-center justify-between gap-3 bg-slate-50/50 rounded-b-3xl">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>উত্তরে পরিবর্তন করুন (Edit Answers)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
