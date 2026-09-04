export interface Scheme {
  id: string;
  title: string;
  provider: string;
  maxIncome: number;
  eligibleCategories: string[];
  minQualification: string;
  benefits: string;
  requiredDocs: string[];
  applyUrl: string;
}

export interface College {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  type: "Government" | "Private" | "Aided";
  minQualification: "10th" | "12th" | "Diploma";
  annualFee: number;
  courses: string[];
  schemesApplicable: string[];
}

export interface StudentProfile {
  district: string;
  qualification: "10th" | "12th" | "Diploma";
  familyIncome: number;
  category: string; // e.g., 'OPEN', 'OBC', 'SC', 'ST', 'EBC', 'MINORITY'
  quizVector: {
    tech: number; // 0 to 1
    vocation: number; // 0 to 1
    academic: number; // 0 to 1
    govt: number; // 0 to 1
  };
  preferredLanguage: 'en' | 'hi' | 'mr';
}

export interface CareerActionPlan {
  goal: string;
  immediateSteps: string[];
  eligibleSchemesSummary: string;
  documentChecklist: string[];
  longTermOutlook: string;
}
