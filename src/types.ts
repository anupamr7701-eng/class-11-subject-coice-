export type QuestionType = 'text' | 'paragraph' | 'radio' | 'checkbox' | 'scale';

export interface QuestionOption {
  label: string;
  sublabel?: string;
  value: string;
}

export interface QuestionData {
  id: number;
  number: number;
  sectionId: number;
  title: string;
  description?: string;
  type: QuestionType;
  options?: QuestionOption[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  required: boolean;
  placeholder?: string;
}

export interface SectionData {
  id: number;
  title: string;
  englishTitle: string;
  description: string;
  iconName: string;
}

export interface UserResponses {
  name?: string; // Q1
  currentClass?: string; // Q2
  locationTier?: string; // Q3
  board?: string; // Q4
  interestScience?: number; // Q5 (1-10)
  interestCommerce?: number; // Q6 (1-10)
  interestArts?: number; // Q7 (1-10)
  interestTech?: number; // Q8 (1-10)
  interestCommunication?: number; // Q9 (1-10)
  aptitudeMath?: number; // Q10 (0-10)
  aptitudePhysics?: number; // Q11 (1-10)
  aptitudeLogic?: number; // Q12 (1-10)
  aptitudeLanguage?: number; // Q13 (1-10)
  aptitudeCreativity?: number; // Q14 (1-10)
  learningMethod?: string; // Q15
  futureField?: string; // Q16
  careerPriority?: string; // Q17
  aiAttitude?: string; // Q18
  competitionTolerance?: string; // Q19
  familyFinance?: string; // Q20
  parentsPreference?: string; // Q21
  coachingAffordability?: string; // Q22
  learnerType?: string; // Q23
  confusions?: string[]; // Q24
  specificConcern?: string; // Q25
  email?: string; // Q26
  wantUpdates?: string; // Q27
}

export interface StreamScore {
  name: string;
  banglaName: string;
  percentage: number;
  badge: string;
  description: string;
  subjects: string[];
  topCareers: string[];
  aiVulnerability: 'Low' | 'Moderate' | 'High';
  aiVulnerabilityBangla: string;
  pros: string[];
  cons: string[];
}

export interface AptitudeDimension {
  name: string;
  banglaName: string;
  score: number;
  maxScore: number;
  level: 'উচ্চ' | 'মাঝারি' | 'উন্নতির সুযোগ';
  color: string;
}

export interface CareerAssessmentResult {
  candidateName: string;
  primaryStream: StreamScore;
  secondaryStream: StreamScore;
  allStreams: StreamScore[];
  aptitudeDimensions: AptitudeDimension[];
  aiReadinessScore: number; // 0-100
  aiReadinessAnalysis: string;
  aiSuggestedTools: string[];
  realityCheckAdvice: {
    financialStrategy: string;
    coachingAdvice: string;
    parentHandlingTip: string;
    competitionAdvice: string;
  };
  customConcernsFeedback: {
    concern: string;
    solution: string;
  }[];
  actionPlan: {
    phase: string;
    title: string;
    tasks: string[];
  }[];
  generatedAt: string;
}
