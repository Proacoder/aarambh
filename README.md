# CareerMitra (AARAMBH) 🎯
### Rural Student Career Opportunity Navigator

CareerMitra is a multilingual career guidance platform designed for rural and Tier-2/3 students in Maharashtra to discover verified career pathways, government colleges, polytechnics, scholarships, entrance examinations, and actionable next steps.

---

## 🏗️ Architecture & Team Roles

| Role | Responsibility | Tech Stack | Status |
|---|---|---|---|
| **Person 1** | Frontend Lead | Next.js 14, Tailwind CSS, shadcn/ui, jsPDF | In Progress |
| **Person 2 (You)** | Backend + Database | Express, TypeScript, Prisma 7, PostgreSQL (Supabase) | **Complete & Verified** |
| **Person 3 (Nishad)** | AI + Data Pipeline | Google Gemini (`@google/genai`), Regional Datasets | **Merged & Integrated** |
| **Person 4** | Maps + Demo | Leaflet, OpenStreetMap, Regional GeoJSON | Integrated with API |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Seed the Database
Populates PostgreSQL with 33+ Maharashtra colleges, 125 courses, and 9 central/state scholarships:
```bash
pnpm seed
```

### 3. Run Backend Integration Test
Verifies database integrity, Haversine formula distance calculations, academic hard filtering, and scholarship matching:
```bash
pnpm test
```

### 4. Run AI Pipeline Test
Tests data matcher and Gemini 1.5 Flash action plan generator:
```bash
pnpm test:ai
```

### 5. Start Backend Server
```bash
pnpm dev:api
```
Server runs at `http://localhost:5000` (or configured `PORT`).

---

## 📡 API Overview

Complete API documentation and sample payloads are in [docs/API_DOCUMENTATION.md](file:///Users/dhanashree/Ignite/AARAMBH/docs/API_DOCUMENTATION.md).

- `GET /api/health` - Health check and live entity counts
- `GET /api/districts` - 36 Maharashtra districts with GPS coordinates for Leaflet maps
- `POST /api/students` - Student / session profile creation
- `GET /api/assessment/questions` - 5-question bilingual (EN/MR) RIASEC assessment
- `POST /api/assessment` - Assessment submission and domain scoring
- `GET /api/recommendations/:studentId` - Deterministic recommendations (35% Domain, 25% Academic Hard Filter, 25% Distance, 15% Financial)
- `GET /api/colleges` - College search with max fee and Leaflet map radius filtering
- `GET /api/scholarships` - Filterable scholarships with document checklists
- `GET /api/action-plan/:studentId` - Comprehensive Career Action Plan with Gemini AI narrative and 3-stage roadmap
