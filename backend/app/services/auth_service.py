from datetime import datetime

from ..db import get_db_connection
from ..utils.auth import hash_password


def login(username_or_name: str, password: str):
    """Login by username OR name. Returns user dict or None."""
    conn = get_db_connection()
    cursor = conn.cursor()
    hashed = hash_password(password)

    cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username_or_name, hashed))
    user = cursor.fetchone()

    if not user:
        cursor.execute("SELECT * FROM users WHERE name = ? AND password = ?", (username_or_name, hashed))
        user = cursor.fetchone()

    conn.close()
    if user:
        d = dict(user)
        d.pop('password', None)
        return d
    return None


def register(data: dict) -> tuple[bool, str, int | None]:
    """Register user. Returns (success, message, user_id)."""
    required_fields = ['username', 'password', 'role', 'name', 'email']
    for field in required_fields:
        if field not in data:
            return False, f'Missing required field: {field}', None

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?",
                  (data['username'], data['email']))
    if cursor.fetchone():
        conn.close()
        return False, 'Username or email already exists', None

    if data['role'] == 'patient':
        cursor.execute("SELECT id FROM patients WHERE name = ?", (data['name'],))
        if not cursor.fetchone():
            conn.close()
            return False, 'Patient name not found in records', None

    current_time = datetime.now().isoformat()

    try:
        cursor.execute('''
        INSERT INTO users 
            (username, password, role, name, email, medications, medical_history, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['username'],
            hash_password(data['password']),
            data['role'],
            data['name'],
            data['email'],
            data.get('medications'),
            data.get('medical_history'),
            current_time,
            current_time
        ))
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return True, 'User registered successfully', user_id
    except Exception:
        conn.rollback()
        conn.close()
        return False, 'Registration failed', None
