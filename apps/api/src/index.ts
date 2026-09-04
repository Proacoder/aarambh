import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.ts";

import studentRoutes from "./routes/studentRoutes.ts";
import assessmentRoutes from "./routes/assessmentRoutes.ts";
import recommendationRoutes from "./routes/recommendationRoutes.ts";
import collegeRoutes from "./routes/collegeRoutes.ts";
import scholarshipRoutes from "./routes/scholarshipRoutes.ts";
import districtRoutes from "./routes/districtRoutes.ts";
import actionPlanRoutes from "./routes/actionPlanRoutes.ts";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString().split("T")[1].slice(0, 8)}] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get("/api/health", async (_req, res) => {
  try {
    const [collegeCount, courseCount, scholarshipCount] = await Promise.all([
      prisma.college.count(),
      prisma.collegeCourse.count(),
      prisma.scholarship.count()
    ]);

    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        colleges: collegeCount,
        courses: courseCount,
        scholarships: scholarshipCount
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: "degraded",
      database: {
        connected: false,
        error: err.message
      }
    });
  }
});

// Mount Routes
app.use("/api/students", studentRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/action-plan", actionPlanRoutes);

// Root fallback
app.get("/", (_req, res) => {
  res.json({
    name: "CareerMitra API",
    description: "Rural Student Career Opportunity Navigator Backend",
    version: "1.0.0",
    endpoints: [
      "/api/health",
      "/api/districts",
      "/api/students",
      "/api/assessment/questions",
      "/api/assessment",
      "/api/recommendations/:studentId",
      "/api/colleges",
      "/api/colleges/:id",
      "/api/scholarships",
      "/api/scholarships/:id",
      "/api/action-plan/:studentId"
    ]
  });
});

// Centralized error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ API Error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error"
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 CareerMitra API server running on http://localhost:${PORT}`);
});

export default app;
