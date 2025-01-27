from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from database.models import User
from database.db import mongo, get_db
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    try:
        # Debug print
        print("Received token:", request.json.get('token'))
        
        token = request.json.get('token')
        if not token:
            return jsonify({'error': 'No token provided'}), 400
            
        # Verify Google token
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                current_app.config['GOOGLE_CLIENT_ID'],
                clock_skew_in_seconds=10
            )
        except ValueError as e:
            print("Token verification error:", str(e))
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return jsonify({'error': 'Wrong issuer.'}), 401
            
        user_data = {
            'email': idinfo['email'],
            'name': idinfo.get('name', idinfo['email']),
            'auth_provider': 'google',
            'provider_id': idinfo['sub'],
            'profile_picture': idinfo.get('picture'),
            'last_login': datetime.utcnow()
        }
        
        # Debug print
        print("User data:", user_data)
        
        # Get database connection
        db = get_db()
        
        # Create or update user
        existing_user = db.users.find_one({'email': user_data['email']})
        if not existing_user:
            db.users.insert_one(user_data)
        else:
            db.users.update_one(
                {'email': user_data['email']},
                {'$set': {'last_login': datetime.utcnow()}}
            )
        
        # Create JWT token
        access_token = create_access_token(identity=user_data['email'])
        
        return jsonify({
            'token': access_token,
            'user': user_data
        }), 200
        
    except Exception as e:
        print("Server error:", str(e))
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/facebook', methods=['POST'])
def facebook_auth():
    try:
        access_token = request.json.get('token')
        
        # Verify Facebook token and get user data
        fb_response = requests.get(
            'https://graph.facebook.com/me',
            params={
                'fields': 'id,name,email,picture',
                'access_token': access_token
            }
        )
        fb_data = fb_response.json()
        
        user_data = {
            'email': fb_data.get('email'),
            'name': fb_data['name'],
            'auth_provider': 'facebook',
            'provider_id': fb_data['id'],
            'profile_picture': fb_data.get('picture', {}).get('data', {}).get('url'),
            'last_login': datetime.utcnow()
        }
        
        # Get database connection
        db = get_db()
        
        # Create or update user
        existing_user = db.users.find_one({'email': user_data['email']})
        if not existing_user:
            db.users.insert_one(user_data)
        else:
            db.users.update_one(
                {'email': user_data['email']},
                {'$set': {'last_login': datetime.utcnow()}}
            )
        
        # Create JWT token
        access_token = create_access_token(identity=user_data['email'])
        
        return jsonify({
            'token': access_token,
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400 