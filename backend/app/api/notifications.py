from flask import Blueprint, request, jsonify

from ..services.notification_service import get_all_notifications, mark_read, mark_all_read
from ..utils.casing import to_camel_case

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/api/notifications', methods=['GET'])
def list_notifications():
    notifications = get_all_notifications()
    return jsonify(to_camel_case({'success': True, 'notifications': notifications})), 200


@notifications_bp.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
def mark_notification_read(notification_id):
    success, message = mark_read(notification_id)
    if success:
        return jsonify(to_camel_case({'success': True, 'message': message})), 200
    return jsonify(to_camel_case({'success': False, 'message': message})), 404


@notifications_bp.route('/api/notifications/read-all', methods=['PUT'])
def mark_all_read_route():
    success, message = mark_all_read()
    return jsonify(to_camel_case({'success': True, 'message': message})), 200
