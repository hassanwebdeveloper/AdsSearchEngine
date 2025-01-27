from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config.config import Config
from api.auth import auth_bp
from database.db import initialize_db, mongo

app = Flask(__name__, static_url_path='', static_folder='../frontend/build')

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "expose_headers": ["Content-Type"]
    }
})

app.config.from_object(Config)

# Initialize extensions
jwt = JWTManager(app)
initialize_db(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')

@app.route("/", defaults={'path':''})
def serve(path):
    return send_from_directory(app.static_folder,'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 