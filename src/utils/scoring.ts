import { UserResponses, CareerAssessmentResult, StreamScore, AptitudeDimension } from '../types';

export function calculateCareerAssessment(responses: UserResponses): CareerAssessmentResult {
  const candidateName = responses.name?.trim() || 'শিক্ষার্থী বন্ধু';

  // Extract raw numbers with fallbacks
  const qSci = responses.interestScience ?? 5;
  const qCom = responses.interestCommerce ?? 5;
  const qArts = responses.interestArts ?? 5;
  const qTech = responses.interestTech ?? 5;
  const qComm = responses.interestCommunication ?? 5;

  const aptMath = responses.aptitudeMath ?? 5;
  const aptPhys = responses.aptitudePhysics ?? 5;
  const aptLogic = responses.aptitudeLogic ?? 5;
  const aptLang = responses.aptitudeLanguage ?? 5;
  const aptCreate = responses.aptitudeCreativity ?? 5;

  // Raw points calculation
  let rawPcm = (qSci * 2.2) + (qTech * 2.0) + (aptMath * 2.5) + (aptPhys * 2.5) + (aptLogic * 2.0);
  let rawPcb = (qSci * 2.8) + (aptPhys * 2.2) + (aptLogic * 1.5) + (aptLang * 1.2) + 15;
  let rawCommerce = (qCom * 3.0) + (aptMath * 1.8) + (aptLogic * 2.0) + (qComm * 1.8) + 10;
  let rawArts = (qArts * 3.0) + (aptLang * 2.4) + (aptCreate * 2.0) + (qComm * 2.0) + 10;
  let rawTechDesign = (qTech * 2.5) + (aptCreate * 2.8) + (aptLogic * 1.8) + (qComm * 1.5) + 10;

  // Goal & future field alignment (Q16)
  switch (responses.futureField) {
    case 'tech_engineering':
      rawPcm += 30;
      rawTechDesign += 18;
      break;
    case 'medical_healthcare':
      rawPcb += 36;
      break;
    case 'business_finance':
      rawCommerce += 34;
      break;
    case 'law_civil_services':
      rawArts += 30;
      rawCommerce += 12;
      break;
    case 'creative_media':
      rawArts += 28;
      rawTechDesign += 32;
      break;
    case 'teaching_research':
      rawPcm += 14;
      rawPcb += 14;
      rawArts += 14;
      break;
    case 'confused':
      // balance evenly
      break;
  }

  // Priority alignment (Q17)
  switch (responses.careerPriority) {
    case 'high_salary':
      rawPcm += 8;
      rawCommerce += 10;
      break;
    case 'job_security':
      rawPcb += 10;
      rawArts += 8; // Govt / Civil
      break;
    case 'creative_freedom':
      rawArts += 12;
      rawTechDesign += 14;
      break;
    case 'social_impact':
      rawPcb += 14;
      rawArts += 12;
      break;
    case 'work_life_balance':
      rawArts += 8;
      rawCommerce += 6;
      rawPcb -= 4; // Doctors have grueling hours early on
      break;
    case 'remote_work':
      rawPcm += 12;
      rawTechDesign += 14;
      rawCommerce += 6;
      break;
  }

  // Learning method (Q15)
  if (responses.learningMethod === 'memorization') {
    rawPcb += 6; // Biology heavy vocab
    rawArts += 5; // History/laws
    rawPcm -= 5;
  } else if (responses.learningMethod === 'understanding') {
    rawPcm += 8;
    rawCommerce += 6;
  }

  // Math threshold adjustments
  if (aptMath < 4) {
    rawPcm -= 18;
  }

  // Calculate percentages (normalized to max ~95%, realistic range 40-95%)
  const streamsRaw = [
    { key: 'pcm', raw: rawPcm },
    { key: 'pcb', raw: rawPcb },
    { key: 'commerce', raw: rawCommerce },
    { key: 'arts', raw: rawArts },
    { key: 'tech_design', raw: rawTechDesign },
  ];

  const maxRaw = Math.max(...streamsRaw.map((s) => s.raw));

  function toPercentage(raw: number): number {
    const ratio = raw / maxRaw;
    const scaled = Math.round(52 + ratio * 42); // between 52% and 94%
    return Math.min(96, Math.max(38, scaled));
  }

  const pcmPercent = toPercentage(rawPcm);
  const pcbPercent = toPercentage(rawPcb);
  const commercePercent = toPercentage(rawCommerce);
  const artsPercent = toPercentage(rawArts);
  const techDesignPercent = toPercentage(rawTechDesign);

  const streamDetails: Record<string, StreamScore> = {
    pcm: {
      name: 'Science (PCM) & Engineering',
      banglaName: 'সায়েন্স (Science - PCM) ও টেকনোলজি',
      percentage: pcmPercent,
      badge: 'প্রকৌশল ও প্রযুক্তি প্রধান',
      description: 'পদার্থবিদ্যা, রসায়ন ও গণিতের সুষম সমন্বয়। সফটওয়্যার ইঞ্জিনিয়ারিং, AI গবেষণা, ডেটা সায়েন্স, রোবোটিক্স বা কোর ইঞ্জিনিয়ারিংয়ের জন্য সেরা ভিত।',
      subjects: ['Physics (পদার্থবিদ্যা)', 'Chemistry (রসায়ন)', 'Mathematics (গণিত)', 'Computer Science / IT'],
      topCareers: ['সফটওয়্যার ও AI ইঞ্জিনিয়ার', 'ডেটা সায়েন্টিস্ট ও ক্লাউড আর্কিটেক্ট', 'অ্যারোস্পেস / মেকানিক্যাল ইঞ্জিনিয়ার', 'ফিনটেক ও কোয়ান্ট অ্যানালিস্ট'],
      aiVulnerability: 'Low',
      aiVulnerabilityBangla: 'অত্যন্ত নিরাপদ (AI টুল ব্যবহার করে প্রবলেম সলভিংয়ের ব্যাপক সুযোগ)',
      pros: ['বিশ্বব্যাপী ক্যারিয়ারের বিস্তার ও হাই-পেইং রিমোট জব', 'প্রযুক্তি পরিবর্তনের নেতৃত্বে থাকার সুযোগ', 'অন্য যেকোনো স্ট্রিমে ভবিষ্যতে সহজে শিফট করার সুবিধা'],
      cons: ['প্রতিযোগিতা অত্যন্ত তীব্র', 'ধারাবাহিক লজিক্যাল প্র্যাকটিস ও কনসেপ্ট বোঝা অপরিহার্য'],
    },
    pcb: {
      name: 'Science (PCB) & Healthcare',
      banglaName: 'সায়েন্স (Science - PCB) ও স্বাস্থ্যসেবা',
      percentage: pcbPercent,
      badge: 'চিকিৎসাবিজ্ঞান ও লাইফ সায়েন্স',
      description: 'জীববিজ্ঞান ও রসায়নের গভীর বোঝাপড়া। মানবসেবা, চিকিৎসা, ফার্মাসিউটিক্যালস বা বায়োটেকনোলজির জন্য আদর্শ পথ।',
      subjects: ['Biology (জীববিজ্ঞান)', 'Chemistry (রসায়ন)', 'Physics (পদার্থবিদ্যা)', 'Biotechnology / Psychology'],
      topCareers: ['চিকিৎসক (MBBS / BDS)', 'বায়োটেকনোলজি ও জেনেটিক্স রিসার্চার', 'ফার্মাসিউটিক্যাল সায়েন্টিস্ট', 'ক্লিনিক্যাল সাইকোলজিস্ট ও নার্সিং লিডার'],
      aiVulnerability: 'Low',
      aiVulnerabilityBangla: 'খুবই সুরক্ষিত (হিউম্যান এমপ্যাথি ও সার্জিক্যাল স্কিল AI দ্বারা প্রতিস্থাপন অসম্ভব)',
      pros: ['সর্বোচ্চ সামাজিক সম্মান ও আত্মতৃপ্তি', 'মহামারী ও বার্ধক্য বৃদ্ধির যুগে চিরস্থায়ী চাহিদা', 'ক্লিনিক্যাল প্র্যাকটিসের অভাবনীয় মূল্য'],
      cons: ['ডিগ্রি অর্জনে দীর্ঘ সময় (৫.৫ থেকে ৮ বছর)', 'প্রাইভেট কলেজে পড়ার খরচ অত্যন্ত বেশি, সরকারি সিটের প্রতিযোগিতা প্রবল'],
    },
    commerce: {
      name: aptMath >= 6 ? 'Commerce with Mathematics' : 'Commerce (Business & Management)',
      banglaName: aptMath >= 6 ? 'কমার্স উইথ ম্যাথস (Commerce with Maths)' : 'কমার্স (Commerce & Management)',
      percentage: commercePercent,
      badge: 'অর্থনীতি, ব্যবসা ও ফিন্যান্স',
      description: aptMath >= 6
        ? 'গণিত ও অর্থনীতির শক্তিশালী কম্বিনেশন। ইনভেস্টমেন্ট ব্যাংকিং, চার্টার্ড অ্যাকাউন্টেন্সি (CA), ফিনটেক ও ডাটা অ্যানালিটিক্সের আধুনিক দুনিয়া।'
        : 'ব্যবসা পরিচালনা, মার্কেটিং, সিএ, করপোরেট ল ও এন্টারপ্রেনারশিপের চমৎকার ক্ষেত্র যেখানে ব্যবহারিক মেধা বেশি কাজে লাগে।',
      subjects: ['Accountancy (হিসাববিজ্ঞান)', 'Economics (অর্থনীতি)', 'Business Studies (ব্যবসায় উদ্যোগ)', aptMath >= 6 ? 'Applied Mathematics' : 'Commercial Studies / Entreprenuership'],
      topCareers: ['চার্টার্ড অ্যাকাউন্ট্যান্ট (CA) / CFA', 'ইনভেস্টমেন্ট ব্যাংকার ও ফিন্যান্সিয়াল অ্যানালিস্ট', 'স্টার্টআপ উদ্যোক্তা ও কর্পোরেট লিডার', 'বিজনেস অ্যানালিস্ট ও মার্কেটিং স্ট্র্যাটেজিস্ট'],
      aiVulnerability: 'Moderate',
      aiVulnerabilityBangla: 'মধ্যম ঝুঁকি (সাধারণ বুককিপিং অটোমেটেড হলেও স্ট্র্যাটেজিক ফিন্যান্স দারুণ নিরাপদ)',
      pros: ['কম বয়সেই স্বাবলম্বী হওয়ার সুযোগ', 'তুলনামূলকভাবে ইঞ্জিনিয়ারিং/মেডিকেলের চেয়ে কম খরচে শীর্ষ ডিগ্রি', 'বাস্তব জীবনের অর্থব্যবস্থা ও ব্যবসায়িক বুদ্ধিমত্তা তৈরি'],
      cons: ['শুধু থিওরি পড়লে চলবে না, এক্সেল ও আধুনিক ফিনটেক টুলস শেখা বাধ্যতামূলক'],
    },
    arts: {
      name: 'Humanities & Social Sciences',
      banglaName: 'আর্টস ও হিউম্যানিটিজ (Humanities & Arts)',
      percentage: artsPercent,
      badge: 'আইন, সিভিল সার্ভিস ও নীতিনির্ধারণ',
      description: 'চিন্তাশক্তি, মানবিক সমাজ বিশ্লেষণ, ভাষাগত গভীরতা ও যুক্তির জগত। সিভিল সার্ভিস (UPSC/WBCS/BCS), কর্পোরেট ল, পলিসি মেকিং ও একাডেমিয়ার মূল ভিত্তি।',
      subjects: ['Political Science (রাষ্ট্রবিজ্ঞান)', 'History / Geography (ইতিহাস/ভূগোল)', 'Psychology / Sociology (মনোবিজ্ঞান)', 'English Literature & Law Basics'],
      topCareers: ['সিভিল সার্ভিস (IAS / IPS / প্রশাসনিক কর্মকর্তা)', 'কর্পোরেট আইনজীবী ও জুডিশিয়াল সার্ভিস', 'সাইকোলজিস্ট ও কাউন্সেলিং স্পেশালিস্ট', 'আন্তর্জাতিক সম্পর্ক ও থিঙ্ক-ট্যাঙ্ক গবেষক'],
      aiVulnerability: 'Low',
      aiVulnerabilityBangla: 'খুবই নিরাপদ (আইনি বিচারবুদ্ধি, মানবিক কাউন্সেলিং ও কূটনীতিতে মানুষই অপ্রতিরোধ্য)',
      pros: ['সিভিল সার্ভিস ও সরকারি নিয়োগে সবচেয়ে সুবিধাজনক সিলেবাস', 'গভীর পড়াশোনা ও বিশ্বদৃষ্টি তৈরি হয়', 'পড়াশোনার আর্থিক খরচ বিজ্ঞানের চেয়ে উল্লেখযোগ্যভাবে কম'],
      cons: ['সুনির্দিষ্ট স্কিল (যেমন ল, ডেটা, বা রাইটিং) ছাড়া শুধু সাধারণ পাস ডিগ্রির বাজারমূল্য কম'],
    },
    tech_design: {
      name: 'Applied Design & Digital Media',
      banglaName: 'অ্যাপ্লায়েড ডিজাইন ও ক্রিয়েটিভ টেক (Design & Tech)',
      percentage: techDesignPercent,
      badge: 'ডিজিটাল উদ্ভাবন ও আধুনিক মিডিয়া',
      description: 'প্রযুক্তি এবং সৃজনশীল নান্দনিকতার ফিউশন। ইউআই/ইউএক্স ডিজাইন, গেম আর্ট, আধুনিক কন্টেন্ট ইকোসিস্টেম এবং ভিজ্যুয়াল মিডিয়া ইন্ডাস্ট্রির প্রধান চালিকাশক্তি।',
      subjects: ['UI/UX Design', 'Visual Arts & Illustration', 'Computer Graphics / Media Studies', 'Mass Communication'],
      topCareers: ['প্রোডাক্ট / UI/UX ডিজাইনার', '3D অ্যানিমেটর ও গেম ডিজাইনার', 'ক্রিয়েটিভ ডিরেক্টর ও কনটেন্ট আর্কিটেক্ট', 'ব্র্যান্ড স্ট্র্যাটেজিস্ট ও মিডিয়া প্রডিউসার'],
      aiVulnerability: 'Moderate',
      aiVulnerabilityBangla: 'মধ্যম ঝুঁকি (AI আর্ট টুলসকে নিজের ক্ষমতায়ন হিসেবে ব্যবহার করতে হবে)',
      pros: ['পোর্টফোলিও ও স্কিলভিত্তিক কাজ, প্রথাগত সনদের বাধ্যবাধকতা কম', 'রিমোট ও গ্লোবাল ক্লায়েন্টদের সাথে ডলার উপার্জনের সহজ পথ'],
      cons: ['দ্রুত টুলস ও ট্রেন্ড আপগ্রেড না করলে পিছিয়ে পড়ার ভয়'],
    },
  };

  const allStreamsList: StreamScore[] = [
    streamDetails.pcm,
    streamDetails.pcb,
    streamDetails.commerce,
    streamDetails.arts,
    streamDetails.tech_design,
  ].sort((a, b) => b.percentage - a.percentage);

  const primaryStream = allStreamsList[0];
  const secondaryStream = allStreamsList[1];

  // 5 Aptitude Dimensions
  const getLevel = (score: number): 'উচ্চ' | 'মাঝারি' | 'উন্নতির সুযোগ' => {
    if (score >= 7.5) return 'উচ্চ';
    if (score >= 5.0) return 'মাঝারি';
    return 'উন্নতির সুযোগ';
  };

  const aptitudeDimensions: AptitudeDimension[] = [
    {
      name: 'Mathematical & Quantitative',
      banglaName: 'গাণিতিক মেধা ও সংখ্যাতত্ত্ব',
      score: aptMath,
      maxScore: 10,
      level: getLevel(aptMath),
      color: '#3b82f6',
    },
    {
      name: 'Scientific Reasoning',
      banglaName: 'বিজ্ঞানমনস্কতা ও কনসেপ্টের গভীরতা',
      score: aptPhys,
      maxScore: 10,
      level: getLevel(aptPhys),
      color: '#10b981',
    },
    {
      name: 'Logical Problem Solving',
      banglaName: 'যৌক্তিক চিন্তা ও বিশ্লেষণ ক্ষমতা',
      score: aptLogic,
      maxScore: 10,
      level: getLevel(aptLogic),
      color: '#6366f1',
    },
    {
      name: 'Verbal & Communication',
      banglaName: 'ভাষাগত দখল ও যোগাযোগ সাবলীলতা',
      score: Math.round(((aptLang + qComm) / 2) * 10) / 10,
      maxScore: 10,
      level: getLevel((aptLang + qComm) / 2),
      color: '#ec4899',
    },
    {
      name: 'Creativity & Innovation',
      banglaName: 'সৃজনশীলতা ও উদ্ভাবনী ক্ষমতা',
      score: aptCreate,
      maxScore: 10,
      level: getLevel(aptCreate),
      color: '#f59e0b',
    },
  ];

  // AI Readiness Score (0-100)
  let aiScore = 50;
  if (responses.aiAttitude === 'excited') aiScore += 25;
  if (responses.aiAttitude === 'mixed') aiScore += 15;
  if (responses.aiAttitude === 'fearful') aiScore += 5;
  aiScore += (qTech * 1.5) + (aptLogic * 1.0);
  aiScore = Math.min(98, Math.max(35, Math.round(aiScore)));

  // AI Readiness Analysis
  let aiReadinessAnalysis = '';
  if (aiScore >= 75) {
    aiReadinessAnalysis = 'আপনার প্রযুক্তিগত কৌতূহল এবং লজিক্যাল চিন্তাভাবনা চমৎকার। AI যুগে যারা AI টুলসকে ভয় না পেয়ে নিজের কাজের গতি বহুগুণ বাড়াতে ব্যবহার করতে পারেন, তারা সাধারণ কর্মীর চেয়ে ১০ গুণ বেশি এগিয়ে থাকেন। আপনার নির্বাচিত স্ট্রিমে AI একটি শক্তিশালী হাতিয়ার হিসেবে কাজ করবে।';
  } else if (aiScore >= 55) {
    aiReadinessAnalysis = 'AI বিপ্লব নিয়ে আপনার মধ্যে বাস্তবসম্মত সচেতনতা তৈরি হয়েছে। এখন প্রয়োজন নিয়মিতভাবে প্রম্পট ইঞ্জিনিয়ারিং, ডেটা অ্যানালাইসিস বা আপনার পছন্দের বিষয়ের আধুনিক সফটওয়্যার ব্যবহার শুরু করা। ভয় পাওয়ার কিছু নেই—AI চাকরি কেড়ে নেবে না, বরং যে মানুষটি AI দক্ষতার সাথে ব্যবহার করতে পারে, সে সাধারণকে ছাড়িয়ে যাবে।';
  } else {
    aiReadinessAnalysis = 'কৃত্রিম বুদ্ধিমত্তা নিয়ে অতিরিক্ত আতঙ্কিত হওয়ার প্রয়োজন নেই। আপনার স্ট্রিম যাই হোক না কেন, মৌলিক মানবিক গুণাবলী যেমন: জটিল সিদ্ধান্ত নেওয়া, সহানুভূতি, মানবিক যোগাযোগ ও কৌশলগত চিন্তা—এগুলো কখনোই AI একা করতে পারে না। ধীরে ধীরে দৈনন্দিন পড়াশোনায় ChatGPT বা রিসার্চ টুলসের ইতিবাচক ব্যবহার রপ্ত করুন।';
  }

  const aiSuggestedTools = [
    'ChatGPT / Gemini (পড়ার জটিল বিষয় সহজ বাংলায় ব্যাখ্যা করানোর জন্য)',
    'Claude / Perplexity (গবেষণা ও বিশ্বস্ত তথ্য রেফারেন্স খোঁজার জন্য)',
    'Notion AI (পড়ার নোটস ও শিডিউল সুবিন্যস্ত রাখার জন্য)',
    'Canva / Figma (প্রেজেন্টেশন ও ভিজ্যুয়াল আইডিয়া ফুটিয়ে তুলতে)',
  ];

  // Reality Check Feedback
  let financialStrategy = '';
  if (responses.familyFinance === 'very_tight' || responses.familyFinance === 'tight') {
    financialStrategy = 'পারিবারিক বাজেট সীমিত হলে কোনো অবস্থাতেই লাখ লাখ টাকা ঋণ নিয়ে প্রাইভেট কোচিং বা অপ্রয়োজনীয় প্রতিষ্ঠানে ঝাঁপিয়ে পড়বেন না। বর্তমানে YouTube, PW Free Batches, NPTEL, এবং সরকারি উচ্চমানের কলেজগুলোতে নামমাত্র খরচে বিশ্বমানের শিক্ষা পাওয়া যায়। রাজ্য ও কেন্দ্রীয় সরকারের একাধিক মেধাভিত্তিক স্কলারশিপ (যেমন স্বামী বিবেকানন্দ স্কলারশিপ, NSP) রয়েছে যা নিয়মিত আবেদন করবেন।';
  } else if (responses.familyFinance === 'medium') {
    financialStrategy = 'সরকারি ও সাশ্রয়ী শীর্ষ প্রতিষ্ঠানগুলোকে লক্ষ্য বানান। অনলাইন সাশ্রয়ী প্ল্যাটফর্মের মাধ্যমে পড়াশোনার বাজেট নিয়ন্ত্রণে রেখে বইপত্র ও ব্যক্তিগত ল্যাপটপ/ডিজিটাল রিসোর্সে বিনিয়োগ করুন।';
  } else {
    financialStrategy = 'আপনার পরিবারের আর্থিক অবস্থান মজবুত, যা আপনাকে দীর্ঘমেয়াদী কোর্স বা বিশেষায়িত ল্যাব/ইন্সটিটিউটে পড়ার সুযোগ দেয়। তবে কেবল ব্র্যান্ড নামের চেয়ে নিজের আগ্রহ ও দক্ষতার সাথে মানানসই প্রতিষ্ঠান বাছাই করা বুদ্ধিমানের কাজ হবে।';
  }

  let coachingAdvice = '';
  if (responses.coachingAffordability === 'coaching_free') {
    coachingAdvice = 'বড় কোচিং সেন্টারের পোস্টারে বিভ্রান্ত হবেন না। সেলফ-স্টাডি এবং ইউটিউবের সেরা ফ্রি লেকচার + বিগত ১০ বছরের প্রশ্নপত্র (PYQs) সমাধান করে প্রতি বছর হাজার হাজার ছাত্রছাত্রী শীর্ষস্থান অধিকার করে। আপনার প্রয়োজন কেবল একটি কঠোর দৈনিক রুটিন ও সেলফ-ডিসিপ্লিন।';
  } else if (responses.coachingAffordability === 'coaching_budget') {
    coachingAdvice = 'অতিরিক্ত খরুচে অফলাইন কোচিংয়ের চেয়ে সাশ্রয়ী অনলাইন হাইব্রিড ব্যাচ বেছে নিন যেখানে লাইভ ডাউট ক্লিয়ারিং এবং নিয়মিত মক টেস্টের সুযোগ থাকে।';
  } else {
    coachingAdvice = 'কোচিং নিলে শুধু ক্লাসে বসে থাকলেই সাফল্য আসে না; প্রতিদিনের সেলফ-স্টাডি ও নিজে নিজে ভুল বিশ্লেষণ করাই আসল চাবিকাঠি।';
  }

  let parentHandlingTip = '';
  if (responses.parentsPreference === 'parents_open') {
    parentHandlingTip = 'আপনার পরিবার আপনার সিদ্ধান্তের ওপর বিশ্বাস রাখছে—এটি একটি দারুণ আশীর্বাদ! আপনার নির্বাচিত স্ট্রিমটির আগামী ৫ বছরের রোডম্যাপ ও ক্যারিয়ার সুযোগ তাদের সাথে আলোচনা করে আরও আত্মবিশ্বাসী হন।';
  } else if (responses.parentsPreference === 'parents_confused') {
    parentHandlingTip = 'পিতামাতা অনেক সময় ট্রেন্ড সম্পর্কে স্পষ্ট জানেন না বলে দুশ্চিন্তা করেন। এই মূল্যায়ন রিপোর্টটি তাদের সাথে শেয়ার করুন এবং বিভিন্ন ক্যারিয়ারের ভবিষ্যৎ বাস্তব তথ্য তাদের বুঝিয়ে বলুন।';
  } else {
    parentHandlingTip = 'পিতামাতা যদি আপনার পছন্দের বাইরে কোনো স্ট্রিমের জন্য চাপ দেন, তবে মনে রাখবেন তারা আপনার ভবিষ্যৎ নিরাপত্তা নিয়েই চিন্তিত। তাদের সাথে রাগারাগি না করে এই রিপোর্টের তথ্য, আপনার স্কোর এবং আপনার নির্বাচিত ক্যারিয়ারে সফল ব্যক্তিত্বদের উদাহরণ দিয়ে শান্তভাবে বসুন।';
  }

  let competitionAdvice = '';
  if (responses.competitionTolerance === 'peaceful') {
    competitionAdvice = 'আপনার জন্য এমন ক্যারিয়ার সেরা যেখানে মেধার জোর এবং সুনির্দিষ্ট স্কিল দিয়ে প্রতিষ্ঠিত হওয়া যায় (যেমন: অ্যাপ্লায়েড ডিজাইন, সফটওয়্যার ডেভেলপমেন্ট, ল, কনটেন্ট বা স্পেশালাইজড ম্যানেজমেন্ট)। লক্ষ লক্ষ মানুষের অন্ধ ইঁদুরদৌড়ের চেয়ে নিজের বিশেষ দক্ষতার মূল্য দিন।';
  } else if (responses.competitionTolerance === 'high_resilience') {
    competitionAdvice = 'আপনার তীব্র প্রতিযোগিতার চাপ সামলানোর মানসিক দৃঢ়তা দারুণ। JEE, NEET, CA বা UPSC-র মতো কঠিন পরীক্ষায় ধারাবাহিকতা এবং মক টেস্টে ভুল শুধরে নেওয়ার অভ্যাস গড়ে তুললে আপনি সফল হবেন।';
  } else {
    competitionAdvice = 'মধ্যম পর্যায়ের স্বাস্থ্যকর প্রতিযোগিতা আপনার জন্য উপযুক্ত। একটি মূল ক্যারিয়ার লক্ষ্যের পাশাপাশি একটি নিরাপদ ব্যাকআপ প্ল্যান সবসময় প্রস্তুত রাখবেন।';
  }

  // Address Selected Confusions (Q24)
  const confusionsMap: Record<string, { concern: string; solution: string }> = {
    complete_confusion: {
      concern: 'কোনটা বেছে নিলে ভালো হবে একদমই বুঝতে পারছি না',
      solution: 'দশম শ্রেণি পর্যন্ত সব বিষয় সাধারণ থাকে, তাই হঠাৎ স্ট্রিম বাছাইয়ে বিভ্রান্ত হওয়া খুব স্বাভাবিক। এই রিপোর্টের এক নম্বর ও দুই নম্বর স্ট্রিমের বিষয়গুলোর এনসিইআরটি বই খুলে আগামী ১ সপ্তাহ পড়ুন; যে বিষয়ে পড়তে ক্লান্তি কম আসে সেটাই আপনার পথ।',
    },
    ai_threat: {
      concern: 'AI যুগে কোন ক্যারিয়ার নিরাপদ ও দীর্ঘস্থায়ী থাকবে সেই ভয়',
      solution: 'AI মেকানিকাল কাজ প্রতিস্থাপন করবে, কিন্তু হিউম্যান জাজমেন্ট, মেডিকেল ডায়াগনসিস, কোডিং আর্কিটেকচার, ও আর্ট-স্ট্র্যাটেজি আরও বেশি মূল্যবান হবে। আপনার স্ট্রিমের সাথে AI টুলস ব্যবহারের দক্ষতা যোগ করে নিন।',
    },
    fear_of_regret: {
      concern: 'ভুল স্ট্রিম বেছে নেওয়ার পর ভবিষ্যতে আফসোস হওয়ার আতঙ্ক',
      solution: 'আজকের আধুনিক শিক্ষানীতি (NEP) এবং গ্লোবাল স্কিল মার্কেটে কোনো স্ট্রিমই একমুখী খাঁচা নয়। সায়েন্স বা কমার্স বা আর্টস পড়েও মানুষ পরবর্তীতে ম্যানেজমেন্ট, ডিজাইন, সিভিল সার্ভিস বা ডেটা সায়েন্সে যেতে পারে। ভয় কাটিয়ে কাজে নেমে পড়ুন।',
    },
    parental_pressure: {
      concern: 'পিতামাতা ও পরিবারের প্রত্যাশার প্রবল চাপ',
      solution: 'পিতামাতাকে যুক্তি দিয়ে বোঝান। তাদের বুঝিয়ে বলুন যে বিষয়ে আপনার মেধা ও আগ্রহ রয়েছে, সেখানে আপনি সেরা ১০%-এ পৌঁছাতে পারবেন; কিন্তু জোর করে অপছন্দের বিষয়ে পড়লে পড়াশোনায় আগ্রহ হারিয়ে যাওয়ার ঝুঁকি থাকে।',
    },
    financial_worry: {
      concern: 'আর্থিক সীমাবদ্ধতা ও ভবিষ্যৎ উচ্চশিক্ষার খরচের চিন্তা',
      solution: 'টাকার অভাবে মেধা কখনোই পুরোপুরি আটকে থাকে না। সরকারি কলেজ, জাতীয় পর্যায়ের স্কলারশিপ এবং সেলফ-লার্নিং রিসোর্স কাজে লাগিয়ে প্রতি বছর অসংখ্য তরুণ অবিশ্বাস্য উচ্চতায় পৌঁছাচ্ছেন। শুরুতেই খরচ নিয়ে অযথা ভয় পাবেন না।',
    },
    conflicting_advice: {
      concern: 'বন্ধু এবং বড়দের ভিন্ন ভিন্ন মতামত শুনে বিভ্রান্তি',
      solution: 'প্রতিটি মানুষ তার নিজের জীবনের অভিজ্ঞতা থেকে উপদেশ দেয়। কিন্তু পড়তে হবে আপনাকে। অন্যের অপূর্ণ স্বপ্ন পূরণ করার দায় আপনার নয়; নিজের স্বাভাবিক মেধা (Aptitude) ও আত্মবিশ্বাসকে অগ্রাধিকার দিন।',
    },
    low_marks: {
      concern: 'নম্বর কম আসায় অপশন সীমিত মনে হচ্ছে',
      solution: 'দশম বা দ্বাদশের একটি পরীক্ষার নম্বর আপনার সম্পূর্ণ মেধা বা ভবিষ্যৎ নির্ধারণ করে না। অনেক সময় পরীক্ষার পদ্ধতির কারণে নম্বর কম আসে। বাস্তব জীবনে প্র্যাকটিক্যাল স্কিল ও অধ্যবসায়ই আসল ক্যারিয়ার গড়ে তোলে।',
    },
  };

  const customConcernsFeedback: { concern: string; solution: string }[] = [];
  if (responses.confusions && responses.confusions.length > 0) {
    responses.confusions.forEach((key) => {
      if (confusionsMap[key]) {
        customConcernsFeedback.push(confusionsMap[key]);
      }
    });
  }

  // If none checked or general fallback
  if (customConcernsFeedback.length === 0) {
    customConcernsFeedback.push(confusionsMap.complete_confusion);
  }

  // 6-Month Action Plan
  const actionPlan = [
    {
      phase: 'মাস ১ - ২ (Phase 1)',
      title: 'মৌলিক ধারণা স্পষ্টকরণ ও সিলেবাস পর্যবেক্ষণ',
      tasks: [
        `নির্বাচিত স্ট্রিম (${primaryStream.banglaName})-এর একাদশ শ্রেণির মূল বইগুলোর প্রথম দুটি অধ্যায় রিডিং পড়া শুরু করুন।`,
        'প্রতিটি বিষয়ে কোন কোন অধ্যায় বেশি আকর্ষণীয় লাগছে তা একটি ডায়েরিতে নোট করুন।',
        'ইউটিউব থেকে ভারতের ও বাংলাদেশের সেরা শিক্ষকদের ফ্রি ইন্ট্রোডাক্টরি ভিডিওগুলো দেখে নিন।',
      ],
    },
    {
      phase: 'মাস ৩ - ৪ (Phase 2)',
      title: 'ডিজিটাল স্কিল ও বাস্তব প্রয়োগ',
      tasks: [
        'দৈনন্দিন কাজে বেসিক কম্পিউটার টুলস (Google Docs, Sheets/Excel) এবং একটি প্রাথমিক AI টুল (ChatGPT/Gemini) ব্যবহার শুরু করুন।',
        'পড়াশোনার একটি নিয়মিত ৩-৪ ঘণ্টার দৈনিক সেলফ-স্টাডি শিডিউল তৈরি করুন এবং কঠোরভাবে মেনে চলুন।',
        'আপনার পছন্দের ফিল্ডে কাজ করছেন এমন ২-৩ জন সিনিয়র বা প্রফেশনালের সাথে কথা বলে বাস্তব অভিজ্ঞতা শুনুন।',
      ],
    },
    {
      phase: 'মাস ৫ - ৬ (Phase 3)',
      title: 'মক টেস্ট ও ক্যারিয়ার রোডম্যাপ চূড়ান্তকরণ',
      tasks: [
        'ভবিষ্যতের টার্গেট কলেজ ও প্রবেশিকা পরীক্ষাগুলোর (যেমন JEE/NEET/CUET/CLAT/CA Foundation) যোগ্যতা ও পূর্ববর্তী বছরের কাট-অফ খতিয়ে দেখুন।',
        'একটি মজবুত ব্যাকআপ প্ল্যান (Secondary Option) মাথায় রেখে পূর্ণ আত্মবিশ্বাসের সাথে চূড়ান্ত প্রস্তুতিতে নামুন।',
      ],
    },
  ];

  return {
    candidateName,
    primaryStream,
    secondaryStream,
    allStreams: allStreamsList,
    aptitudeDimensions,
    aiReadinessScore: aiScore,
    aiReadinessAnalysis,
    aiSuggestedTools,
    realityCheckAdvice: {
      financialStrategy,
      coachingAdvice,
      parentHandlingTip,
      competitionAdvice,
    },
    customConcernsFeedback,
    actionPlan,
    generatedAt: new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };
}
