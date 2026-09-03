import { Router } from "express";
import { generateStudentRecommendations } from "../services/recommendationService.ts";
import { generateAICareerPlan } from "../services/aiActionPlanService.ts";

const router = Router();

interface EntranceExamInfo {
  name: string;
  conductingBody: string;
  targetCourses: string[];
  tentativeExamMonth: string;
  registrationMonth: string;
  officialWebsite: string;
  description: string;
}

const ENTRANCE_EXAMS: Record<string, EntranceExamInfo[]> = {
  realistic: [
    {
      name: "MHT-CET (Engineering)",
      conductingBody: "State Common Entrance Test Cell, Maharashtra",
      targetCourses: ["B.Tech / B.E."],
      tentativeExamMonth: "April - May",
      registrationMonth: "January - March",
      officialWebsite: "https://cetcell.mahacet.org/",
      description: "State-level entrance test for admissions into first-year engineering and realistic degree courses across Maharashtra colleges."
    },
    {
      name: "DTE Maharashtra Polytechnic CAP",
      conductingBody: "Directorate of Technical Education (DTE), Maharashtra",
      targetCourses: ["Diploma in Engineering"],
      tentativeExamMonth: "Merit based on Class 10 Marks",
      registrationMonth: "June - July",
      officialWebsite: "https://poly24.dtemaharashtra.gov.in/",
      description: "Centralized Admission Process based on SSC (10th) marks for admission to 3-year polytechnic engineering diplomas."
    },
    {
      name: "JEE (Main)",
      conductingBody: "National Testing Agency (NTA)",
      targetCourses: ["B.Tech (COEP, VJTI, NITs, IITs)"],
      tentativeExamMonth: "January (Session 1) & April (Session 2)",
      registrationMonth: "November - December",
      officialWebsite: "https://jeemain.nta.nic.in/",
      description: "National entrance examination accepted by premier autonomous institutes in Maharashtra (COEP, VJTI) and national NITs/IIITs."
    }
  ],
  social: [
    {
      name: "NEET-UG",
      conductingBody: "National Testing Agency (NTA) & DMER Maharashtra",
      targetCourses: ["MBBS", "BAMS", "BHMS", "B.Sc Nursing", "B.P.Th"],
      tentativeExamMonth: "May",
      registrationMonth: "February - March",
      officialWebsite: "https://neet.nta.nic.in/",
      description: "Mandatory all-India entrance examination for admissions into conventional and municipal medical/dental/nursing colleges."
    },
    {
      name: "MHT-CET (PCB Group - Pharmacy)",
      conductingBody: "State CET Cell, Maharashtra",
      targetCourses: ["B.Pharm", "Pharma.D"],
      tentativeExamMonth: "April",
      registrationMonth: "January - March",
      officialWebsite: "https://cetcell.mahacet.org/",
      description: "State entrance test for degree pharmacy admissions in conventional College of Pharmacy Karad/Amravati and affiliated colleges."
    }
  ],
  investigative: [
    {
      name: "MCAER PG-CET / MHT-CET Agriculture",
      conductingBody: "Maharashtra Council of Agricultural Education and Research (MCAER)",
      targetCourses: ["B.Sc. (Hons) Agriculture", "B.Tech Agri Engineering", "Horticulture", "Fisheries"],
      tentativeExamMonth: "April - May",
      registrationMonth: "February - March",
      officialWebsite: "https://mcaer.org/",
      description: "Entrance test for undergraduate admissions into Maharashtra's 4 State Agricultural Universities (MPKV, PDKV, VNMKV, DBSKKV)."
    }
  ],
  conventional: [
    {
      name: "MPSC Subordinate Services (Non-Gazetted)",
      conductingBody: "Maharashtra Public Service Commission (MPSC)",
      targetCourses: ["Police Sub-Inspector (PSI)", "State Tax Inspector (STI)", "Assistant Section Officer (ASO)"],
      tentativeExamMonth: "June / September",
      registrationMonth: "February - March",
      officialWebsite: "https://mpsc.gov.in/",
      description: "Premier state competitive exam recruiting rural graduates into Maharashtra administrative and police services."
    },
    {
      name: "Maharashtra Talathi & Revenue Bharti Exam",
      conductingBody: "Revenue Department, Govt of Maharashtra",
      targetCourses: ["Talathi (Village Revenue Officer)", "Clerk Typist"],
      tentativeExamMonth: "August - October",
      registrationMonth: "June - July",
      officialWebsite: "https://mahabhumi.gov.in/",
      description: "District-wise competitive examination for village revenue administration positions."
    }
  ],
  enterprising: [
    {
      name: "MAH-CET (MBA / MMS / BBA CET)",
      conductingBody: "State CET Cell, Maharashtra",
      targetCourses: ["BBA", "BCA", "MBA", "MMS"],
      tentativeExamMonth: "March - April",
      registrationMonth: "January - February",
      officialWebsite: "https://cetcell.mahacet.org/",
      description: "State-level examination for admissions into professional commerce, management, and computer application degrees."
    }
  ],
  artistic: [
    {
      name: "MAH-AAC-CET / Fine artistic & Design CET",
      conductingBody: "State CET Cell, Maharashtra",
      targetCourses: ["Bachelor of Fine artistic (BFA)", "Visual Communication"],
      tentativeExamMonth: "May",
      registrationMonth: "March - April",
      officialWebsite: "https://cetcell.mahacet.org/",
      description: "Admission into conventional Chitrakala Mahavidyalayas and design institutes across Maharashtra."
    }
  ]
};

/**
 * GET /api/action-plan/:studentId
 * Generates the complete, AI-ready Career Action Plan data bundle
 */
router.get("/:studentId", async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Get deterministic recommendations
    const recPayload = await generateStudentRecommendations(studentId);
    const { student, topDomains, recommendations, eligibleScholarships } = recPayload;

    const topDomain = topDomains[0]?.domain || "realistic";

    // Gather entrance examinations relevant to the student's top domains
    const relevantExams = [
      ...(ENTRANCE_EXAMS[topDomain] || []),
      ...(topDomains[1] ? ENTRANCE_EXAMS[topDomains[1].domain] || [] : [])
    ].slice(0, 4);

    // Consolidate complete document checklist from all matched scholarships
    const documentSet = new Set<string>([
      "Class 10 (SSC) Original Marksheet and Passing Certificate",
      "Class 12 (HSC) Marksheet or Diploma Transcript (if applicable)",
      "Maharashtra State Domicile Certificate (Tahsildar / MahaOnline)",
      "Current Financial Year Income Certificate (< ₹8 Lakhs from Tahsildar)",
      "Aadhaar Card linked with Bank Account (NPCI active for DBT)",
      "Nationalized Bank Account Passbook with IFSC",
      "Recent Passport Size Color Photographs (5 copies)"
    ]);

    for (const sch of eligibleScholarships) {
      for (const doc of sch.requiredDocuments) {
        documentSet.add(doc);
      }
    }

    const documentChecklist = Array.from(documentSet);

    // Structured 3-Stage Milestone Action Plan
    const milestones = [
      {
        stage: 1,
        title: "Immediate Action & Document Preparation",
        timeframe: "Next 30 Days",
        actions: [
          "Visit the local Setu Seva Kendra / MahaOnline centre to procure your Tahsildar Income Certificate (valid for current FY).",
          "Ensure your Aadhaar is linked to your bank account with NPCI mapping enabled for MahaDBT direct benefit transfer.",
          "Obtain 3 certified copies of all prior academic marksheets and school leaving/transfer certificate.",
          `Explore the top recommended college in your region: ${recommendations[0]?.collegeName || "Local conventional Polytechnic"}.`
        ]
      },
      {
        stage: 2,
        title: "Entrance Exam & Skill Readiness",
        timeframe: "Months 2 to 5",
        actions: [
          `Register for the relevant state entrance examination (${relevantExams[0]?.name || "MHT-CET / DTE CAP"}) on the official portal.`,
          "Practice past 5 years question papers available on the State CET Cell portal.",
          `Strengthen core fundamentals in ${topDomain.toUpperCase()} related subjects through free state e-learning resources.`,
          "Visit the nearest college campus or talk to current students/alumni regarding hostel accommodation."
        ]
      },
      {
        stage: 3,
        title: "CAP Admission & Scholarship Application",
        timeframe: "Months 5 to 8",
        actions: [
          "Participate in the Centralized Admission Process (CAP) rounds; fill option forms with preference for top-matched conventional colleges.",
          "Upon allotment, verify documents at the Scrutiny Centre (FC/ARC) and confirm seat acceptance.",
          `Submit the online scholarship application on MahaDBT (${eligibleScholarships[0]?.name || "EBC Fee Reimbursement"}) immediately after college fee receipt is issued.`,
          "Submit verified hard copy of scholarship application along with required documents to the college scholarship clerk."
        ]
      }
    ];

    // Assemble comprehensive action plan payload
    const actionPlan = {
      student,
      primaryCareerPath: {
        domain: topDomain,
        domainAffinityScore: topDomains[0]?.score || 0,
        summary: `Strong alignment with ${topDomain.toUpperCase()} disciplines based on adaptive assessment responses.`,
        topRecommendedColleges: recommendations.slice(0, 5).map((r) => ({
          collegeName: r.collegeName,
          courseName: r.courseName,
          district: r.district,
          distanceKm: r.distanceKm,
          approximateFees: r.approximateFees ? `₹${r.approximateFees.toLocaleString("en-IN")}/yr` : "Subsidized",
          overallScore: r.overallScore,
          whyYouQualify: r.reasons
        }))
      },
      matchedScholarships: eligibleScholarships.slice(0, 5).map((s) => ({
        name: s.name,
        provider: s.provider,
        amount: s.amount,
        officialUrl: s.officialUrl,
        whyEligible: s.whyEligible
      })),
      entranceExaminations: relevantExams,
      documentChecklist,
      milestones,
      generatedAt: new Date().toISOString(),
      meta: {
        platform: "CareerMitra",
        engine: "Deterministic Rules Engine v1.0",
        aiReady: true
      }
    };

    // Optional AI enhancement via Gemini (Person 3 pipeline integration)
    const preferredLang = (req.query.lang as "en" | "mr" | "hi") || "mr";
    const shouldRunAi = req.query.ai !== "false" && !!process.env.GEMINI_API_KEY;

    let aiNarrative = null;
    if (shouldRunAi) {
      aiNarrative = await generateAICareerPlan(
        {
          name: student.name,
          educationLevel: student.educationLevel,
          percentage: student.percentage,
          district: student.district,
          financialLevel: student.financialLevel,
          willingToMove: student.willingToMove,
          topDomain: topDomain
        },
        recommendations.slice(0, 5).map((r) => ({
          name: r.collegeName,
          type: r.collegeType,
          district: r.district,
          courseName: r.courseName,
          annualFee: r.approximateFees,
          distanceKm: r.distanceKm,
          whyQualify: r.reasons
        })),
        eligibleScholarships.slice(0, 4).map((s) => ({
          name: s.name,
          provider: s.provider,
          amount: s.amount,
          whyEligible: s.whyEligible
        })),
        preferredLang
      );
    }

    return res.json({
      actionPlan: {
        ...actionPlan,
        aiNarrative
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
