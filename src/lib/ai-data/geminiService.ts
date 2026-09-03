import { GoogleGenAI } from '@google/genai';
import { College, Scheme, StudentProfile, CareerActionPlan } from './types';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCareerPlan(
  profile: StudentProfile,
  matchedColleges: College[],
  matchedSchemes: Scheme[]
): Promise<CareerActionPlan | null> {
  
  const systemInstruction = `
    You are an expert career counselor for rural students in Maharashtra.
    Your job is to take the student's profile, a list of eligible local colleges, and eligible government schemes, and return a structured Career Action Plan.
    The response MUST be strictly in JSON format matching the provided schema.
    
    CRITICAL:
    Generate the text content of the JSON fields fluently in the student's preferred language code: ${profile.preferredLanguage} (where 'en' = English, 'hi' = Hindi, 'mr' = Marathi).
  `;

  const userPrompt = `
    Student Profile:
    ${JSON.stringify(profile, null, 2)}
    
    Eligible Colleges:
    ${JSON.stringify(matchedColleges.map(c => ({ name: c.name, type: c.type, fee: c.annualFee, courses: c.courses })), null, 2)}
    
    Eligible Schemes:
    ${JSON.stringify(matchedSchemes.map(s => ({ title: s.title, benefits: s.benefits })), null, 2)}
    
    Based on the profile's quizVector and qualifications, suggest a primary career goal, outline immediate steps (e.g., which colleges to apply to), summarize the schemes they should use for funding, list the common required documents, and give a long-term outlook.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
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
          required: ["goal", "immediateSteps", "eligibleSchemesSummary", "documentChecklist", "longTermOutlook"]
        }
      }
    });

    if (response.text) {
      const plan: CareerActionPlan = JSON.parse(response.text);
      return plan;
    }
    return null;
  } catch (error) {
    console.error("Error generating career plan with Gemini:", error);
    return null;
  }
}
