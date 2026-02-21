import os


class Config:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DB_PATH = os.environ.get('DB_PATH', os.path.join(BASE_DIR, 'db', 'stroke_app.db'))
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    PORT = int(os.environ.get('PORT', 5000))
