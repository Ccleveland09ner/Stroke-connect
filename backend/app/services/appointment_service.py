from datetime import datetime

from ..db import get_db_connection


def get_all_appointments():
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
    appointments = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return appointments


def add_appointment(data: dict) -> tuple[bool, str, int | None]:
    required_fields = ['patient_id', 'date', 'time', 'type']
    for field in required_fields:
        if field not in data:
            return False, f'Missing required field: {field}', None

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM patients WHERE id = ?", (data['patient_id'],))
    patient = cursor.fetchone()
    if not patient:
        conn.close()
        return False, 'Patient not found', None

    current_time = datetime.now().isoformat()
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

    cursor.execute('''
    INSERT INTO notifications 
        (type, message, patient_id, timestamp, read) 
    VALUES (?, ?, ?, ?, ?)
    ''', (
        'info',
        f'New appointment scheduled for {patient["name"]} on {data["date"]} at {data["time"]}',
        data['patient_id'],
        current_time,
        0
    ))

    conn.commit()
    conn.close()
    return True, 'Appointment added successfully', appointment_id


def update_appointment(appointment_id: int, data: dict) -> tuple[bool, str]:
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
    WHERE 
        a.id = ?
    ''', (appointment_id,))
    appointment = cursor.fetchone()
    if not appointment:
        conn.close()
        return False, 'Appointment not found'

    current_time = datetime.now().isoformat()
    update_fields = []
    update_values = []
    for field in ['patient_id', 'date', 'time', 'type', 'notes', 'status']:
        if field in data:
            update_fields.append(f"{field} = ?")
            update_values.append(data[field])
    update_fields.append("updated_at = ?")
    update_values.append(current_time)

    if len(update_fields) > 1:
        cursor.execute(
            f"UPDATE appointments SET {', '.join(update_fields)} WHERE id = ?",
            (*update_values, appointment_id)
        )

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
        ''', ('info', message, appointment['patient_id'], current_time, 0))

    conn.commit()
    conn.close()
    return True, 'Appointment updated successfully'
