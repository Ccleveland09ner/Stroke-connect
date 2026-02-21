from ..db import get_db_connection


def get_all_notifications():
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
    notifications = []
    for row in cursor.fetchall():
        d = dict(row)
        d['read'] = bool(d['read'])
        notifications.append(d)
    conn.close()
    return notifications


def mark_read(notification_id: int) -> tuple[bool, str]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM notifications WHERE id = ?", (notification_id,))
    if not cursor.fetchone():
        conn.close()
        return False, 'Notification not found'
    cursor.execute("UPDATE notifications SET read = 1 WHERE id = ?", (notification_id,))
    conn.commit()
    conn.close()
    return True, 'Notification marked as read'


def mark_all_read() -> tuple[bool, str]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET read = 1 WHERE read = 0")
    conn.commit()
    conn.close()
    return True, 'All notifications marked as read'
