from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config.config import Config
from api.auth import auth_bp
from database.db import initialize_db, mongo
import json
import base64

app = Flask(__name__, static_url_path='', static_folder='../frontend/build')

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://localhost:3000",
            "http://localhost:3000",
            "https://www.facebook.com",
            "https://*.ngrok.io",
            "https://*.ngrok-free.app",
            "http://localhost:5000",
            # Add your specific ngrok URL
            "https://c7bc-182-178-8-32.ngrok-free.app"
        ],
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Enable CORS headers on all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

app.config.from_object(Config)

# Initialize extensions
jwt = JWTManager(app)
initialize_db(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Facebook Data Deletion Endpoint
@app.route('/api/facebook-deletion', methods=['POST'])
def handle_facebook_deletion():
    try:
        # Get the signed_request from Facebook
        signed_request = request.form.get('signed_request')
        if not signed_request:
            return jsonify({'error': 'No signed_request parameter found'}), 400

        # Parse the signed request
        [encoded_sig, payload] = signed_request.split('.')
        
        # Get the data from payload
        data = json.loads(base64.urlsafe_b64decode(payload + '=' * (-len(payload) % 4)).decode('utf-8'))
        
        # Get the user ID from the data
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'No user_id found in signed_request'}), 400

        # Get database connection
        db = mongo.db
        
        # Delete the user's data
        result = db.users.delete_one({
            'auth_provider': 'facebook',
            'provider_id': user_id
        })

        # Return the confirmation URL as required by Facebook
        confirmation_url = f"https://{request.headers.get('Host')}/api/facebook-deletion/status"
        
        return jsonify({
            "url": confirmation_url,
            "confirmation_code": "1"
        }), 200

    except Exception as e:
        print(f"Error processing Facebook deletion request: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Facebook Data Deletion Status Endpoint
@app.route('/api/facebook-deletion/status', methods=['GET'])
def deletion_status():
    return jsonify({
        "status": "success",
        "message": "Data deletion has been completed"
    }), 200

@app.route("/", defaults={'path':''})
def serve(path):
    return send_from_directory(app.static_folder,'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 