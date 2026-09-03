import { Router } from "express";
import { prisma } from "../lib/prisma.ts";
import { generateStudentRecommendations } from "../services/recommendationService.ts";

const router = Router();

export interface AssessmentQuestion {
  id: number;
  questionEn: string;
  questionMr: string;
  options: {
    textEn: string;
    textMr: string;
    scores: {
      realistic?: number;
      enterprising?: number;
      social?: number;
      conventional?: number;
      artistic?: number;
      investigative?: number;
    };
  }[];
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    questionEn: "What kind of daily work excites you the most?",
    questionMr: "तुम्हाला कोणत्या प्रकारचे दैनंदिन काम करायला सर्वात जास्त आवडेल?",
    options: [
      {
        textEn: "Working with computers, coding, fixing electronic circuits or machines",
        textMr: "संगणक, कोडिंग, इलेक्ट्रॉनिक सर्किट्स किंवा यंत्रे दुरुस्त करणे",
        scores: { realistic: 30, investigative: 15 }
      },
      {
        textEn: "Treating sick people, health investigative, medicine, nursing care",
        textMr: "आजारी व्यक्तींची काळजी घेणे, आरोग्य विज्ञान, औषधनिर्माण आणि नर्सिंग",
        scores: { social: 30, investigative: 20 }
      },
      {
        textEn: "Agriculture, modern farming techniques, dairy, food production",
        textMr: "शेती, आधुनिक कृषी तंत्रज्ञान, दुग्धव्यवसाय आणि अन्न प्रक्रिया",
        scores: { investigative: 25, realistic: 15, enterprising: 10 }
      },
      {
        textEn: "Running a enterprising, shop, accounting, marketing, or cooperative",
        textMr: "स्वतःचा व्यवसाय, दुकान, हिशेब तपासणी, विक्री किंवा सहकारी संस्था",
        scores: { enterprising: 30, artistic: 10 }
      },
      {
        textEn: "Public administration, police, talathi, MPSC, social welfare work",
        textMr: "सरकारी सेवा, पोलीस, तलाठी, स्पर्धा परीक्षा (MPSC) आणि समाजकार्य",
        scores: { conventional: 30, artistic: 15 }
      }
    ]
  },
  {
    id: 2,
    questionEn: "How do you prefer to solve problems?",
    questionMr: "तुम्ही अडचणी किंवा प्रश्न कसे सोडवणे पसंत करता?",
    options: [
      {
        textEn: "Building or repairing things practically with tools and software",
        textMr: "साधने किंवा सॉफ्टवेअर वापरून प्रत्यक्ष काम करून व दुरुस्ती करून",
        scores: { realistic: 25, investigative: 15 }
      },
      {
        textEn: "Understanding biology, health diagnosis, and directly helping individuals",
        textMr: "जैविक प्रक्रिया समजून घेऊन आणि थेट लोकांच्या आरोग्याला मदत करून",
        scores: { social: 25, investigative: 15 }
      },
      {
        textEn: "Calculating profits, managing money, and negotiating deals",
        textMr: "नफा-तोटा हिशोब करून, पैशांचे नियोजन आणि सौदे करून",
        scores: { enterprising: 25, conventional: 10 }
      },
      {
        textEn: "Studying rules, laws, and working within community or conventional systems",
        textMr: "नियम, कायदे आणि शासकीय किंवा सामाजिक यंत्रणा समजून घेऊन",
        scores: { conventional: 25, artistic: 15 }
      },
      {
        textEn: "Creative writing, art, history, communication, or teaching",
        textMr: "सर्जनशील लेखन, कला, इतिहास, संवाद किंवा अध्यापन",
        scores: { artistic: 30, conventional: 10 }
      }
    ]
  },
  {
    id: 3,
    questionEn: "What is your primary goal and timeframe for starting to earn?",
    questionMr: "कमाई सुरू करण्यासाठी तुमचे मुख्य उद्दिष्ट आणि वेळ काय आहे?",
    options: [
      {
        textEn: "Quick employment/income within 1-2 years via short technical training or ITI",
        textMr: "१-२ वर्षांत तातडीने रोजगार (उदा. ITI, व्होकेशनल किंवा तांत्रिक पदविका)",
        scores: { realistic: 20, enterprising: 15 }
      },
      {
        textEn: "A 3-year professional polytechnic diploma or degree for stable industry jobs",
        textMr: "उद्योग क्षेत्रात स्थिर नोकरीसाठी ३ वर्षांचा पदविका (Polytechnic) किंवा पदवी अभ्यासक्रम",
        scores: { realistic: 20, investigative: 15 }
      },
      {
        textEn: "A 4-5 year specialized professional degree (Engineering, Medical, Agri, Pharmacy)",
        textMr: "४-५ वर्षांची व्यावसायिक पदवी (अभियांत्रिकी, वैद्यकीय, कृषी किंवा फार्मसी)",
        scores: { social: 20, investigative: 20, realistic: 15 }
      },
      {
        textEn: "Preparing for competitive conventional exams (MPSC, Police Bharti, Talathi, Banking)",
        textMr: "सरकारी नोकरी स्पर्धा परीक्षांची तयारी (MPSC, पोलीस भरती, तलाठी, बँक)",
        scores: { conventional: 25, enterprising: 10 }
      }
    ]
  },
  {
    id: 4,
    questionEn: "Which school subject did you find most engaging?",
    questionMr: "शाळेत तुम्हाला कोणता विषय सर्वात जास्त आवडायचा?",
    options: [
      {
        textEn: "Mathematics, Physics, Computers or Mechanics",
        textMr: "गणित, भौतिकशास्त्र, संगणक किंवा यांत्रिकी",
        scores: { realistic: 25, investigative: 20 }
      },
      {
        textEn: "Biology, Chemistry, Environmental Studies",
        textMr: "जीवशास्त्र, रसायनशास्त्र, पर्यावरण अभ्यास",
        scores: { investigative: 25, social: 20 }
      },
      {
        textEn: "Commerce, Bookkeeping, Economics, Basic Math",
        textMr: "वाणिज्य, हिशोब, अर्थशास्त्र आणि व्यवहारज्ञान",
        scores: { enterprising: 25, conventional: 10 }
      },
      {
        textEn: "History, Civics, Politics, Languages",
        textMr: "इतिहास, नागरिकशास्त्र, राज्यशास्त्र आणि भाषा",
        scores: { conventional: 20, artistic: 25 }
      }
    ]
  },
  {
    id: 5,
    questionEn: "Where would you feel most accomplished working 5 years from now?",
    questionMr: "५ वर्षांनंतर स्वतःला कोणत्या कार्यक्षेत्रात पाहणे तुम्हाला सर्वात जास्त अभिमानास्पद वाटेल?",
    options: [
      {
        textEn: "In a realistic firm, software lab, or running an engineering workshop",
        textMr: "माहिती तंत्रज्ञान कंपनीत, सॉफ्टवेअर लॅबमध्ये किंवा स्वतःच्या इंजिनिअरिंग वर्कशॉपमध्ये",
        scores: { realistic: 25, investigative: 10 }
      },
      {
        textEn: "In a primary health center, hospital, or community medical clinic",
        textMr: "प्राथमिक आरोग्य केंद्रात, रुग्णालयात किंवा औषध निर्माण केंद्रात",
        scores: { social: 25, investigative: 15 }
      },
      {
        textEn: "Leading modern agricultural development, farm exports, or rural enterprise",
        textMr: "आधुनिक शेती, कृषी निर्यात किंवा ग्रामीण कृषी उद्योगाचे नेतृत्व करताना",
        scores: { investigative: 20, enterprising: 20 }
      },
      {
        textEn: "As a conventional officer serving citizens in administrative offices",
        textMr: "शासकीय अधिकारी म्हणून जनतेची सेवा करताना प्रशासकीय कार्यालयात",
        scores: { conventional: 25, artistic: 10 }
      },
      {
        textEn: "Running a thriving local enterprising or cooperative providing jobs to others",
        textMr: "स्थानिक व्यवसाय किंवा सहकारी संस्था चालवून इतरांना रोजगार देताना",
        scores: { enterprising: 25, realistic: 10 }
      }
    ]
  }
];

/**
 * GET /api/assessment/questions
 * Returns the 5 adaptive RIASEC questions in English & Marathi
 */
router.get("/questions", (_req, res) => {
  res.json({
    count: ASSESSMENT_QUESTIONS.length,
    questions: ASSESSMENT_QUESTIONS
  });
});

/**
 * POST /api/assessment
 * Submits assessment answers and computes/records domain scores
 */
router.post("/", async (req, res, next) => {
  try {
    const { studentId, answers, directScores } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: "studentId is required." });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ error: `Student with id '${studentId}' not found.` });
    }

    let realistic = 0;
    let enterprising = 0;
    let social = 0;
    let conventional = 0;
    let artistic = 0;
    let investigative = 0;

    if (directScores) {
      // Direct scores passed from frontend
      realistic = Number(directScores.realistic ?? 0);
      enterprising = Number(directScores.enterprising ?? 0);
      social = Number(directScores.social ?? 0);
      conventional = Number(directScores.conventional ?? 0);
      artistic = Number(directScores.artistic ?? 0);
      investigative = Number(directScores.investigative ?? 0);
    } else if (Array.isArray(answers)) {
      // Calculate scores based on selected option index per question
      // answers can be [{ questionId: 1, selectedOptionIndex: 0 }, ...]
      for (const ans of answers) {
        const q = ASSESSMENT_QUESTIONS.find((item) => item.id === ans.questionId);
        if (q && q.options[ans.selectedOptionIndex]) {
          const sc = q.options[ans.selectedOptionIndex].scores;
          realistic += sc.realistic ?? 0;
          enterprising += sc.enterprising ?? 0;
          social += sc.social ?? 0;
          conventional += sc.conventional ?? 0;
          artistic += sc.artistic ?? 0;
          investigative += sc.investigative ?? 0;
        }
      }

      // Normalize scores to roughly 0-100 range
      const maxScore = Math.max(realistic, enterprising, social, conventional, artistic, investigative, 1);
      const normalize = (val: number) => Math.round((val / maxScore) * 100);

      realistic = normalize(realistic);
      enterprising = normalize(enterprising);
      social = normalize(social);
      conventional = normalize(conventional);
      artistic = normalize(artistic);
      investigative = normalize(investigative);
    } else {
      // Baseline defaults
      realistic = 60;
      enterprising = 50;
      social = 45;
      conventional = 50;
      artistic = 40;
      investigative = 55;
    }

    const assessment = await prisma.assessmentResult.upsert({
      where: { studentId },
      update: {
        realistic,
        enterprising,
        social,
        conventional,
        artistic,
        investigative,
        answers: answers ?? directScores ?? null
      },
      create: {
        studentId,
        realistic,
        enterprising,
        social,
        conventional,
        artistic,
        investigative,
        answers: answers ?? directScores ?? null
      }
    });

    // Automatically trigger recommendations generation
    const recommendationsPayload = await generateStudentRecommendations(studentId);

    return res.status(200).json({
      message: "Assessment recorded and recommendations generated.",
      assessment,
      recommendationsPayload
    });
  } catch (err) {
    next(err);
  }
});

export default router;
