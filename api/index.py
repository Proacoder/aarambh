"""
Vercel Serverless Entrypoint for CareerMitra Flask Application
"""
import os
import sys
from pathlib import Path

# Ensure project root is in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app import app

# Expose WSGI application for Vercel
app = app
