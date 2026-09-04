import { Router } from "express";
import { prisma } from "../lib/prisma.ts";
import { calculateHaversineDistance } from "../lib/geo.ts";

const router = Router();

/**
 * GET /api/colleges
 * Lists colleges with flexible filtering: district, type, course search, maxFees, and geo-radius for Leaflet maps
 */
router.get("/", async (req, res, next) => {
  try {
    const {
      district,
      type,
      course,
      maxFees,
      latitude,
      longitude,
      radiusKm
    } = req.query;

    const where: any = {};

    if (district) {
      where.district = {
        equals: String(district),
        mode: "insensitive"
      };
    }

    if (type) {
      where.type = {
        contains: String(type),
        mode: "insensitive"
      };
    }

    if (course || maxFees) {
      where.courses = {
        some: {
          ...(course && {
            name: {
              contains: String(course),
              mode: "insensitive"
            }
          }),
          ...(maxFees && {
            approximateFees: {
              lte: parseFloat(String(maxFees))
            }
          })
        }
      };
    }

    let colleges = await prisma.college.findMany({
      where,
      include: {
        courses: true
      },
      orderBy: {
        name: "asc"
      }
    });

    // If geographic coordinates and radius are provided, filter and sort by distance for map view
    if (latitude && longitude) {
      const userLat = parseFloat(String(latitude));
      const userLon = parseFloat(String(longitude));
      const maxRadius = radiusKm ? parseFloat(String(radiusKm)) : 300;

      colleges = colleges
        .map((col) => {
          const dist = calculateHaversineDistance(userLat, userLon, col.latitude, col.longitude);
          return {
            ...col,
            distanceKm: dist
          };
        })
        .filter((col) => col.distanceKm <= maxRadius)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return res.json({
      count: colleges.length,
      colleges
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/colleges/:id
 * Retrieve single college details with courses
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const college = await prisma.college.findUnique({
      where: { id },
      include: {
        courses: true
      }
    });

    if (!college) {
      return res.status(404).json({ error: `College '${id}' not found.` });
    }

    return res.json({ college });
  } catch (err) {
    next(err);
  }
});

export default router;
