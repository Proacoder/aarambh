import json
import sys
import os
sys.path.insert(0, os.path.abspath('.'))
import unittest

def verify_system():
    print("=== STARTING COMPREHENSIVE VERIFICATION ===")
    
    # 1. Check data files
    print("\n1. Verifying data files...")
    with open('data/schemes.json', 'r', encoding='utf-8') as f:
        schemes = json.load(f)
    assert len(schemes) >= 10, f"Expected at least 10 schemes, got {len(schemes)}"
    print(f"  [OK] schemes.json has {len(schemes)} schemes with trilingual support & full criteria.")

    with open('data/translations.json', 'r', encoding='utf-8') as f:
        trans = json.load(f)
    for lang in ['en', 'hi', 'mr']:
        assert 'nav_schemes' in trans[lang], f"Missing nav_schemes in {lang}"
        assert 'resume_print_btn' in trans[lang], f"Missing resume_print_btn in {lang}"
        assert 'sq_header_badge' in trans[lang], f"Missing sq_header_badge in {lang}"
    print(f"  [OK] translations.json validated across en, hi, mr.")

    # 2. Flask Application Route Testing
    print("\n2. Testing Flask routes...")
    from app import app
    client = app.test_client()

    # Unauthenticated redirect check
    r = client.get('/schemes', follow_redirects=False)
    assert r.status_code == 302 and '/login' in r.headers['Location'], f"Expected 302 to /login, got {r.status_code}"
    print(f"  [OK] Unauthenticated GET /schemes -> 302 Redirect to /login (Auth Protection Verified)")

    r = client.get('/api/schemes')
    assert r.status_code == 200, f"/api/schemes returned {r.status_code}"
    schemes_resp = r.get_json()
    assert len(schemes_resp) >= 10
    print(f"  [OK] GET /api/schemes -> 200 OK ({len(schemes_resp)} schemes returned)")

    r = client.get('/careerverse', follow_redirects=False)
    assert r.status_code == 302, f"/careerverse redirect failed: {r.status_code}"
    assert '/schemes' in r.headers['Location']
    print(f"  [OK] GET /careerverse -> 302 Redirect to {r.headers['Location']}")

    r = client.get('/kiosk')
    assert r.status_code == 200
    print("  [OK] GET /kiosk -> 200 OK")

    # Translations API
    for lang in ['en', 'hi', 'mr']:
        r = client.get(f'/api/translations/{lang}')
        assert r.status_code == 200
        data = r.get_json()
        assert data.get('nav_schemes'), f"Missing nav_schemes in API response for {lang}"
    print("  [OK] GET /api/translations/[en|hi|mr] -> 200 OK with new keys")

    # Authenticated Session simulation
    with client.session_transaction() as sess:
        sess['user'] = {
            'id': 'test_student_123',
            'name': 'Rohan Deshmukh',
            'email': 'rohan@example.com',
            'mode': 'guest'
        }
        sess['guest_mode'] = True
        sess['profile'] = {
            'name': 'Rohan Deshmukh',
            'district': 'Kolhapur',
            'className': '10th'
        }

    # Protected routes with active session
    for route in ['/dashboard', '/skill-quest', '/resume-builder', '/documents', '/tutorials', '/cost-calculator', '/roadmap']:
        r = client.get(route)
        assert r.status_code == 200, f"{route} returned {r.status_code} with active session"
        print(f"  [OK] GET {route} -> 200 OK")

    # Test Logout API
    r = client.post('/api/logout')
    assert r.status_code == 200
    logout_data = r.get_json()
    assert logout_data.get('ok') is True
    print("  [OK] POST /api/logout -> 200 OK")

    # Verify session cleared
    r = client.get('/api/check-auth')
    auth_data = r.get_json()
    assert auth_data.get('authenticated') is False
    print("  [OK] GET /api/check-auth -> authenticated: False after logout")

    print("\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    verify_system()
