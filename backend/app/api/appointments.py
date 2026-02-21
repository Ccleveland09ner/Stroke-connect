from flask import Blueprint, request, jsonify

from ..services.appointment_service import get_all_appointments, add_appointment, update_appointment
from ..utils.casing import to_camel_case, from_camel_case

appointments_bp = Blueprint('appointments', __name__)


@appointments_bp.route('/api/appointments', methods=['GET'])
def list_appointments():
    appointments = get_all_appointments()
    return jsonify(to_camel_case({'success': True, 'appointments': appointments})), 200


@appointments_bp.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = from_camel_case(request.get_json() or {})
    success, message, appointment_id = add_appointment(data)
    if success:
        return jsonify(to_camel_case({
            'success': True,
            'message': message,
            'appointment_id': appointment_id
        })), 201
    return jsonify(to_camel_case({'success': False, 'message': message})), 400


@appointments_bp.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
def update_appointment_route(appointment_id):
    data = from_camel_case(request.get_json() or {})
    success, message = update_appointment(appointment_id, data)
    if success:
        return jsonify(to_camel_case({'success': True, 'message': message})), 200
    return jsonify(to_camel_case({'success': False, 'message': message})), 404
