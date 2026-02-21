import os

from flask import Flask, send_from_directory

from .config import Config
from .extensions import init_extensions
from .db import init_db
from .api.auth import auth_bp
from .api.patients import patients_bp
from .api.appointments import appointments_bp
from .api.notifications import notifications_bp
from .api.health import health_bp


def create_app():
    if os.environ.get('FLASK_ENV') == 'production' and os.environ.get('SECRET_KEY', 'dev-secret-key') == 'dev-secret-key':
        raise ValueError('SECRET_KEY must be set in production')
    app = Flask(__name__)
    app.config.from_object(Config)
    init_extensions(app)
    init_db()

    app.register_blueprint(auth_bp)
    app.register_blueprint(patients_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(health_bp)

    # Production: serve built frontend (static + SPA fallback)
    # Skip on Vercel - Vercel serves the frontend from the Vite build output
    if os.environ.get('FLASK_ENV') == 'production' and not os.environ.get('VERCEL'):
        static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static')

        @app.route('/assets/<path:path>')
        def serve_assets(path):
            return send_from_directory(os.path.join(static_dir, 'assets'), path)

        @app.route('/favicon.svg')
        def serve_favicon():
            return send_from_directory(static_dir, 'favicon.svg')

        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_spa(path):
            if path.startswith('api/'):
                return {'error': 'Not found'}, 404
            return send_from_directory(static_dir, 'index.html')

    return app
