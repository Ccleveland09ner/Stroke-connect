from flask import Flask, jsonify, request, make_response
import sqlite3
import json
import os
from flask_cors import CORS
from datetime import datetime
import time
import hashlib

# Create the application instance
app = Flask(__name__)
CORS(app)

# Ensure the database directory exists
os.makedirs('backend/db', exist_ok=True)

# Database setup
DB_PATH = 'backend/db/stroke_app.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table with additional fields
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
    
    # Create patients table
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
    
    # Create vital_signs table
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
    
    # Create imaging_results table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS imaging_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        result_text TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
    )
    ''')
    
    # Create appointments table
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
    
    # Create notifications table
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
    
    # Insert sample users if they don't exist
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
    
    # Insert sample patients if they don't exist
    cursor.execute("SELECT COUNT(*) FROM patients")
    if cursor.fetchone()[0] == 0:
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        # Sample patients
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
            
            # Get the last inserted patient ID
            patient_id = cursor.lastrowid
            
            # Add vital signs for this patient
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
            
            # Add imaging results for this patient
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
    
    # Insert sample appointments if they don't exist
    cursor.execute("SELECT COUNT(*) FROM appointments")
    if cursor.fetchone()[0] == 0:
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        # Sample appointments
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
    
    # Insert sample notifications if they don't exist
    cursor.execute("SELECT COUNT(*) FROM notifications")
    if cursor.fetchone()[0] == 0:
        current_timestamp = datetime.now().isoformat()
        
        # Sample notifications
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

# Initialize the database
init_db()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    required_fields = ['username', 'password', 'role', 'name', 'email']
    
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'message': f'Missing required field: {field}'
            }), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if username or email already exists
    cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", 
                  (data['username'], data['email']))
    if cursor.fetchone():
        conn.close()
        return jsonify({
            'success': False,
            'message': 'Username or email already exists'
        }), 400
    
    # For patients, verify if name exists in patients table
    if data['role'] == 'patient':
        cursor.execute("SELECT id FROM patients WHERE name = ?", (data['name'],))
        if not cursor.fetchone():
            conn.close()
            return jsonify({
                'success': False,
                'message': 'Patient name not found in records'
            }), 400
    
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
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user_id': user_id
        }), 201
        
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({
            'success': False,
            'message': 'Registration failed'
        }), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?", 
                  (username, hash_password(password)))
    user = cursor.fetchone()
    
    conn.close()
    
    if user:
        # Convert user to dictionary
        user_dict = dict(user)
        
        # Remove password for security
        user_dict.pop('password', None)
        
        response = {
            'success': True,
            'message': 'Login successful',
            'user': user_dict,
            'token': 'mock-jwt-token'  # In a real app, this would be a JWT
        }
        return jsonify(response), 200
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid credentials'
        }), 401

@app.route('/api/patients', methods=['GET'])
def get_patients():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT 
        p.*,
        u.name as neurologist_name,
        vs.blood_pressure, vs.heart_rate, vs.oxygen_saturation
    FROM 
        patients p
    LEFT JOIN 
        users u ON p.assigned_neurologist = u.id
    LEFT JOIN 
        vital_signs vs ON p.id = vs.patient_id
    ORDER BY 
        p.id DESC
    ''')
    
    patients = cursor.fetchall()
    
    # Get imaging results for each patient
    patient_list = []
    for patient in patients:
        patient_dict = dict(patient)
        
        # Get imaging results
        cursor.execute("SELECT result_text FROM imaging_results WHERE patient_id = ?", (patient['id'],))
        results = cursor.fetchall()
        patient_dict['imaging_results'] = [result['result_text'] for result in results]
        
        # Format vital signs
        patient_dict['vital_signs'] = {
            'blood_pressure': patient_dict.pop('blood_pressure'),
            'heart_rate': patient_dict.pop('heart_rate'),
            'oxygen_saturation': patient_dict.pop('oxygen_saturation')
        }
        
        # Remove neurologist name from dictionary
        neurologist_name = patient_dict.pop('neurologist_name')
        
        patient_list.append(patient_dict)
    
    conn.close()
    
    return jsonify({
        'success': True,
        'patients': patient_list
    }), 200

@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT 
        p.*,
        u.name as neurologist_name,
        vs.blood_pressure, vs.heart_rate, vs.oxygen_saturation
    FROM 
        patients p
    LEFT JOIN 
        users u ON p.assigned_neurologist = u.id
    LEFT JOIN 
        vital_signs vs ON p.id = vs.patient_id
    WHERE 
        p.id = ?
    ''', (patient_id,))
    
    patient = cursor.fetchone()
    
    if not patient:
        conn.close()
        return jsonify({
            'success': False,
            'message': 'Patient not found'
        }), 404
    
    patient_dict = dict(patient)
    
    # Get imaging results
    cursor.execute("SELECT result_text FROM imaging_results WHERE patient_id = ?", (patient_id,))
    results = cursor.fetchall()
    patient_dict['imaging_results'] = [result['result_text'] for result in results]
    
    # Format vital signs
    patient_dict['vital_signs'] = {
        'blood_pressure': patient_dict.pop('blood_pressure'),
        'heart_rate': patient_dict.pop('heart_rate'),
        'oxygen_saturation': patient_dict.pop('oxygen_saturation')
    }
    
    # Include neurologist name
    neurologist_name = patient_dict.pop('neurologist_name')
    patient_dict['neurologist_name'] = neurologist_name
    
    conn.close()
    
    return jsonify({
        'success': True,
        'patient': patient_dict
    }), 200

@app.route('/api/patients', methods=['POST'])
def add_patient():
    data = request.get_json()
    
    required_fields = ['name', 'age', 'gender', 'medical_record_number']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'message': f'Missing required field: {field}'
            }), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if medical record number already exists
    cursor.execute("SELECT id FROM patients WHERE medical_record_number = ?", (data['medical_record_number'],))
    if cursor.fetchone():
        conn.close()
        return jsonify({
            'success': False,
            'message': 'A patient with this medical record number already exists'
        }), 400
    
    current_time = datetime.now().isoformat()
    
    # Insert the patient
    cursor.execute('''
    INSERT INTO patients 
        (name, age, gender, medical_record_number, date_of_admission, chief_complaint, 
        nihss_score, status, assigned_neurologist, notes, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['name'],
        data['age'],
        data['gender'],
        data['medical_record_number'],
        data.get('date_of_admission', current_time.split('T')[0]),
        data.get('chief_complaint', ''),
        data.get('nihss_score', 0),
        data.get('status', 'waiting'),
        data.get('assigned_neurologist'),
        data.get('notes', ''),
        current_time,
        current_time
    ))
    
    patient_id = cursor.lastrowid
    
    # Insert vital signs if provided
    if 'vital_signs' in data:
        vital_signs = data['vital_signs']
        cursor.execute('''
        INSERT INTO vital_signs 
            (patient_id, blood_pressure, heart_rate, oxygen_saturation, timestamp) 
        VALUES (?, ?, ?, ?, ?)
        ''', (
            patient_id,
            vital_signs.get('blood_pressure', ''),
            vital_signs.get('heart_rate', 0),
            vital_signs.get('oxygen_saturation', 0),
            current_time
        ))
    
    # Insert imaging results if provided
    if 'imaging_results' in data:
        for result in data['imaging_results']:
            cursor.execute('''
            INSERT INTO imaging_results 
                (patient_id, result_text, timestamp) 
            VALUES (?, ?, ?)
            ''', (
                patient_id,
                result,
                current_time
            ))
    
    # Create a notification
    cursor.execute('''
    INSERT INTO notifications 
        (type, message, patient_id, timestamp, read) 
    VALUES (?, ?, ?, ?, ?)
    ''', (
        'info',
        f'New patient {data["name"]} has been registered',
        patient_id,
        current_time,
        0
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Patient added successfully',
        'patient_id': patient_id
    }), 201

@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    data = request.get_json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if patient exists
    cursor.execute("SELECT id FROM patients WHERE id = ?", (patient_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({
            'success': False,
            'message': 'Patient not found'
        }), 404
    
    current_time = datetime.now().isoformat()
    
    # Update fields that were provided
    update_fields = []
    update_values = []
    
    for field in ['name', 'age', 'gender', 'medical_record_number', 'chief_complaint', 
                  'nihss_score', 'status', 'assigned_neurologist', 'notes']:
        if field in data:
            update_fields.append(f"{field} = ?")
            update_values.append(data[field])
    
    update_fields.append("updated_at = ?")
    update_values.append(current_time)
    
    if update_fields:
        cursor.execute(f'''
        UPDATE patients 
        SET {", ".join(update_fields)}
        WHERE id = ?
        ''', (*update_values, patient_id))
    
    # Update vital signs if provided
    if 'vital_signs' in data:
        vital_signs = data['vital_signs']
        
        # Check if vital signs already exist
        cursor.execute("SELECT id FROM vital_signs WHERE patient_id = ?", (patient_id,))
        if cursor.fetchone():
            cursor.execute('''
            UPDATE vital_signs 
            SET blood_pressure = ?, heart_rate = ?, oxygen_saturation = ?, timestamp = ?
            WHERE patient_id = ?
            ''', (
                vital_signs.get('blood_pressure', ''),
                vital_signs.get('heart_rate', 0),
                vital_signs.get('oxygen_saturation', 0),
                current_time,
                patient_id
            ))
        else:
            cursor.execute('''
            INSERT INTO vital_signs 
                (patient_id, blood_pressure, heart_rate, oxygen_saturation, timestamp) 
            VALUES (?, ?, ?, ?, ?)
            ''', (
                patient_id,
                vital_signs.get('blood_pressure', ''),
                vital_signs.get('heart_rate', 0),
                vital_signs.get('oxygen_saturation', 0),
                current_time
            ))
    
    # Update imaging results if provided
    if 'imaging_results' in data and isinstance(data['imaging_results'], list):
        # Delete existing results
        cursor.execute("DELETE FROM imaging_results WHERE patient_id = ?", (patient_id,))
        
        # Insert new results
        for result in data['imaging_results']:
            cursor.execute('''
            INSERT INTO imaging_results 
                (patient_id, result_text, timestamp) 
            VALUES (?, ?, ?)
            ''', (
                patient_id,
                result,
                current_time
            ))
    
    # Create a notification for status changes
    if 'status' in data:
        cursor.execute("SELECT name FROM patients WHERE id = ?", (patient_id,))
        patient_name = cursor.fetchone()['name']
        
        notification_type = 'info'
        if data['status'] == 'treatment-approved':
            notification_type = 'alert'
            message = f'{patient_name} has been approved for tPA treatment'
        elif data['status'] == 'treatment-denied':
            notification_type = 'warning'
            message = f'{patient_name} has been denied tPA treatment'
        else:
            message = f'{patient_name} status updated to {data["status"]}'
        
        cursor.execute('''
        INSERT INTO notifications 
            (type, message, patient_id, timestamp, read) 
        VALUES (?, ?, ?, ?, ?)
        ''', (
            notification_type,
            message,
            patient_id,
            current_time,
            0
        ))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Patient updated successfully'
    }), 200

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT 
        a.*,
        p.name as patient_name
    FROM 
        appointments a
    LEFT JOIN 
        patients p ON a.patient_id = p.id
    ORDER BY 
        a.date, a.time
    ''')
    
    appointments = cursor.fetchall()
    
    appointment_list = []
    for appointment in appointments:
        appointment_dict = dict(appointment)
        appointment_list.append(appointment_dict)
    
    conn.close()
    
    return jsonify({
        'success': True,
        'appointments': appointment_list
    }), 200

@app.route('/api/appointments', methods=['POST'])
def add_appointment():
    data = request.get_json()
    
    required_fields = ['patient_id', 'date', 'time', 'type']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'message': f'Missing required field: {field}'
            }), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if patient exists
    cursor.execute("SELECT name FROM patients WHERE id = ?", (data['patient_id'],))
    patient = cursor.fetchone()
    if not patient:
        conn.close()
        return jsonify({
            'success': False,
            'message': 'Patient not found'
        }), 400
    
    current_time = datetime.now().isoformat()
    
    # Insert the appointment
    cursor.execute('''
    INSERT INTO appointments 
        (patient_id, date, time, type, notes, status, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['patient_id'],
        data['date'],
        data['time'],
        data['type'],
        data.get('notes', ''),
        data.get('status', 'scheduled'),
        current_time,
        current_time
    ))
    
    appointment_id = cursor.lastrowid
    
    # Create a notification
    patient_name = patient['name']
    appointment_date = data['date']
    appointment_time = data['time']
    
    cursor.execute('''
    INSERT INTO notifications 
        (type, message, patient_id, timestamp, read) 
    VALUES (?, ?, ?, ?, ?)
    ''', (
        'info',
        f'New appointment scheduled for {patient_name} on {appointment_date} at {appointment_time}',
        data['patient_id'],
        current_time,
        0
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Appointment added successfully',
        'appointment_id': appointment_id
    }), 201

@app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    data = request.get_json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if appointment exists
    cursor.execute('''
    SELECT 
        a.*,
        p.name as patient_name
    FROM 
        appointments a
    LEFT JOIN 
        patients p ON a.patient_id = p.id
    WHERE 
        a.id = ?
    ''', (appointment_id,))
    
    appointment = cursor.fetchone()
    if not appointment:
        conn.close()
        return jsonify({
            'success': False,
            'message': 'Appointment not found'
        }), 404
    
    current_time = datetime.now().isoformat()
    
    # Update fields that were provided
    update_fields = []
    update_values = []
    
    for field in ['patient_id', 'date', 'time', 'type', 'notes', 'status']:
        if field in data:
            update_fields.append(f"{field} = ?")
            update_values.append(data[field])
    
    update_fields.append("updated_at = ?")
    update_values.append(current_time)
    
    if update_fields:
        cursor.execute(f'''
        UPDATE appointments 
        SET {", ".join(update_fields)}
        WHERE id = ?
        ''', (*update_values, appointment_id))
    
    # Create a notification for status changes
    if 'status' in data:
        patient_name = appointment['patient_name']
        
        if data['status'] == 'completed':
            message = f'Appointment for {patient_name} on {appointment["date"]} at {appointment["time"]} has been completed'
        elif data['status'] == 'cancelled':
            message = f'Appointment for {patient_name} on {appointment["date"]} at {appointment["time"]} has been cancelled'
        else:
            message = f'Appointment for {patient_name} status updated to {data["status"]}'
        
        cursor.execute('''
        INSERT INTO notifications 
            (type, message, patient_id, timestamp, read) 
        VALUES (?, ?, ?, ?, ?)
        ''', (
            'info',
            message,
            appointment['patient_id'],
            current_time,
            0
        ))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Appointment updated successfully'
    }), 200

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT 
        n.*,
        p.name as patient_name
    FROM 
        notifications n
    LEFT JOIN 
        patients p ON n.patient_id = p.id
    ORDER BY 
        n.timestamp DESC
    ''')
    
    notifications = cursor.fetchall()
    
    notification_list = []
    for notification in notifications:
        notification_dict = dict(notification)
        notification_dict['read'] = bool(notification_dict['read'])
        notification_list.append(notification_dict)
    
    conn.close()
    
    return jsonify({
        'success': True,
        'notifications': notification_list
    }), 200

@app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
def mark_notification_as_read(notification_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if notification exists
    cursor.execute("SELECT id FROM notifications WHERE id = ?", (notification_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({
            'success': False,
            'message': 'Notification not found'
        }), 404
    
    cursor.execute("UPDATE notifications SET read = 1 WHERE id = ?", (notification_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Notification marked as read'
    }), 200

@app.route('/api/notifications/read-all', methods=['PUT'])
def mark_all_notifications_as_read():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE notifications SET read = 1 WHERE read = 0")
    
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'All notifications marked as read'
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)