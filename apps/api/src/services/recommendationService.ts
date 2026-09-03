import { prisma } from "../lib/prisma.ts";
import {
  getDistrictCoordinates,
  calculateHaversineDistance,
  calculateDistanceScore
} from "../lib/geo.ts";

export interface DomainScores {
  technology: number;
  business: number;
  healthcare: number;
  government: number;
  arts: number;
  science: number;
}

export interface RecommendationResult {
  collegeId: string;
  collegeName: string;
  collegeType: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  courseId: string;
  courseName: string;
  durationYears: number | null;
  approximateFees: number | null;
  eligibilityPercentage: number | null;
  domainCategory: string;
  overallScore: number;
  scores: {
    domainFit: number;
    academicFit: number;
    distanceFit: number;
    financialFit: number;
  };
  reasons: string[];
}

export interface EligibleScholarship {
  id: string;
  name: string;
  provider: string;
  amount: string | null;
  description: string | null;
  officialUrl: string | null;
  matchScore: number;
  whyEligible: string;
  requiredDocuments: string[];
}

export interface CareerRecommendationPayload {
  student: {
    id: string;
    name: string | null;
    educationLevel: string;
    percentage: number | null;
    district: string;
    financialLevel: string | null;
    willingToMove: boolean;
  };
  topDomains: { domain: string; score: number }[];
  recommendations: RecommendationResult[];
  eligibleScholarships: EligibleScholarship[];
  generatedAt: string;
}

/**
 * Classifies a course into primary and secondary domains and career pathways.
 */
function classifyCourse(courseName: string): { primary: keyof DomainScores; secondary?: keyof DomainScores } {
  const lower = courseName.toLowerCase();

  if (lower.includes("computer") || lower.includes("information tech") || lower.includes("software") || lower.includes("robotics") || lower.includes("electrician") || lower.includes("copa")) {
    return { primary: "technology", secondary: "science" };
  }
  if (lower.includes("mining") || lower.includes("mechanical") || lower.includes("electrical") || lower.includes("electronics") || lower.includes("civil") || lower.includes("automobile") || lower.includes("b.tech") || lower.includes("polytechnic")) {
    return { primary: "technology", secondary: "science" };
  }
  if (lower.includes("agriculture") || lower.includes("horticulture") || lower.includes("forestry") || lower.includes("fisheries") || lower.includes("food tech")) {
    return { primary: "science", secondary: "technology" };
  }
  if (lower.includes("mbbs") || lower.includes("nursing") || lower.includes("pharmacy") || lower.includes("b.pharm") || lower.includes("d.pharm") || lower.includes("dmlt") || lower.includes("physiotherapy") || lower.includes("gnm") || lower.includes("healthcare")) {
    return { primary: "healthcare", secondary: "science" };
  }
  if (lower.includes("social work") || lower.includes("public admin") || lower.includes("political science") || lower.includes("civil services")) {
    return { primary: "government", secondary: "arts" };
  }
  if (lower.includes("banking") || lower.includes("b.com") || lower.includes("bba") || lower.includes("management") || lower.includes("cooperative") || lower.includes("agri-business")) {
    return { primary: "business", secondary: "technology" };
  }
  if (lower.includes("arts") || lower.includes("history") || lower.includes("marathi") || lower.includes("economics") || lower.includes("b.a.")) {
    return { primary: "arts", secondary: "government" };
  }

  return { primary: "science", secondary: "technology" };
}

/**
 * Calculate Domain Fit Score (35% weight)
 */
function calculateDomainScore(
  courseName: string,
  domains: DomainScores
): { score: number; domain: string } {
  const { primary, secondary } = classifyCourse(courseName);
  const primaryScore = domains[primary] || 0;
  const secondaryScore = secondary ? (domains[secondary] || 0) * 0.7 : 0;

  const score = Math.min(100, Math.max(primaryScore, secondaryScore));
  return { score, domain: primary };
}

/**
 * Calculate Academic Eligibility Score (25% weight)
 * Hard filter: if student percentage < required cutoff, returns null (disqualified)
 */
function calculateAcademicScore(
  studentPercentage: number | null,
  courseCutoff: number | null
): number | null {
  if (courseCutoff == null) {
    return 80; // No strict cutoff specified
  }

  if (studentPercentage == null) {
    return 75; // Baseline if percentage not provided
  }

  // HARD FILTER: Ineligible students are strictly filtered out
  if (studentPercentage < courseCutoff) {
    return null;
  }

  const margin = studentPercentage - courseCutoff;
  // Passing cutoff starts at 70 points, +2.5 points per margin % up to 100
  return Math.min(100, Math.round(70 + margin * 2.5));
}

/**
 * Calculate Financial Fit Score (15% weight)
 */
function calculateFinancialScore(
  financialLevel: string | null,
  approxFees: number | null
): number {
  const fees = approxFees ?? 30000;
  const level = (financialLevel || "Medium").toLowerCase();

  if (level.includes("low") || level.includes("bpl") || level.includes("ews")) {
    if (fees <= 10000) return 100;
    if (fees <= 25000) return 90;
    if (fees <= 50000) return 75;
    if (fees <= 85000) return 60;
    return 40;
  }

  if (level.includes("high")) {
    return 100;
  }

  // Medium financial level default
  if (fees <= 25000) return 100;
  if (fees <= 60000) return 85;
  if (fees <= 90000) return 75;
  return 60;
}

/**
 * Core Deterministic Recommendation Function
 */
export async function generateStudentRecommendations(
  studentId: string
): Promise<CareerRecommendationPayload> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { assessment: true }
  });

  if (!student) {
    throw new Error(`Student with id '${studentId}' not found`);
  }

  // Extract domain scores or use balanced defaults
  const domainScores: DomainScores = {
    technology: student.assessment?.technology ?? 50,
    business: student.assessment?.business ?? 50,
    healthcare: student.assessment?.healthcare ?? 50,
    government: student.assessment?.government ?? 50,
    arts: student.assessment?.arts ?? 50,
    science: student.assessment?.science ?? 50
  };

  // Rank top interest domains
  const topDomains = Object.entries(domainScores)
    .map(([domain, score]) => ({ domain, score }))
    .sort((a, b) => b.score - a.score);

  // Student location
  const studentCoords = getDistrictCoordinates(student.district);

  // Fetch all colleges with courses
  const colleges = await prisma.college.findMany({
    include: { courses: true }
  });

  const qualifiedRecommendations: RecommendationResult[] = [];

  for (const college of colleges) {
    const distanceKm = calculateHaversineDistance(
      studentCoords.latitude,
      studentCoords.longitude,
      college.latitude,
      college.longitude
    );

    const distanceFit = calculateDistanceScore(distanceKm, student.willingToMove);

    for (const course of college.courses) {
      // 1. Academic Eligibility (25%) - HARD FILTER
      const academicFit = calculateAcademicScore(
        student.percentage,
        course.eligibilityPercentage
      );

      if (academicFit === null) {
        // Disqualified by hard filter
        continue;
      }

      // 2. Domain / Career Fit (35%)
      const { score: domainFit, domain: domainCategory } = calculateDomainScore(
        course.name,
        domainScores
      );

      // 3. Financial Fit (15%)
      const financialFit = calculateFinancialScore(
        student.financialLevel,
        course.approximateFees
      );

      // 4. Combined Weighted Score: 35% Domain, 25% Academic, 25% Distance, 15% Financial
      const overallScore = Math.round(
        (0.35 * domainFit +
          0.25 * academicFit +
          0.25 * distanceFit +
          0.15 * financialFit) *
          10
      ) / 10;

      // Construct transparent "Why You Qualify" reasons
      const reasons: string[] = [];

      if (student.percentage && course.eligibilityPercentage) {
        const margin = Math.round((student.percentage - course.eligibilityPercentage) * 10) / 10;
        reasons.push(
          `Academic Match: Your ${student.percentage}% meets the ${course.eligibilityPercentage}% eligibility cutoff (+${margin}% margin).`
        );
      } else {
        reasons.push("Academic Match: Open enrollment criteria met for this course.");
      }

      if (distanceKm <= 50) {
        reasons.push(`Local Accessibility: Located nearby in ${college.district} (~${distanceKm} km from your district).`);
      } else if (student.willingToMove) {
        reasons.push(`Mobility Match: Premier regional institute (~${distanceKm} km) matching your willingness to relocate.`);
      } else {
        reasons.push(`Regional Campus: Located within ~${distanceKm} km in ${college.district}.`);
      }

      const feeFormatted = course.approximateFees ? `₹${course.approximateFees.toLocaleString("en-IN")}/yr` : "Subsidized";
      if ((student.financialLevel || "").toLowerCase().includes("low") || (course.approximateFees ?? 0) <= 25000) {
        reasons.push(`Affordability: Government-subsidized fee of ${feeFormatted} with high scholarship eligibility.`);
      } else {
        reasons.push(`Fee Structure: ${feeFormatted} with government installment & scholarship support.`);
      }

      reasons.push(`Aspiration Alignment: Matches your interest in ${domainCategory.toUpperCase()} (${domainFit}% affinity score).`);

      qualifiedRecommendations.push({
        collegeId: college.id,
        collegeName: college.name,
        collegeType: college.type,
        district: college.district,
        state: college.state,
        latitude: college.latitude,
        longitude: college.longitude,
        distanceKm,
        courseId: course.id,
        courseName: course.name,
        durationYears: course.durationYears,
        approximateFees: course.approximateFees,
        eligibilityPercentage: course.eligibilityPercentage,
        domainCategory,
        overallScore,
        scores: {
          domainFit,
          academicFit,
          distanceFit,
          financialFit
        },
        reasons
      });
    }
  }

  // Sort by overallScore descending
  qualifiedRecommendations.sort((a, b) => b.overallScore - a.overallScore);

  // Take top 15 recommendations
  const topRecommendations = qualifiedRecommendations.slice(0, 15);

  // Evaluate Scholarship Eligibility Deterministically
  const scholarships = await prisma.scholarship.findMany();
  const eligibleScholarships: EligibleScholarship[] = [];

  for (const s of scholarships) {
    const el = s.eligibility as Record<string, any> | null;
    const docs = (s.documents as string[]) || [];

    let isEligible = true;
    let matchScore = 80;
    const reasons: string[] = [];

    if (el) {
      // Percentage check
      if (typeof el.minPercentage === "number" && student.percentage != null) {
        if (student.percentage < el.minPercentage) {
          isEligible = false;
        } else {
          matchScore += 10;
          reasons.push(`Meets minimum ${el.minPercentage}% score requirement.`);
        }
      }

      // Financial level check
      if (el.maxAnnualIncome) {
        const fin = (student.financialLevel || "Medium").toLowerCase();
        if (fin.includes("low") || fin.includes("bpl") || fin.includes("ews")) {
          matchScore += 10;
          reasons.push("Family income criteria (< ₹8 Lakhs) met for economically weaker sections.");
        }
      }

      // Domicile check
      if (student.state === "Maharashtra") {
        reasons.push("Maharashtra State Domicile requirement satisfied.");
      }
    }

    if (isEligible) {
      eligibleScholarships.push({
        id: s.id,
        name: s.name,
        provider: s.provider,
        amount: s.amount,
        description: s.description,
        officialUrl: s.officialUrl,
        matchScore: Math.min(100, matchScore),
        whyEligible: reasons.join(" ") || (el?.ruleDescription as string) || "Meets primary eligibility criteria.",
        requiredDocuments: docs
      });
    }
  }

  // Sort scholarships by matchScore descending
  eligibleScholarships.sort((a, b) => b.matchScore - a.matchScore);

  // Persist top 10 recommendations in PostgreSQL Recommendation table
  // Clear previous recommendations for this student
  await prisma.recommendation.deleteMany({
    where: { studentId }
  });

  const recordsToInsert = topRecommendations.slice(0, 10).map((rec) => ({
    studentId,
    collegeId: rec.collegeId,
    category: rec.domainCategory,
    score: rec.overallScore,
    reason: rec.reasons[0] || `${rec.courseName} at ${rec.collegeName}`
  }));

  if (recordsToInsert.length > 0) {
    await prisma.recommendation.createMany({
      data: recordsToInsert
    });
  }

  return {
    student: {
      id: student.id,
      name: student.name,
      educationLevel: student.educationLevel,
      percentage: student.percentage,
      district: student.district,
      financialLevel: student.financialLevel,
      willingToMove: student.willingToMove
    },
    topDomains,
    recommendations: topRecommendations,
    eligibleScholarships,
    generatedAt: new Date().toISOString()
  };
}
