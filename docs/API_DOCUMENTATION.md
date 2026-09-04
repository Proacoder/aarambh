# CareerMitra API Documentation

Career Opportunity Navigator Backend for Rural & Tier-2/3 Students (Person 2 - Backend & Database).

## Base URL
```text
http://localhost:5000/api
```

---

## Quick Start for Team Members

```bash
# 1. Install dependencies
pnpm install

# 2. Seed realistic Maharashtra colleges & scholarships
pnpm --filter api db:seed

# 3. Run automated backend integration test
pnpm --filter api test

# 4. Start backend in development mode
pnpm --filter api dev
```

---

## Endpoints Overview

| Method | Endpoint | Description | Consumed By |
|---|---|---|---|
| `GET` | `/api/health` | Server & DB health check + counts | All |
| `GET` | `/api/districts` | All 36 Maharashtra districts with GPS coordinates | Person 1 (Dropdown) & Person 4 (Leaflet) |
| `POST` | `/api/students` | Register student / session profile | Person 1 (Onboarding Form) |
| `GET` | `/api/students/:id` | Fetch student with assessment and recommendations | Person 1 (Dashboard) |
| `GET` | `/api/assessment/questions` | 5 adaptive RIASEC questions in English & Marathi | Person 1 (Assessment UI) |
| `POST` | `/api/assessment` | Submit assessment answers / domain scores | Person 1 (Assessment Completion) |
| `GET` | `/api/recommendations/:studentId` | Deterministic recommendation engine results | Person 1 (Dashboard) |
| `GET` | `/api/colleges` | Colleges with course search, maxFees & geo-radius | Person 1 & Person 4 (Leaflet Map) |
| `GET` | `/api/colleges/:id` | Detailed college profile with all courses | Person 1 (College Modal/Page) |
| `GET` | `/api/scholarships` | Central & Maharashtra state scholarships | Person 1 (Scholarship Hub) |
| `GET` | `/api/scholarships/:id` | Scholarship detail with document checklist | Person 1 |
| `GET` | `/api/action-plan/:studentId` | Structured AI-ready action plan & roadmap bundle | Person 3 (Gemini) & Person 1 (PDF Generator) |

---

## Detailed Endpoint Specifications

### 1. Districts Endpoint
```http
GET /api/districts
```
**Response:**
```json
{
  "count": 36,
  "districts": [
    {
      "name": "Nanded",
      "marathiName": "नांदेड",
      "division": "Chhatrapati Sambhajinagar",
      "latitude": 19.1383,
      "longitude": 77.321
    },
    ...
  ]
}
```

---

### 2. Student Registration
```http
POST /api/students
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "Ramesh Pawar",
  "educationLevel": "10th Pass",
  "percentage": 74.5,
  "district": "Nanded",
  "state": "Maharashtra",
  "financialLevel": "Low",
  "willingToMove": false
}
```
**Response:**
```json
{
  "message": "Student profile created successfully.",
  "student": {
    "id": "cmtlgt...",
    "name": "Ramesh Pawar",
    "educationLevel": "10th Pass",
    "percentage": 74.5,
    "district": "Nanded",
    "financialLevel": "Low",
    "willingToMove": false
  }
}
```

---

### 3. Career Assessment Questions
```http
GET /api/assessment/questions
```
Returns 5 bilingual adaptive RIASEC questions with domain score points.

---

### 4. Submit Assessment Answers
```http
POST /api/assessment
Content-Type: application/json
```
**Option A: Submit answers array (indices of selected options):**
```json
{
  "studentId": "cmtlgt...",
  "answers": [
    { "questionId": 1, "selectedOptionIndex": 0 },
    { "questionId": 2, "selectedOptionIndex": 0 },
    { "questionId": 3, "selectedOptionIndex": 1 },
    { "questionId": 4, "selectedOptionIndex": 0 },
    { "questionId": 5, "selectedOptionIndex": 0 }
  ]
}
```
**Option B: Pass direct scores (0 to 100):**
```json
{
  "studentId": "cmtlgt...",
  "directScores": {
    "technology": 85,
    "science": 70,
    "business": 40,
    "government": 45,
    "healthcare": 30,
    "arts": 25
  }
}
```

---

### 5. Recommendation Engine (Deterministic)
```http
GET /api/recommendations/:studentId
```
**Weighting Formula:**
- Domain / Career Fit: **35%**
- Academic Eligibility: **25%** (**Hard Filter**: ineligibility strictly eliminates the course)
- Distance (Haversine Formula): **25%**
- Financial Fit & Subsidies: **15%**

**Sample Response:**
```json
{
  "student": { ... },
  "topDomains": [
    { "domain": "technology", "score": 85 },
    { "domain": "science", "score": 70 }
  ],
  "recommendations": [
    {
      "collegeId": "...",
      "collegeName": "Government Polytechnic, Nanded",
      "collegeType": "Government Polytechnic",
      "district": "Nanded",
      "latitude": 19.1624,
      "longitude": 77.3098,
      "distanceKm": 2.9,
      "courseName": "Diploma in Computer Engineering",
      "durationYears": 3,
      "approximateFees": 7800,
      "eligibilityPercentage": 55,
      "domainCategory": "technology",
      "overallScore": 94.8,
      "scores": {
        "domainFit": 85,
        "academicFit": 100,
        "distanceFit": 100,
        "financialFit": 100
      },
      "reasons": [
        "Academic Match: Your 74.5% meets the 55% eligibility cutoff (+19.5% margin).",
        "Local Accessibility: Located nearby in Nanded (~2.9 km from your district).",
        "Affordability: Government-subsidized fee of ₹7,800/yr with high scholarship eligibility."
      ]
    }
  ],
  "eligibleScholarships": [
    {
      "name": "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojna (EBC)",
      "amount": "50% Tuition Fee Reimbursement (Up to ₹50,000/yr)",
      "whyEligible": "Meets minimum 50% score requirement. Family income criteria (< ₹8 Lakhs) met...",
      "requiredDocuments": ["Income Certificate", "Domicile Certificate", "CAP Allotment Letter"]
    }
  ]
}
```

---

### 6. Colleges & Leaflet Map Integration
```http
GET /api/colleges?latitude=19.1383&longitude=77.3210&radiusKm=100
```
Query parameters:
- `district`: Filter by district name (e.g. `?district=Nanded` or `?district=Pune`)
- `type`: Filter by institution type (e.g. `?type=Polytechnic` or `?type=Government`)
- `course`: Search course name (e.g. `?course=Agriculture` or `?course=Computer`)
- `maxFees`: Filter maximum annual fee (e.g. `?maxFees=25000`)
- `latitude`, `longitude`, `radiusKm`: Filters and sorts colleges by distance in km from given coordinates (ideal for Leaflet map radius circle).

---

### 7. Action Plan Data Bundle (For Person 3 Gemini & Person 1 PDF Generator)
```http
GET /api/action-plan/:studentId
```
Returns a structured JSON payload containing:
- `student`: Full profile
- `primaryCareerPath`: Top domain, affinity score, summary, and top colleges with "Why You Qualify"
- `matchedScholarships`: Filtered eligible government/private scholarships
- `entranceExaminations`: Relevant exams (MHT-CET, NEET, DTE CAP, JEE, MCAER, MPSC) with schedules and portals
- `documentChecklist`: Complete deduplicated checklist of certificates required for admissions & scholarships
- `milestones`: 3-stage actionable roadmap (Stage 1: 30 days, Stage 2: Months 2-5, Stage 3: Months 5-8)
