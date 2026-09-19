import React from 'react';
import { QuestionData } from '../types';
import { Check, AlertCircle } from 'lucide-react';

interface QuestionCardProps {
  question: QuestionData;
  value: any;
  onChange: (val: any) => void;
  error?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  // Render scale options (e.g. 1-10 or 0-10)
  const renderScale = () => {
    const min = question.scaleMin ?? 1;
    const max = question.scaleMax ?? 10;
    const items = [];
    for (let i = min; i <= max; i++) {
      items.push(i);
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span className="text-slate-600">{question.scaleMinLabel || `${min} (কম)`}</span>
          <span className="text-slate-600">{question.scaleMaxLabel || `${max} (বেশি)`}</span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
          {items.map((num) => {
            const isSelected = value === num;
            return (
              <button
                key={num}
                type="button"
                id={`q${question.id}-scale-${num}`}
                onClick={() => onChange(num)}
                className={`h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-105'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {value !== undefined && value !== null && (
          <div className="text-xs text-center font-medium text-indigo-700 bg-indigo-50/80 py-1 rounded-lg">
            বাছাই করা স্কোর (Selected Score): <strong>{value}</strong> / {max}
          </div>
        )}
      </div>
    );
  };

  // Render radio options
  const renderRadio = () => {
    return (
      <div className="space-y-2.5">
        {question.options?.map((opt) => {
          const isChecked = value === opt.value;
          return (
            <label
              key={opt.value}
              htmlFor={`q${question.id}-${opt.value}`}
              className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                isChecked
                  ? 'bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="pt-0.5">
                <input
                  type="radio"
                  id={`q${question.id}-${opt.value}`}
                  name={`question_${question.id}`}
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => onChange(opt.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>

              <div className="flex-1">
                <div className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
                  {opt.label}
                </div>
                {opt.sublabel && (
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {opt.sublabel}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    );
  };

  // Render checkbox options
  const renderCheckbox = () => {
    const selectedValues: string[] = Array.isArray(value) ? value : [];

    const handleToggle = (optVal: string) => {
      if (selectedValues.includes(optVal)) {
        onChange(selectedValues.filter((v) => v !== optVal));
      } else {
        onChange([...selectedValues, optVal]);
      }
    };

    return (
      <div className="space-y-2.5">
        {question.options?.map((opt) => {
          const isChecked = selectedValues.includes(opt.value);
          return (
            <label
              key={opt.value}
              htmlFor={`q${question.id}-${opt.value}`}
              className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                isChecked
                  ? 'bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  id={`q${question.id}-${opt.value}`}
                  checked={isChecked}
                  onChange={() => handleToggle(opt.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div className="flex-1">
                <div className="text-sm sm:text-base font-medium text-slate-800 leading-snug">
                  {opt.label}
                </div>
                {opt.sublabel && (
                  <div className="text-xs text-slate-500 mt-0.5">{opt.sublabel}</div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <div
      id={`question-card-${question.id}`}
      className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all shadow-xs ${
        error
          ? 'border-rose-400 ring-2 ring-rose-100'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold shrink-0 mt-0.5 border border-indigo-100">
          {question.number}
        </span>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {question.title}
            {question.required && (
              <span className="text-rose-500 ml-1" title="আবশ্যক">*</span>
            )}
          </h3>
          {question.description && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              {question.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        {question.type === 'scale' && renderScale()}
        {question.type === 'radio' && renderRadio()}
        {question.type === 'checkbox' && renderCheckbox()}
        {question.type === 'text' && (
          <div>
            <input
              type="text"
              id={`q${question.id}-text`}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder || 'এখানে লিখুন...'}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm sm:text-base transition-all bg-slate-50/50"
            />
          </div>
        )}
        {question.type === 'paragraph' && (
          <div>
            <textarea
              id={`q${question.id}-paragraph`}
              rows={4}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder || 'আপনার মন্তব্য বা দ্বিধার কথা লিখুন...'}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm sm:text-base transition-all bg-slate-50/50 resize-y"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
