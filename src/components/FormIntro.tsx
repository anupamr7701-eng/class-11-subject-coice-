import React from 'react';
import { Sparkles, CheckCircle2, Clock, ShieldCheck, Zap, UserCheck } from 'lucide-react';

export const FormIntro: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8 border border-indigo-700/40">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-indigo-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ফিউচার-রেডি (Future-Ready) স্ট্রিম সিলেকশন গাইড (Stream Selection Guide) ২০২৬-২৭</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-sm text-xs font-bold text-emerald-300 border border-emerald-400/30">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>অনুপম রায় দ্বারা তৈরি (Created by Anupam Roy)</span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white mb-3 leading-snug">
          এআই যুগে (A.I Era) ক্যারিয়ার (Career) কীভাবে বাঁচাবেন? <br className="hidden sm:inline" />
          <span className="text-indigo-200 font-semibold">
            সায়েন্স (Science), কমার্স (Commerce), আর্টস (Arts) — কমপ্লিট রিয়ালিটি চেক (Complete Reality Check)
          </span>
        </h2>

        <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-3xl mb-6">
          এই ওয়ার্কশিটটি (Worksheet) পূরণ করতে মাত্র <strong>১০-১২ মিনিট (Minutes)</strong> সময় লাগবে। আপনার সৎ উত্তরের ওপর ভিত্তি করে ডেটা-ড্রিভেন অ্যালগরিদমের (Data-Driven Algorithm) মাধ্যমে সাবমিট (Submit) করার সাথে সাথেই পেয়ে যাবেন আপনার পার্সোনালাইজড রেজাল্ট (Personalized Result) ও ক্যারিয়ার রোডম্যাপ (Career Roadmap):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">সঠিক স্ট্রিম (Stream) নির্বাচন</p>
              <p className="text-xs text-indigo-200 mt-0.5 leading-relaxed">
                সায়েন্স (Science), কমার্স (Commerce), নাকি আর্টস (Arts) — আপনার স্বভাবজাত মেধার সাথে কোনটা মিলবে
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">এআই (AI) যুগে ক্যারিয়ার নিরাপত্তা</p>
              <p className="text-xs text-indigo-200 mt-0.5 leading-relaxed">
                কোন কোন পেশা সুরক্ষিত থাকবে এবং কোন টেকনোলজি টুলস (Technology Tools) আয়ত্ত করবেন
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex items-start gap-3">
            <Clock className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">তাৎক্ষণিক অ্যাকশন প্ল্যান (Action Plan)</p>
              <p className="text-xs text-indigo-200 mt-0.5 leading-relaxed">
                বাজেট (Budget), কোচিংয়ের (Coaching) বিকল্প ও আগামী ৩-৬ মাসের সুনির্দিষ্ট পদক্ষেপ
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>কোনো ভুল বা সঠিক উত্তর নেই। কোনো চাপ ছাড়া খোলামনে উত্তর দিন।</span>
          </div>
          <div className="inline-flex items-center gap-1.5 font-bold text-amber-200 bg-amber-500/15 px-3.5 py-1.5 rounded-full border border-amber-400/25">
            <span>⚡ সাবমিট (Submit) করার সাথে সাথেই ফুল রেজাল্ট (Full Result) স্ক্রিনে দৃশ্যমান হবে</span>
          </div>
        </div>
      </div>
    </div>
  );
};
