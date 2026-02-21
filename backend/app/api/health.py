from datetime import datetime
from flask import Blueprint, jsonify

from ..utils.casing import to_camel_case

health_bp = Blueprint('health', __name__)


@health_bp.route('/api/health', methods=['GET'])
def health_check():
    return jsonify(to_camel_case({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })), 200
