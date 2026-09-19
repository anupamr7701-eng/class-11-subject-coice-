import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return aiClient;
}

// Intelligent contextual counselor engine in Bengali
function generateCounselorAdvice(params: {
  query: string;
  primaryStream?: string;
  secondaryStream?: string;
  mathScore?: number;
  logicScore?: number;
  scienceScore?: number;
  candidateName?: string;
}): string {
  const q = params.query.toLowerCase();
  const name = params.candidateName || 'শিক্ষার্থী বন্ধু';
  const stream = params.primaryStream || 'আপনার নির্বাচিত স্ট্রিম';

  if (q.includes('টাকা') || q.includes('খরচ') || q.includes('বাজেট') || q.includes('ফি') || q.includes('financial')) {
    return `${name}, পড়াশোনার খরচ নিয়ে একদম বিচলিত হবেন না। বর্তমানে সরকারি ও শীর্ষ সাহায্যপ্রাপ্ত কলেজগুলোতে অত্যন্ত সুলভ খরচে পড়া যায়। এছাড়া স্বামী বিবেকানন্দ মেরিট-কাম-মিন্স স্কলারশিপ, জাতীয় স্কলারশিপ (NSP) এবং বিভিন্ন ট্রাস্টের বৃত্তি রয়েছে। ইন্টারনেটের ফ্রি রিসোর্স কাজে লাগালে বড় মাপের কোচিং ফি ছাড়াই শীর্ষ ফলাফল অর্জন করা সম্ভব।`;
  }

  if (q.includes('অঙ্ক') || q.includes('গণিত') || q.includes('math') || (params.mathScore !== undefined && params.mathScore < 5 && q.includes('ভয়'))) {
    return `গণিতের ভীতি দূর করার সবচেয়ে সহজ উপায় হলো বেসিক ফর্মুলা ও উদাহরণের অঙ্কগুলো নিজে নিজে না দেখে একাধিকবার সমাধান করা। প্রতিদিন মাত্র ৩০-৪০ মিনিট সহজ সমস্যা সমাধানের মধ্য দিয়ে আত্মবিশ্বাস ফিরিয়ে আনা যায়। মুখস্থ না করে লজিক বোঝা জরুরি।`;
  }

  if (q.includes('ai') || q.includes('চাকরি') || q.includes('ভবিষ্যত') || q.includes('নিরাপদ') || q.includes('job')) {
    return `AI বিপ্লবের যুগে কোনো পেশাই এক জায়গায় স্থির থাকবে না। ${stream}-এর সাথে যদি আপনি ডেটা অ্যানালিসিস, প্রম্পট ক্রিয়েশন বা আধুনিক ডিজিটাল টুলস ব্যবহারের দক্ষতা যুক্ত করেন, তবে আপনি সাধারণ কর্মীদের চেয়ে ১০ গুণ এগিয়ে থাকবেন। AI মেকানিক্যাল কাজ প্রতিস্থাপন করলেও স্ট্র্যাটেজিক ও মানবিক বিচারবোধ প্রতিস্থাপন করতে পারবে না।`;
  }

  if (q.includes('বাবা') || q.includes('মা') || q.includes('অভিভাবক') || q.includes('পিতামাতা') || q.includes('pressure')) {
    return `অভিভাবকদের চাপ মূলত আপনার ভবিষ্যৎ সুরক্ষা নিশ্চিত করার উদ্বেগ থেকেই আসে। তাদের সাথে বিতর্ক না করে এই মূল্যায়ন রিপোর্টের ফলাফল, আপনার সাবলীল মেধার দিক এবং ${stream}-এ সফল ব্যক্তিদের ক্যারিয়ারের বাস্তব উদাহরণ শান্তভাবে তাদের সামনে তুলে ধরুন। আপনার প্রস্তুতি দেখলে তারা পূর্ণ সমর্থন দেবেন।`;
  }

  if (q.includes('মেডিকেল') || q.includes('ডাক্তার') || q.includes('neet')) {
    return `চিকিৎসাবিজ্ঞানে ক্যারিয়ার গড়তে দীর্ঘমেয়াদী অধ্যবসায় ও মানসিক একাগ্রতা প্রয়োজন। জীববিজ্ঞান ও রসায়নের এনসিইআরটি বই প্রতিটি লাইন ধরে বুঝে পড়া এবং বিগত বছরের প্রশ্ন নিয়মিত সমাধান করাই NEET-এর সাফল্যের আসল চাবিকাঠি। প্রতিদিন নিয়মিত পড়াশোনার শৃঙ্খলা বজায় রাখাই আসল কাজ।`;
  }

  if (q.includes('ইঞ্জিনিয়ারিং') || q.includes('কোডিং') || q.includes('jee') || q.includes('software')) {
    return `প্রকৌশল ও প্রযুক্তি ক্ষেত্রে শুধু বইয়ের থিওরি মুখস্থ করলে চলে না; প্রবলেম সলভিং ও নতুন কিছু বানানোর কৌতূহল থাকা দরকার। গণিত ও পদার্থবিদ্যার কনসেপ্ট শক্ত করার পাশাপাশি পাইথন (Python) বা বেসিক প্রোগ্রামিং লজিক শেখা শুরু করুন। এটি আপনাকে যেকোনো বিশ্ববিদ্যালয়ের পড়াশোনায় এগিয়ে রাখবে।`;
  }

  if (q.includes('কমার্স') || q.includes('ব্যবসা') || q.includes('ca') || q.includes('commerce')) {
    return `কমার্স হলো আধুনিক অর্থনীতির হৃদস্পন্দন। চার্টার্ড অ্যাকাউন্টেন্সি (CA), ফিন্যান্সিয়াল অ্যানালিস্ট বা বিজনেস ম্যানেজমেন্টে মেধার কদর সবসময় শীর্ষে। একাদশ শ্রেণি থেকেই হিসাববিজ্ঞানের নিয়মগুলো বাস্তব জীবনের ব্যবসার সাথে মিলিয়ে বোঝার চেষ্টা করুন এবং মাইক্রোসফট এক্সেল ও ফিনটেক টুলস ভালোভাবে শিখুন।`;
  }

  if (q.includes('আর্টস') || q.includes('মানবিক') || q.includes('আইন') || q.includes('upsc') || q.includes('arts')) {
    return `আর্টস বা হিউম্যানিটিজ নিয়ে পড়াশোনা বিশ্বদৃষ্টি ও চিন্তার গভীরতা খুলে দেয়। কর্পোরেট ল, সিভিল সার্ভিস (UPSC/WBCS), সাইকোলজি, নীতি নির্ধারণ ও মিডিয়াতে আজ প্রচুর উচ্চ বেতনের সুযোগ রয়েছে। ভাষা ও যোগাযোগের ওপর ভালো দখল তৈরি করলে এই ক্ষেত্রে অভাবনীয় সাফল্য সম্ভব।`;
  }

  if (q.includes('ঘণ্টা') || q.includes('রুটিন') || q.includes('সময়')) {
    return `${name}, পড়াশোনায় মোট ঘণ্টার চেয়ে মনোযোগের গভীরতা বেশি গুরুত্বপূর্ণ। একাদশ শ্রেণিতে প্রতিদিন ৩-৪ ঘণ্টা নিয়মিত গভীর সেলফ-স্টাডি এবং সাপ্তাহিক রিভিশনই যে কোনো বড় পরীক্ষার জন্য যথেষ্ট। একটানা পড়ার চেয়ে ৪৫ মিনিট পড়ে ৫ মিনিটের বিরতি নেওয়ার 'পমোডোরো' টেকনিক ব্যবহার করুন।`;
  }

  return `${name}, আপনার প্রশ্নের জন্য ধন্যবাদ। আপনার জন্য ${stream} অত্যন্ত মানানসই একটি ক্ষেত্র। একাদশ শ্রেণির শুরুতে প্রথম ২-৩ মাস পাঠ্যবইয়ের প্রতিটি মৌলিক কনসেপ্ট বোঝার পেছনে সময় দিন। নিয়মিত সেলফ-স্টাডি ও কৌতূহল বজায় রাখলে আপনার ভবিষ্যৎ অত্যন্ত উজ্জ্বল হবে।`;
}

// Promise with timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Counselor endpoint
app.post('/api/counselor', async (req, res) => {
  const {
    query,
    primaryStream,
    secondaryStream,
    mathScore,
    logicScore,
    scienceScore,
    candidateName,
    currentClass,
  } = req.body;

  if (!query || typeof query !== 'string') {
    res.status(400).json({ error: 'Query is required' });
    return;
  }

  const ai = getAI();
  if (ai) {
    try {
      const prompt = `তুমি একজন অত্যন্ত অভিজ্ঞ ও সহমর্মী বাঙালি ক্যারিয়ার কাউন্সেলর।
শিক্ষার্থীর প্রোফাইল:
- নাম: ${candidateName || 'শিক্ষার্থী'}
- বর্তমান শ্রেণি: ${currentClass || '১০ম শ্রেণি'}
- প্রস্তাবিত স্ট্রিম: ${primaryStream || 'সায়েন্স/কমার্স/আর্টস'}
- গণিত স্কোর: ${mathScore ?? 5}/১০, বিজ্ঞান: ${scienceScore ?? 5}/১০, লজিক: ${logicScore ?? 5}/১০

শিক্ষার্থীর প্রশ্ন: "${query}"

নির্দেশনা:
১. বাংলায় (Bengali) সহজ, সাবলীল, উৎসাহব্যঞ্জক ও বাস্তবমুখী উত্তর দাও।
২. উত্তর ৩-৪টি বাক্যে সংক্ষেপ করো যাতে শিক্ষার্থী সহজে বুঝতে পারে।`;

      const genPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const response = await withTimeout(genPromise, 2500);
      if (response && response.text) {
        res.json({ reply: response.text });
        return;
      }
    } catch {
      // Fallback immediately on timeout or API error
    }
  }

  // Guaranteed instantaneous intelligent response
  const reply = generateCounselorAdvice({
    query,
    primaryStream,
    secondaryStream,
    mathScore,
    logicScore,
    scienceScore,
    candidateName,
  });

  res.json({ reply });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Career Stream Guide Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
