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
from werkzeug.middleware.proxy_fix import ProxyFix

from flask import Flask, render_template, request, jsonify, session, send_from_directory, redirect, url_for, Response

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "templates"),
    static_folder=str(BASE_DIR / "static"),
    static_url_path="/static"
)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "careermitra-dev-secret-change-me")

# Ensure proper protocol handling behind reverse proxies (Vercel / Render)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# Cookie settings for cross-origin OAuth callbacks
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

oauth = OAuth(app)
oauth.register(
    name='google',
    client_id=os.environ.get('GOOGLE_CLIENT_ID', ''),
    client_secret=os.environ.get('GOOGLE_CLIENT_SECRET', ''),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

@app.after_request
def add_no_cache_headers(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

NODE_API_URL = os.environ.get("NODE_API_URL", "http://localhost:3000/api")

# ---------------------------------------------------------------------------
# Auth helper — lightweight session-based check
# ---------------------------------------------------------------------------
from functools import wraps
from flask import redirect, url_for

def require_login(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user" not in session:
            if request.path not in ["/login", "/api/login", "/login/google", "/auth/callback"]:
                session["next_url"] = request.url
            return redirect(url_for("login_page"))
        return f(*args, **kwargs)
    return decorated

# ---------------------------------------------------------------------------
# Page routes (serve HTML templates)
# ---------------------------------------------------------------------------
@app.route("/")
def landing():
    return render_template("index.html")

@app.route("/login")
def login_page():
    next_url = request.args.get("next")
    if next_url:
        session["next_url"] = next_url
    return render_template("login.html")

@app.route("/login/google")
@app.route("/auth/google")
def login_google():
    next_url = request.args.get("next")
    if next_url:
        session["next_url"] = next_url

    client_id = os.environ.get('GOOGLE_CLIENT_ID', '').strip()
    client_secret = os.environ.get('GOOGLE_CLIENT_SECRET', '').strip()
    if not client_id or not client_secret:
        print("⚠️ Google OAuth credentials not configured in environment.")
        return redirect("/login?error=oauth_not_configured")

    redirect_uri = url_for('auth_callback', _external=True)
    if request.headers.get('X-Forwarded-Proto') == 'https' or request.is_secure or os.environ.get('VERCEL') or os.environ.get('RENDER'):
        if redirect_uri.startswith('http://'):
            redirect_uri = 'https://' + redirect_uri[7:]

    return oauth.google.authorize_redirect(redirect_uri)

@app.route("/auth/callback")
def auth_callback():
    try:
        token = oauth.google.authorize_access_token()
    except Exception as e:
        print("OAuth authorize error:", e)
        return redirect("/login?error=oauth_failed")

    user_info = token.get('userinfo') if token else None
    if not user_info and token:
        try:
            resp = oauth.google.get('https://openidconnect.googleapis.com/v1/userinfo', token=token)
            if resp.ok:
                user_info = resp.json()
        except Exception as e:
            print("OAuth userinfo fallback error:", e)

    if user_info:
        email = user_info.get("email")
        name = user_info.get("name") or user_info.get("given_name") or (email.split("@")[0] if email else "Student")
        picture = user_info.get("picture")
        sub = user_info.get("sub", "")

        # Seamless upgrade: if user was in guest mode, preserve any existing profile data
        existing_profile = session.get("profile") or {}
        if not existing_profile.get("name") or existing_profile.get("name") == "Guest Student":
            existing_profile["name"] = name
        existing_profile["email"] = email
        if picture:
            existing_profile["picture"] = picture

        session["user"] = {
            "id": f"google_{sub or uuid.uuid4().hex[:8]}",
            "email": email,
            "name": name,
            "picture": picture,
            "mode": "google"
        }
        session["guest_mode"] = False
        session["profile"] = existing_profile

        next_target = session.pop("next_url", None)
        if next_target and not next_target.endswith("/login"):
            return redirect(next_target)

        if existing_profile.get("district") and existing_profile.get("className"):
            return redirect(url_for("dashboard"))
        return redirect(url_for("onboarding"))

    return redirect(url_for("landing"))

@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(force=True) or {}
    mode = data.get("mode", "guest")
    if mode == "guest":
        session["user"] = {
            "id": f"guest_{uuid.uuid4().hex[:8]}",
            "email": None,
            "name": "Guest Student",
            "mode": "guest"
        }
        session["guest_mode"] = True
    next_target = session.pop("next_url", "/onboarding")
    return jsonify({"ok": True, "user": session.get("user"), "redirect": next_target})

@app.route("/api/check-auth")
def api_check_auth():
    if "user" in session:
        user = session["user"]
        is_guest = user.get("mode") == "guest" or session.get("guest_mode", False)
        profile = session.get("profile")
        has_profile = profile is not None and bool(profile.get("name"))
        return jsonify({
            "authenticated": True,
            "user": user,
            "isGuest": bool(is_guest),
            "hasProfile": bool(has_profile)
        })
    return jsonify({"authenticated": False, "isGuest": False, "hasProfile": False})

@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.clear()
    return jsonify({"ok": True})

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
@require_login
def onboarding():
    districts = get_districts_list()
    return render_template("onboarding.html", districts=districts, user=session.get("user"))

@app.route("/assessment")
@require_login
def assessment():
    return render_template("assessment.html")

@app.route("/dashboard")
@require_login
def dashboard():
    return render_template("dashboard.html")

@app.route("/roadmap")
@require_login
def roadmap_page():
    return render_template("roadmap.html")

@app.route("/all-colleges")
@app.route("/colleges")
@require_login
def all_colleges_page():
    return render_template("all_colleges.html")

@app.route("/career-aunty")
@app.route("/mitra-tai")
@require_login
def career_aunty_page():
    return render_template("career_aunty.html")

@app.route("/career-dna")
@require_login
def career_dna_page():
    return render_template("career_dna.html")

@app.route("/all-schemes")
@app.route("/schemes")
@require_login
def schemes_page():
    return render_template("schemes.html")

@app.route("/careerverse")
def careerverse_redirect():
    return redirect("/schemes")

@app.route("/api/schemes")
def api_schemes():
    import json
    with open(DATA_DIR / "schemes.json", encoding="utf-8") as f:
        schemes = json.load(f)
    return jsonify(schemes)

_tts_cache = {}

@app.route("/api/tts")
def api_tts():
    import urllib.request
    import urllib.parse
    import re
    text = request.args.get("text", "").strip()
    lang = request.args.get("lang", "mr").strip()
    if not text:
        return ("", 400)
    
    tl = "mr" if lang == "mr" else ("hi" if lang == "hi" else "en")
    clean_text = re.sub(r'[*#`_~]', '', text).strip()
    cache_key = f"{tl}:{clean_text}"
    if cache_key in _tts_cache:
        return Response(_tts_cache[cache_key], mimetype="audio/mpeg")

    # Split text into clean chunks of up to 180 characters each
    chunks = []
    sentences = re.split(r'([।\.\!\?]+[\s\n]*)', clean_text)
    current = ""
    for part in sentences:
        if len(current) + len(part) < 180:
            current += part
        else:
            if current.strip():
                chunks.append(current.strip())
            current = part
    if current.strip():
        chunks.append(current.strip())

    if not chunks:
        chunks = [clean_text[:180]]

    audio_parts = []
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    for ch in chunks[:4]:
        encoded = urllib.parse.quote(ch)
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl={tl}&client=tw-ob&q={encoded}"
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=4) as resp:
                audio_parts.append(resp.read())
        except Exception:
            pass

    if audio_parts:
        full_audio = b"".join(audio_parts)
        if len(_tts_cache) < 300:
            _tts_cache[cache_key] = full_audio
        return Response(full_audio, mimetype="audio/mpeg")
    return ("", 500)

@app.route("/parent-mode")
@require_login
def parent_mode_page():
    return render_template("parent_mode.html")

@app.route("/resume-builder")
@require_login
def resume_builder_page():
    return render_template("resume_builder.html")

@app.route("/skill-quest")
@require_login
def skill_quest_page():
    return render_template("skill_quest.html")

@app.route("/tutorials")
@require_login
def tutorials_page():
    return render_template("tutorials.html")

@app.route("/career-compare")
@app.route("/compare")
@require_login
def career_compare_page():
    return render_template("career_compare.html")

@app.route("/kiosk")
def kiosk_page():
    if "user" not in session:
        session["user"] = {
            "id": f"kiosk_{uuid.uuid4().hex[:8]}",
            "email": None,
            "name": "Kiosk Student",
            "mode": "kiosk"
        }
        session["guest_mode"] = True
    return render_template("kiosk.html")

@app.route("/guider")
def guider_page():
    return render_template("guider_dashboard.html")

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
    student_id = session.get("studentId", "guest_123")
    profile = session.get("profile") or {}
    lang = session.get("lang", "en")
    career_id = request.args.get("careerId", "").strip()

    if not profile:
        profile = {
            "id": student_id,
            "name": "Student",
            "district": "Pune",
            "className": "10th",
            "category": "General",
            "income": 150000
        }
        session["profile"] = profile

    # 1. Load local datasets for rich fallback and matching
    import json
    careers_data = []
    schemes_data = []
    colleges_data = []
    try:
        with open(DATA_DIR / "careers.json", encoding="utf-8") as f:
            careers_data = json.load(f)
        with open(DATA_DIR / "schemes.json", encoding="utf-8") as f:
            schemes_data = json.load(f)
        with open(DATA_DIR / "colleges.json", encoding="utf-8") as f:
            colleges_data = json.load(f)
    except Exception as e:
        print("Error loading datasets in roadmap:", e)

    # 2. Match relevant scholarships based on profile
    category = (profile.get("category") or "OPEN").upper()
    try:
        income = float(profile.get("income") or 150000)
    except (ValueError, TypeError):
        income = 150000.0

    matched_schemes = []
    for s in schemes_data:
        el = s.get("eligibility") or {}
        max_income = el.get("incomeLimit") or s.get("maxIncome", 800000)
        if income > max_income:
            continue
        cats = el.get("category") or s.get("eligibleCategories", [])
        if cats:
            cat_list = [c.upper() for c in cats]
            if "OPEN" in cat_list or "ALL" in cat_list or category in cat_list:
                matched_schemes.append(s)
            elif category in ["OBC", "EBC"] and ("OPEN" in cat_list or "EBC" in cat_list):
                matched_schemes.append(s)
        else:
            matched_schemes.append(s)

    if not matched_schemes:
        matched_schemes = schemes_data[:4]

    scholarship_steps = []
    for s in matched_schemes[:4]:
        s_name = s.get("name") or s.get("title") or "Scholarship Scheme"
        s_amount = s.get("amount") or s.get("benefits") or "Tuition Fee Waiver"
        scholarship_steps.append(f"{s_name} — {s_amount}")

    # 3. If a specific career is requested from careers.json, build direct pathway
    matched_career = None
    if career_id:
        for c in careers_data:
            if c.get("id") == career_id:
                matched_career = c
                break

    if matched_career:
        c_name = matched_career.get("name", {}).get(lang) or matched_career.get("name", {}).get("en") or matched_career.get("id")
        c_desc = matched_career.get("description", {}).get(lang) or matched_career.get("description", {}).get("en") or ""
        
        pathway = []
        for step in matched_career.get("pathway", []):
            if isinstance(step, dict):
                pathway.append(step.get(lang) or step.get("en") or "")
            else:
                pathway.append(str(step))

        immediate_steps = pathway[:3] if len(pathway) >= 3 else pathway[:2]
        later_steps = pathway[3:] if len(pathway) >= 3 else pathway[2:]

        if not immediate_steps:
            immediate_steps = [
                "Complete foundational coursework with strong emphasis on core practical concepts.",
                "Register for Maharashtra Centralised Admission Process (CAP) / Entrance Exam.",
                "Obtain your Domicile Certificate & Tahsildar Income Certificate from your local Setu Seva Kendra."
            ]
        if not later_steps:
            later_steps = [
                "Pursue specialized training, certifications, and industry internships.",
                "Build hands-on practical project portfolio to demonstrate competence.",
                "Apply for placement rounds or state technical recruitment examinations."
            ]

        # Find colleges offering relevant courses
        nearby_colleges = []
        c_id = matched_career.get("id", "")
        for clg in colleges_data:
            c_courses = clg.get("courses", [])
            if any(kw in crs.lower() for kw in c_id.replace("_", " ").split() for crs in c_courses):
                nearby_colleges.append(f"{clg.get('name')} ({clg.get('district')}) — {', '.join(c_courses[:2])}")
        if not nearby_colleges:
            nearby_colleges = [f"{clg.get('name')} ({clg.get('district')})" for clg in colleges_data[:4]]

        long_term = f"High employment demand across Maharashtra for {c_name}. Typical entry package: ₹2.4L - ₹4.5L/year with structured promotions in government and private sectors."

        return jsonify({
            "roadmap": {
                "careerGoal": c_name,
                "immediateSteps": immediate_steps,
                "scholarshipSteps": scholarship_steps,
                "laterSteps": later_steps,
                "nearbyCollegeNames": nearby_colleges[:4],
                "longTermOutlook": long_term
            },
            "career": {
                "id": matched_career.get("id"),
                "name": c_name,
                "description": c_desc
            },
            "colleges": [{"name": clg.get("name"), "district": clg.get("district"), "distanceKm": 15} for clg in colleges_data[:4]],
            "schemes": [{"name": s.get("name") or s.get("title"), "benefit": s.get("amount") or s.get("benefits")} for s in matched_schemes[:4]],
            "profile": profile
        })

    # 4. Otherwise query Node API for assessment-based Action Plan
    try:
        resp = requests.get(f"{NODE_API_URL}/action-plan/{student_id}?lang={lang}", timeout=2.0)
        if resp.status_code == 200:
            plan = resp.json().get("actionPlan", {})
            career = plan.get("primaryCareerPath", {})
            milestones = plan.get("milestones", [])
            
            if milestones and len(milestones) > 0:
                immediate = milestones[0].get("actions", [])
                later = []
                for m in milestones[1:]:
                    later.extend(m.get("actions", []))

                node_scholarships = []
                for s in plan.get("matchedScholarships", []):
                    s_name = s.get("name", "Scholarship")
                    s_amt = s.get("amount", "")
                    node_scholarships.append(f"{s_name} — {s_amt}" if s_amt else s_name)

                colleges_nearby = []
                for c in career.get("topRecommendedColleges", []):
                    colleges_nearby.append(f"{c.get('collegeName')} ({c.get('district')}) — {c.get('courseName')} (~{c.get('distanceKm')} km)")

                domain_str = career.get("domain", "Engineering & Technical").capitalize()

                return jsonify({
                    "roadmap": {
                        "careerGoal": f"{domain_str} Track",
                        "immediateSteps": immediate or [
                            "Obtain Tahsildar Income Certificate (< ₹8 Lakhs) & Maharashtra Domicile from Setu Kendra.",
                            "Verify Aadhaar NPCI bank linkage for DBT scholarship direct credit.",
                            "Register for Maharashtra DTE Centralised Admission Process (CAP)."
                        ],
                        "scholarshipSteps": node_scholarships or scholarship_steps,
                        "laterSteps": later or [
                            "Complete first-year diploma or degree with focus on core practical subjects.",
                            "Undergo MSME industrial summer internship or apprenticeship program.",
                            "Appear for technical certifications and campus recruitment drives."
                        ],
                        "nearbyCollegeNames": colleges_nearby or [f"{clg.get('name')} ({clg.get('district')})" for clg in colleges_data[:4]],
                        "longTermOutlook": career.get("summary") or "Strong alignment with industrial growth corridors across Maharashtra. Excellent technical and government recruitment opportunities."
                    },
                    "career": {
                        "id": career.get("domain", "realistic"),
                        "name": f"{domain_str} Track",
                        "description": career.get("summary", "Personalized career roadmap based on your assessment results.")
                    },
                    "colleges": [{"name": c.get("collegeName"), "district": c.get("district"), "distanceKm": c.get("distanceKm")} for c in career.get("topRecommendedColleges", [])],
                    "schemes": [{"name": s.get("name"), "benefit": s.get("amount")} for s in plan.get("matchedScholarships", [])],
                    "profile": profile
                })
    except Exception as e:
        print("Roadmap Node API fallback:", e)

    # 5. Local Fallback with rich defaults
    return jsonify({
        "roadmap": {
            "careerGoal": "Engineering & Technology Track",
            "immediateSteps": [
                "Complete Board examinations with focus on Mathematics & Science fundamentals.",
                "Register for Maharashtra DTE Centralised Admission Process (CAP) round.",
                "Obtain Tahsildar Income Certificate (< ₹8 Lakhs) & Domicile Certificate from CSC/Setu Kendra."
            ],
            "scholarshipSteps": scholarship_steps,
            "laterSteps": [
                "Maintain 7.5+ CGPA in diploma/degree foundation coursework.",
                "Master hands-on technical skills through college tinkering labs and CAD/coding tools.",
                "Undergo 6-week MSME industrial summer internship in Pune, Nashik or Chhatrapati Sambhajinagar."
            ],
            "longTermOutlook": "Extremely high demand across Maharashtra automotive, manufacturing & tech corridors (MIDC Bhosari, Chakan, Talegaon, Aurangabad). Expected initial package: ₹2.5L - ₹4.5L/year.",
            "nearbyCollegeNames": [f"{clg.get('name')} ({clg.get('district')})" for clg in colleges_data[:4]]
        },
        "career": {
            "id": "realistic",
            "name": "Engineering & Technology Track",
            "description": "Strong alignment with practical problem-solving, engineering systems, and industrial growth."
        },
        "colleges": [{"name": clg.get("name"), "district": clg.get("district"), "distanceKm": 15} for clg in colleges_data[:4]],
        "schemes": [{"name": s.get("name") or s.get("title"), "benefit": s.get("amount") or s.get("benefits")} for s in matched_schemes[:4]],
        "profile": profile
    })

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
        print(e)
        return jsonify({"reply": "I am currently unable to reach my AI brain. Please try again."})

@app.route("/api/reset", methods=["POST"])
def api_reset():
    session.clear()
    return jsonify({"ok": True})

@app.route("/cost-calculator")
@require_login
def cost_calculator():
    return render_template("cost_calculator.html")

@app.route("/documents")
@require_login
def documents():
    return render_template("documents.html")

@app.route("/exam-calendar")
@require_login
def exam_calendar():
    return render_template("exam_calendar.html")

@app.route("/api/cost-calculator", methods=["POST"])
def api_cost_calculator():
    import json, math
    data = request.get_json(force=True) or {}
    college_id = data.get("collegeId")
    home_district = data.get("homeDistrict") or (session.get("profile", {}).get("district")) or "Pune"
    accommodation_type = data.get("accommodationType") or data.get("accommodation") or "govtHostel"
    food_type = data.get("foodType") or data.get("food") or "collegeMess"
    family_income = data.get("familyIncome")
    if family_income is None:
        family_income = data.get("income")
    if family_income is None:
        family_income = session.get("profile", {}).get("income", 0)
    
    # Load data
    with open(DATA_DIR / "colleges.json", encoding="utf-8") as f:
        colleges = json.load(f)
    with open(DATA_DIR / "city_cost_index.json", encoding="utf-8") as f:
        cost_index = json.load(f)
    with open(DATA_DIR / "districts.json", encoding="utf-8") as f:
        districts = json.load(f)
    with open(DATA_DIR / "schemes.json", encoding="utf-8") as f:
        schemes = json.load(f)
    
    # Find college with safe fallback
    college = next((c for c in colleges if c["id"] == college_id), None)
    if not college:
        college = colleges[0] if colleges else {
            "id": "clg-gp-pune",
            "name": "Government Polytechnic, Pune",
            "district": "Pune",
            "type": "Government",
            "annualFee": 8000,
            "lat": 18.5320,
            "lng": 73.8450
        }
    
    college_district = college.get("district", "Pune")
    costs = cost_index.get(college_district, cost_index.get("Pune", {}))
    
    # Calculate travel distance
    home_coords = districts.get(home_district) or districts.get("Pune", {"lat": 18.5204, "lng": 73.8567})
    clg_lat = college.get("lat", 18.5204)
    clg_lng = college.get("lng", 73.8567)
    R = 6371.0
    lat1, lng1 = math.radians(home_coords["lat"]), math.radians(home_coords["lng"])
    lat2, lng2 = math.radians(clg_lat), math.radians(clg_lng)
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlng/2)**2
    distance_km = max(5.0, round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a)), 1))
    
    # Costs
    tuition = college.get("annualFee", 8000)
    accom_dict = costs.get("accommodation", {})
    accom = accom_dict.get(accommodation_type) or accom_dict.get("govtHostel", {"monthly": 1200, "label": "Government Hostel"})
    food_dict = costs.get("food", {})
    food = food_dict.get(food_type) or food_dict.get("collegeMess", {"monthly": 3000, "label": "College Mess"})
    
    accom_annual = accom.get("monthly", 1200) * 10
    food_annual = food.get("monthly", 3000) * 10
    local_transport_annual = costs.get("transport", {}).get("localMonthlyPass", 800) * 10
    personal_annual = costs.get("personal", {}).get("monthly", 1200) * 10
    phone_annual = costs.get("phone", {}).get("monthly", 300) * 12
    books_annual = costs.get("books", {}).get("annual", 4000)
    medical_annual = costs.get("medical", {}).get("annual", 1500)
    
    # Inter-city travel (MSRTC rate ~₹1.2/km, 5 round trips/year)
    st_bus_rate = 1.2
    trips_per_year = 5
    one_way_fare = round(distance_km * st_bus_rate)
    travel_annual = one_way_fare * 2 * trips_per_year
    
    subtotal = tuition + accom_annual + food_annual + travel_annual + local_transport_annual + personal_annual + phone_annual + books_annual + medical_annual
    emergency = round(subtotal * 0.05)
    total = subtotal + emergency
    
    # Scholarship deductions — support both old & new schemes schema
    profile = session.get("profile", {})
    category = str(data.get("category") or profile.get("category", "OPEN")).strip()
    cat_upper = category.upper()
    income = float(family_income or 0)
    
    scholarship_total = 0
    matched_scholarships = []
    
    for s in schemes:
        sch_name = s.get("name") or s.get("title") or "Scholarship Scheme"
        sch_benefit = s.get("amount") or s.get("benefits") or "Tuition Assistance"
        
        # Max income limit
        max_income = float("inf")
        if isinstance(s.get("eligibility"), dict):
            max_income = s["eligibility"].get("incomeLimit") or float("inf")
        elif s.get("maxIncome"):
            max_income = s["maxIncome"]
        
        if income > 0 and income > max_income:
            continue
            
        # Eligible categories
        elig_cats = []
        if isinstance(s.get("eligibility"), dict):
            elig_cats = s["eligibility"].get("category", [])
        elif s.get("eligibleCategories"):
            elig_cats = s["eligibleCategories"]
            
        elig_upper = [str(c).upper() for c in elig_cats]
        
        # Matching logic
        is_match = False
        if not elig_upper:
            is_match = True
        elif cat_upper in elig_upper or (cat_upper in ["OPEN", "GENERAL"] and ("OPEN" in elig_upper or "EBC" in elig_upper or "GENERAL" in elig_upper)):
            is_match = True
        elif any(cat_upper in c for c in elig_upper):
            is_match = True
            
        if is_match:
            matched_scholarships.append({"name": sch_name, "benefit": sch_benefit})
    
    # Calculate scholarship deductions
    for s in matched_scholarships:
        b_text = s["benefit"].lower()
        if "tuition" in b_text or "fee" in b_text:
            if "50%" in b_text:
                scholarship_total += round(tuition * 0.5)
            else:
                scholarship_total += tuition
        if "hostel" in b_text or "vasatigruh" in b_text or "nirvah" in b_text:
            scholarship_total += min(30000, accom_annual)
            
    # Cap scholarship deduction at gross total
    scholarship_total = min(total, scholarship_total)
    net_cost = max(0, total - scholarship_total)
    monthly_cost = round(net_cost / 12)
    
    # Family budget impact
    family_monthly_income = round(income / 12) if income > 0 else 0
    if family_monthly_income > 0:
        income_pct = min(100, round((monthly_cost / family_monthly_income) * 100))
    else:
        income_pct = 20  # reasonable default when income not provided
    
    return jsonify({
        "college": {
            "name": college.get("name", "Target College"),
            "district": college_district,
            "type": college.get("type", "Government")
        },
        "homeDistrict": home_district,
        "distanceKm": distance_km,
        "breakdown": {
            "tuition": {"annual": tuition, "label": "Tuition & Fees"},
            "accommodation": {"annual": accom_annual, "monthly": accom.get("monthly", 1200), "label": accom.get("label", "Government Hostel")},
            "food": {"annual": food_annual, "monthly": food.get("monthly", 3000), "label": food.get("label", "College Mess")},
            "travel": {"annual": travel_annual, "oneWayFare": one_way_fare, "tripsPerYear": trips_per_year, "label": f"ST Bus Travel ({trips_per_year} round trips)"},
            "localTransport": {"annual": local_transport_annual, "monthly": costs.get("transport", {}).get("localMonthlyPass", 800), "label": costs.get("transport", {}).get("label", "Local Transit")},
            "personal": {"annual": personal_annual, "monthly": costs.get("personal", {}).get("monthly", 1200), "label": "Personal & Miscellaneous"},
            "phone": {"annual": phone_annual, "monthly": costs.get("phone", {}).get("monthly", 300), "label": costs.get("phone", {}).get("label", "Phone & Internet")},
            "books": {"annual": books_annual, "label": costs.get("books", {}).get("label", "Books & Study Materials")},
            "medical": {"annual": medical_annual, "label": costs.get("medical", {}).get("label", "Medical & Emergency")},
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
        "costTier": costs.get("tierLabel", "Tier 2 Hub")
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
