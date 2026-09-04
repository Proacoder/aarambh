import { Router } from "express";
import { prisma } from "../lib/prisma.ts";
import {
  ValidationError,
  normalizeFinancialLevel,
  parseDistrict,
  parseEducationLevel,
  parsePercentage,
  parseStudentName,
  parseWillingToMove
} from "../lib/validation.ts";

const router = Router();

/**
 * POST /api/students
 * Register a new student or session-based student profile
 */
router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      educationLevel,
      percentage,
      district,
      state = "Maharashtra",
      financialLevel,
      willingToMove = false
    } = req.body;

    const parsedEducation = parseEducationLevel(educationLevel);
    const parsedDistrict = parseDistrict(district);
    const parsedPercentage = parsePercentage(percentage);
    const parsedFinancial = normalizeFinancialLevel(financialLevel);
    const parsedMove = parseWillingToMove(willingToMove, false);
    const parsedName = parseStudentName(name);

    const student = await prisma.student.create({
      data: {
        name: parsedName,
        educationLevel: parsedEducation,
        percentage: parsedPercentage,
        district: parsedDistrict,
        state: typeof state === "string" && state.trim() ? state.trim() : "Maharashtra",
        financialLevel: parsedFinancial,
        willingToMove: parsedMove
      }
    });

    return res.status(201).json({
      message: "Student profile created successfully.",
      student
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

/**
 * GET /api/students/:id
 * Fetch student profile along with assessment and recommendations
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        assessment: true,
        recommendations: {
          include: {
            college: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: `Student '${id}' not found.` });
    }

    return res.json({ student });
  } catch (err) {
    next(err);
  }
});

export default router;
