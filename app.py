"""
CareerMitra - Rural Student Career Opportunity Navigator (Maharashtra)
Flask frontend proxying to Node.js Backend API.
"""
import os
import uuid
import requests
import math
from pathlib import Path
from dotenv import load_dotenv
from authlib.integrations.flask_client import OAuth

from flask import Flask, render_template, request, jsonify, session, send_from_directory, redirect, url_for
from werkzeug.middleware.proxy_fix import ProxyFix

load_dotenv()

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"

def load_env():
    env_path = BASE_DIR / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

load_env()

app = Flask(__name__)
# Trust headers from Vercel/reverse proxy so _external=True uses https
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "careermitra-dev-secret-change-me")

oauth = OAuth(app)
oauth.register(
    name='google',
    client_id=os.environ.get('GOOGLE_CLIENT_ID'),
    client_secret=os.environ.get('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

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

@app.route("/login/google")
def login_google():
    if hasattr(app, "oauth") and hasattr(app.oauth, "google"):
        redirect_uri = url_for('auth_callback', _external=True)
        return app.oauth.google.authorize_redirect(redirect_uri)
    return redirect(url_for("landing"))

@app.route("/auth/callback")
def auth_callback():
    if hasattr(app, "oauth") and hasattr(app.oauth, "google"):
        token = app.oauth.google.authorize_access_token()
        user_info = token.get('userinfo', {}) if token else {}
        if user_info:
            session["user"] = {
                "id": f"google_{uuid.uuid4().hex[:8]}",
                "email": user_info.get("email"),
                "name": user_info.get("name"),
                "picture": user_info.get("picture"),
                "mode": "google"
            }
            session["guest_mode"] = False
            return redirect(url_for("onboarding"))
    return redirect(url_for("landing"))

@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(force=True) or {}
    mode = data.get("mode", "guest")
    email = data.get("email") or "student@example.com"
    name = data.get("name") or email.split("@")[0].replace(".", " ").title()

    student_id = session.get("studentId") or str(uuid.uuid4())[:8]
    session["studentId"] = student_id
    if mode == "guest":
        session["user"] = {
            "id": student_id,
            "email": None,
            "name": "Guest Student",
            "mode": "guest"
        }
        session["guest_mode"] = True
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
            "id": student_id,
            "email": email,
            "name": name,
            "mode": mode
        }
        session["guest_mode"] = False

    if not session.get("profile"):
        session["profile"] = {
            "id": student_id,
            "name": name if name and name != "Student" else "राहुल पवार",
            "district": "Pune",
            "className": "10th",
            "marks": 78,
            "income": 120000,
            "category": "General",
            "registered": True
        }

    return jsonify({"ok": True, "user": session["user"], "profile": session["profile"]})

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
=======
        session["guest_mode"] = True
    return jsonify({"ok": True, "user": session.get("user")})
>>>>>>> origin/nishad

FALLBACK_DISTRICTS = [
    "Mumbai", "Thane", "Pune", "Nashik", "Nagpur", "Kolhapur", 
    "Satara", "Solapur", "Sangli", "Ahmednagar", "Ratnagiri", "Chhatrapati Sambhajinagar"
]

FALLBACK_QUESTIONS = [
  {
    "id": 1,
    "key": "q1",
    "textEn": "1. What kind of activities do you enjoy most in your free time?",
    "textMr": "१. तुमच्या फावल्या वेळेत तुम्हाला कोणत्या गोष्टी करायला सर्वात जास्त आवडतात?",
    "options": [
      { "id": 1, "textEn": "🛠️ Building, repairing machinery or fixing electrical tools", "textMr": "🛠️ यंत्रसामग्री दुरुस्त करणे किंवा इलेक्ट्रिकल उपकरणे जोडणे", "domain": "realistic" },
      { "id": 2, "textEn": "🔬 Solving scientific puzzles, math problems or researching online", "textMr": "🔬 वैज्ञानिक कोडी सोडवणे, गणिताचे प्रश्न किंवा ऑनलाइन संशोधन", "domain": "investigative" },
      { "id": 3, "textEn": "🎨 Drawing, painting, writing stories, music or video editing", "textMr": "🎨 चित्रे काढणे, कथा लिहिणे, संगीत किंवा व्हिडिओ संपादन", "domain": "artistic" },
      { "id": 4, "textEn": "🤝 Helping neighbors, teaching children, or community service", "textMr": "🤝 शेजाऱ्यांना मदत करणे, मुलांना शिकवणे किंवा समाजसेवा", "domain": "social" }
    ]
  },
  {
    "id": 2,
    "key": "q2",
    "textEn": "2. Which work environment excites you the most?",
    "textMr": "२. कोणते कामाचे वातावरण तुम्हाला सर्वात जास्त आकर्षित करते?",
    "options": [
      { "id": 1, "textEn": "🌾 Outdoor field, engineering site, workshop or farm", "textMr": "🌾 शेतजमीन, अभियांत्रिकी साइट, वर्कशॉप किंवा मैदान", "domain": "realistic" },
      { "id": 2, "textEn": "💻 Research lab, computer software workstation, or tech desk", "textMr": "💻 संशोधन प्रयोगशाळा, संगणक सॉफ्टवेअर वर्कस्टेशन", "domain": "investigative" },
      { "id": 3, "textEn": "🎬 Creative studio, media house, or design office", "textMr": "🎬 क्रिएटिव्ह स्टुडिओ, मीडिया हाऊस किंवा डिझाईन ऑफिस", "domain": "artistic" },
      { "id": 4, "textEn": "🏫 Hospital, primary health center, school, or NGO office", "textMr": "🏫 रुग्णालय, प्राथमिक आरोग्य केंद्र, शाळा किंवा स्वयंसेवी संस्था", "domain": "social" }
    ]
  },
  {
    "id": 3,
    "key": "q3",
    "textEn": "3. How do you approach solving a complex problem?",
    "textMr": "३. एखादी गुंतागुंतीची समस्या सोडवताना तुम्ही कसा मार्ग निवडता?",
    "options": [
      { "id": 1, "textEn": "🔧 Hands-on testing, opening up components and physical trial", "textMr": "🔧 स्वतः हाताने हाताळून, भाग उघडून प्रत्यक्ष प्रयोग करणे", "domain": "realistic" },
      { "id": 2, "textEn": "📊 Data analysis, logical deduction, and step-by-step investigation", "textMr": "📊 डेटा विश्लेषण, तर्कशुद्ध विचार आणि टप्प्याटप्प्याने तपास", "domain": "investigative" },
      { "id": 3, "textEn": "💼 Strategic negotiation, team direction, and decisive action", "textMr": "💼 धोरणात्मक वाटाघाटी, नेतृत्व आणि जलद निर्णय", "domain": "enterprising" },
      { "id": 4, "textEn": "📋 Checking rules, standard procedures, and organized documentation", "textMr": "📋 नियम, मानक पद्धती आणि दस्तऐवजीकरण तपासणे", "domain": "conventional" }
    ]
  },
  {
    "id": 4,
    "key": "q4",
    "textEn": "4. Which subjects or skills did you naturally excel at in school?",
    "textMr": "४. शाळेत असताना कोणत्या विषयात किंवा कौशल्यात तुम्ही आपोआप पुढे होतात?",
    "options": [
      { "id": 1, "textEn": "📐 Physics, Applied Mechanics, Technical Drawing or Workshop", "textMr": "📐 भौतिकशास्त्र, यांत्रिकी, तांत्रिक आलेखन किंवा वर्कशॉप", "domain": "realistic" },
      { "id": 2, "textEn": "🧪 Chemistry, Biology, Mathematics or Computer Coding", "textMr": "🧪 रसायनशास्त्र, जीवशास्त्र, गणित किंवा कोडिंग", "domain": "investigative" },
      { "id": 3, "textEn": "🗣️ Languages, History, Civics, Group Discussions & Public Speaking", "textMr": "🗣️ भाषा, इतिहास, नागरिकशास्त्र, वादविवाद आणि भाषण", "domain": "social" },
      { "id": 4, "textEn": "📑 Bookkeeping, Accounting, Economics, or Office Practices", "textMr": "📑 बहीखाता, लेखाशास्त्र, अर्थशास्त्र किंवा कार्यालयीन पद्धती", "domain": "conventional" }
    ]
  },
  {
    "id": 5,
    "key": "q5",
    "textEn": "5. Where do you see yourself making the biggest impact in 5 years?",
    "textMr": "५. ५ वर्षांनंतर स्वतःला कुठे काम करताना पाहताना तुम्हाला आनंद होईल?",
    "options": [
      { "id": 1, "textEn": "⚙️ Managing an engineering workshop, tech unit or project", "textMr": "⚙️ इंजिनिअरिंग वर्कशॉप, टेक युनिट किंवा प्रकल्प व्यवस्थापन", "domain": "realistic" },
      { "id": 2, "textEn": "🔬 Leading medical, agricultural, or software research", "textMr": "🔬 वैद्यकीय, कृषी किंवा सॉफ्टवेअर संशोधात नेतृत्व करणे", "domain": "investigative" },
      { "id": 3, "textEn": "🏪 Running your own enterprise, retail business or venture", "textMr": "🏪 स्वतःचा व्यवसाय, व्यापार किंवा संस्था चालवणे", "domain": "enterprising" },
      { "id": 4, "textEn": "🏛️ Serving as a government civil servant or MPSC administrative officer", "textMr": "🏛️ प्रशासकीय अधिकारी किंवा एमपीएससी अधिकारी म्हणून सेवा", "domain": "conventional" }
    ]
  },
  {
    "id": 6,
    "key": "q6",
    "textEn": "6. How comfortable are you with new technology and physical equipment?",
    "textMr": "६. नवीन तंत्रज्ञान आणि मशिनरी वापरताना तुम्हाला काय वाटते?",
    "options": [
      { "id": 1, "textEn": "🛠️ Very eager — I love operating engines, electronic circuits & tools", "textMr": "🛠️ खूप उत्सुक — मला इंजिन, सर्किट आणि टूल्स वापरायला आवडतात", "domain": "realistic" },
      { "id": 2, "textEn": "💻 Fascinated — I like understanding the internal code & logic", "textMr": "💻 उत्सुक — मला त्याच्यामागील लॉजिक आणि कोड समजायला आवडतो", "domain": "investigative" },
      { "id": 3, "textEn": "🎨 Creative — I like using digital tools for art, animation & media", "textMr": "🎨 सर्जनशील — मला कला, ॲनिमेशन आणि फोटोग्राफीसाठी साधने आवडतात", "domain": "artistic" },
      { "id": 4, "textEn": "📑 Systematic — I prefer structured office software & Excel tools", "textMr": "📑 पद्धतशीर — मला एक्सेल, फायलिंग आणि ऑफिस सॉफ्टवेअर आवडतात", "domain": "conventional" }
    ]
  },
  {
    "id": 7,
    "key": "q7",
    "textEn": "7. When interacting with people in your community, what role suits you best?",
    "textMr": "७. तुमच्या गावात किंवा शहरात लोकांसोबत काम करताना तुमची भूमिका काय असते?",
    "options": [
      { "id": 1, "textEn": "🧑‍🏫 Counselor / Teacher — listening, guiding, healthcare & advice", "textMr": "🧑‍🏫 मार्गदर्शक / शिक्षक — ऐकून घेणे, सल्ला देणे, आरोग्य आणि शिक्षण", "domain": "social" },
      { "id": 2, "textEn": "📢 Organizer / Leader — convincing others, driving campaigns", "textMr": "📢 संघटक / नेता — लोकांना पटवून देणे, कार्यक्रम आणि नेतृत्व", "domain": "enterprising" },
      { "id": 3, "textEn": "🛠️ Specialist — fixing technical breakdown or infrastructure", "textMr": "🛠️ तज्ज्ञ — तांत्रिक अडचणी दुरुस्त करणे किंवा पायाभूत कामे", "domain": "realistic" },
      { "id": 4, "textEn": "📝 Accountant — managing funds, maintaining lists & records", "textMr": "📝 हिशोबनीस — निधी व्यवस्थापन, याद्या आणि अधिकृत नोंदी ठेवणे", "domain": "conventional" }
    ]
  },
  {
    "id": 8,
    "key": "q8",
    "textEn": "8. How do you feel about managing financial records and budgets?",
    "textMr": "८. आर्थिक नोंदी, कागदपत्रे आणि नियमांचे पालन करण्याबद्दल तुमचे काय मत आहे?",
    "options": [
      { "id": 1, "textEn": "📊 Very meticulous — I enjoy precise accounting & budgeting", "textMr": "📊 अत्यंत अचूक — मला अचूक हिशोब, फायलिंग आणि बजेट आवडते", "domain": "conventional" },
      { "id": 2, "textEn": "💰 Business-minded — I focus on profit margins, sales & expansion", "textMr": "💰 व्यवसायिक — माझे लक्ष नफा, विक्री आणि वाढीवर असते", "domain": "enterprising" },
      { "id": 3, "textEn": "🔬 Analytical — I treat budget data as numbers to find insights", "textMr": "🔬 विश्लेषणात्मक — मी निष्कर्षांसाठी आकडेवारीचा अभ्यास करतो", "domain": "investigative" },
      { "id": 4, "textEn": "🤝 Community-focused — I ensure funds directly benefit families", "textMr": "🤝 समाजकेंद्रित — निधीचा गरजूंना फायदा होईल याची मी काळजी घेतो", "domain": "social" }
    ]
  },
  {
    "id": 9,
    "key": "q9",
    "textEn": "9. When expressing your original ideas, which medium do you prefer?",
    "textMr": "९. तुमच्या कल्पना मांडण्यासाठी तुम्ही कोणते माध्यम निवडाल?",
    "options": [
      { "id": 1, "textEn": "🎨 Visual Arts / Design — posters, videos, music or UI design", "textMr": "🎨 दृश्य कला / डिझाईन — पोस्टर, व्हिडिओ, संगीत, हस्तकला", "domain": "artistic" },
      { "id": 2, "textEn": "📐 Physical Models — building a working prototype or 3D model", "textMr": "📐 भौतिक मॉडेल्स — काम करणारा प्रोटोटाइप किंवा मॉडेल तयार करणे", "domain": "realistic" },
      { "id": 3, "textEn": "📝 Written Reports — research paper, documentation or technical essay", "textMr": "📝 लिखित अहवाल — संशोधन पेपर, दस्तऐवजीकरण किंवा निबंध", "domain": "investigative" },
      { "id": 4, "textEn": "🎤 Speeches & Presentations — pitching in front of an audience", "textMr": "🎤 भाषणे आणि सादरीकरण — श्रोत्यांसमोर मत मांडणे", "domain": "enterprising" }
    ]
  },
  {
    "id": 10,
    "key": "q10",
    "textEn": "10. In a group project or development drive, what is your strength?",
    "textMr": "१०. गटात किंवा विकासकामात सहभागी होताना तुमची सर्वात मोठी ताकद कोणती असते?",
    "options": [
      { "id": 1, "textEn": "📢 Motivational Leadership — inspiring team members & delegating", "textMr": "📢 प्रेरणादायी नेतृत्व — सहकाऱ्यांना प्रोत्साहन देणे आणि नियोजन", "domain": "enterprising" },
      { "id": 2, "textEn": "🛠️ Execution & Construction — doing actual physical work reliably", "textMr": "🛠️ प्रत्यक्ष अंमलबजावणी — प्रत्यक्ष काम विश्वासाने पूर्ण करणे", "domain": "realistic" },
      { "id": 3, "textEn": "🤝 Empathy & Harmony — keeping everyone united & caring for all", "textMr": "🤝 एकता आणि सहकार्य — सर्वांना एकत्र ठेवणे आणि काळजी घेणे", "domain": "social" },
      { "id": 4, "textEn": "📝 Record Keeping — keeping track of costs & official letters", "textMr": "📝 नोंदवही व्यवस्थापन — उपस्थिती, खर्च आणि पत्रव्यवहार नोंदवणे", "domain": "conventional" }
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

@app.route("/career-dna")
def career_dna_page():
    return render_template("career_dna.html")

@app.route("/careerverse")
def careerverse_page():
    return render_template("careerverse.html")

@app.route("/parent-mode")
def parent_mode_page():
    return render_template("parent_mode.html")

@app.route("/resume-builder")
def resume_builder_page():
    return render_template("resume_builder.html")

@app.route("/skill-quest")
def skill_quest_page():
    return render_template("skill_quest.html")

@app.route("/tutorials")
def tutorials_page():
    return render_template("tutorials.html")

@app.route("/career-compare")
@app.route("/compare")
def career_compare_page():
    return render_template("career_compare.html")

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

@app.route("/api/careers/compare")
def api_careers_compare():
    careers_data = [
        {
            "id": "elec_tech",
            "nameEn": "Electrical & Solar Technician",
            "nameMr": "इलेक्ट्रिकल व सौर ऊर्जा तंत्रज्ञ",
            "icon": "⚡",
            "category": "Technical / Vocational",
            "duration": "1 - 2 Years (ITI / Diploma)",
            "startingSalary": "₹15,000 - ₹25,000 / mo",
            "growthRate": "High (92%)",
            "minQualification": "10th Pass",
            "difficulty": "Moderate",
            "sideIncomeGigs": [
                {
                    "titleEn": "Home Appliance Repairing",
                    "titleMr": "घरगुती उपकरणे दुरुस्ती",
                    "estEarning": "₹4,000 - ₹10,000 / mo",
                    "hours": "5-8 hrs/week",
                    "descEn": "Fix ceiling fans, wiring, switches & home pumps for local households on weekends.",
                    "descMr": "आठवड्याच्या शेवटी स्थानिक घरांमधील पंखे, वायरिंग आणि पंप दुरुस्त करा."
                },
                {
                    "titleEn": "Solar Rooftop Installation Helper",
                    "titleMr": "सोलर रूफटॉप बसवणी सहाय्यक",
                    "estEarning": "₹6,000 - ₹12,000 / mo",
                    "hours": "8-12 hrs/week",
                    "descEn": "Assist local solar vendors with rooftop panel assembly and inverter wiring.",
                    "descMr": "स्थानिक सोलर विक्रेत्यांना पॅनेल आणि इन्व्हर्टर बसवण्यात मदत करा."
                }
            ]
        },
        {
            "id": "software_dev",
            "nameEn": "Computer Software & Web Developer",
            "nameMr": "संगणक सॉफ्टवेअर व वेब डेव्हलपर",
            "icon": "💻",
            "category": "IT & Computer Science",
            "duration": "3 - 4 Years (B.Sc CS / BCA / B.Tech)",
            "startingSalary": "₹25,000 - ₹50,000 / mo",
            "growthRate": "Extremely High (98%)",
            "minQualification": "12th Pass (Science/Commerce)",
            "difficulty": "High",
            "sideIncomeGigs": [
                {
                    "titleEn": "Freelance Website Design for Local Shops",
                    "titleMr": "स्थानिक दुकानांसाठी फ्रिलान्स वेब डिझाईन",
                    "estEarning": "₹8,000 - ₹20,000 / mo",
                    "hours": "10-15 hrs/week",
                    "descEn": "Create simple portfolio websites and Google Maps listings for local businesses.",
                    "descMr": "स्थानिक व्यवसायांसाठी सोप्या वेबसाईट आणि गूगल मॅप्स लिस्टींग तयार करा."
                },
                {
                    "titleEn": "Online Form Filing & Data Kiosk",
                    "titleMr": "ऑनलाइन फॉर्म भरणे व डेटा केंद्र",
                    "estEarning": "₹5,000 - ₹12,000 / mo",
                    "hours": "6-10 hrs/week",
                    "descEn": "Help village students fill out exam and scholarship application forms online.",
                    "descMr": "ग्रामीण विद्यार्थ्यांना परीक्षा व शिष्यवृत्ती फॉर्म भरण्यास मदत करा."
                }
            ]
        },
        {
            "id": "agri_tech",
            "nameEn": "Agriculture & Agri-Tech Specialist",
            "nameMr": "कृषी तंत्रज्ञान व सेंद्रिय शेती तज्ज्ञ",
            "icon": "🌾",
            "category": "Agriculture & Rural Tech",
            "duration": "2 - 4 Years (Diploma / B.Sc Agri)",
            "startingSalary": "₹18,000 - ₹35,000 / mo",
            "growthRate": "High (89%)",
            "minQualification": "10th / 12th Pass",
            "difficulty": "Moderate",
            "sideIncomeGigs": [
                {
                    "titleEn": "Soil & Water Testing Agent",
                    "titleMr": "माती व पाणी परीक्षण प्रतिनिधी",
                    "estEarning": "₹6,000 - ₹15,000 / mo",
                    "hours": "6-10 hrs/week",
                    "descEn": "Collect soil samples from farmers and provide mini-nutrient analysis reports.",
                    "descMr": "शेतकऱ्यांकडून मातीचे नमुने गोळा करून खत सल्ला अहवाल द्या."
                },
                {
                    "titleEn": "Organic Fertilizer & Bio-Input Retail",
                    "titleMr": "सेंद्रिय खते व जैविक औषध विक्री",
                    "estEarning": "₹5,000 - ₹12,000 / mo",
                    "hours": "4-8 hrs/week",
                    "descEn": "Supply bio-pesticides and vermicompost to local farmers on commission.",
                    "descMr": "स्थानिक शेतकऱ्यांना सेंद्रिय खते आणि वर्मीकंपोस्ट पुरवून कमिशन मिळवा."
                }
            ]
        },
        {
            "id": "healthcare_nurse",
            "nameEn": "Healthcare Assistant & Paramedic",
            "nameMr": "आरोग्य सहाय्यक व पॅरामेडिक",
            "icon": "🩺",
            "category": "Healthcare & Life Sciences",
            "duration": "2 - 3 Years (GNM / DMLT / B.Sc Nursing)",
            "startingSalary": "₹16,000 - ₹30,000 / mo",
            "growthRate": "High (94%)",
            "minQualification": "12th Science",
            "difficulty": "Moderate-High",
            "sideIncomeGigs": [
                {
                    "titleEn": "Home Care Nursing Assistant",
                    "titleMr": "होम केअर रुग्ण सहाय्यक",
                    "estEarning": "₹6,000 - ₹14,000 / mo",
                    "hours": "8-12 hrs/week",
                    "descEn": "Assist elderly citizens at home with medication and blood pressure/sugar checks.",
                    "descMr": "घरातील ज्येष्ठांना औषधे देणे आणि बीपी/शुगर तपासण्यात मदत करा."
                },
                {
                    "titleEn": "Lab Pathology Sample Collection",
                    "titleMr": "पॅथॉलॉजी लॅब नमुना संकलन",
                    "estEarning": "₹5,000 - ₹12,000 / mo",
                    "hours": "5-8 hrs/week",
                    "descEn": "Collect morning blood samples for diagnostic centers in your taluka.",
                    "descMr": "तालुक्यातील लॅबसाठी सकाळी रक्ताचे नमुने गोळा करा."
                }
            ]
        },
        {
            "id": "mpsc_gov",
            "nameEn": "MPSC Civil Servant & Administration",
            "nameMr": "एमपीएससी व प्रशासकीय अधिकारी",
            "icon": "🏛️",
            "category": "Public Service & Governance",
            "duration": "2 - 3 Years (Graduation + Prep)",
            "startingSalary": "₹30,000 - ₹60,000 / mo",
            "growthRate": "Very High (95%)",
            "minQualification": "Any Graduate",
            "difficulty": "High",
            "sideIncomeGigs": [
                {
                    "titleEn": "School Student Home Tutor",
                    "titleMr": "शालेय विद्यार्थ्यांसाठी होम ट्युशन",
                    "estEarning": "₹4,000 - ₹12,000 / mo",
                    "hours": "6-10 hrs/week",
                    "descEn": "Teach 5th to 10th-grade students Social Studies, Math & Science in evening batches.",
                    "descMr": "इयत्ता ५ वी ते १० वी च्या विद्यार्थ्यांना संध्याकाळी क्लास किंवा ट्युशन घ्या."
                },
                {
                    "titleEn": "Govt Welfare Scheme Facilitator",
                    "titleMr": "शासकीय योजना अर्ज सहाय्यक",
                    "estEarning": "₹5,000 - ₹14,000 / mo",
                    "hours": "5-9 hrs/week",
                    "descEn": "Help local villagers apply for housing, pension, and agricultural subsidy schemes.",
                    "descMr": "ग्रामस्थांना घरकुल, मानधन आणि शेती योजनेचे अर्ज भरण्यास मदत करा."
                }
            ]
        },
        {
            "id": "graphic_design",
            "nameEn": "Digital Graphic Designer & Media",
            "nameMr": "डिजिटल ग्राफिक्स डिझायनर व मीडिया",
            "icon": "🎨",
            "category": "Creative & Digital Media",
            "duration": "1 - 3 Years (Diploma / B.Voc)",
            "startingSalary": "₹20,000 - ₹40,000 / mo",
            "growthRate": "High (90%)",
            "minQualification": "10th / 12th Pass",
            "difficulty": "Moderate",
            "sideIncomeGigs": [
                {
                    "titleEn": "Festival & Event Banner Design",
                    "titleMr": "सण व सोहळे बॅनर डिझाईन",
                    "estEarning": "₹6,000 - ₹18,000 / mo",
                    "hours": "8-12 hrs/week",
                    "descEn": "Design social media posters, birthday banners & flex prints for local shops and political leaders.",
                    "descMr": "स्थानिक दुकाने व नेत्यांसाठी सोशल मीडिया पोस्टर्स आणि फ्लेक्स डिझाईन करा."
                },
                {
                    "titleEn": "YouTube & Instagram Reel Editing",
                    "titleMr": "युट्यूब व इंस्टाग्राम रील्स एडिटिंग",
                    "estEarning": "₹5,000 - ₹15,000 / mo",
                    "hours": "6-10 hrs/week",
                    "descEn": "Edit short videos and promotional reels for regional content creators.",
                    "descMr": "स्थानिक युट्युबर्स आणि दुकानांसाठी छोटे व्हिडिओ एडिट करा."
                }
            ]
        }
    ]
    return jsonify(careers_data)

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

@app.route("/api/mitra-tai", methods=["POST"])
def api_mitra_tai():
    data = request.get_json(force=True) or {}
    message = data.get("message", "").strip()
    lang = data.get("language") or session.get("lang") or "mr"
    student_id = session.get("studentId")

    try:
        resp = requests.get(f"{NODE_API_URL}/action-plan/{student_id}?lang={lang}", timeout=2.0)
        plan = resp.json().get("actionPlan", {})
        ai_narrative = plan.get("aiNarrative")
        
        if ai_narrative and "Hello" not in message and "नमस्कार" not in message:
            reply = f"{ai_narrative.get('summary', '')} {ai_narrative.get('financialOutlook', '')}"
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
        print("Mitra Tai fallback:", e)
        reply = "नमस्कार! मी मित्र ताई आहे. मी तुम्हाला करिअर आणि शिक्षणाबद्दल मदत करण्यासाठी येथे आहे." if lang == "mr" else "Hello! I am Mitra Tai. I am here to help you with career and education guidance."
        return jsonify({
            "reply": reply,
            "language": lang,
            "contextUsed": {}
        })
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
    
    # 1. Try NVIDIA NIM LLM if key is configured
    nvidia_key = os.environ.get("NVIDIA_API_KEY")
    if nvidia_key:
        active_models = [
            "meta/llama-3.2-11b-vision-instruct",
            "openai/gpt-oss-20b",
            "nvidia/nemotron-3-super-120b-a12b"
        ]
        
        headers = {
            "Authorization": f"Bearer {nvidia_key}",
            "Content-Type": "application/json"
        }
        
        if lang == "mr":
            system_instruction = (
                "तुम्ही 'मित्र ताई' (Mitra Tai) आहात — महाराष्ट्रातील ग्रामीण व निमशहरी विद्यार्थ्यांच्या करिअर मार्गदर्शक. "
                f"विद्यार्थ्याचे नाव: {name}, जिल्हा: {district}, शिक्षण: {cls_lvl}. "
                "नेहमी शुद्ध, सोप्या आणि उत्साहवर्धक मराठीत (Devanagari script) उत्तर द्या. "
                "उत्तरात १०वी/१२वी नंतरचे पर्याय, शासकीय तंत्रनिकेतन (Polytechnic), ITI, CAP rounds आणि महाडीबीटी शिष्यवृत्ती (MahaDBT EBC ५०% फी माफी, स्वाधार वसतिगृह योजना) यांचा उल्लेख करा. "
                "उत्तर १०० शब्दांच्या आत आणि मुद्द्यांमध्ये ठेवा."
            )
        elif lang == "hi":
            system_instruction = (
                "आप 'मित्र ताई' (Mitra Tai) हैं — महाराष्ट्र के विद्यार्थियों के लिए एक आत्मीय और बुद्धिमान करियर काउंसलर। "
                f"छात्र: {name}, जिला: {district}, कक्षा: {cls_lvl}. "
                "सरल और उत्साहजनक हिंदी में जवाब दें। सरकारी कॉलेज, ITI, और MahaDBT छात्रवृत्ति की सही जानकारी दें। उत्तर 100 शब्दों के अंदर रखें।"
            )
        else:
            system_instruction = (
                "You are Mitra Tai, a warm, highly encouraging, and intelligent female AI career guide for Maharashtra students. "
                f"Student: {name}, District: {district}, Education: {cls_lvl}. "
                "Provide practical, motivating advice in clear English. Mention Government Polytechnics, ITIs, CAP rounds, and MahaDBT scholarships when relevant. Keep response under 100 words."
            )

        for model_name in active_models:
            try:
                payload = {
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": user_msg}
                    ],
                    "temperature": 0.6,
                    "max_tokens": 300
                }
                resp = requests.post(
                    "https://integrate.api.nvidia.com/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=5.0
                )
                if resp.status_code == 200:
                    result = resp.json()
                    content = result.get("choices", [{}])[0].get("message", {}).get("content")
                    if content and len(content.strip()) > 5:
                        return jsonify({
                            "reply": content.strip(),
                            "ok": True,
                            "engine": "nvidia_nim",
                            "model": model_name
                        })
            except Exception as e:
                print(f"NVIDIA model {model_name} error:", e)
                continue

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
