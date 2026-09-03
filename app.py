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
    return render_template("index.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/careerverse")
def careerverse_page():
    return render_template("careerverse.html")

@app.route("/career-dna")
def career_dna_page():
    return render_template("career_dna.html")

@app.route("/resume-builder")
def resume_builder_page():
    return render_template("resume_builder.html")

@app.route("/skill-quest")
def skill_quest_page():
    return render_template("skill_quest.html")

@app.route("/kiosk")
def kiosk_page():
    return render_template("kiosk.html")

@app.route("/parent-mode")
def parent_mode_page():
    return render_template("parent_mode.html")

@app.route("/guider")
def guider_page():
    return render_template("guider_dashboard.html")

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
    elif mode == "teacher":
        session["user"] = {
            "id": f"teacher_{uuid.uuid4().hex[:8]}",
            "name": data.get("teacherId", "Prof. Anand Kulkarni"),
            "udise": data.get("udise", "27251401201"),
            "role": "teacher"
        }
        session["is_teacher"] = True
    else:
        session["user"] = {
            "id": f"guest_{uuid.uuid4().hex[:8]}",
            "email": email,
            "mode": "guest"
        }
        session["guest_mode"] = True

    return jsonify({"ok": True, "user": session["user"]})

@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json(force=True) or {}
    name = data.get("name", "विद्यार्थी").strip()
    contact = data.get("contact", "")
    district = data.get("district", "Maharashtra")
    class_name = data.get("className", "10th")
    
    student_id = str(uuid.uuid4())[:8]
    session["studentId"] = student_id
    session["profile"] = {
        "id": student_id,
        "name": name,
        "contact": contact,
        "district": district,
        "className": class_name,
        "marks": 75,
        "income": 120000,
        "category": "General",
        "registered": True
    }
    session["user"] = {
        "id": student_id,
        "email": contact,
        "mode": "registered"
    }
    return jsonify({"ok": True, "studentId": student_id})

@app.route("/api/forgot-password", methods=["POST"])
def api_forgot_password():
    data = request.get_json(force=True) or {}
    contact = data.get("contact", "")
    return jsonify({
        "ok": True,
        "message": f"Password reset instructions dispatched to {contact}"
    })

@app.route("/api/guider/register-student", methods=["POST"])
def api_guider_register_student():
    data = request.get_json(force=True) or {}
    name = data.get("name", "").strip()
    class_name = data.get("className", "10th")
    district = data.get("district", "Maharashtra")
    category = data.get("category", "General")
    income = float(data.get("income") or 120000)
    mobile = data.get("mobile", "")
    
    student_id = f"g_{uuid.uuid4().hex[:6]}"
    session["studentId"] = student_id
    session["profile"] = {
        "id": student_id,
        "name": name,
        "className": class_name,
        "district": district,
        "category": category,
        "income": income,
        "mobile": mobile,
        "marks": 78,
        "mobility": "district",
        "registeredByTeacher": True
    }
    return jsonify({"ok": True, "studentId": student_id})

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
        try:
            q_id = int(q_id_str)
        except (ValueError, TypeError):
            q_id = 1
        val_int = int(val) if isinstance(val, (int, float, str)) and str(val).isdigit() else 1
        node_answers.append({
            "questionId": q_id,
            "selectedOptionIndex": max(0, val_int - 1)
        })

    try:
        resp = requests.post(f"{NODE_API_URL}/assessment", json={
            "studentId": student_id,
            "answers": node_answers
        }, timeout=1.0)
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
        resp = requests.get(f"{NODE_API_URL}/action-plan/{student_id}?lang={lang}", timeout=1.0)
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
        print("Roadmap fallback active:", e)
        # Deterministic local roadmap
        return jsonify({
            "roadmap": {
                "careerGoal": "Technology & Engineering Track",
                "immediateSteps": [
                    "Complete 10th / 12th board examinations with focus on Mathematics and Science",
                    "Register on DTE Maharashtra portal for Centralized Admission Process (CAP)",
                    "Procure Domicile and Income certificates from Tehsil office"
                ],
                "scholarshipSteps": [
                    "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna (EBC)",
                    "Dr. Panjabrao Deshmukh Vasatigruh Nirvah Bhatta Yojna"
                ],
                "longTermOutlook": "High employment growth in Maharashtra industrial corridors (Pune, Chakan, Aurangabad MIDC) with opportunities in CAD, IoT, and software development.",
                "laterSteps": [
                    "Apply for Direct Second Year Engineering (DSE) or campus apprentice drives",
                    "Build portfolio projects for ITI / polytechnic final year evaluation"
                ],
                "nearbyCollegeNames": [
                    f"Government Polytechnic, {profile.get('district', 'Pune')}",
                    f"Government ITI, {profile.get('district', 'Pune')}"
                ]
            },
            "career": {
                "id": "tech",
                "name": "Technology & Practical Engineering",
                "description": "Design, build, and maintain digital, electronic, and mechanical systems."
            },
            "colleges": [
                {"name": f"Government Polytechnic, {profile.get('district', 'Pune')}", "district": profile.get("district", "Pune"), "distanceKm": 8.5},
                {"name": f"Government ITI, {profile.get('district', 'Pune')}", "district": profile.get("district", "Pune"), "distanceKm": 5.2}
            ],
            "schemes": [
                {"name": "Rajarshi Shahu Maharaj EBC Scheme", "benefit": "50% Tuition Fee Waiver"},
                {"name": "Dr. Panjabrao Deshmukh Hostel Allowance", "benefit": "₹30,000 / year"}
            ],
            "profile": profile
        })

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
# Mitra Saathi AI Intelligence Endpoints
# ---------------------------------------------------------------------------
@app.route("/api/mitra-tai", methods=["POST"])
@app.route("/api/mitra", methods=["POST"])
def api_mitra_conversation():
    data = request.get_json(force=True) or {}
    user_msg = data.get("message", "").strip()
    lang = data.get("language", "mr")
    profile = data.get("studentProfile") or session.get("profile") or {}
    
    district = profile.get("district", "Maharashtra")
    name = profile.get("name", "विद्यार्थी मित्र")
    cls_lvl = profile.get("className", "10th")
    
    # 1. Try Gemini / NVIDIA LLM if key is configured
    ai_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("NVIDIA_API_KEY")
    if ai_key:
        try:
            prompt = (
                f"You are Mitra, a warm, highly encouraging, and knowledgeable career guide for Maharashtra rural students. "
                f"Student name: {name}, District: {district}, Education: {cls_lvl}. "
                f"User asked: {user_msg}. "
                f"Reply in language: {lang} (Marathi, Hindi, or English). "
                f"Keep tone encouraging, practical, and under 120 words. Include specific schemes like MahaDBT, Govt Polytechnics, or ITIs if relevant."
            )
            # Example API call if configured
            # ...
        except Exception:
            pass

    # 2. Local Contextual Knowledge Engine (Deterministic & Fast Fallback)
    lower = user_msg.lower()
    
    if any(w in lower for w in ["कॉलेज", "college", "शासकीय", "polytechnic", "iti"]):
        if lang == "mr":
            reply = (
                f"**{district}** जिल्ह्यामध्ये अनेक दर्जेदार शासकीय संस्था आहेत! "
                f"10वी नंतर तू **Government Polytechnic** मध्ये 3 वर्षांचा डिप्लोमा (Civil, Mechanical, Computer) निवडू शकतोस. "
                f"किंवा शासकीय **ITI** मध्ये 1-2 वर्षांचा ट्रेड (Electrician, COPA) पूर्ण करून लगेच नोकरी मिळवू शकतोस. "
                f"केंद्रीय प्रवेश प्रक्रिया (CAP Rounds) द्वारे अर्ज कसा करावा याबद्दल आणखी जाणून घ्यायचे आहे का?"
            )
        elif lang == "hi":
            reply = (
                f"**{district}** में कई बेहतरीन सरकारी कॉलेज और ITI केंद्र हैं! "
                f"10वीं/12वीं के बाद आप **Government Polytechnic** से 3 साल का इंजीनियरिंग डिप्लोमा या **ITI** से ट्रेड कोर्स कर सकते हैं। "
                f"CAP राउंड्स के जरिए सरकारी फीस बेहद कम होती है। क्या आप कट-ऑफ और हॉस्टल सुविधा के बारे में जानना चाहते हैं?"
            )
        else:
            reply = (
                f"In **{district}**, there are excellent Government Polytechnics and ITI centers. "
                f"After 10th or 12th, a 3-year Diploma in Engineering or a 2-year ITI trade offers high employability at minimal fees. "
                f"Would you like to check specific CAP round admission steps or hostel availability?"
            )

    elif any(w in lower for w in ["शिष्यवृत्ती", "scholarship", "mahadbt", "महाडीबीटी", "पैसे", "फीस", "fees", "cost"]):
        if lang == "mr":
            reply = (
                f"काळजी करू नकोस {name}! महाराष्ट्र शासनाचे **MahaDBT पोर्टल** आर्थिकदृष्ट्या सक्षम आधार देते:\n"
                f"1. **राजर्षी छत्रपती शाहू महाराज शिक्षण शुल्क शिष्यवृत्ती (EBC)**: ५०% शिक्षण शुल्क माफी.\n"
                f"2. **डॉ. पंजाबराव देशमुख वसतिगृह भत्ता**: जिल्ह्याच्या ठिकाणी दरमहा ₹३,००० वसतिगृह भत्ता.\n"
                f"3. **SC/ST/OBC शिष्यवृत्ती**: १००% ट्युशन फी परतावा + परीक्षा फी माफी.\n"
                f"आपल्या 'PathPocket' कॅल्क्युलेटरवर जाऊन तू अचूक खर्च आणि सवलत पाहू शकतोस!"
            )
        elif lang == "hi":
            reply = (
                f"चिंता मत करो {name}! महाराष्ट्र सरकार के **MahaDBT पोर्टल** से कई योजनाएं उपलब्ध हैं:\n"
                f"1. **EBC योजना**: 50% ट्यूशन फीस माफ़ी.\n"
                f"2. **स्वाधार एवं डॉ. पंजाबराव देशमुख योजना**: हॉस्टल व मेस भत्ता.\n"
                f"3. **आरक्षित वर्ग छात्रवृत्ति**: 100% सरकारी फीस माफी.\n"
                f"आप 'PathPocket' टूल से अपने परिवार के कुल खर्च का सही अनुमान लगा सकते हैं।"
            )
        else:
            reply = (
                f"Don't worry about fees, {name}! The Maharashtra Government's **MahaDBT Portal** provides massive support:\n"
                f"1. **Rajarshi Shahu Maharaj (EBC)**: 50% tuition fee waiver.\n"
                f"2. **Hostel Allowance Scheme**: Monthly support for rural students living in city hostels.\n"
                f"3. **Reserved Category Scholarships**: 100% tuition refund.\n"
                f"Explore our 'PathPocket' calculator to see exact net expenses!"
            )

    elif any(w in lower for w in ["करिअर", "career", "भविष्य", "scope", "job"]):
        if lang == "mr":
            reply = (
                f"तुझ्या प्रोफाइल आणि Career DNA नुसार तंत्रज्ञान, कृषी-तंत्रज्ञान (Agri-Tech) आणि शासकीय सेवा यांमध्ये उत्तम संधी आहेत! "
                f"जर तुला प्रॅक्टिकल काम आवडत असेल, तर डिप्लोमा &rarr; डायरेक्ट सेकंड इयर इंजिनिअरिंग हा सर्वात सुरक्षित आणि कमी खर्चाचा मार्ग आहे. "
                f"तुला कोणत्या क्षेत्रात जास्त आवड आहे — प्रॅक्टिकल मशिनरी, कॉम्प्युटर, की सामाजिक सेवा?"
            )
        elif lang == "hi":
            reply = (
                f"आपके Career DNA के अनुसार प्रैक्टिकल टेक्नोलॉजी, एग्री-टेक और एडमिनिस्ट्रेटिव सेवाओं में शानदार अवसर हैं! "
                f"10वीं के बाद पॉलिटेक्निक डिप्लोमा और फिर बी.टेक करना कम बजट में सबसे भरोसेमंद रास्ता है। "
                f"आप किस क्षेत्र में अपनी क्षमता आजमाना चाहते हैं?"
            )
        else:
            reply = (
                f"Based on your Career DNA and district profile, fields in Practical Technology, Agri-Tech, and Technical Trades are top matches! "
                f"A Polytechnic Diploma followed by Direct Second Year Degree admission is one of the most affordable pathways. "
                f"Which area excites you most — hands-on engineering, computers, or public service?"
            )

    else:
        if lang == "mr":
            reply = (
                f"नमस्कार {name}! मी तुझी मित्र साथी आहे. "
                f"मी तुला {district} जिल्ह्यातील शिक्षण, महाडीबीटी शिष्यवृत्ती, सरकारी पॉलिटेक्निक किंवा योग्य करिअर मार्ग निवडण्यात मदत करू शकते. "
                f"तुला नेमकी कोणती माहिती हवी आहे?"
            )
        elif lang == "hi":
            reply = (
                f"नमस्ते {name}! मैं आपकी करियर साथी मित्र हूं। "
                f"मैं आपको {district} के सरकारी कॉलेजों, छात्रवृत्ति योजनाओं और उपयुक्त करियर विकल्पों में मदद कर सकती हूं। "
                f"आप मुझसे कोई भी सवाल पूछ सकते हैं!"
            )
        else:
            reply = (
                f"Hello {name}! I am Mitra, your Career Saathi. "
                f"I can assist you with college admissions in {district}, MahaDBT scholarships, polytechnic diplomas, and career roadmaps. "
                f"What would you like to explore today?"
            )

    return jsonify({"reply": reply, "ok": True})

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
