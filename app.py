import os
import random
import sqlite3
import time
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'career-mitra-secret-key-2026-mvp')

# Database Configuration (PostgreSQL with SQLite fallback)
PG_HOST = os.environ.get('POSTGRES_HOST', 'localhost')
PG_DB = os.environ.get('POSTGRES_DB', 'careermitra')
PG_USER = os.environ.get('POSTGRES_USER', 'postgres')
PG_PASS = os.environ.get('POSTGRES_PASSWORD', 'postgres')
PG_PORT = os.environ.get('POSTGRES_PORT', '5432')
DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    """Returns a PostgreSQL connection if available, otherwise falls back to SQLite."""
    if DATABASE_URL or os.environ.get('USE_POSTGRES') == 'true':
        try:
            import psycopg2
            import psycopg2.extras
            conn_str = DATABASE_URL if DATABASE_URL else f"host={PG_HOST} dbname={PG_DB} user={PG_USER} password={PG_PASS} port={PG_PORT}"
            conn = psycopg2.connect(conn_str)
            return conn, 'postgres'
        except Exception as e:
            print(f"[DB Warning] Could not connect to PostgreSQL ({e}). Falling back to SQLite.")
    
    # SQLite Fallback
    db_path = os.path.join(os.path.dirname(__file__), 'career_mitra.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn, 'sqlite'

def init_db():
    """Initialize user table and seed demo user if empty."""
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        
        if db_type == 'postgres':
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    mobile VARCHAR(15) UNIQUE NOT NULL,
                    name VARCHAR(100),
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    mobile TEXT UNIQUE NOT NULL,
                    name TEXT,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """)
        conn.commit()

        # Seed Demo User if not existing
        demo_mobile = '9876543210'
        if db_type == 'postgres':
            cursor.execute("SELECT id FROM users WHERE mobile = %s", (demo_mobile,))
        else:
            cursor.execute("SELECT id FROM users WHERE mobile = ?", (demo_mobile,))
        
        if not cursor.fetchone():
            hashed_pw = generate_password_hash('password123')
            if db_type == 'postgres':
                cursor.execute(
                    "INSERT INTO users (mobile, name, password_hash) VALUES (%s, %s, %s)",
                    (demo_mobile, 'Demo Student', hashed_pw)
                )
            else:
                cursor.execute(
                    "INSERT INTO users (mobile, name, password_hash) VALUES (?, ?, ?)",
                    (demo_mobile, 'Demo Student', hashed_pw)
                )
            conn.commit()
            print(f"[DB Init] Demo user created -> Mobile: {demo_mobile}, Password: password123")

        conn.close()
    except Exception as e:
        print(f"[DB Error] Initialization failed: {e}")

# Run DB initialization at server start
init_db()

@app.route('/')
def home():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        if 'user_id' in session:
            return redirect(url_for('dashboard'))
        return render_template('login.html')

    # POST Form Submission
    login_type = request.form.get('login_type', 'password')
    mobile = request.form.get('mobile', '').strip()

    if not mobile or len(mobile) != 10 or not mobile.isdigit():
        return render_template('login.html', error='Please provide a valid 10-digit Indian mobile number.')

    # 1. Password Login
    if login_type == 'password':
        password = request.form.get('password', '')
        if not password:
            return render_template('login.html', error='Password is required.')

        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        
        if db_type == 'postgres':
            cursor.execute("SELECT id, mobile, name, password_hash FROM users WHERE mobile = %s", (mobile,))
        else:
            cursor.execute("SELECT id, mobile, name, password_hash FROM users WHERE mobile = ?", (mobile,))
        
        user = cursor.fetchone()
        conn.close()

        if user:
            # Handle Row indexing (tuple or dict)
            user_id = user[0] if isinstance(user, tuple) else user['id']
            user_mobile = user[1] if isinstance(user, tuple) else user['mobile']
            user_name = user[2] if isinstance(user, tuple) else user['name']
            pw_hash = user[3] if isinstance(user, tuple) else user['password_hash']

            if check_password_hash(pw_hash, password):
                session['user_id'] = user_id
                session['mobile'] = user_mobile
                session['name'] = user_name or 'User'
                return redirect(url_for('dashboard'))

        # Fallback for demo testing if database not pre-populated
        if mobile == '9876543210' and password == 'password123':
            session['user_id'] = 1
            session['mobile'] = mobile
            session['name'] = 'Demo Student'
            return redirect(url_for('dashboard'))

        return render_template('login.html', error='Invalid mobile number or password.')

    # 2. OTP Login
    elif login_type == 'otp':
        entered_otp = request.form.get('otp', '').strip()
        
        stored_otp = session.get('otp_code')
        stored_mobile = session.get('otp_mobile')
        otp_time = session.get('otp_time', 0)

        # Allow demo code 123456 or valid session OTP
        is_demo_otp = (entered_otp == '123456')
        is_valid_session_otp = (stored_otp and stored_mobile == mobile and stored_otp == entered_otp and (time.time() - otp_time) < 300)

        if is_demo_otp or is_valid_session_otp:
            # Fetch or create user
            conn, db_type = get_db_connection()
            cursor = conn.cursor()
            
            if db_type == 'postgres':
                cursor.execute("SELECT id, mobile, name FROM users WHERE mobile = %s", (mobile,))
            else:
                cursor.execute("SELECT id, mobile, name FROM users WHERE mobile = ?", (mobile,))
            
            user = cursor.fetchone()
            
            if user:
                user_id = user[0] if isinstance(user, tuple) else user['id']
                user_name = user[2] if isinstance(user, tuple) else user['name']
            else:
                # Auto-register user on OTP verify
                default_pw = generate_password_hash('otp_authenticated')
                if db_type == 'postgres':
                    cursor.execute("INSERT INTO users (mobile, name, password_hash) VALUES (%s, %s, %s) RETURNING id", (mobile, f"User {mobile[-4:]}", default_pw))
                    user_id = cursor.fetchone()[0]
                else:
                    cursor.execute("INSERT INTO users (mobile, name, password_hash) VALUES (?, ?, ?)", (mobile, f"User {mobile[-4:]}", default_pw))
                    user_id = cursor.lastrowid
                conn.commit()
                user_name = f"User {mobile[-4:]}"
            
            conn.close()

            # Clear used OTP from session
            session.pop('otp_code', None)
            session.pop('otp_mobile', None)

            session['user_id'] = user_id
            session['mobile'] = mobile
            session['name'] = user_name
            return redirect(url_for('dashboard'))
        else:
            return render_template('login.html', error='Invalid or expired OTP. Try 123456 for demo.')

    return render_template('login.html', error='Invalid request.')

@app.route('/send-otp', methods=['POST'])
def send_otp():
    """Generates a 6-digit OTP and returns JSON response."""
    data = request.get_json() or {}
    mobile = data.get('mobile', '').strip()

    if not mobile or len(mobile) != 10 or not mobile.isdigit():
        return jsonify({'success': False, 'message': 'Invalid 10-digit Indian mobile number.'}), 400

    # Generate 6-digit OTP (Static demo OTP 123456 or random)
    otp = "123456" # For deterministic demo testing, could also be str(random.randint(100000, 999999))
    session['otp_code'] = otp
    session['otp_mobile'] = mobile
    session['otp_time'] = time.time()

    return jsonify({
        'success': True,
        'message': f'OTP sent successfully to +91 {mobile}.',
        'demo_otp': otp
    })

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    """API endpoint to verify OTP."""
    data = request.get_json() or {}
    mobile = data.get('mobile', '').strip()
    otp = data.get('otp', '').strip()

    stored_otp = session.get('otp_code')
    stored_mobile = session.get('otp_mobile')

    if otp == '123456' or (stored_otp and stored_mobile == mobile and stored_otp == otp):
        return jsonify({'success': True, 'message': 'OTP verified successfully.'})
    
    return jsonify({'success': False, 'message': 'Invalid OTP.'}), 400

@app.route('/dashboard')
def dashboard():
    """Post-login landing page showcasing success."""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_name = session.get('name', 'User')
    mobile = session.get('mobile', '')
    
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Career Mitra | Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;800&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            body {{
                background: #0B0F19;
                color: #F9FAFB;
                font-family: 'Plus Jakarta Sans', sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
            }}
            .card {{
                background: rgba(18, 24, 38, 0.85);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                max-width: 440px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            }}
            .icon {{
                font-size: 48px;
                color: #10B981;
                margin-bottom: 16px;
            }}
            h2 {{ margin-bottom: 8px; font-size: 26px; }}
            p {{ color: #9CA3AF; margin-bottom: 24px; }}
            .btn-logout {{
                display: inline-block;
                padding: 12px 24px;
                background: linear-gradient(135deg, #EF4444, #DC2626);
                color: white;
                text-decoration: none;
                border-radius: 10px;
                font-weight: 700;
                transition: transform 0.2s;
            }}
            .btn-logout:hover {{ transform: translateY(-2px); }}
        </style>
    </head>
    <body>
        <div class="card">
            <i class="fa-solid fa-circle-check icon"></i>
            <h2>Welcome back, {user_name}!</h2>
            <p>Authenticated Mobile: <strong>+91 {mobile}</strong></p>
            <p>You have successfully logged into <strong>Career Mitra</strong>.</p>
            <a href="/logout" class="btn-logout"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</a>
        </div>
    </body>
    </html>
    """

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/register')
def register():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Career Mitra | Register</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;800&display=swap" rel="stylesheet">
        <style>
            body { background: #0B0F19; color: #F9FAFB; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .card { background: rgba(18, 24, 38, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 40px; text-align: center; max-width: 440px; }
            a { color: #06B6D4; font-weight: 700; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Registration Page</h2>
            <p>Register feature (register.html) will be added in Phase 2 as planned!</p>
            <a href="/login">&larr; Back to Login</a>
        </div>
    </body>
    </html>
    """

if __name__ == '__main__':
    print("[SERVER] Starting Career Mitra Flask Server on http://127.0.0.1:5000 ...")
    app.run(host='127.0.0.1', port=5000, debug=True)
