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
      technology?: number;
      business?: number;
      healthcare?: number;
      government?: number;
      arts?: number;
      science?: number;
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
        scores: { technology: 30, science: 15 }
      },
      {
        textEn: "Treating sick people, health science, medicine, nursing care",
        textMr: "आजारी व्यक्तींची काळजी घेणे, आरोग्य विज्ञान, औषधनिर्माण आणि नर्सिंग",
        scores: { healthcare: 30, science: 20 }
      },
      {
        textEn: "Agriculture, modern farming techniques, dairy, food production",
        textMr: "शेती, आधुनिक कृषी तंत्रज्ञान, दुग्धव्यवसाय आणि अन्न प्रक्रिया",
        scores: { science: 25, technology: 15, business: 10 }
      },
      {
        textEn: "Running a business, shop, accounting, marketing, or cooperative",
        textMr: "स्वतःचा व्यवसाय, दुकान, हिशेब तपासणी, विक्री किंवा सहकारी संस्था",
        scores: { business: 30, arts: 10 }
      },
      {
        textEn: "Public administration, police, talathi, MPSC, social welfare work",
        textMr: "सरकारी सेवा, पोलीस, तलाठी, स्पर्धा परीक्षा (MPSC) आणि समाजकार्य",
        scores: { government: 30, arts: 15 }
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
        scores: { technology: 25, science: 15 }
      },
      {
        textEn: "Understanding biology, health diagnosis, and directly helping individuals",
        textMr: "जैविक प्रक्रिया समजून घेऊन आणि थेट लोकांच्या आरोग्याला मदत करून",
        scores: { healthcare: 25, science: 15 }
      },
      {
        textEn: "Calculating profits, managing money, and negotiating deals",
        textMr: "नफा-तोटा हिशोब करून, पैशांचे नियोजन आणि सौदे करून",
        scores: { business: 25, government: 10 }
      },
      {
        textEn: "Studying rules, laws, and working within community or government systems",
        textMr: "नियम, कायदे आणि शासकीय किंवा सामाजिक यंत्रणा समजून घेऊन",
        scores: { government: 25, arts: 15 }
      },
      {
        textEn: "Creative writing, art, history, communication, or teaching",
        textMr: "सर्जनशील लेखन, कला, इतिहास, संवाद किंवा अध्यापन",
        scores: { arts: 30, government: 10 }
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
        scores: { technology: 20, business: 15 }
      },
      {
        textEn: "A 3-year professional polytechnic diploma or degree for stable industry jobs",
        textMr: "उद्योग क्षेत्रात स्थिर नोकरीसाठी ३ वर्षांचा पदविका (Polytechnic) किंवा पदवी अभ्यासक्रम",
        scores: { technology: 20, science: 15 }
      },
      {
        textEn: "A 4-5 year specialized professional degree (Engineering, Medical, Agri, Pharmacy)",
        textMr: "४-५ वर्षांची व्यावसायिक पदवी (अभियांत्रिकी, वैद्यकीय, कृषी किंवा फार्मसी)",
        scores: { healthcare: 20, science: 20, technology: 15 }
      },
      {
        textEn: "Preparing for competitive government exams (MPSC, Police Bharti, Talathi, Banking)",
        textMr: "सरकारी नोकरी स्पर्धा परीक्षांची तयारी (MPSC, पोलीस भरती, तलाठी, बँक)",
        scores: { government: 25, business: 10 }
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
        scores: { technology: 25, science: 20 }
      },
      {
        textEn: "Biology, Chemistry, Environmental Studies",
        textMr: "जीवशास्त्र, रसायनशास्त्र, पर्यावरण अभ्यास",
        scores: { science: 25, healthcare: 20 }
      },
      {
        textEn: "Commerce, Bookkeeping, Economics, Basic Math",
        textMr: "वाणिज्य, हिशोब, अर्थशास्त्र आणि व्यवहारज्ञान",
        scores: { business: 25, government: 10 }
      },
      {
        textEn: "History, Civics, Politics, Languages",
        textMr: "इतिहास, नागरिकशास्त्र, राज्यशास्त्र आणि भाषा",
        scores: { government: 20, arts: 25 }
      }
    ]
  },
  {
    id: 5,
    questionEn: "Where would you feel most accomplished working 5 years from now?",
    questionMr: "५ वर्षांनंतर स्वतःला कोणत्या कार्यक्षेत्रात पाहणे तुम्हाला सर्वात जास्त अभिमानास्पद वाटेल?",
    options: [
      {
        textEn: "In a technology firm, software lab, or running an engineering workshop",
        textMr: "माहिती तंत्रज्ञान कंपनीत, सॉफ्टवेअर लॅबमध्ये किंवा स्वतःच्या इंजिनिअरिंग वर्कशॉपमध्ये",
        scores: { technology: 25, science: 10 }
      },
      {
        textEn: "In a primary health center, hospital, or community medical clinic",
        textMr: "प्राथमिक आरोग्य केंद्रात, रुग्णालयात किंवा औषध निर्माण केंद्रात",
        scores: { healthcare: 25, science: 15 }
      },
      {
        textEn: "Leading modern agricultural development, farm exports, or rural enterprise",
        textMr: "आधुनिक शेती, कृषी निर्यात किंवा ग्रामीण कृषी उद्योगाचे नेतृत्व करताना",
        scores: { science: 20, business: 20 }
      },
      {
        textEn: "As a government officer serving citizens in administrative offices",
        textMr: "शासकीय अधिकारी म्हणून जनतेची सेवा करताना प्रशासकीय कार्यालयात",
        scores: { government: 25, arts: 10 }
      },
      {
        textEn: "Running a thriving local business or cooperative providing jobs to others",
        textMr: "स्थानिक व्यवसाय किंवा सहकारी संस्था चालवून इतरांना रोजगार देताना",
        scores: { business: 25, technology: 10 }
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

    let technology = 0;
    let business = 0;
    let healthcare = 0;
    let government = 0;
    let arts = 0;
    let science = 0;

    if (directScores) {
      // Direct scores passed from frontend
      technology = Number(directScores.technology ?? 0);
      business = Number(directScores.business ?? 0);
      healthcare = Number(directScores.healthcare ?? 0);
      government = Number(directScores.government ?? 0);
      arts = Number(directScores.arts ?? 0);
      science = Number(directScores.science ?? 0);
    } else if (Array.isArray(answers)) {
      // Calculate scores based on selected option index per question
      // answers can be [{ questionId: 1, selectedOptionIndex: 0 }, ...]
      for (const ans of answers) {
        const q = ASSESSMENT_QUESTIONS.find((item) => item.id === ans.questionId);
        if (q && q.options[ans.selectedOptionIndex]) {
          const sc = q.options[ans.selectedOptionIndex].scores;
          technology += sc.technology ?? 0;
          business += sc.business ?? 0;
          healthcare += sc.healthcare ?? 0;
          government += sc.government ?? 0;
          arts += sc.arts ?? 0;
          science += sc.science ?? 0;
        }
      }

      // Normalize scores to roughly 0-100 range
      const maxScore = Math.max(technology, business, healthcare, government, arts, science, 1);
      const normalize = (val: number) => Math.round((val / maxScore) * 100);

      technology = normalize(technology);
      business = normalize(business);
      healthcare = normalize(healthcare);
      government = normalize(government);
      arts = normalize(arts);
      science = normalize(science);
    } else {
      // Baseline defaults
      technology = 60;
      business = 50;
      healthcare = 45;
      government = 50;
      arts = 40;
      science = 55;
    }

    const assessment = await prisma.assessmentResult.upsert({
      where: { studentId },
      update: {
        technology,
        business,
        healthcare,
        government,
        arts,
        science,
        answers: answers ?? directScores ?? null
      },
      create: {
        studentId,
        technology,
        business,
        healthcare,
        government,
        arts,
        science,
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
