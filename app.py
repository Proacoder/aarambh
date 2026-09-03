"""
CareerMitra - Rural Student Career Opportunity Navigator (Maharashtra)
Flask frontend proxying to Node.js Backend API.
"""
import os
import uuid
import requests
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

@app.route("/onboarding")
def onboarding():
    try:
        districts = requests.get(f"{NODE_API_URL}/districts").json()
    except Exception:
        districts = []
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
    try:
        return jsonify(requests.get(f"{NODE_API_URL}/districts").json())
    except:
        return jsonify([])

@app.route("/api/assessment/questions")
def api_questions():
    try:
        data = requests.get(f"{NODE_API_URL}/assessment/questions").json()
        return jsonify(data.get("questions", []))
    except Exception:
        return jsonify([])

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
        print(e)
        return jsonify({"error": "node_api_error"}), 500

@app.route("/api/dashboard")
def api_dashboard():
    profile = session.get("profile")
    student_id = session.get("studentId")
    lang = session.get("lang", "en")
    
    if not profile or not student_id:
        return jsonify({"error": "incomplete"}), 400

    try:
        resp = requests.get(f"{NODE_API_URL}/action-plan/{student_id}?lang={lang}")
        node_data = resp.json()
        plan = node_data.get("actionPlan", {})
        
        career = plan.get("primaryCareerPath", {})
        
        matches = [{
            "id": career.get("domain", "realistic"),
            "name": f"{career.get('domain', '').capitalize()} Track",
            "description": career.get("summary", ""),
            "matchPct": career.get("domainAffinityScore", 90),
            "icon": "dY",
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
        print(e)
        return jsonify({"error": "node_api_error"}), 500

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
