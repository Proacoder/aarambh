import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

export interface AICareerPlanResponse {
  goal: string;
  immediateSteps: string[];
  eligibleSchemesSummary: string;
  documentChecklist: string[];
  longTermOutlook: string;
  isAiGenerated: boolean;
  language: string;
}

/**
 * Generates an AI-powered Career Action Plan narrative using Gemini 1.5 Flash.
 * Strictly uses data already verified by the deterministic rules engine.
 */
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("ℹ️ GEMINI_API_KEY not configured. Using deterministic fallback.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const languageNames: Record<string, string> = {
      en: "English",
      mr: "Marathi (मराठी)",
      hi: "Hindi (हिंदी)"
    };

    const targetLang = languageNames[preferredLanguage] || "English";

    const systemInstruction = `
You are CareerMitra, an empathetic, expert career counselor for rural and Tier-2/3 students in Maharashtra, India.
Your mission is to empower rural youth by explaining their personalized Career Action Plan clearly, practically, and respectfully.

CRITICAL CONSTRAINTS:
1. Explain ONLY the data provided in the prompt. Do NOT invent new eligibility cutoffs, entrance exams, or college details.
2. The response MUST be strictly in JSON matching the specified schema.
3. Generate the text content of ALL fields fluently in ${targetLang} (Language code: '${preferredLanguage}').
4. Keep the tone encouraging, realistic, and practical for rural students and their families.
`;

    const userPrompt = `
Student Information:
- Name: ${studentProfile.name || "Student"}
- Current Education: ${studentProfile.educationLevel}
- Academic Score: ${studentProfile.percentage ? studentProfile.percentage + "%" : "Not specified"}
- Home District: ${studentProfile.district}, Maharashtra
- Financial Level: ${studentProfile.financialLevel || "Subsidized / Standard"}
- Willing to Move: ${studentProfile.willingToMove ? "Yes" : "Prefers nearby / regional"}
- Top Career Interest Domain: ${studentProfile.topDomain}

Eligible Pre-screened Regional Colleges & Courses:
${JSON.stringify(matchedColleges.slice(0, 5), null, 2)}

Eligible Pre-screened Scholarships & Financial Aid:
${JSON.stringify(matchedScholarships.slice(0, 4), null, 2)}

Task:
Generate a structured Career Action Plan in ${targetLang}:
1. "goal": Clear, motivating primary career pathway statement.
2. "immediateSteps": 4-5 concrete, sequential next steps (visiting local Setu Kendra for certificates, applying on CAP portal, preparing for state entrance exams).
3. "eligibleSchemesSummary": Practical explanation of how government fee reimbursements & hostel allowances (MahaDBT) will cover their education costs.
4. "documentChecklist": Essential documents they must get stamped at Tahsildar / Setu Kendra.
5. "longTermOutlook": 3-5 year realistic job / livelihood opportunities in Maharashtra.
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            goal: { type: "STRING" },
            immediateSteps: { type: "ARRAY", items: { type: "STRING" } },
            eligibleSchemesSummary: { type: "STRING" },
            documentChecklist: { type: "ARRAY", items: { type: "STRING" } },
            longTermOutlook: { type: "STRING" }
          },
          required: [
            "goal",
            "immediateSteps",
            "eligibleSchemesSummary",
            "documentChecklist",
            "longTermOutlook"
          ]
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        ...parsed,
        isAiGenerated: true,
        language: preferredLanguage
      };
    }

    return null;
  } catch (error) {
    console.error("⚠️ Gemini API call failed or timed out:", error);
    return null;
  }
}
