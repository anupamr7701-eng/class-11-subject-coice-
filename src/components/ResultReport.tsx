import React, { useEffect, useState } from 'react';
import { CareerAssessmentResult, UserResponses } from '../types';
import confetti from 'canvas-confetti';
import { downloadResultAsPdf, printFormattedAssessment, ASSESSMENT_PDF_TITLE } from '../utils/pdfExport';
import {
  Award,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  ShieldCheck,
  Zap,
  Wallet,
  BookOpen,
  ArrowRight,
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  MessageSquareText,
  User,
  Calendar,
  Send,
  Loader2,
  Download,
  UserCheck,
  Check,
  FileDown,
  Compass,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ResultReportProps {
  result: CareerAssessmentResult;
  userResponses: UserResponses;
  onRetake: () => void;
  onReviewAnswers: () => void;
}

export const ResultReport: React.FC<ResultReportProps> = ({
  result,
  userResponses,
  onRetake,
  onReviewAnswers,
}) => {
  // Counselor chat state
  const [counselorQuery, setCounselorQuery] = useState('');
  const [counselorLoading, setCounselorLoading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [radarMode, setRadarMode] = useState<'core' | 'extended'>('core');

  const safeResponses = userResponses || {};
  const sciInterest = Number(safeResponses.interestScience ?? 0);
  const comInterest = Number(safeResponses.interestCommerce ?? 0);
  const artsInterest = Number(safeResponses.interestArts ?? 0);
  const techInterest = Number(safeResponses.interestTech ?? 0);
  const commInterest = Number(safeResponses.interestCommunication ?? 0);

  // Core 3 streams radar data for Science, Commerce, and Arts
  const coreRadarData = [
    {
      stream: 'বিজ্ঞান (Science)',
      axisLabel: 'বিজ্ঞান (Science)',
      interest: sciInterest * 10,
      rating: sciInterest,
      fullMark: 100,
    },
    {
      stream: 'বাণিজ্য (Commerce)',
      axisLabel: 'বাণিজ্য (Commerce)',
      interest: comInterest * 10,
      rating: comInterest,
      fullMark: 100,
    },
    {
      stream: 'মানবিক / আর্টস (Arts)',
      axisLabel: 'আর্টস (Arts)',
      interest: artsInterest * 10,
      rating: artsInterest,
      fullMark: 100,
    },
  ];

  const extendedRadarData = [
    ...coreRadarData,
    {
      stream: 'প্রযুক্তি ও উদ্ভাবন (Tech)',
      axisLabel: 'প্রযুক্তি (Tech)',
      interest: techInterest * 10,
      rating: techInterest,
      fullMark: 100,
    },
    {
      stream: 'যোগাযোগ ও মিডিয়া (Media)',
      axisLabel: 'মিডিয়া (Media)',
      interest: commInterest * 10,
      rating: commInterest,
      fullMark: 100,
    },
  ];

  const activeRadarData = radarMode === 'core' ? coreRadarData : extendedRadarData;

  const maxInterest = Math.max(sciInterest, comInterest, artsInterest);
  const topInterestName =
    maxInterest === 0
      ? 'মূল ৩টি ক্ষেত্র'
      : sciInterest === maxInterest
      ? 'বিজ্ঞান (Science)'
      : comInterest === maxInterest
      ? 'বাণিজ্য (Commerce)'
      : 'আর্টস (Arts)';

  const [counselorChat, setCounselorChat] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `নমস্কার ${result.candidateName}! আপনার মূল্যায়নের ভিত্তিতে আপনার জন্য "${result.primaryStream.banglaName}" সবচেয়ে সম্ভাবনাময় মনে হচ্ছে। স্ট্রিম (Stream) বা ক্যারিয়ার (Career) নিয়ে আপনার মনে কোনো নির্দিষ্ট প্রশ্ন বা দ্বিধা থাকলে আমাকে নির্দ্বিধায় জিজ্ঞাসা করতে পারেন।`,
    },
  ]);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
      });
    } catch {
      // Ignore in restricted environments
    }
  }, []);

  // Handle direct PDF Download
  const handleSavePdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadResultAsPdf('printable-career-report', result.candidateName);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.warn('Direct PDF export error, falling back to window.print()', err);
      printFormattedAssessment();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    printFormattedAssessment();
  };

  const handleCounselorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counselorQuery.trim() || counselorLoading) return;

    const query = counselorQuery.trim();
    setCounselorQuery('');
    setCounselorChat((prev) => [...prev, { sender: 'user', text: query }]);
    setCounselorLoading(true);

    try {
      const response = await fetch('/api/counselor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          primaryStream: result.primaryStream.banglaName,
          secondaryStream: result.secondaryStream.banglaName,
          mathScore: userResponses.aptitudeMath,
          logicScore: userResponses.aptitudeLogic,
          scienceScore: userResponses.interestScience,
          candidateName: result.candidateName,
          currentClass: userResponses.currentClass,
        }),
      });

      if (!response.ok) {
        throw new Error('Counselor service error');
      }

      const data = await response.json();
      setCounselorChat((prev) => [...prev, { sender: 'ai', text: data.reply }]);
    } catch {
      // Fallback
      setCounselorChat((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `আপনার প্রশ্নের জন্য ধন্যবাদ! আপনার প্রাথমিক পছন্দের স্ট্রিম (${result.primaryStream.banglaName}) নিয়ে নিয়মিত পাঠ্যবই এবং এনসিইআরটি (NCERT) সিলেবাস (Syllabus) গভীরভাবে পড়ার অভ্যাস তৈরি করুন। গণিত (Math) ও লজিক্যাল (Logical) বিষয়ে প্রতিদিন নিয়মিত সময় দিলে যে কোনো জড়তা দ্রুত কেটে যাবে।`,
        },
      ]);
    } finally {
      setCounselorLoading(false);
    }
  };

  return (
    <div id="result-report-view" className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Printable Report Wrapper for PDF export */}
      <div id="printable-career-report" className="space-y-8">
        
        {/* Printable Watermark Header (Only visible in Print / PDF) */}
        <div className="print-header-watermark">
          <div className="flex items-center justify-between pb-3 border-b-2 border-indigo-600">
            <div>
              <h1 className="text-xl font-bold text-indigo-900">
                অনুপম রায় দ্বারা তৈরি ক্যারিয়ার মূল্যায়ন (Career Assessment by Anupam Roy)
              </h1>
              <p className="text-xs font-semibold text-emerald-800">
                অনুপম রায় দ্বারা তৈরি (Created by Anupam Roy) &middot; ক্যারিয়ার স্ট্রিম সিলেকশন গাইড
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p>শিক্ষার্থী: <strong>{result.candidateName}</strong></p>
              <p>তারিখ: {result.generatedAt}</p>
            </div>
          </div>
        </div>

        {/* Hero Result Banner */}
        <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-indigo-700/50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>মূল্যায়ন সম্পন্ন &middot; তাৎক্ষণিক রেজাল্ট ড্যাশবোর্ড (Instant Result Dashboard)</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-xs font-bold text-emerald-300 border border-emerald-400/30">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>অনুপম রায় দ্বারা তৈরি (Created by Anupam Roy)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-indigo-200">
                <Calendar className="w-3.5 h-3.5" />
                <span>তারিখ (Date): {result.generatedAt}</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3">
              অভিনন্দন, <span className="text-amber-300">{result.candidateName}</span>!
            </h2>

            <p className="text-sm sm:text-base text-indigo-100/90 max-w-2xl leading-relaxed mb-6">
              আপনার আগ্রহ, স্বাভাবিক মেধা (Aptitude), ভবিষ্যতের ক্যারিয়ার ভিশন (Career Vision) ও বাস্তব পরিস্থিতি বিশ্লেষণের ভিত্তিতে তৈরি হয়েছে এই কমপ্লিট ক্যারিয়ার ড্যাশবোর্ড (Complete Career Dashboard)।
            </p>

            {/* Primary Recommendation Highlight Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-white/20 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-amber-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                      আপনার জন্য ১ম সেরা স্ট্রিম (Primary Recommendation)
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black text-white">
                    {result.primaryStream.banglaName}
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-200 mt-1">
                    ব্যাজ (Badge): <strong>{result.primaryStream.badge}</strong>
                  </p>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl px-5 py-3.5 text-center shrink-0 self-start sm:self-center">
                  <span className="block text-3xl sm:text-4xl font-black text-emerald-300">
                    {result.primaryStream.percentage}%
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">
                    ম্যাচ স্কোর (Fit Score)
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-indigo-50 mt-4 leading-relaxed border-t border-white/10 pt-4">
                {result.primaryStream.description}
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar: PDF Save, Print, Review, Retake (Hidden on paper/PDF print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs no-print">
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>অনুপম রায় দ্বারা তৈরি ক্যারিয়ার মূল্যায়ন রিপোর্ট (Career Assessment Report)</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ভবিষ্যতের জন্য রিপোর্টটি সরাসরি PDF ডাউনলোড (Download) বা প্রিন্ট (Print) করে সংরক্ষণ করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dedicated PDF Download Button with title */}
            <button
              type="button"
              id="download-pdf-btn"
              onClick={handleSavePdf}
              disabled={isDownloadingPdf}
              title={ASSESSMENT_PDF_TITLE}
              aria-label="অনুপম রায় দ্বারা তৈরি ক্যারিয়ার মূল্যায়ন PDF ডাউনলোড করুন"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-100 cursor-pointer disabled:opacity-75"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>পিডিএফ তৈরি হচ্ছে...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                  <span>পিডিএফ ডাউনলোড সম্পন্ন!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-amber-300" />
                  <span>পিডিএফ ডাউনলোড (Save PDF)</span>
                </>
              )}
            </button>

            {/* Dedicated Print Button using window.print() */}
            <button
              type="button"
              id="print-report-btn"
              onClick={handlePrint}
              title={ASSESSMENT_PDF_TITLE}
              aria-label="অনুপম রায় দ্বারা তৈরি ক্যারিয়ার মূল্যায়ন প্রিন্ট বা PDF হিসেবে সেভ করুন"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer border border-slate-200"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>প্রিন্ট / সেভ (Print)</span>
            </button>

            {/* Review answers button */}
            <button
              type="button"
              id="review-answers-btn"
              onClick={onReviewAnswers}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>উত্তরসমূহ (Answers)</span>
            </button>

            {/* Retake button */}
            <button
              type="button"
              id="retake-test-btn"
              onClick={onRetake}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>নতুন টেস্ট (Retake)</span>
            </button>
          </div>
        </div>

        {/* Primary & Secondary Comparison Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Stream Details */}
          <div className="bg-white rounded-3xl p-6 border-2 border-indigo-500 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              ১ম পছন্দ (Primary Choice)
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  শীর্ষ সুপারিশ (Top Recommendation)
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {result.primaryStream.banglaName}
              </h3>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>প্রোফাইল ম্যাচ (Profile Match):</span>
                  <span className="text-indigo-600 font-bold">{result.primaryStream.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${result.primaryStream.percentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    একাদশ ও দ্বাদশ শ্রেণির প্রধান বিষয়সমূহ (Main Subjects):
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.primaryStream.subjects.map((sub, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    শীর্ষ ক্যারিয়ার ক্ষেত্র (Top Career Fields):
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.primaryStream.topCareers.map((car, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                      >
                        {car}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    এআই যুগের ঝুঁকি ও স্থায়িত্ব (AI Era Safety):
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    🛡️ {result.primaryStream.aiVulnerabilityBangla}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <h5 className="text-xs font-bold text-slate-700 mb-1.5">মূল সুবিধাসমূহ (Key Advantages):</h5>
              <ul className="space-y-1 text-xs text-slate-600">
                {result.primaryStream.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Secondary Alternative Stream */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-slate-700 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              ২য় বিকল্প (Secondary Backup)
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  শক্তিশালী ব্যাকআপ পথ (Backup Path)
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {result.secondaryStream.banglaName}
              </h3>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>প্রোফাইল ম্যাচ (Profile Match):</span>
                  <span className="text-slate-700 font-bold">{result.secondaryStream.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${result.secondaryStream.percentage}%` }}
                  />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {result.secondaryStream.description}
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    প্রধান বিষয়সমূহ (Main Subjects):
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.secondaryStream.subjects.map((sub, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    শীর্ষ ক্যারিয়ার ক্ষেত্র (Top Careers):
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.secondaryStream.topCareers.map((car, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                      >
                        {car}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <h5 className="text-xs font-bold text-slate-700 mb-1.5">কেন ব্যাকআপ হিসেবে গুরুত্বপূর্ণ:</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                একটি শক্তিশালী ব্যাকআপ স্ট্রিম (Backup Stream) রাখা মানসিক চাপ বহুলাংশে কমিয়ে দেয়। আপনার ১ম পছন্দের পাশাপাশি এই বিষয়েও আপনার মেধা চমৎকার।
              </p>
            </div>
          </div>
        </div>

        {/* Visual Stream Interest Radar Chart (Recharts) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  সায়েন্স, কমার্স ও আর্টস ধারায় আপনার আগ্রহের রাডার চার্ট (Interest Levels Radar Chart)
                </h3>
                <p className="text-xs text-slate-500">
                  বিজ্ঞান (Science), বাণিজ্য (Commerce) ও আর্টস (Arts) স্ট্রিমসমূহের প্রতি আপনার ব্যক্তিগত পছন্দের তুলনামূলক ম্যাপিং
                </p>
              </div>
            </div>

            {/* Toggle view mode */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setRadarMode('core')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  radarMode === 'core'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                মূল ৩টি স্ট্রিম
              </button>
              <button
                type="button"
                onClick={() => setRadarMode('extended')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  radarMode === 'extended'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সব ৫টি ক্ষেত্র
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Recharts Radar Chart */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="w-full h-[280px] sm:h-[320px] min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                    data={activeRadarData}
                  >
                    <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <PolarAngleAxis
                      dataKey="axisLabel"
                      tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      tickCount={5}
                    />
                    <Radar
                      name="আগ্রহের স্তর"
                      dataKey="interest"
                      stroke="#4f46e5"
                      fill="#6366f1"
                      fillOpacity={0.4}
                      dot={{ r: 4, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl text-xs shadow-xl border border-slate-700">
                              <p className="font-bold text-indigo-300 text-sm">{item.stream}</p>
                              <p className="mt-1 text-slate-200">
                                আগ্রহের মাত্রা: <span className="font-bold text-amber-400 font-mono text-sm">{item.rating}/১০</span> ({item.interest}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-1">
                * স্কেল: ০–১০০% (প্রশ্নপত্রে আপনার দেওয়া ১–১০ রেটিং অনুসারে নির্ধারিত)
              </p>
            </div>

            {/* Stream Interest Breakdown Cards */}
            <div className="lg:col-span-5 space-y-3">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                    সর্বাধিক আগ্রহের বিষয়
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {topInterestName}
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold font-mono">
                  {Math.max(sciInterest, comInterest, artsInterest)}/১০
                </span>
              </div>

              {/* Science Interest */}
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>বিজ্ঞান (Science)</span>
                  </span>
                  <span className="font-mono text-blue-700 font-bold">
                    {sciInterest}/১০ ({sciInterest * 10}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${sciInterest * 10}%` }}
                  />
                </div>
              </div>

              {/* Commerce Interest */}
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>বাণিজ্য (Commerce)</span>
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {comInterest}/১০ ({comInterest * 10}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${comInterest * 10}%` }}
                  />
                </div>
              </div>

              {/* Arts Interest */}
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>মানবিক / আর্টস (Arts)</span>
                  </span>
                  <span className="font-mono text-amber-700 font-bold">
                    {artsInterest}/১০ ({artsInterest * 10}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${artsInterest * 10}%` }}
                  />
                </div>
              </div>

              {radarMode === 'extended' && (
                <>
                  {/* Tech Interest */}
                  <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span>প্রযুক্তি ও উদ্ভাবন (Tech)</span>
                      </span>
                      <span className="font-mono text-purple-700 font-bold">
                        {techInterest}/১০ ({techInterest * 10}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${techInterest * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* Communication Interest */}
                  <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span>যোগাযোগ ও মিডিয়া (Media)</span>
                      </span>
                      <span className="font-mono text-rose-700 font-bold">
                        {commInterest}/১০ ({commInterest * 10}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${commInterest * 10}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* All Streams Comparison Matrix */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                সকল স্ট্রিমের তুলনামূলক উপযুক্ততা ম্যাট্রিক্স (Comparison Matrix)
              </h3>
              <p className="text-xs text-slate-500">
                আপনার উত্তরগুলোর ওপর ভিত্তি করে পাঁচটি প্রধান ধারার তুলনামূলক পার্সেন্টেজ স্কোর (Score)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {result.allStreams.map((stream, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-slate-800 flex items-center gap-2">
                    <span className="w-5 text-slate-400 font-mono text-xs">#{idx + 1}</span>
                    <span>{stream.banglaName}</span>
                  </span>
                  <span className="text-indigo-600 font-bold font-mono">
                    {stream.percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      idx === 0
                        ? 'bg-indigo-600'
                        : idx === 1
                        ? 'bg-sky-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${stream.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Dimensional Aptitude Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                আপনার মেধা ও স্বাভাবিক দক্ষতার মাত্রা (Aptitude Dimensions)
              </h3>
              <p className="text-xs text-slate-500">
                স্বাভাবিক চিন্তা ও সমস্যার সমাধান করার ক্ষমতার ৫টি প্রধান স্তম্ভ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.aptitudeDimensions.map((dim, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-slate-800">{dim.banglaName}</h4>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      dim.level === 'উচ্চ'
                        ? 'bg-emerald-100 text-emerald-800'
                        : dim.level === 'মাঝারি'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {dim.level}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs text-slate-500 mb-1.5 font-medium">
                  <span>স্কোর (Score):</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">
                    {dim.score} / {dim.maxScore}
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(dim.score / dim.maxScore) * 100}%`,
                      backgroundColor: dim.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* A.I Era Future-Proofing & Career Safety */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-indigo-800/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/20">
                <Zap className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  এআই যুগে (A.I Era) ক্যারিয়ার নিরাপত্তা ও প্রস্তুতি
                </h3>
                <p className="text-xs text-indigo-200">
                  কীভাবে কৃত্রিম বুদ্ধিমত্তার (Artificial Intelligence) যুগে নিজের ক্যারিয়ারকে সুরক্ষিত রাখবেন
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl px-4 py-2 border border-white/10 text-center self-start sm:self-center">
              <span className="block text-2xl font-black text-amber-300">
                {result.aiReadinessScore}/১০০
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-200">
                এআই রেডি স্কোর (AI Readiness Score)
              </span>
            </div>
          </div>

          <p className="text-sm text-indigo-100 leading-relaxed mb-6">
            {result.aiReadinessAnalysis}
          </p>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-3">
              এখন থেকেই আয়ত্ত করার মতো প্রয়োজনীয় এআই টুলস (AI Tools) ও প্রযুক্তি:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.aiSuggestedTools.map((tool, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10 flex items-start gap-2.5 text-xs text-indigo-100"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <span>{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reality Check: Financial & Family Strategy */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                রিয়ালিটি চেক: অর্থ, কোচিং ও পারিবারিক সমন্বয় (Reality Check)
              </h3>
              <p className="text-xs text-slate-500">
                বাস্তবসম্মত প্রস্তুতি ও পারিবারিক সম্প্রীতি বজায় রাখার কৌশল
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                আর্থিক কৌশল ও বাজেট (Financial Strategy)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {result.realityCheckAdvice.financialStrategy}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                কোচিং ও সেলফ-স্টাডি গাইড (Coaching & Self-Study)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {result.realityCheckAdvice.coachingAdvice}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                পিতামাতার সাথে বোঝাপড়া (Parental Communication)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {result.realityCheckAdvice.parentHandlingTip}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                প্রতিযোগিতা সামলানোর মানসিকতা (Competition Mindset)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {result.realityCheckAdvice.competitionAdvice}
              </p>
            </div>
          </div>
        </div>

        {/* Solutions for Specific Confusions */}
        {result.customConcernsFeedback.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  আপনার দ্বিধা ও সংশয়ের সুস্পষ্ট সমাধান (Confusion Solutions)
                </h3>
                <p className="text-xs text-slate-500">
                  প্রশ্ন ২৪-এ আপনার দেওয়া উত্তরের পরিপ্রেক্ষিতে সুনির্দিষ্ট কাউন্সেলিং (Counseling)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {result.customConcernsFeedback.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-sky-100 bg-sky-50/40 space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-sky-900">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>শঙ্কা: &ldquo;{item.concern}&rdquo;</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-6">
                    💡 <strong>পরামর্শ:</strong> {item.solution}
                  </p>
                </div>
              ))}
            </div>

            {userResponses.specificConcern && (
              <div className="mt-4 p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
                  আপনার নিজস্ব ব্যক্তিগত নোট (Question 25 Note):
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 italic">
                  &ldquo;{userResponses.specificConcern}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* 6-Month Action Plan */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                পরবর্তী ৬ মাসের সুনির্দিষ্ট অ্যাকশন প্ল্যান (Action Plan)
              </h3>
              <p className="text-xs text-slate-500">
                ধাপে ধাপে নিজেকে সঠিক লক্ষ্যে প্রস্তুত করার সময়োপযোগী পরিকল্পনা
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {result.actionPlan.map((step, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                    {step.phase}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800">
                    {step.title}
                  </h4>
                </div>
                <ul className="space-y-2 mt-3 text-xs sm:text-sm text-slate-600">
                  {step.tasks.map((task, tidx) => (
                    <li key={tidx} className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-1" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Creator Certificate & Credit Badge */}
        <div className="bg-gradient-to-r from-indigo-50 via-emerald-50 to-teal-50 rounded-3xl p-5 sm:p-6 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-200 shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                অফিসিয়াল সিস্টেম ক্রেডিট
              </span>
              <h4 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                অনুপম রায় দ্বারা তৈরি (Created by Anupam Roy)
              </h4>
              <p className="text-xs text-slate-600">
                এআই যুগোপযোগী ক্যারিয়ার স্ট্রিম মূল্যায়ন অ্যালগরিদম ও পার্সোনালাইজড ড্যাশবোর্ড
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <span className="inline-block text-xs font-bold text-emerald-800 bg-white border border-emerald-300 px-3.5 py-1.5 rounded-xl shadow-2xs">
              সার্টিফাইড ক্যারিয়ার গাইড ২০২৬-২৭
            </span>
          </div>
        </div>

      </div>

      {/* Interactive AI Career Counselor (No-print) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs no-print">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              এআই ক্যারিয়ার মেন্টরের সাথে সরাসরি প্রশ্ন করুন (AI Career Counselor Chat)
            </h3>
            <p className="text-xs text-slate-500">
              অনুপম রায় দ্বারা পরিচালিত ইন্টেলিজেন্ট কাউন্সেলর — আপনার ফলাফল ও পরিস্থিতি অনুযায়ী প্রশ্ন করুন
            </p>
          </div>
        </div>

        {/* Chat History */}
        <div className="space-y-3 max-h-72 overflow-y-auto p-3 rounded-2xl bg-slate-50 border border-slate-200/80 mb-3">
          {counselorChat.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  AI
                </div>
              )}
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs'
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {counselorLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>এআই ক্যারিয়ার কাউন্সেলর (AI Counselor) উত্তর তৈরি করছেন...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            'আমার জন্য কোন কোন সরকারি কলেজ বা পরীক্ষা সেরা?',
            'সায়েন্স (Science) নিলে প্রতিদিন কত ঘণ্টা পড়ার প্রয়োজন?',
            'কমার্স (Commerce) পড়ে ভবিষ্যতে কোন জবে বেতন বেশি?',
            'গণিতের (Math) ভয় কীভাবে দ্রুত দূর করব?',
          ].map((prompt, pidx) => (
            <button
              key={pidx}
              type="button"
              onClick={() => setCounselorQuery(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input form */}
        <form onSubmit={handleCounselorSubmit} className="flex gap-2">
          <input
            type="text"
            value={counselorQuery}
            onChange={(e) => setCounselorQuery(e.target.value)}
            placeholder="আপনার প্রশ্ন বাংলায় লিখুন... (যেমন: আর্টস পড়লে ভবিষ্যতে কী কী সুযোগ আছে?)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            disabled={counselorLoading || !counselorQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <span>পাঠান</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Bottom Final Buttons (No-print) */}
      <div className="text-center pt-4 no-print flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleSavePdf}
          disabled={isDownloadingPdf}
          title={ASSESSMENT_PDF_TITLE}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm transition-all shadow-md shadow-indigo-100 cursor-pointer disabled:opacity-75"
        >
          <FileDown className="w-4 h-4 text-amber-300" />
          <span>অনুপম রায় দ্বারা তৈরি ক্যারিয়ার মূল্যায়ন (Save PDF)</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          title={ASSESSMENT_PDF_TITLE}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>প্রিন্ট / PDF সংরক্ষণ (Print)</span>
        </button>

        <button
          type="button"
          onClick={onRetake}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span>নতুন করে পরীক্ষা দিন (Retake Test)</span>
        </button>
      </div>
    </div>
  );
};
