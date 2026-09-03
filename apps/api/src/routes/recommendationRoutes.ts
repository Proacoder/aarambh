import { Router } from "express";
import { generateStudentRecommendations } from "../services/recommendationService.ts";

const router = Router();

/**
 * GET /api/recommendations/:studentId
 * Runs the deterministic multi-factor recommendation engine (35% Domain, 25% Academic, 25% Distance, 15% Financial)
 */
router.get("/:studentId", async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const payload = await generateStudentRecommendations(studentId);
    return res.json(payload);
  } catch (err: any) {
    if (err.message && err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

export default router;
