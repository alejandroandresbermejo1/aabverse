import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")

def get_connection():
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL no configurada en las variables de entorno.")
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def init_db():
    if not DATABASE_URL:
        return
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CREATE SCHEMA IF NOT EXISTS aimshot;")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS aimshot.records (
                    id SERIAL PRIMARY KEY,
                    player_name VARCHAR(20) DEFAULT 'Anónimo',
                    mode VARCHAR(50) NOT NULL,
                    difficulty VARCHAR(50) NOT NULL,
                    record INT NOT NULL,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
        conn.commit()
    finally:
        conn.close()
