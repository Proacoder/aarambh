import { StudentProfile } from './types';
import { getMatchingData } from './dataMatcher';
import { generateCareerPlan } from './geminiService';

async function runTest() {
  console.log("=== CareerMitra AI Pipeline Test ===");

  // 1. Define a mock student profile
  // Example: A 10th-pass student from Kolhapur, low income, interested in technical/vocational paths, prefers Marathi.
  const mockProfile: StudentProfile = {
    district: "Kolhapur",
    qualification: "10th",
    familyIncome: 80000,
    category: "OBC",
    quizVector: {
      tech: 0.8,
      vocation: 0.9,
      academic: 0.3,
      govt: 0.4
    },
    preferredLanguage: "mr" // Marathi output
  };

  console.log("Mock Profile Generated:", mockProfile);

  // 2. Run data matching
  console.log("\nRunning Data Matcher...");
  const { matchedColleges, matchedSchemes } = getMatchingData(mockProfile);

  console.log(`Matched Colleges: ${matchedColleges.length}`);
  matchedColleges.forEach(c => console.log(` - ${c.name} (${c.type})`));

  console.log(`Matched Schemes: ${matchedSchemes.length}`);
  matchedSchemes.forEach(s => console.log(` - ${s.title}`));

  // 3. Pass to Gemini
  console.log("\nCalling Gemini 1.5 Flash API (Ensure GEMINI_API_KEY is set)...");
  if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is missing in environment variables. The API call will likely fail.");
  }

  const careerPlan = await generateCareerPlan(mockProfile, matchedColleges, matchedSchemes);

  // 4. Log final output
  console.log("\n=== Final Career Action Plan ===");
  if (careerPlan) {
    console.log(JSON.stringify(careerPlan, null, 2));
  } else {
    console.log("Failed to generate career plan.");
  }
}

runTest();
