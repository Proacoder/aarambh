"""
database.py
Shared PostgreSQL connection helper.
Every blueprint (login, profile, location, aptitude, ...) imports
get_db_connection() from here instead of writing its own.
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()


def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )
