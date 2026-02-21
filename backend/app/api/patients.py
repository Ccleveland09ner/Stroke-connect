from flask import Blueprint, request, jsonify

from ..services.patient_service import (
    get_all_patients,
    get_patient_by_id,
    get_patient_by_user_name,
    add_patient,
    update_patient,
)
from ..utils.casing import to_camel_case, from_camel_case

patients_bp = Blueprint('patients', __name__)


@patients_bp.route('/api/patients', methods=['GET'])
def list_patients():
    patients = get_all_patients()
    return jsonify(to_camel_case({'success': True, 'patients': patients})), 200


@patients_bp.route('/api/patients/me', methods=['GET'])
def get_my_record():
    user_name = request.headers.get('X-User-Name') or request.args.get('userName')
    if not user_name:
        return jsonify(to_camel_case({'success': False, 'message': 'Unauthorized'})), 401
    patient = get_patient_by_user_name(user_name)
    if not patient:
        return jsonify(to_camel_case({'success': False, 'message': 'Patient not found'})), 404
    return jsonify(to_camel_case({'success': True, 'patient': patient})), 200


@patients_bp.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    patient = get_patient_by_id(patient_id)
    if not patient:
        return jsonify(to_camel_case({'success': False, 'message': 'Patient not found'})), 404
    return jsonify(to_camel_case({'success': True, 'patient': patient})), 200


@patients_bp.route('/api/patients', methods=['POST'])
def create_patient():
    data = from_camel_case(request.get_json() or {})
    success, message, patient_id = add_patient(data)
    if success:
        return jsonify(to_camel_case({
            'success': True,
            'message': message,
            'patient_id': patient_id
        })), 201
    return jsonify(to_camel_case({'success': False, 'message': message})), 400


@patients_bp.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient_route(patient_id):
    data = from_camel_case(request.get_json() or {})
    success, message = update_patient(patient_id, data)
    if success:
        return jsonify(to_camel_case({'success': True, 'message': message})), 200
    status = 404 if 'not found' in message else 400
    return jsonify(to_camel_case({'success': False, 'message': message})), status
