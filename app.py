"""
app.py
Shared entry point. This file should stay tiny.
Every teammate registers exactly ONE line here for their own module.
Do not add routes directly in this file — put them in your own
blueprint under <yourmodule>/routes.py.
"""

import os
from flask import Flask, render_template, send_from_directory
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, template_folder='.')
app.secret_key = os.getenv("SECRET_KEY", "career-mitra-2026")

# ---------------------------------------
# REGISTER BLUEPRINTS
# ---------------------------------------
from location.routes import location_bp
app.register_blueprint(location_bp)

# Teammates add their own imports + registrations here, e.g.:
# from login.routes import login_bp
# app.register_blueprint(login_bp)
#
# from profile.routes import profile_bp
# app.register_blueprint(profile_bp)
#
# from aptitude.routes import aptitude_bp
# app.register_blueprint(aptitude_bp)


@app.route("/")
@app.route("/home")
@app.route("/colleges")
@app.route("/map")
def index():
    return render_template("home.html")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
