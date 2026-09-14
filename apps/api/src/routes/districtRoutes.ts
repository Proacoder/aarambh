import { Router, type Router as RouterType } from "express";
import { MAHARASHTRA_DISTRICTS } from "../lib/geo.ts";

const router: RouterType = Router();
/**
 * GET /api/districts
 * Returns all 36 Maharashtra districts with coordinates for dropdowns and Leaflet maps.
 */
router.get("/", (_req, res) => {
  const districts = Object.values(MAHARASHTRA_DISTRICTS).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  res.json({
    count: districts.length,
    districts
  });
});

export default router;
