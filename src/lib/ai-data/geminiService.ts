import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

export interface MitraTaiResponse {
  summary: string;
  whyThisFits: string[];
  financialOutlook: string;
  actionPlan: string[];
  warnings: string[];
}

function buildSystemInstructions(): string {
  return `You are Mitra Tai, an empathetic, expert career counselor for rural and Tier-2/3 students in Maharashtra, India.
Your mission is to empower rural youth by explaining their personalized Career Action Plan clearly, practically, and respectfully.
Use simple language, avoid corporate jargon, and make no fake promises.

CRITICAL GROUNDING RULE:
You are the explanation layer. You must ONLY use the provided JSON context for facts, fees, distances, and eligibility. 
If a fact is not in the context, state that it is unavailable. Do NOT invent new eligibility cutoffs, entrance exams, or college details.`;
}

function buildStudentContext(profile: any, assessmentResults: any): string {
  return `STUDENT PROFILE CONTEXT:
- Name: ${profile.name || "Student"}
- Current Education: ${profile.educationLevel}
- Academic Score: ${profile.percentage ? profile.percentage + "%" : "Not specified"}
- Home District: ${profile.district}, Maharashtra
- Financial Level: ${profile.financialLevel || "Subsidized / Standard"}
- Willing to Move: ${profile.willingToMove ? "Yes" : "Prefers nearby / regional"}
- Top Career Interest Domain: ${profile.topDomain || "Realistic/Technical"}
`;
}

function buildMatchedCollegesContext(colleges: any[], kharchaEstimate?: number): string {
  return `MATCHED COLLEGES CONTEXT:
${JSON.stringify(colleges.map(c => ({
  name: c.name || c.collegeName,
  type: c.type,
  district: c.district,
  courseName: c.courseName,
  annualFee: c.annualFee,
  distanceKm: c.distanceKm,
  whyQualify: c.whyQualify
})), null, 2)}
${kharchaEstimate ? `Estimated Annual Kharcha (Expenses): ₹${kharchaEstimate}` : ''}
`;
}

function buildMatchedSchemesContext(schemes: any[]): string {
  return `MATCHED SCHEMES CONTEXT:
${JSON.stringify(schemes.map(s => ({
  name: s.name,
  provider: s.provider,
  amount: s.amount,
  eligibility: s.eligibility,
  documents: s.documents
})), null, 2)}
`;
}

function buildUserQuestion(query: string, requestedLanguage: string): string {
  const languageMap: Record<string, string> = { en: "English", hi: "Hindi", mr: "Marathi" };
  const targetLang = languageMap[requestedLanguage] || "English";
  
  return `
USER QUERY:
${query}

TASK & OUTPUT CONSTRAINTS:
1. Output your entire response natively in ${targetLang} (Language code: '${requestedLanguage}').
2. The response MUST be strictly in JSON matching the MitraTaiResponse schema.
3. STRICT CONSTRAINT: Do not translate or alter numeric values (₹ amounts, percentages, distances). Keep them exactly as provided in the context.
`;
}

export async function generateMitraTaiResponse(
  profile: any,
  colleges: any[],
  schemes: any[],
  requestedLanguage: "en" | "hi" | "mr" = "en",
  userQuery: string = "Generate my personalized Career Action Plan."
): Promise<MitraTaiResponse> {
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("ℹ️ GEMINI_API_KEY not configured. Returning deterministic fallback.");
    return getFallbackResponse(requestedLanguage);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = buildSystemInstructions();
    const userPrompt = [
      buildStudentContext(profile, {}),
      buildMatchedCollegesContext(colleges),
      buildMatchedSchemesContext(schemes),
      buildUserQuestion(userQuery, requestedLanguage)
    ].join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temp for deterministic, factual outputs
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            summary: { type: "STRING" },
            whyThisFits: { type: "ARRAY", items: { type: "STRING" } },
            financialOutlook: { type: "STRING" },
            actionPlan: { type: "ARRAY", items: { type: "STRING" } },
            warnings: { type: "ARRAY", items: { type: "STRING" } }
          },
          required: ["summary", "whyThisFits", "financialOutlook", "actionPlan", "warnings"]
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return parsed as MitraTaiResponse;
    }
    
    return getFallbackResponse(requestedLanguage);
  } catch (error) {
    console.error("⚠️ Gemini API call failed or timed out:", error);
    return getFallbackResponse(requestedLanguage);
  }
}

function getFallbackResponse(lang: string): MitraTaiResponse {
  if (lang === "mr") {
    return {
      summary: "नमस्कार! मी मित्र ताई ऑफलाइन आहे, पण तुझे कॉलेज आणि शिष्यवृत्तीचे रेकॉर्ड डॅशबोर्डवर उपलब्ध आहेत.",
      whyThisFits: ["तुमच्या गुणांवर आधारित हा सर्वात सुरक्षित पर्याय आहे."],
      financialOutlook: "कृपया तुमच्या डॅशबोर्डवरील शिष्यवृत्ती विभाग तपासा.",
      actionPlan: ["तुमचे जवळचे कॉलेज तपासा.", "कागदपत्रे जमा करा."],
      warnings: ["माहिती ऑफलाइन जनरेट झाली आहे, कृपया महा-डीबीटी पोर्टलवर खात्री करा."]
    };
  } else if (lang === "hi") {
    return {
      summary: "नमस्ते! मैं मित्र ताई अभी ऑफलाइन हूँ, लेकिन आपके कॉलेज और छात्रवृत्ति के रिकॉर्ड डैशबोर्ड पर उपलब्ध हैं।",
      whyThisFits: ["आपके अंकों के आधार पर यह सबसे सुरक्षित विकल्प है।"],
      financialOutlook: "कृपया अपने डैशबोर्ड पर छात्रवृत्ति अनुभाग देखें।",
      actionPlan: ["अपना नजदीकी कॉलेज देखें।", "दस्तावेज जमा करें।"],
      warnings: ["जानकारी ऑफलाइन उत्पन्न हुई है, कृपया महा-डीबीटी पोर्टल पर पुष्टि करें।"]
    };
  }
  
  return {
    summary: "Hello! Mitra Tai is currently offline, but your deterministic college and scholarship records are available.",
    whyThisFits: ["Based on your academic score and district, these are the safest regional matches."],
    financialOutlook: "Please review the scholarships section on your dashboard for exact funding amounts.",
    actionPlan: ["Review nearby colleges.", "Gather your baseline documents (Income Certificate, Domicile)."],
    warnings: ["This is a fallback response. Please verify deadlines manually on the MahaDBT portal."]
  };
}
