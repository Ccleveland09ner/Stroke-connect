import os

from app import create_app

app = create_app()

if __name__ == '__main__':
    is_dev = os.environ.get('FLASK_ENV') == 'development'
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=is_dev, host='0.0.0.0', port=port)
