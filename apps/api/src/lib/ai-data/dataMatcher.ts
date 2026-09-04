import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { College, Scheme, StudentProfile } from './types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Deterministically load the local JSON files from project root
const COLLEGES_PATH = path.resolve(__dirname, '../../../../data/colleges.json');
const SCHEMES_PATH = path.resolve(__dirname, '../../../../data/schemes.json');

let collegesData: College[] = [];
let schemesData: Scheme[] = [];

try {
  if (fs.existsSync(COLLEGES_PATH)) {
    collegesData = JSON.parse(fs.readFileSync(COLLEGES_PATH, 'utf-8'));
  }
  if (fs.existsSync(SCHEMES_PATH)) {
    schemesData = JSON.parse(fs.readFileSync(SCHEMES_PATH, 'utf-8'));
  }
} catch (error) {
  console.error("Error reading dataset files.", error);
}

export function getMatchingData(profile: StudentProfile): { matchedColleges: College[], matchedSchemes: Scheme[] } {
  const matchedColleges = collegesData.filter((college) => {
    const districtMatch = college.district.toLowerCase() === profile.district.toLowerCase();
    let qualMatch = false;
    if (profile.qualification === '12th' || profile.qualification === 'Diploma') {
      qualMatch = true;
    } else {
      qualMatch = college.minQualification === '10th';
    }
    return districtMatch && qualMatch;
  });

  const matchedSchemes = schemesData.filter((scheme) => {
    const incomeMatch = profile.familyIncome <= scheme.maxIncome;
    const categoryMatch = scheme.eligibleCategories.includes(profile.category) || scheme.eligibleCategories.includes("OPEN");
    let qualMatch = false;
    if (profile.qualification === '12th' || profile.qualification === 'Diploma') {
      qualMatch = true;
    } else {
      qualMatch = scheme.minQualification === '10th';
    }
    return incomeMatch && categoryMatch && qualMatch;
  });

  return {
    matchedColleges,
    matchedSchemes
  };
}
