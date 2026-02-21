from flask import Blueprint, request, jsonify

from ..services.auth_service import login, register
from ..utils.casing import to_camel_case, from_camel_case

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/api/login', methods=['POST'])
def login_route():
    data = from_camel_case(request.get_json() or {})
    username_or_name = data.get('username') or data.get('name')
    password = data.get('password')
    if not username_or_name or not password:
        return jsonify(to_camel_case({'success': False, 'message': 'Missing username or password'})), 400
    user = login(username_or_name, password)
    if user:
        return jsonify(to_camel_case({
            'success': True,
            'message': 'Login successful',
            'user': user,
            'token': 'mock-jwt-token'
        })), 200
    return jsonify(to_camel_case({'success': False, 'message': 'Invalid credentials'})), 401


@auth_bp.route('/api/register', methods=['POST'])
def register_route():
    data = from_camel_case(request.get_json() or {})
    success, message, user_id = register(data)
    if success:
        return jsonify(to_camel_case({
            'success': True,
            'message': message,
            'user_id': user_id
        })), 201
    status = 400 if 'exists' in message or 'found' in message else 500
    return jsonify(to_camel_case({'success': False, 'message': message})), status
