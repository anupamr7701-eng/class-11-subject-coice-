import React, { useState, useEffect } from 'react';
import { SECTIONS, QUESTIONS } from './data/questions';
import { UserResponses, CareerAssessmentResult } from './types';
import { calculateCareerAssessment } from './utils/scoring';
import { Header } from './components/Header';
import { FormIntro } from './components/FormIntro';
import { QuestionCard } from './components/QuestionCard';
import { SectionNav } from './components/SectionNav';
import { ResultReport } from './components/ResultReport';
import { ReviewAnswers } from './components/ReviewAnswers';
import {
  Sparkles,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

const STORAGE_KEY = 'career_assessment_responses_v1';

export default function App() {
  // No options are auto-filled or auto-selected by default
  const [responses, setResponses] = useState<UserResponses>({
    confusions: [],
  });

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [viewAllMode, setViewAllMode] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<CareerAssessmentResult | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear any residual cached responses on start so user starts completely fresh
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // Helper to get response value for question number
  const getQuestionValue = (qId: number) => {
    switch (qId) {
      case 1:
        return responses.name;
      case 2:
        return responses.currentClass;
      case 3:
        return responses.locationTier;
      case 4:
        return responses.board;
      case 5:
        return responses.interestScience;
      case 6:
        return responses.interestCommerce;
      case 7:
        return responses.interestArts;
      case 8:
        return responses.interestTech;
      case 9:
        return responses.interestCommunication;
      case 10:
        return responses.aptitudeMath;
      case 11:
        return responses.aptitudePhysics;
      case 12:
        return responses.aptitudeLogic;
      case 13:
        return responses.aptitudeLanguage;
      case 14:
        return responses.aptitudeCreativity;
      case 15:
        return responses.learningMethod;
      case 16:
        return responses.futureField;
      case 17:
        return responses.careerPriority;
      case 18:
        return responses.aiAttitude;
      case 19:
        return responses.competitionTolerance;
      case 20:
        return responses.familyFinance;
      case 21:
        return responses.parentsPreference;
      case 22:
        return responses.coachingAffordability;
      case 23:
        return responses.learnerType;
      case 24:
        return responses.confusions;
      case 25:
        return responses.specificConcern;
      case 26:
        return responses.email;
      case 27:
        return responses.wantUpdates;
      default:
        return undefined;
    }
  };

  const handleResponseChange = (qId: number, val: any) => {
    setResponses((prev) => {
      const updated = { ...prev };
      switch (qId) {
        case 1:
          updated.name = val;
          break;
        case 2:
          updated.currentClass = val;
          break;
        case 3:
          updated.locationTier = val;
          break;
        case 4:
          updated.board = val;
          break;
        case 5:
          updated.interestScience = val;
          break;
        case 6:
          updated.interestCommerce = val;
          break;
        case 7:
          updated.interestArts = val;
          break;
        case 8:
          updated.interestTech = val;
          break;
        case 9:
          updated.interestCommunication = val;
          break;
        case 10:
          updated.aptitudeMath = val;
          break;
        case 11:
          updated.aptitudePhysics = val;
          break;
        case 12:
          updated.aptitudeLogic = val;
          break;
        case 13:
          updated.aptitudeLanguage = val;
          break;
        case 14:
          updated.aptitudeCreativity = val;
          break;
        case 15:
          updated.learningMethod = val;
          break;
        case 16:
          updated.futureField = val;
          break;
        case 17:
          updated.careerPriority = val;
          break;
        case 18:
          updated.aiAttitude = val;
          break;
        case 19:
          updated.competitionTolerance = val;
          break;
        case 20:
          updated.familyFinance = val;
          break;
        case 21:
          updated.parentsPreference = val;
          break;
        case 22:
          updated.coachingAffordability = val;
          break;
        case 23:
          updated.learnerType = val;
          break;
        case 24:
          updated.confusions = val;
          break;
        case 25:
          updated.specificConcern = val;
          break;
        case 26:
          updated.email = val;
          break;
        case 27:
          updated.wantUpdates = val;
          break;
      }
      return updated;
    });

    // Clear error for this question if it existed
    if (errors[qId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    }
  };

  // Count answered questions
  const totalQuestions = QUESTIONS.length;
  const completedQuestionsCount = QUESTIONS.filter((q) => {
    const val = getQuestionValue(q.id);
    if (val === undefined || val === null || val === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  }).length;

  const progressPercent = Math.round((completedQuestionsCount / totalQuestions) * 100);

  // Check which sections are fully completed
  const completedSectionIds = SECTIONS.filter((sec) => {
    const secQuestions = QUESTIONS.filter((q) => q.sectionId === sec.id && q.required);
    return secQuestions.every((q) => {
      const val = getQuestionValue(q.id);
      if (val === undefined || val === null || val === '') return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    });
  }).map((s) => s.id);

  // Validate a specific section
  const validateSection = (secId: number): boolean => {
    const secQuestions = QUESTIONS.filter((q) => q.sectionId === secId && q.required);
    const newErrors: Record<number, string> = {};

    secQuestions.forEach((q) => {
      const val = getQuestionValue(q.id);
      if (val === undefined || val === null || val === '') {
        newErrors[q.id] = 'দয়া করে এই আবশ্যক প্রশ্নের উত্তর দিন';
      } else if (Array.isArray(val) && val.length === 0) {
        newErrors[q.id] = 'কমপক্ষে একটি বিকল্প নির্বাচন করুন';
      } else if (q.id === 26 && typeof val === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val.trim())) {
          newErrors[q.id] = 'দয়া করে সঠিক ইমেইল ঠিকানা দিন (যেমন: example@gmail.com)';
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      // Scroll to first error
      const firstErrorId = Object.keys(newErrors)[0];
      const el = document.getElementById(`question-card-${firstErrorId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  // Validate all required questions before final submission
  const validateAll = (): boolean => {
    const newErrors: Record<number, string> = {};
    QUESTIONS.filter((q) => q.required).forEach((q) => {
      const val = getQuestionValue(q.id);
      if (val === undefined || val === null || val === '') {
        newErrors[q.id] = 'দয়া করে এই আবশ্যক প্রশ্নের উত্তর দিন';
      } else if (Array.isArray(val) && val.length === 0) {
        newErrors[q.id] = 'কমপক্ষে একটি বিকল্প নির্বাচন করুন';
      } else if (q.id === 26 && typeof val === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val.trim())) {
          newErrors[q.id] = 'দয়া করে সঠিক ইমেইল ঠিকানা দিন (যেমন: example@gmail.com)';
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorId = Object.keys(newErrors)[0];
      const targetQuestion = QUESTIONS.find((q) => q.id === Number(firstErrorId));
      if (targetQuestion) {
        const secIndex = SECTIONS.findIndex((s) => s.id === targetQuestion.sectionId);
        if (secIndex !== -1 && !viewAllMode) {
          setCurrentSectionIndex(secIndex);
        }
      }
      setTimeout(() => {
        const el = document.getElementById(`question-card-${firstErrorId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return false;
    }

    return true;
  };

  const handleNextSection = () => {
    const currentSec = SECTIONS[currentSectionIndex];
    if (validateSection(currentSec.id)) {
      if (currentSectionIndex < SECTIONS.length - 1) {
        setCurrentSectionIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectSection = (idx: number) => {
    setCurrentSectionIndex(idx);
    setViewAllMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit and immediately calculate and display result
  const handleSubmit = () => {
    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    // Instant computation without delay
    const calculatedResult = calculateCareerAssessment(responses);
    setAssessmentResult(calculatedResult);

    // Brief smooth transition (150ms) to ensure smooth DOM update
    setTimeout(() => {
      setIsSubmitting(false);
      setShowResult(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে নতুন করে শুরু করতে চান? আগের সকল উত্তর মুছে যাবে।')) {
      const emptyResponses: UserResponses = {
        confusions: [],
      };
      setResponses(emptyResponses);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
      setShowResult(false);
      setAssessmentResult(null);
      setCurrentSectionIndex(0);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Current section questions
  const currentSection = SECTIONS[currentSectionIndex];
  const questionsToRender = viewAllMode
    ? QUESTIONS
    : QUESTIONS.filter((q) => q.sectionId === currentSection.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Sticky Top Header */}
      <Header
        progressPercent={progressPercent}
        completedCount={completedQuestionsCount}
        totalCount={totalQuestions}
        showResult={showResult}
        onReset={handleReset}
        onPrint={() => window.print()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {showResult && assessmentResult ? (
          <ResultReport
            result={assessmentResult}
            userResponses={responses}
            onRetake={handleReset}
            onReviewAnswers={() => setShowReviewModal(true)}
          />
        ) : (
          <div className="space-y-6">
            {/* Form Introduction Hero */}
            <FormIntro />

            {/* Current Section Title (when in step-by-step mode) */}
            {!viewAllMode && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                    {currentSection.englishTitle}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {currentSection.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {currentSection.description}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-100 shrink-0">
                  {currentSection.id}/৭
                </div>
              </div>
            )}

            {/* Validation alert banner if errors exist */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">কিছু আবশ্যক তথ্য অসম্পূর্ণ রয়েছে:</strong>
                  <span>দয়া করে লাল চিহ্নিত প্রশ্নগুলোর উত্তর দিন যাতে আপনার ফলাফল শতভাগ নির্ভুল হয়।</span>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-4 sm:space-y-5">
              {questionsToRender.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  value={getQuestionValue(q.id)}
                  onChange={(val) => handleResponseChange(q.id, val)}
                  error={errors[q.id]}
                />
              ))}
            </div>

            {/* Navigation & Submit Controls */}
            <SectionNav
              sections={SECTIONS}
              currentSectionIndex={currentSectionIndex}
              onSelectSection={handleSelectSection}
              onNext={handleNextSection}
              onPrev={handlePrevSection}
              onSubmit={handleSubmit}
              isLastSection={currentSectionIndex === SECTIONS.length - 1}
              completedSectionIds={completedSectionIds}
              viewAllMode={viewAllMode}
              onToggleViewAll={() => setViewAllMode((prev) => !prev)}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </main>

      {/* Review Answers Modal */}
      {showReviewModal && (
        <ReviewAnswers
          responses={responses}
          onClose={() => setShowReviewModal(false)}
          onEdit={() => {
            setShowReviewModal(false);
            setShowResult(false);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © ২০২৬-২৭ স্ট্রিম সিলেকশন ও ক্যারিয়ার গাইড (Career Stream Guide) &middot; <strong className="text-slate-700">অনুপম রায় দ্বারা তৈরি (Created by Anupam Roy)</strong>
          </p>
          <div className="flex items-center gap-4 text-indigo-600 font-medium">
            <button
              onClick={handleReset}
              className="hover:underline cursor-pointer text-slate-500 hover:text-slate-700"
            >
              রিসেট (Reset)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
