from datetime import datetime

from ..db import get_db_connection


def _patient_row_to_dict(patient, cursor, patient_id=None, include_neurologist=True):
    pid = patient_id or patient['id']
    patient_dict = dict(patient)

    cursor.execute("SELECT result_text FROM imaging_results WHERE patient_id = ?", (pid,))
    results = cursor.fetchall()
    patient_dict['imaging_results'] = [r['result_text'] for r in results]

    patient_dict['vital_signs'] = {
        'blood_pressure': patient_dict.pop('blood_pressure', ''),
        'heart_rate': patient_dict.pop('heart_rate', 0),
        'oxygen_saturation': patient_dict.pop('oxygen_saturation', 0)
    }

    neurologist_name = patient_dict.pop('neurologist_name', None)
    if include_neurologist and neurologist_name:
        patient_dict['neurologist_name'] = neurologist_name

    return patient_dict


def get_all_patients():
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
    patient_list = [_patient_row_to_dict(p, cursor, include_neurologist=False) for p in patients]
    conn.close()
    return patient_list


def get_patient_by_id(patient_id):
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
        return None
    result = _patient_row_to_dict(patient, cursor, patient_id)
    conn.close()
    return result


def get_patient_by_user_name(user_name):
    """For /api/patients/me - find patient where name matches user."""
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
        p.name = ?
    ''', (user_name,))
    patient = cursor.fetchone()
    if not patient:
        conn.close()
        return None
    result = _patient_row_to_dict(patient, cursor, patient['id'])
    conn.close()
    return result


def add_patient(data: dict) -> tuple[bool, str, int | None]:
    required_fields = ['name', 'age', 'gender', 'medical_record_number']
    for field in required_fields:
        if field not in data:
            return False, f'Missing required field: {field}', None

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM patients WHERE medical_record_number = ?", (data['medical_record_number'],))
    if cursor.fetchone():
        conn.close()
        return False, 'A patient with this medical record number already exists', None

    current_time = datetime.now().isoformat()
    date_val = data.get('date_of_admission') or current_time.split('T')[0]

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
        date_val,
        data.get('chief_complaint', ''),
        data.get('nihss_score', 0),
        data.get('status', 'waiting'),
        data.get('assigned_neurologist'),
        data.get('notes', ''),
        current_time,
        current_time
    ))
    patient_id = cursor.lastrowid

    if 'vital_signs' in data:
        vs = data['vital_signs']
        cursor.execute('''
        INSERT INTO vital_signs 
            (patient_id, blood_pressure, heart_rate, oxygen_saturation, timestamp) 
        VALUES (?, ?, ?, ?, ?)
        ''', (
            patient_id,
            vs.get('blood_pressure', ''),
            vs.get('heart_rate', 0),
            vs.get('oxygen_saturation', 0),
            current_time
        ))

    if 'imaging_results' in data:
        for result in data['imaging_results']:
            cursor.execute('''
            INSERT INTO imaging_results 
                (patient_id, result_text, timestamp) 
            VALUES (?, ?, ?, ?)
            ''', (patient_id, result, current_time))

    cursor.execute('''
    INSERT INTO notifications 
        (type, message, patient_id, timestamp, read) 
    VALUES (?, ?, ?, ?, ?)
    ''', ('info', f'New patient {data["name"]} has been registered', patient_id, current_time, 0))

    conn.commit()
    conn.close()
    return True, 'Patient added successfully', patient_id


def update_patient(patient_id: int, data: dict) -> tuple[bool, str]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM patients WHERE id = ?", (patient_id,))
    if not cursor.fetchone():
        conn.close()
        return False, 'Patient not found'

    current_time = datetime.now().isoformat()
    update_fields = []
    update_values = []

    allowed = ['name', 'age', 'gender', 'medical_record_number', 'chief_complaint',
               'nihss_score', 'status', 'assigned_neurologist', 'notes',
               'diagnosis', 'treatment', 'tpa_eligible', 'tpa_decision', 'tpa_decision_reason']
    for field in allowed:
        if field in data:
            update_fields.append(f"{field} = ?")
            update_values.append(data[field])

    update_fields.append("updated_at = ?")
    update_values.append(current_time)

    if len(update_fields) > 1:
        cursor.execute(
            f"UPDATE patients SET {', '.join(update_fields)} WHERE id = ?",
            (*update_values, patient_id)
        )

    if 'vital_signs' in data:
        vs = data['vital_signs']
        cursor.execute("SELECT id FROM vital_signs WHERE patient_id = ?", (patient_id,))
        if cursor.fetchone():
            cursor.execute('''
            UPDATE vital_signs 
            SET blood_pressure = ?, heart_rate = ?, oxygen_saturation = ?, timestamp = ?
            WHERE patient_id = ?
            ''', (vs.get('blood_pressure', ''), vs.get('heart_rate', 0),
                  vs.get('oxygen_saturation', 0), current_time, patient_id))
        else:
            cursor.execute('''
            INSERT INTO vital_signs 
                (patient_id, blood_pressure, heart_rate, oxygen_saturation, timestamp) 
            VALUES (?, ?, ?, ?, ?)
            ''', (patient_id, vs.get('blood_pressure', ''), vs.get('heart_rate', 0),
                  vs.get('oxygen_saturation', 0), current_time))

    if 'imaging_results' in data and isinstance(data['imaging_results'], list):
        cursor.execute("DELETE FROM imaging_results WHERE patient_id = ?", (patient_id,))
        for result in data['imaging_results']:
            cursor.execute('''
            INSERT INTO imaging_results 
                (patient_id, result_text, timestamp) 
            VALUES (?, ?, ?, ?)
            ''', (patient_id, result, current_time))

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
        ''', (notification_type, message, patient_id, current_time, 0))

    conn.commit()
    conn.close()
    return True, 'Patient updated successfully'
