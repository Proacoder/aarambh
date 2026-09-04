import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { College, Scheme, StudentProfile } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Deterministically load the local JSON files
const COLLEGES_PATH = path.resolve(__dirname, '../../../data/colleges.json');
const SCHEMES_PATH = path.resolve(__dirname, '../../../data/schemes.json');

let collegesData: College[] = [];
let schemesData: Scheme[] = [];

try {
  collegesData = JSON.parse(fs.readFileSync(COLLEGES_PATH, 'utf-8'));
  schemesData = JSON.parse(fs.readFileSync(SCHEMES_PATH, 'utf-8'));
} catch (error) {
  console.error("Error reading dataset files. Ensure you are running this from the correct root.", error);
}

export function getMatchingData(profile: StudentProfile): { matchedColleges: College[], matchedSchemes: Scheme[] } {
  // 1. Filter Colleges
  // We match based on district, minimum qualification (e.g., if college needs 12th, a 10th student can't apply, 
  // but let's do an exact match or assume profile.qualification satisfies it).
  const matchedColleges = collegesData.filter((college) => {
    const districtMatch = college.district.toLowerCase() === profile.district.toLowerCase();
    
    // Qualification match: if user has 10th, they can only apply to 10th or Diploma minQual colleges (assuming diploma acts like 10th or 12th depending on context, but let's just do exact or lower bound)
    // For simplicity in this engine:
    let qualMatch = false;
    if (profile.qualification === '12th') {
      qualMatch = true; // 12th pass can apply for 10th/12th/Diploma courses
    } else if (profile.qualification === 'Diploma') {
      qualMatch = true; // Diploma can apply to degree
    } else {
      // 10th can only apply to 10th level
      qualMatch = college.minQualification === '10th';
    }

    return districtMatch && qualMatch;
  });

  // 2. Filter Schemes
  const matchedSchemes = schemesData.filter((scheme) => {
    const incomeMatch = profile.familyIncome <= scheme.maxIncome;
    const categoryMatch = scheme.eligibleCategories.includes(profile.category) || scheme.eligibleCategories.includes("OPEN");
    
    let qualMatch = false;
    if (profile.qualification === '12th' || profile.qualification === 'Diploma') {
      qualMatch = true; // Meets minimum of 10th or 12th
    } else {
      qualMatch = scheme.minQualification === '10th'; // Only 10th allowed
    }

    return incomeMatch && categoryMatch && qualMatch;
  });

  return {
    matchedColleges,
    matchedSchemes
  };
}
