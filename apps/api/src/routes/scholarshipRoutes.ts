import { Router } from "express";
import { prisma } from "../lib/prisma.ts";

const router = Router();

/**
 * GET /api/scholarships
 * List all scholarships with optional eligibility filters
 */
router.get("/", async (req, res, next) => {
  try {
    const { percentage, financialLevel, educationLevel } = req.query;

    const scholarships = await prisma.scholarship.findMany({
      orderBy: { name: "asc" }
    });

    if (!percentage && !financialLevel && !educationLevel) {
      return res.json({
        count: scholarships.length,
        scholarships
      });
    }

    // Filter by student parameters if provided
    const userPct = percentage ? parseFloat(String(percentage)) : null;
    const userFin = financialLevel ? String(financialLevel).toLowerCase() : null;
    const userEdu = educationLevel ? String(educationLevel).toLowerCase() : null;

    const filtered = scholarships.filter((s) => {
      const el = s.eligibility as Record<string, any> | null;
      if (!el) return true;

      // Check minPercentage
      if (userPct !== null && typeof el.minPercentage === "number") {
        if (userPct < el.minPercentage) return false;
      }

      // Check education level if specified
      if (userEdu && Array.isArray(el.educationLevels)) {
        const matchesEdu = el.educationLevels.some((e: string) =>
          userEdu.includes(e.toLowerCase()) || e.toLowerCase().includes(userEdu)
        );
        if (!matchesEdu) return false;
      }

      return true;
    });

    return res.json({
      count: filtered.length,
      scholarships: filtered
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/scholarships/:id
 * Single scholarship details
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const scholarship = await prisma.scholarship.findUnique({
      where: { id }
    });

    if (!scholarship) {
      return res.status(404).json({ error: `Scholarship '${id}' not found.` });
    }

    return res.json({ scholarship });
  } catch (err) {
    next(err);
  }
});

export default router;
