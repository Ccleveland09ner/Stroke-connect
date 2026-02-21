import sqlite3
import os
from datetime import datetime

from .config import Config
from .utils.auth import hash_password


def get_db_connection():
    db_dir = os.path.dirname(Config.DB_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    conn = sqlite3.connect(Config.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def migrate_db(cursor):
    """Add new columns if they don't exist."""
    migrations = [
        "ALTER TABLE patients ADD COLUMN diagnosis TEXT",
        "ALTER TABLE patients ADD COLUMN treatment TEXT",
        "ALTER TABLE patients ADD COLUMN tpa_eligible INTEGER DEFAULT 0",
        "ALTER TABLE patients ADD COLUMN tpa_decision TEXT",
        "ALTER TABLE patients ADD COLUMN tpa_decision_reason TEXT",
    ]
    for sql in migrations:
        try:
            cursor.execute(sql)
        except sqlite3.OperationalError:
            pass


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        medications TEXT,
        medical_history TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        medical_record_number TEXT UNIQUE NOT NULL,
        date_of_admission TEXT NOT NULL,
        chief_complaint TEXT,
        nihss_score INTEGER,
        status TEXT NOT NULL,
        assigned_neurologist INTEGER,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (assigned_neurologist) REFERENCES users (id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS vital_signs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        blood_pressure TEXT,
        heart_rate INTEGER,
        oxygen_saturation INTEGER,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS imaging_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        result_text TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        type TEXT NOT NULL,
        notes TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        patient_id INTEGER,
        timestamp TEXT NOT NULL,
        read INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
    )
    ''')

    migrate_db(cursor)

    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        current_time = datetime.now().isoformat()
        sample_users = [
            ('neurologist', hash_password('password'), 'neurologist', 'Dr. Sarah Johnson',
             'neurologist@example.com', None, None, current_time, current_time),
            ('technician', hash_password('password'), 'technician', 'Alex Rodriguez',
             'technician@example.com', None, None, current_time, current_time),
            ('patient', hash_password('password'), 'patient', 'Jamie Smith',
             'patient@example.com', 'Aspirin 81mg daily', 'Hypertension', current_time, current_time)
        ]
        cursor.executemany(
            '''INSERT INTO users 
               (username, password, role, name, email, medications, medical_history, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            sample_users
        )

    cursor.execute("SELECT COUNT(*) FROM patients")
    if cursor.fetchone()[0] == 0:
        current_date = datetime.now().strftime('%Y-%m-%d')
        sample_patients = [
            ('John Doe', 67, 'male', 'MRN12345', current_date, 'Sudden left-sided weakness and facial droop',
             14, 'waiting', 1, 'Patient arrived 45 minutes after symptom onset.', current_date, current_date),
            ('Jane Smith', 73, 'female', 'MRN12346', current_date, 'Slurred speech and right arm weakness',
             8, 'treatment-pending', 1, 'Last known well 3 hours prior to arrival.', current_date, current_date),
            ('Robert Johnson', 58, 'male', 'MRN12347', current_date, 'Dizziness, nausea, and difficulty walking',
             5, 'treatment-approved', 1, 'Patient has history of hypertension and diabetes.', current_date, current_date),
            ('Jamie Smith', 52, 'female', 'MRN12348', current_date, 'Sudden severe headache and vomiting',
             10, 'diagnosed', 1, 'Patient transferred for neurosurgical evaluation.', current_date, current_date)
        ]

        for patient in sample_patients:
            cursor.execute('''
            INSERT INTO patients 
                (name, age, gender, medical_record_number, date_of_admission, chief_complaint, 
                nihss_score, status, assigned_neurologist, notes, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', patient)

            patient_id = cursor.lastrowid
            vital_signs = (
                patient_id,
                f"{120 + patient_id*10}/{75 + patient_id*5}",
                70 + patient_id*5,
                95 + patient_id % 4,
                current_date
            )
            cursor.execute('''
            INSERT INTO vital_signs 
                (patient_id, blood_pressure, heart_rate, oxygen_saturation, timestamp) 
            VALUES (?, ?, ?, ?, ?)
            ''', vital_signs)

            if patient_id == 1:
                results = [
                    (patient_id, "CT scan shows no hemorrhage", current_date),
                    (patient_id, "CTA shows M1 occlusion", current_date)
                ]
            elif patient_id == 2:
                results = [
                    (patient_id, "CT scan negative for hemorrhage", current_date),
                    (patient_id, "MRI shows acute infarct in left MCA territory", current_date)
                ]
            elif patient_id == 3:
                results = [
                    (patient_id, "CT scan negative", current_date),
                    (patient_id, "MRI confirms right cerebellar infarct", current_date)
                ]
            else:
                results = [
                    (patient_id, "CT shows subarachnoid hemorrhage", current_date),
                    (patient_id, "CTA confirms right MCA aneurysm", current_date)
                ]

            cursor.executemany('''
            INSERT INTO imaging_results 
                (patient_id, result_text, timestamp) 
            VALUES (?, ?, ?)
            ''', results)

    cursor.execute("SELECT COUNT(*) FROM appointments")
    if cursor.fetchone()[0] == 0:
        current_date = datetime.now().strftime('%Y-%m-%d')
        sample_appointments = [
            (1, current_date, '09:00', 'emergency', 'Stroke evaluation', 'scheduled', current_date, current_date),
            (2, current_date, '14:30', 'follow-up', 'Stroke recovery follow-up', 'scheduled', current_date, current_date),
            (3, current_date, '11:15', 'follow-up', 'Post-tPA follow-up', 'scheduled', current_date, current_date)
        ]
        cursor.executemany('''
        INSERT INTO appointments 
            (patient_id, date, time, type, notes, status, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_appointments)

    cursor.execute("SELECT COUNT(*) FROM notifications")
    if cursor.fetchone()[0] == 0:
        current_timestamp = datetime.now().isoformat()
        sample_notifications = [
            ('alert', 'Critical: John Doe has NIHSS score of 14, tPA evaluation needed', 1, current_timestamp, 0),
            ('warning', 'Jane Smith lab results indicate elevated troponin', 2, current_timestamp, 0),
            ('info', 'Robert Johnson appointment scheduled for tomorrow', 3, current_timestamp, 1)
        ]
        cursor.executemany('''
        INSERT INTO notifications 
            (type, message, patient_id, timestamp, read) 
        VALUES (?, ?, ?, ?, ?)
        ''', sample_notifications)

    conn.commit()
    conn.close()
