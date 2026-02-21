"""
Vercel serverless function entry point.
Imports the Flask app from backend and exports it for Vercel's Python runtime.
"""
import sys
from pathlib import Path

# Ensure backend is on the path when running from project root
root = Path(__file__).resolve().parent.parent
if str(root) not in sys.path:
    sys.path.insert(0, str(root))

from backend.app import create_app

app = create_app()
