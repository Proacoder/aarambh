"""
CareerMitra - Rural Student Career Opportunity Navigator (Maharashtra)
Flask frontend proxying to Node.js Backend API.
"""
import os
import uuid
import requests
import math
from pathlib import Path

from flask import Flask, render_template, request, jsonify, session, send_from_directory

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "careermitra-dev-secret-change-me")

NODE_API_URL = "http://localhost:3000/api"

# ---------------------------------------------------------------------------
# Page routes (serve HTML templates)
# ---------------------------------------------------------------------------
@app.route("/")
def landing():
    return render_template("login.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(force=True) or {}
    mode = data.get("mode", "guest")
    email = data.get("email")

    if mode == "google":
        session["user"] = {
            "id": f"google_{uuid.uuid4().hex[:8]}",
            "email": email or "student@gmail.com",
            "mode": "google"
        }
        session["guest_mode"] = False
    else:
        session["user"] = {
            "id": f"guest_{uuid.uuid4().hex[:8]}",
            "email": None,
            "mode": "guest"
        }
        session["guest_mode"] = True

    return jsonify({"ok": True, "user": session["user"]})

FALLBACK_DISTRICTS = [
    "Mumbai", "Thane", "Pune", "Nashik", "Nagpur", "Kolhapur", 
    "Satara", "Solapur", "Sangli", "Ahmednagar", "Ratnagiri", "Chhatrapati Sambhajinagar"
]

FALLBACK_QUESTIONS = [
  {
    "id": 1,
    "key": "q1",
    "textEn": "What kind of activities do you enjoy most in your free time?",
    "options": [
      { "textEn": "Building, repairing or fixing physical tools and equipment", "scores": { "realistic": 25 } },
      { "textEn": "Reading, solving puzzles, scientific research or math problems", "scores": { "investigative": 25 } },
      { "textEn": "Drawing, painting, writing, music or creative design", "scores": { "artistic": 25 } },
      { "textEn": "Helping people, teaching, community service or healthcare", "scores": { "social": 25 } },
      { "textEn": "Leading teams, starting a business, selling or organizing events", "scores": { "enterprising": 25 } }
    ]
  },
  {
    "id": 2,
    "key": "q2",
    "textEn": "Which environment excites you most for a career?",
    "options": [
      { "textEn": "Outdoors, farm, workshop or engineering site", "scores": { "realistic": 25 } },
      { "textEn": "Laboratory, research center or technology office", "scores": { "investigative": 25 } },
      { "textEn": "Studio, media house, or creative workspace", "scores": { "artistic": 25 } },
      { "textEn": "Hospital, school, social enterprise or NGO", "scores": { "social": 25 } },
      { "textEn": "Corporate office, startup, retail or trade hub", "scores": { "enterprising": 25 } }
    ]
  },
  {
    "id": 3,
    "key": "q3",
    "textEn": "How do you prefer to solve problems?",
    "options": [
      { "textEn": "Hands-on testing and mechanical fixing", "scores": { "realistic": 25 } },
      { "textEn": "Data analysis, logical thinking and step-by-step investigation", "scores": { "investigative": 25 } },
      { "textEn": "Out-of-the-box thinking and visual design", "scores": { "artistic": 25 } },
      { "textEn": "Discussion, empathy and team consensus", "scores": { "social": 25 } },
      { "textEn": "Strategic negotiation and decisive leadership", "scores": { "enterprising": 25 } }
    ]
  },
  {
    "id": 4,
    "key": "q4",
    "textEn": "Which school subjects do you find most engaging?",
    "options": [
      { "textEn": "Mathematics, Physics, Mechanics", "scores": { "realistic": 25 } },
      { "textEn": "Biology, Chemistry, Environmental Science", "scores": { "investigative": 25 } },
      { "textEn": "Arts, Literature, Languages", "scores": { "artistic": 25 } },
      { "textEn": "Social Studies, Civics, History", "scores": { "social": 25 } },
      { "textEn": "Economics, Commerce, Business Studies", "scores": { "enterprising": 25 } }
    ]
  },
  {
    "id": 5,
    "key": "q5",
    "textEn": "Where would you feel most accomplished working 5 years from now?",
    "options": [
      { "textEn": "Managing an engineering workshop, tech hub, or manufacturing unit", "scores": { "realistic": 25 } },
      { "textEn": "Leading scientific research or agricultural innovation", "scores": { "investigative": 25 } },
      { "textEn": "Creating media, design projects, or artistic products", "scores": { "artistic": 25 } },
      { "textEn": "Working in a hospital, PHC, or school serving rural society", "scores": { "social": 25 } },
      { "textEn": "Running a successful enterprise or government administrative department", "scores": { "enterprising": 25 } }
    ]
  }
]

def get_districts_list():
    try:
        res = requests.get(f"{NODE_API_URL}/districts", timeout=1.0).json()
        if isinstance(res, list) and len(res) > 0:
            return res
    except Exception:
        pass
    try:
        import json
        with open(DATA_DIR / "districts.json", encoding="utf-8") as f:
            d = json.load(f)
            return list(d.keys())
    except Exception:
        return FALLBACK_DISTRICTS

@app.route("/onboarding")
def onboarding():
    districts = get_districts_list()
    return render_template("onboarding.html", districts=districts)

@app.route("/assessment")
def assessment():
    return render_template("assessment.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/roadmap")
def roadmap_page():
    return render_template("roadmap.html")

@app.route("/all-colleges")
@app.route("/colleges")
def all_colleges_page():
    return render_template("all_colleges.html")

@app.route("/career-aunty")
@app.route("/mitra-tai")
def career_aunty_page():
    return render_template("career_aunty.html")

# ---------------------------------------------------------------------------
# API routes (JSON responses for frontend JS)
# ---------------------------------------------------------------------------

@app.route("/api/translations/<lang>")
def api_translations(lang):
    import json
    with open(DATA_DIR / "translations.json", encoding="utf-8") as f:
        t = json.load(f)
    return jsonify(t.get(lang, t["en"]))

@app.route("/api/districts")
def api_districts():
    return jsonify(get_districts_list())

@app.route("/api/assessment/questions")
def api_questions():
    try:
        data = requests.get(f"{NODE_API_URL}/assessment/questions", timeout=1.0).json()
        qs = data.get("questions", [])
        if qs and len(qs) > 0:
            return jsonify(qs)
    except Exception:
        pass
    return jsonify(FALLBACK_QUESTIONS)

@app.route("/api/profile", methods=["POST"])
def api_save_profile():
    data = request.get_json(force=True) or {}
    required = ["name", "className", "district"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "missing_fields"}), 400
    
    # Save to Node API
    try:
        node_payload = {
            "name": data.get("name", "").strip()[:60],
            "educationLevel": data.get("className"),
            "percentage": data.get("marks"),
            "district": data.get("district"),
            "financialLevel": str(data.get("income") or 0),
            "willingToMove": data.get("mobility") != "local"
        }
        resp = requests.post(f"{NODE_API_URL}/students", json=node_payload)
        node_data = resp.json()
        student_id = node_data.get("student", {}).get("id")
    except Exception as e:
        print("Node API error:", e)
        student_id = str(uuid.uuid4())[:8]

    profile = {
        "id": student_id,
        "name": data.get("name", "").strip()[:60],
        "age": data.get("age"),
        "className": data.get("className"),
        "district": data.get("district"),
        "taluka": data.get("taluka", "").strip()[:60],
        "marks": data.get("marks"),
        "income": float(data.get("income") or 0),
        "category": data.get("category", "General"),
        "gender": data.get("gender", ""),
        "disability": bool(data.get("disability", False)),
        "mobility": data.get("mobility", "district"),
        "budget": float(data.get("budget") or 0),
        "language": data.get("language", "en"),
    }
    session["profile"] = profile
    session["lang"] = profile["language"]
    session["studentId"] = student_id
    return jsonify({"ok": True, "profile": profile})

@app.route("/api/profile", methods=["GET"])
def api_get_profile():
    return jsonify(session.get("profile"))

@app.route("/api/assessment", methods=["POST"])
def api_submit_assessment():
    if "profile" not in session:
        return jsonify({"error": "no_profile"}), 400
    answers = (request.get_json(force=True) or {}).get("answers", {})
    
    student_id = session.get("studentId")
    if not student_id:
        return jsonify({"error": "no_student_id"}), 400

    node_answers = []
    for q_id_str, val in answers.items():
        node_answers.append({
            "questionId": int(q_id_str),
            "selectedOptionIndex": int(val) - 1
        })

    try:
        resp = requests.post(f"{NODE_API_URL}/assessment", json={
            "studentId": student_id,
            "answers": node_answers
        })
        node_data = resp.json()
        rec_payload = node_data.get("recommendationsPayload", {})
        
        top_domains = rec_payload.get("topDomains", [])
        
        matches = []
        if top_domains:
            domain = top_domains[0]["domain"]
            matches.append({
                "careerId": domain,
                "matchPct": top_domains[0]["score"],
                "topDims": [d["domain"] for d in top_domains[:2]]
            })
            
        session["matches"] = matches
        
        return jsonify({
            "matches": matches
        })
    except Exception as e:
        print("Node API submit fallback:", e)
        matches = [{
            "careerId": "realistic",
            "matchPct": 92,
            "topDims": ["realistic", "investigative"]
        }]
        session["matches"] = matches
        return jsonify({"matches": matches})

@app.route("/api/dashboard")
def api_dashboard():
    profile = session.get("profile")
    student_id = session.get("studentId")
    lang = session.get("lang", "en")
    
    if not profile:
        # Fallback profile for guest testing
        profile = {
            "id": session.get("studentId", "guest_123"),
            "name": "Guest Student",
            "className": "12th",
            "district": "Pune",
            "income": 150000,
            "category": "General"
        }
        session["profile"] = profile
        session["studentId"] = profile["id"]

    try:
        resp = requests.get(f"{NODE_API_URL}/action-plan/{profile['id']}?lang={lang}", timeout=1.0)
        node_data = resp.json()
        plan = node_data.get("actionPlan", {})
        
        career = plan.get("primaryCareerPath", {})
        
        matches = [{
            "id": career.get("domain", "realistic"),
            "name": f"{career.get('domain', '').capitalize()} Track",
            "description": career.get("summary", ""),
            "matchPct": career.get("domainAffinityScore", 90),
            "icon": "🎓",
            "topDims": [career.get("domain", "")]
        }]
        
        colleges = []
        for c in career.get("topRecommendedColleges", []):
            colleges.append({
                "id": c.get("collegeName"),
                "name": c.get("collegeName"),
                "district": c.get("district"),
                "type": "Institute",
                "category": "Education",
                "courses": [c.get("courseName")],
                "lat": 19.0,
                "lng": 75.0,
                "distanceKm": c.get("distanceKm", 10),
                "annualFee": c.get("approximateFees", "Subsidized"),
                "relevance": c.get("overallScore", 100)
            })
            
        schemes = []
        for s in plan.get("matchedScholarships", []):
            schemes.append({
                "id": s.get("name"),
                "name": s.get("name"),
                "provider": s.get("provider"),
                "maxIncome": 800000,
                "benefit": s.get("amount", "Financial Aid"),
                "requiredDocs": plan.get("documentChecklist", []),
                "applyUrl": s.get("officialUrl", "#")
            })
            
        return jsonify({
            "profile": profile,
            "matches": matches,
            "colleges": colleges,
            "schemes": schemes,
            "districtCenter": {"lat": 19.0, "lng": 75.0},
            "radiusKm": 50,
        })
    except Exception as e:
        print("Node API dashboard fallback:", e)
        import json
        colleges_data = []
        schemes_data = []
        try:
            with open(DATA_DIR / "colleges.json", encoding="utf-8") as f:
                colleges_data = json.load(f)[:6]
            with open(DATA_DIR / "schemes.json", encoding="utf-8") as f:
                schemes_data = json.load(f)[:4]
        except Exception:
            pass

        matches = [{
            "id": "realistic",
            "name": "Engineering & Technology Track",
            "description": "Strong alignment with practical problem-solving and technical education.",
            "matchPct": 92,
            "icon": "🎓",
            "topDims": ["realistic", "investigative"]
        }]

        colleges = []
        for c in colleges_data:
            colleges.append({
                "id": c.get("id", c.get("name")),
                "name": c.get("name"),
                "district": c.get("district"),
                "type": c.get("type", "Government"),
                "category": "Education",
                "courses": c.get("courses", ["Diploma / B.Tech"]),
                "lat": c.get("lat", 19.0),
                "lng": c.get("lng", 75.0),
                "distanceKm": 15.0,
                "annualFee": c.get("annualFee", 8000),
                "relevance": 95
            })

        schemes = []
        for s in schemes_data:
            schemes.append({
                "id": s.get("id", s.get("title")),
                "name": s.get("title"),
                "provider": s.get("provider"),
                "maxIncome": s.get("maxIncome", 800000),
                "benefit": s.get("benefits", "Fee waiver"),
                "requiredDocs": s.get("requiredDocs", ["Income Certificate", "Domicile"]),
                "applyUrl": s.get("applyUrl", "https://mahadbtmahait.gov.in")
            })

        return jsonify({
            "profile": profile,
            "matches": matches,
            "colleges": colleges,
            "schemes": schemes,
            "districtCenter": {"lat": 19.0, "lng": 75.0},
            "radiusKm": 50,
        })

@app.route("/api/roadmap")
def api_roadmap():
    student_id = session.get("studentId")
    profile = session.get("profile")
    lang = session.get("lang", "en")
    
    if not profile or not student_id:
        return jsonify({"error": "incomplete"}), 400

    try:
        resp = requests.get(f"{NODE_API_URL}/action-plan/{student_id}?lang={lang}")
        plan = resp.json().get("actionPlan", {})
        
        career = plan.get("primaryCareerPath", {})
        milestones = plan.get("milestones", [])
        
        immediate = []
        later = []
        if len(milestones) > 0:
            immediate = milestones[0].get("actions", [])
        if len(milestones) > 1:
            later = milestones[1].get("actions", [])
            
        roadmap = {
            "careerGoal": f"{career.get('domain', '').capitalize()} Track",
            "immediateSteps": immediate,
            "scholarshipSteps": [s.get("name") for s in plan.get("matchedScholarships", [])],
            "longTermOutlook": career.get("summary", ""),
            "laterSteps": later,
            "nearbyCollegeNames": [c.get("collegeName") for c in career.get("topRecommendedColleges", [])]
        }
        
        return jsonify({
            "roadmap": roadmap,
            "career": {
                "id": career.get("domain", "realistic"),
                "name": f"{career.get('domain', '').capitalize()} Track",
                "description": career.get("summary", ""),
            },
            "colleges": [{"name": c.get("collegeName"), "district": c.get("district"), "distanceKm": c.get("distanceKm")} for c in career.get("topRecommendedColleges", [])],
            "schemes": [{"name": s.get("name"), "benefit": s.get("amount")} for s in plan.get("matchedScholarships", [])],
            "profile": profile,
        })
    except Exception as e:
        print(e)
        return jsonify({"error": "node_api_error"}), 500

@app.route("/api/mitra-tai", methods=["POST"])
def api_mitra_tai():
    data = request.get_json(force=True) or {}
    message = data.get("message", "").strip()
    lang = data.get("language") or session.get("lang") or "mr"
    student_id = session.get("studentId")

    try:
        resp = requests.get(f"{NODE_API_URL}/action-plan/{student_id}?lang={lang}")
        plan = resp.json().get("actionPlan", {})
        ai_narrative = plan.get("aiNarrative")
        
        if ai_narrative and "Hello" not in message and "नमस्कार" not in message:
            reply = f"{ai_narrative.get('greeting', '')} {ai_narrative.get('roadmapExplanation', '')}"
        else:
            if lang == "mr":
                reply = "नमस्कार! मी मित्र ताई आहे. तुझा AI-Action Plan तयार आहे, डॅशबोर्डवर तपासा!"
            else:
                reply = "Hello! I am Mitra Tai. Your AI Action Plan is ready on the dashboard!"
                
        return jsonify({
            "reply": reply,
            "language": lang,
            "contextUsed": {}
        })
    except Exception as e:
        print(e)
        return jsonify({"reply": "I am currently unable to reach my AI brain. Please try again."})

@app.route("/api/reset", methods=["POST"])
def api_reset():
    session.clear()
    return jsonify({"ok": True})

@app.route("/cost-calculator")
def cost_calculator():
    return render_template("cost_calculator.html")

@app.route("/documents")
def documents():
    return render_template("documents.html")

@app.route("/exam-calendar")
def exam_calendar():
    return render_template("exam_calendar.html")

@app.route("/api/cost-calculator", methods=["POST"])
def api_cost_calculator():
    import json, math
    data = request.get_json(force=True) or {}
    college_id = data.get("collegeId")
    home_district = data.get("homeDistrict") or (session.get("profile", {}).get("district"))
    accommodation_type = data.get("accommodationType", "govtHostel")
    food_type = data.get("foodType", "collegeMess")
    family_income = data.get("familyIncome") or (session.get("profile", {}).get("income", 0))
    
    # Load data
    with open(DATA_DIR / "colleges.json", encoding="utf-8") as f:
        colleges = json.load(f)
    with open(DATA_DIR / "city_cost_index.json", encoding="utf-8") as f:
        cost_index = json.load(f)
    with open(DATA_DIR / "districts.json", encoding="utf-8") as f:
        districts = json.load(f)
    with open(DATA_DIR / "schemes.json", encoding="utf-8") as f:
        schemes = json.load(f)
    
    # Find college
    college = next((c for c in colleges if c["id"] == college_id), None)
    if not college:
        return jsonify({"error": "college_not_found"}), 404
    
    college_district = college["district"]
    costs = cost_index.get(college_district, cost_index.get("Pune"))  # fallback
    
    # Calculate travel distance
    home_coords = districts.get(home_district, {"lat": 19.0, "lng": 75.0})
    R = 6371.0
    lat1, lng1 = math.radians(home_coords["lat"]), math.radians(home_coords["lng"])
    lat2, lng2 = math.radians(college["lat"]), math.radians(college["lng"])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlng/2)**2
    distance_km = round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a)), 1)
    
    # Costs
    tuition = college.get("annualFee", 0)
    accom = costs["accommodation"].get(accommodation_type, costs["accommodation"]["govtHostel"])
    food = costs["food"].get(food_type, costs["food"]["collegeMess"])
    accom_annual = accom["monthly"] * 10  # 10 months (exclude summer)
    food_annual = food["monthly"] * 10
    local_transport_annual = costs["transport"]["localMonthlyPass"] * 10
    personal_annual = costs["personal"]["monthly"] * 10
    phone_annual = costs["phone"]["monthly"] * 12
    books_annual = costs["books"]["annual"]
    medical_annual = costs["medical"]["annual"]
    
    # Inter-city travel (MSRTC rate ~₹1.2/km, 5 round trips/year)
    st_bus_rate = 1.2
    trips_per_year = 5
    one_way_fare = round(distance_km * st_bus_rate)
    travel_annual = one_way_fare * 2 * trips_per_year
    
    subtotal = tuition + accom_annual + food_annual + travel_annual + local_transport_annual + personal_annual + phone_annual + books_annual + medical_annual
    emergency = round(subtotal * 0.05)
    total = subtotal + emergency
    
    # Scholarship deductions
    profile = session.get("profile", {})
    category = profile.get("category", data.get("category", "General"))
    income = float(family_income or 0)
    scholarship_total = 0
    matched_scholarships = []
    for s in schemes:
        if income and income > s.get("maxIncome", float("inf")):
            continue
        if category not in s.get("eligibleCategories", []):
            continue
        matched_scholarships.append({"name": s["title"], "benefit": s["benefits"]})
    
    # Estimate scholarship value (simplified)
    if any("tuition" in s["benefit"].lower() or "fee" in s["benefit"].lower() for s in matched_scholarships):
        scholarship_total += tuition
    if any("hostel" in s["benefit"].lower() for s in matched_scholarships):
        scholarship_total += min(30000, accom_annual)
    
    net_cost = max(0, total - scholarship_total)
    monthly_cost = round(net_cost / 12)
    family_monthly_income = round(income / 12) if income > 0 else 0
    income_pct = round((monthly_cost / family_monthly_income) * 100) if family_monthly_income > 0 else 0
    
    return jsonify({
        "college": {"name": college["name"], "district": college_district, "type": college["type"]},
        "homeDistrict": home_district,
        "distanceKm": distance_km,
        "breakdown": {
            "tuition": {"annual": tuition, "label": "Tuition & Fees"},
            "accommodation": {"annual": accom_annual, "monthly": accom["monthly"], "label": accom.get("label", accommodation_type)},
            "food": {"annual": food_annual, "monthly": food["monthly"], "label": food.get("label", food_type)},
            "travel": {"annual": travel_annual, "oneWayFare": one_way_fare, "tripsPerYear": trips_per_year, "label": f"ST Bus Travel ({trips_per_year} round trips)"},
            "localTransport": {"annual": local_transport_annual, "monthly": costs["transport"]["localMonthlyPass"], "label": costs["transport"]["label"]},
            "personal": {"annual": personal_annual, "monthly": costs["personal"]["monthly"], "label": "Personal & Miscellaneous"},
            "phone": {"annual": phone_annual, "monthly": costs["phone"]["monthly"], "label": costs["phone"]["label"]},
            "books": {"annual": books_annual, "label": costs["books"]["label"]},
            "medical": {"annual": medical_annual, "label": costs["medical"]["label"]},
            "emergency": {"annual": emergency, "label": "Emergency Fund (5%)"}
        },
        "totals": {
            "grossAnnual": total,
            "scholarshipDeduction": scholarship_total,
            "netAnnual": net_cost,
            "netMonthly": monthly_cost
        },
        "familyImpact": {
            "monthlyFamilyIncome": family_monthly_income,
            "incomePercentage": income_pct
        },
        "matchedScholarships": matched_scholarships[:5],
        "costTier": costs.get("tierLabel", "Unknown")
    })

@app.route("/api/exam-calendar")
def api_exam_calendar():
    import json
    education_level = request.args.get("level") or session.get("profile", {}).get("className", "")
    with open(DATA_DIR / "exam_calendar.json", encoding="utf-8") as f:
        exams = json.load(f)
    if education_level:
        exams = [e for e in exams if education_level in e.get("forEducationLevel", [])]
    return jsonify(exams)

# ---------------------------------------------------------------------------
# Serve PWA files from root
# ---------------------------------------------------------------------------
@app.route("/manifest.json")
def manifest():
    return send_from_directory(BASE_DIR, "manifest.json")

@app.route("/sw.js")
def service_worker():
    return send_from_directory(BASE_DIR, "sw.js")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
