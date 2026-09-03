import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
import app

client = app.app.test_client()

print("--- Testing Routes & APIs ---")

# 1. Page Routes
routes = [
    "/", "/login", "/onboarding", "/assessment", "/dashboard", "/roadmap", 
    "/career-aunty", "/mitra-tai", "/careerverse", "/career-dna", 
    "/resume-builder", "/skill-quest", "/kiosk", "/parent-mode",
    "/cost-calculator", "/documents", "/exam-calendar"
]
for r in routes:
    res = client.get(r)
    assert res.status_code == 200, f"Route {r} failed with status {res.status_code}"
    print(f"[OK] Route {r} -> HTTP 200")

# 2. Translations & Data APIs
for lang in ["mr", "hi", "en"]:
    res = client.get(f"/api/translations/{lang}")
    assert res.status_code == 200, f"Translation {lang} failed"
    data = json.loads(res.data)
    assert "app_name" in data and "mitra_tai_title" in data, f"Missing keys in {lang}"
print("[OK] Translations API -> HTTP 200")

# 3. Profile Save API
profile_payload = {
    "name": "Rahul Pawar",
    "age": 17,
    "class_level": "10th",
    "className": "10th",
    "district": "Pune",
    "taluka": "Haveli",
    "marks": 82,
    "income": 150000,
    "category": "OBC",
    "gender": "male",
    "disability": False,
    "mobility": "district",
    "budget": 50000,
    "language": "mr"
}
res = client.post("/api/profile", json=profile_payload)
assert res.status_code == 200, "Profile post failed"
print("[OK] Profile Save API -> HTTP 200")

# 4. Assessment Submission API
answers_payload = {
    "answers": {
        "q_technical": 5,
        "q_vocational": 4,
        "q_healthcare": 2,
        "q_publicService": 3,
        "q_business": 4,
        "q_creative": 3,
        "q_agriculture": 2,
        "q_academic": 4,
        "q_logical": 5,
        "q_verbal": 4
    }
}
res = client.post("/api/assessment", json=answers_payload)
assert res.status_code == 200, "Assessment post failed"
print("[OK] Assessment Submit API -> HTTP 200")

# 5. Dashboard Data API
res = client.get("/api/dashboard")
assert res.status_code == 200, "Dashboard data failed"
dash_data = json.loads(res.data)
assert "matches" in dash_data and len(dash_data["matches"]) > 0
print(f"[OK] Dashboard API -> HTTP 200 ({len(dash_data['matches'])} matches found)")

# 6. Roadmap API
top_career_id = dash_data["matches"][0]["id"]
res = client.get(f"/api/roadmap?careerId={top_career_id}")
assert res.status_code == 200, "Roadmap API failed"
print("[OK] Roadmap API -> HTTP 200")

# 7. Mitra Tai Context-Aware AI API
mitra_payload = {
    "message": "Which career is best for me?",
    "language": "mr"
}
res = client.post("/api/mitra-tai", json=mitra_payload)
assert res.status_code == 200, "Mitra Tai API failed"
mitra_data = json.loads(res.data)
assert "reply" in mitra_data and len(mitra_data["reply"]) > 10
print("[OK] Mitra Tai AI API -> HTTP 200")

print("\n--- ALL BACKEND & API TESTS PASSED PERFECTLY! ---")
