import { generateMitraTaiResponse, MitraTaiResponse } from "../lib/ai-data/geminiService.ts";

export interface AICareerPlanResponse extends MitraTaiResponse {
  isAiGenerated: boolean;
  language: string;
}

export async function generateAICareerPlan(
  studentProfile: {
    name?: string | null;
    educationLevel: string;
    percentage?: number | null;
    district: string;
    financialLevel?: string | null;
    willingToMove: boolean;
    topDomain: string;
  },
  matchedColleges: {
    name: string;
    type: string;
    district: string;
    courseName: string;
    annualFee: number | null;
    distanceKm: number;
    whyQualify: string[];
  }[],
  matchedScholarships: {
    name: string;
    provider: string;
    amount: string | null;
    whyEligible: string;
  }[],
  preferredLanguage: "en" | "hi" | "mr" = "en"
): Promise<AICareerPlanResponse | null> {

  // Pass to the new deterministic pipeline
  const response = await generateMitraTaiResponse(
    studentProfile,
    matchedColleges,
    matchedScholarships,
    preferredLanguage
  );

  return {
    ...response,
    isAiGenerated: true,
    language: preferredLanguage
  };
}
