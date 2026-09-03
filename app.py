"""
CareerMitra - Rural Student Career Opportunity Navigator (Maharashtra)
Flask backend. Session-based (no login/password) per hackathon scope.
"""
import json
import math
import os
import uuid
from pathlib import Path

from flask import Flask, render_template, request, jsonify, session, send_from_directory

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "careermitra-dev-secret-change-me")

# ---------------------------------------------------------------------------
# Load seed data once at startup (small enough to keep in memory)
# ---------------------------------------------------------------------------
def _load(name):
    with open(DATA_DIR / name, encoding="utf-8") as f:
        return json.load(f)

TRANSLATIONS = _load("translations.json")
CAREERS = _load("careers.json")
COLLEGES = _load("colleges.json")
SCHEMES = _load("schemes.json")
DISTRICTS = _load("districts.json")

CAREERS_BY_ID = {c["id"]: c for c in CAREERS}
VECTOR_DIMS = ["technical", "vocational", "healthcare", "publicService",
               "business", "creative", "agriculture", "academic"]

# Assessment question -> vector dimension it feeds
INTEREST_QUESTIONS = [
    {"id": "q_technical", "dim": "technical", "key": "interest_technical"},
    {"id": "q_vocational", "dim": "vocational", "key": "interest_vocational"},
    {"id": "q_healthcare", "dim": "healthcare", "key": "interest_healthcare"},
    {"id": "q_publicService", "dim": "publicService", "key": "interest_publicService"},
    {"id": "q_business", "dim": "business", "key": "interest_business"},
    {"id": "q_creative", "dim": "creative", "key": "interest_creative"},
    {"id": "q_agriculture", "dim": "agriculture", "key": "interest_agriculture"},
    {"id": "q_academic", "dim": "academic", "key": "interest_academic"},
]
APTITUDE_QUESTIONS = [
    {"id": "q_logical", "dim": "academic", "key": "aptitude_logical", "weight": 0.5},
    {"id": "q_verbal", "dim": "publicService", "key": "aptitude_verbal", "weight": 0.3},
]
ALL_QUESTIONS = INTEREST_QUESTIONS + APTITUDE_QUESTIONS


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------
def haversine_km(lat1, lng1, lat2, lng2):
    """Calculate distance in km between two lat/lng points."""
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def compute_career_matches(vector, top_n=5):
    """Cosine similarity between student vector and each career's reference vector."""
    results = []
    student_mag = math.sqrt(sum(v * v for v in vector.values())) or 1.0
    for career in CAREERS:
        cv = career["vector"]
        dot = sum(vector.get(dim, 0) * cv.get(dim, 0) for dim in VECTOR_DIMS)
        career_mag = math.sqrt(sum(v * v for v in cv.values())) or 1.0
        cosine = dot / (student_mag * career_mag)
        pct = max(0, min(100, round(cosine * 100)))
        # Top 2 contributing dimensions for "why this fits you"
        contributions = sorted(
            ((dim, vector.get(dim, 0) * cv.get(dim, 0)) for dim in VECTOR_DIMS),
            key=lambda x: x[1], reverse=True,
        )
        top_dims = [d for d, w in contributions if w > 0][:2]
        results.append({"career": career, "matchPct": pct, "topDims": top_dims})
    results.sort(key=lambda r: r["matchPct"], reverse=True)
    return results[:top_n]


def eligible_schemes(profile):
    """Deterministic scheme eligibility check. No AI involved."""
    income = profile.get("income", 0)
    category = profile.get("category", "General")
    gender = profile.get("gender", "")
    disability = profile.get("disability", False)
    out = []
    for s in SCHEMES:
        if income and income > s.get("maxIncome", float("inf")):
            continue
        if category not in s.get("eligibleCategories", []):
            continue
        if s.get("genderRestriction") == "female" and gender != "female":
            continue
        if s.get("disabilityRequired") and not disability:
            continue
        out.append(s)
    return out


def nearby_colleges(district, career_ids, radius_km, limit=12):
    """Find colleges near a district, sorted by career relevance then distance."""
    center = DISTRICTS.get(district)
    out = []
    for c in COLLEGES:
        dist = None
        if center:
            dist = round(haversine_km(center["lat"], center["lng"], c["lat"], c["lng"]), 1)
            if radius_km and dist > radius_km and c["district"] != district:
                continue
        relevance = len(set(c.get("streams", [])) & set(career_ids))
        out.append({**c, "distanceKm": dist, "relevance": relevance})
    out.sort(key=lambda c: (-c["relevance"], c["distanceKm"] if c["distanceKm"] is not None else 9999))
    return out[:limit]


def radius_for_mobility(mobility):
    return {"local": 25, "district": 60, "state": 500}.get(mobility, 100)


def build_roadmap(profile, career, matched_colleges, matched_schemes, lang):
    """Rule-based multilingual roadmap. Deterministic — no AI guessing."""
    name = profile.get("name") or "Student"
    steps = career.get("pathway", [])
    immediate = [s.get(lang, s.get("en", "")) for s in steps[:2]]
    later = [s.get(lang, s.get("en", "")) for s in steps[2:]]

    scholarship_steps = []
    for sch in matched_schemes[:3]:
        benefit = sch["benefit"].get(lang, sch["benefit"]["en"])
        sch_name = sch["name"].get(lang, sch["name"]["en"])
        scholarship_steps.append(f"{sch_name}: {benefit}")

    college_names = [c["name"] for c in matched_colleges[:3]]

    long_term_templates = {
        "en": f"With consistent effort, {name} can move from the first training step into a stable {career['name']['en']} role within Maharashtra, close to home.",
        "hi": f"लगातार प्रयास से, {name} महाराष्ट्र में घर के पास एक स्थिर {career['name']['hi']} पद तक पहुंच सकते हैं।",
        "mr": f"सतत प्रयत्नांनी, {name} महाराष्ट्रात घराजवळ एक स्थिर {career['name']['mr']} पदापर्यंत पोहोचू शकतो/शकते.",
    }

    return {
        "careerGoal": career["name"].get(lang, career["name"]["en"]),
        "immediateSteps": immediate,
        "scholarshipSteps": scholarship_steps or ["-"],
        "longTermOutlook": long_term_templates.get(lang, long_term_templates["en"]),
        "laterSteps": later,
        "nearbyCollegeNames": college_names,
    }


# ---------------------------------------------------------------------------
# Page routes (serve HTML templates)
# ---------------------------------------------------------------------------
@app.route("/")
def landing():
    return render_template("index.html")


@app.route("/onboarding")
def onboarding():
    return render_template("onboarding.html", districts=sorted(DISTRICTS.keys()))


@app.route("/assessment")
def assessment():
    return render_template("assessment.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/roadmap")
def roadmap_page():
    return render_template("roadmap.html")


# ---------------------------------------------------------------------------
# API routes (JSON responses for frontend JS)
# ---------------------------------------------------------------------------
@app.route("/api/translations/<lang>")
def api_translations(lang):
    return jsonify(TRANSLATIONS.get(lang, TRANSLATIONS["en"]))


@app.route("/api/districts")
def api_districts():
    return jsonify(sorted(DISTRICTS.keys()))


@app.route("/api/assessment/questions")
def api_questions():
    return jsonify(ALL_QUESTIONS)


@app.route("/api/profile", methods=["POST"])
def api_save_profile():
    data = request.get_json(force=True) or {}
    required = ["name", "className", "district"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "missing_fields"}), 400
    profile = {
        "id": session.get("profile", {}).get("id", str(uuid.uuid4())[:8]),
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
    return jsonify({"ok": True, "profile": profile})


@app.route("/api/profile", methods=["GET"])
def api_get_profile():
    return jsonify(session.get("profile"))


@app.route("/api/assessment", methods=["POST"])
def api_submit_assessment():
    if "profile" not in session:
        return jsonify({"error": "no_profile"}), 400
    answers = (request.get_json(force=True) or {}).get("answers", {})
    vector = {dim: 0.0 for dim in VECTOR_DIMS}
    counts = {dim: 0 for dim in VECTOR_DIMS}
    for q in ALL_QUESTIONS:
        raw = float(answers.get(q["id"], 3))  # 1-5 scale, default neutral
        normalized = (raw - 1) / 4.0  # 0..1
        weight = q.get("weight", 1.0)
        vector[q["dim"]] += normalized * weight
        counts[q["dim"]] += weight
    for dim in vector:
        if counts[dim] > 0:
            vector[dim] = round(vector[dim] / counts[dim], 3)

    session["vector"] = vector
    matches = compute_career_matches(vector, top_n=5)
    return jsonify({
        "vector": vector,
        "matches": [
            {"careerId": m["career"]["id"], "matchPct": m["matchPct"], "topDims": m["topDims"]}
            for m in matches
        ],
    })


@app.route("/api/dashboard")
def api_dashboard():
    profile = session.get("profile")
    vector = session.get("vector")
    lang = session.get("lang", "en")
    if not profile or not vector:
        return jsonify({"error": "incomplete"}), 400

    matches = compute_career_matches(vector, top_n=5)
    career_ids = [m["career"]["id"] for m in matches]
    radius = radius_for_mobility(profile.get("mobility", "district"))
    colleges = nearby_colleges(profile["district"], career_ids, radius)
    schemes = eligible_schemes(profile)
    center = DISTRICTS.get(profile["district"], {"lat": 19.0, "lng": 75.0})

    out_matches = []
    for m in matches:
        c = m["career"]
        out_matches.append({
            "id": c["id"],
            "name": c["name"].get(lang, c["name"]["en"]),
            "description": c["description"].get(lang, c["description"]["en"]),
            "matchPct": m["matchPct"],
            "icon": c["icon"],
            "topDims": m["topDims"],
        })

    out_colleges = []
    for c in colleges:
        out_colleges.append({
            "id": c["id"], "name": c["name"], "district": c["district"],
            "type": c["type"], "category": c["category"], "courses": c["courses"],
            "lat": c["lat"], "lng": c["lng"], "distanceKm": c["distanceKm"],
            "annualFee": c["annualFee"], "relevance": c["relevance"],
        })

    out_schemes = []
    for s in schemes:
        out_schemes.append({
            "id": s["id"], "name": s["name"].get(lang, s["name"]["en"]),
            "provider": s["provider"], "maxIncome": s["maxIncome"],
            "benefit": s["benefit"].get(lang, s["benefit"]["en"]),
            "requiredDocs": s["requiredDocs"].get(lang, s["requiredDocs"]["en"]),
            "applyUrl": s["applyUrl"],
        })

    return jsonify({
        "profile": profile,
        "matches": out_matches,
        "colleges": out_colleges,
        "schemes": out_schemes,
        "districtCenter": center,
        "radiusKm": radius,
    })


@app.route("/api/roadmap")
def api_roadmap():
    career_id = request.args.get("careerId")
    profile = session.get("profile")
    lang = session.get("lang", "en")
    if not profile or not career_id or career_id not in CAREERS_BY_ID:
        return jsonify({"error": "incomplete"}), 400

    career = CAREERS_BY_ID[career_id]
    career_ids = [career_id]
    radius = radius_for_mobility(profile.get("mobility", "district"))
    colleges = nearby_colleges(profile["district"], career_ids, radius, limit=5)
    schemes = eligible_schemes(profile)

    roadmap = build_roadmap(profile, career, colleges, schemes, lang)
    return jsonify({
        "roadmap": roadmap,
        "career": {
            "id": career["id"],
            "name": career["name"].get(lang, career["name"]["en"]),
            "description": career["description"].get(lang, career["description"]["en"]),
        },
        "colleges": [{"name": c["name"], "district": c["district"], "distanceKm": c["distanceKm"]} for c in colleges],
        "schemes": [{"name": s["name"].get(lang, s["name"]["en"]), "benefit": s["benefit"].get(lang, s["benefit"]["en"])} for s in schemes[:3]],
        "profile": profile,
    })


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
