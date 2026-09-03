import { Router } from "express";
import { prisma } from "../lib/prisma.ts";

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

    if (!educationLevel || !district) {
      return res.status(400).json({
        error: "educationLevel and district are required fields."
      });
    }

    const student = await prisma.student.create({
      data: {
        name: name || null,
        educationLevel,
        percentage: percentage !== undefined && percentage !== null ? parseFloat(percentage) : null,
        district,
        state,
        financialLevel: financialLevel || null,
        willingToMove: Boolean(willingToMove)
      }
    });

    return res.status(201).json({
      message: "Student profile created successfully.",
      student
    });
  } catch (err) {
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
