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


@app.route("/career-aunty")
@app.route("/mitra-tai")
def career_aunty_page():
    return render_template("career_aunty.html")


# ---------------------------------------------------------------------------
# API routes (JSON responses for frontend JS)
# ---------------------------------------------------------------------------
def generate_mitra_tai_response(msg, lang, profile, matches, colleges, schemes, roadmap=None):
    msg_lower = (msg or "").lower()
    name = profile.get("name", "") if profile else ""
    name_str = f", {name}" if name else ""
    district = profile.get("district", "") if profile else "तुमच्या जिल्ह्यात"

    top_match = matches[0] if matches else None
    if isinstance(top_match, dict):
        top_career_name = top_match.get("name", "Software / Technical Track")
        top_match_pct = top_match.get("matchPct", 90)
    else:
        top_career_name = "Software / Technical Track"
        top_match_pct = 90

    if lang == "mr":
        if any(k in msg_lower for k in ["career", "करिअर", "योग्य", "दिशा", "match", "माझ्यासाठी", "आवड"]):
            if top_match:
                reply = (
                    f"नमस्कार{name_str}! 😊 तुझ्या चाचणीनुसार, तुझ्यासाठी **{top_career_name}** "
                    f"(जवळपास {top_match_pct}% match) ही उत्तम करिअर दिशा आहे. "
                    f"तुला practical कामात आणि नवीन गोष्टी शिकण्यात आवड आहे. "
                    f"या क्षेत्रात पुढील ५ वर्षांत महाराष्ट्रात खूप चांगल्या संधी आहेत!"
                )
            else:
                reply = f"नमस्कार{name_str}! 😊 करिअर शोधण्यासाठी आधी आपली १ मिनिटाची छोटी चाचणी पूर्ण करा. मी तुला योग्य वाट दाखवेन!"

        elif any(k in msg_lower for k in ["college", "कॉलेज", "संस्था", "जवळ", "near"]):
            if colleges:
                c_list = ", ".join([c['name'] for c in colleges[:3]])
                reply = (
                    f"तुमच्या **{district}** जिल्ह्याजवळ **{c_list}** यांसारख्या "
                    f"{len(colleges)} उत्कृष्ट शैक्षणिक संस्था उपलब्ध आहेत. "
                    f"या ठिकाणी कमी शुल्कात दर्जेदार शिक्षण मिळते!"
                )
            else:
                reply = f"तुमच्या **{district}** परिसरात अनेक महाविद्यालये आहेत. प्रोफाइल पूर्ण केल्यावर मी तुला जवळच्या संस्थांची यादी दाखवेन."

        elif any(k in msg_lower for k in ["scholarship", "शिष्यवृत्ती", "योजना", "scheme", "पैसे"]):
            if schemes:
                s_names = ", ".join([s['name'] for s in schemes[:2]])
                reply = (
                    f"हो नक्कीच! 💰 तुझ्यासाठी **{s_names}** या सरकारी शिष्यवृत्त्या योग्य आहेत. "
                    f"या योजनेसाठी उत्पन्नाचा दाखला आणि रहिवासी दाखला (Domicile) तयार ठेवा."
                )
            else:
                reply = "महाराष्ट्रात MahaDBT द्वारे विविध प्रवर्गांसाठी शिष्यवृत्ती मिळतात. प्रोफाइलमधील उत्पन्न आणि प्रवर्ग भरल्यास मी योग्य योजना सांगेन."

        elif any(k in msg_lower for k in ["roadmap", "रोडमॅप", "पुढे", "करायचं", "step", "next", "आता"]):
            reply = (
                f"तुझा पुढचा टप्पा सोपा आहे{name_str}:\n"
                f"१. १०वी/१२वी चे मूलभूत विषय पक्के करा.\n"
                f"२. जवळच्या कॉलेजचे प्रवेश अर्ज तपासा.\n"
                f"३. MahaDBT पोर्टलवर शिष्यवृत्ती अर्ज भरा."
            )

        else:
            reply = (
                f"नमस्कार{name_str}! 😊 मी मित्र ताई आहे. काळजी करू नकोस, करिअरची निवड करताना तू एकटा नाहीस. "
                f"तुला कोणत्या करिअरबद्दल किंवा कॉलेजबद्दल माहिती हवी आहे? मी तुला सोप्या भाषेत समजावून सांगेन."
            )

    elif lang == "hi":
        if any(k in msg_lower for k in ["career", "करियर", "योग्य", "दिशा", "match", "मेरे लिए", "पसंद"]):
            if top_match:
                reply = (
                    f"नमस्ते{name_str}! 😊 आपके असेसमेंट के आधार पर, आपके लिए **{top_career_name}** "
                    f"(लगभग {top_match_pct}% मैच) सबसे बेहतरीन करियर विकल्प है। "
                    f"इसमें प्रैक्टिकल काम और स्किल डेवलपमेंट के बहुत शानदार मौके हैं!"
                )
            else:
                reply = f"नमस्ते{name_str}! 😊 करियर विकल्प देखने के लिए पहले १ मिनट का मूल्यांकन पूरा करें, मैं आपको सही राह दिखाऊंगी!"

        elif any(k in msg_lower for k in ["college", "कॉलेज", "संस्थान", "पास", "near"]):
            if colleges:
                c_list = ", ".join([c['name'] for c in colleges[:3]])
                reply = f"आपके **{district}** जिले के पास **{c_list}** जैसे {len(colleges)} अच्छे संस्थान मौजूद हैं। यहाँ सरकारी व कम फीस में पढ़ाई के विकल्प हैं।"
            else:
                reply = f"आपके **{district}** क्षेत्र में कई कॉलेज उपलब्ध हैं। प्रोफाइल पूर्ण करने पर मैं निकटतम कॉलेज दिखाऊंगी।"

        elif any(k in msg_lower for k in ["scholarship", "छात्रवृत्ति", "योजना", "scheme", "पैसा"]):
            if schemes:
                s_names = ", ".join([s['name'] for s in schemes[:2]])
                reply = f"जी हाँ! 💰 आपके लिए **{s_names}** जैसी योजनाएं उपलब्ध हैं। आवश्यक दस्तावेजों में आय प्रमाण पत्र और जाति/निवास प्रमाण पत्र तैयार रखें।"
            else:
                reply = "MahaDBT पोर्टल पर कई सरकारी छात्रवृत्तियां उपलब्ध हैं। अपनी प्रोफाइल पूरी करें।"

        elif any(k in msg_lower for k in ["roadmap", "रोडमैप", "आगे", "कदम", "step", "next", "अब"]):
            reply = f"आपका अगला कदम{name_str}:\n१. आधारभूत विषय मजबूत करें।\n२. पास के कॉलेजों की पात्रता जांचें।\n३. स्कॉलरशिप के लिए आवेदन करें।"

        else:
            reply = f"नमस्ते{name_str}! 😊 मैं मित्र ताई हूँ। करियर के सफर में घबराने की ज़रूरत नहीं है। आप मुझसे करियर, कॉलेज या छात्रवृत्ति के बारे में कुछ भी पूछ सकते हैं।"

    else:
        if any(k in msg_lower for k in ["career", "match", "best", "direction", "suitable", "fit"]):
            if top_match:
                reply = (
                    f"Hello{name_str}! 😊 Based on your assessment, **{top_career_name}** "
                    f"({top_match_pct}% match) is your strongest career path. "
                    f"Your practical problem-solving skills make this a great fit for your future growth!"
                )
            else:
                reply = f"Hello{name_str}! 😊 Complete the 1-minute assessment first so I can calculate your personalized career matches!"

        elif any(k in msg_lower for k in ["college", "institution", "near", "district"]):
            if colleges:
                c_list = ", ".join([c['name'] for c in colleges[:3]])
                reply = f"Near **{district}**, top options include **{c_list}** among {len(colleges)} matched institutions with affordable fees."
            else:
                reply = f"There are several colleges near **{district}**. Complete your profile to view them!"

        elif any(k in msg_lower for k in ["scholarship", "scheme", "financial", "aid", "fee"]):
            if schemes:
                s_names = ", ".join([s['name'] for s in schemes[:2]])
                reply = f"Great news! 💰 You qualify for schemes like **{s_names}**. Make sure your Income and Domicile certificates are ready!"
            else:
                reply = "Government scholarships via MahaDBT are available based on income and category criteria."

        elif any(k in msg_lower for k in ["roadmap", "next", "action", "plan", "do"]):
            reply = f"Here are your immediate next actions{name_str}:\n1. Focus on core exam subjects.\n2. Review entrance requirements for target colleges.\n3. Keep scholarship documents handy."

        else:
            reply = f"Hello{name_str}! 😊 I am Mitra Tai, your career guide. Ask me anything about career tracks, colleges, or scholarships near you!"

    return {
        "reply": reply,
        "language": lang,
        "contextUsed": {
            "name": profile.get("name") if profile else None,
            "district": profile.get("district") if profile else None,
            "topCareer": top_career_name if top_match else None,
            "collegeCount": len(colleges) if colleges else 0,
            "schemeCount": len(schemes) if schemes else 0,
        }
    }


@app.route("/api/mitra-tai", methods=["POST"])
def api_mitra_tai():
    data = request.get_json(force=True) or {}
    message = data.get("message", "").strip()
    lang = data.get("language") or session.get("lang") or "mr"

    profile = data.get("studentProfile") or session.get("profile")
    vector = session.get("vector")

    matches = data.get("careerMatches")
    colleges = data.get("colleges")
    schemes = data.get("schemes")

    if profile and vector and not matches:
        raw_matches = compute_career_matches(vector, top_n=5)
        matches = [{
            "id": m["career"]["id"],
            "name": m["career"]["name"].get(lang, m["career"]["name"]["en"]),
            "matchPct": m["matchPct"]
        } for m in raw_matches]

        career_ids = [m["career"]["id"] for m in raw_matches]
        radius = radius_for_mobility(profile.get("mobility", "district"))
        colleges = nearby_colleges(profile["district"], career_ids, radius)
        schemes = eligible_schemes(profile)

    res = generate_mitra_tai_response(message, lang, profile, matches, colleges, schemes)
    return jsonify(res)


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
