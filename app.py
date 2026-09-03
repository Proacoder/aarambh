import os
from flask import Flask, render_template

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'career-mitra-2026')


@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')


if __name__ == '__main__':
    print("[SERVER] Career Mitra running at http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
