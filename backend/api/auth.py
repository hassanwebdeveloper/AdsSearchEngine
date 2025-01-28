from flask import Blueprint, request, jsonify, current_app, url_for
from flask_jwt_extended import create_access_token
from database.models import User
from database.db import mongo, get_db
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from datetime import datetime
from bson import json_util
import json

auth_bp = Blueprint('auth', __name__)

# Helper function to serialize MongoDB documents
def serialize_doc(doc):
    if doc is None:
        return None
    doc['_id'] = str(doc['_id'])  # Convert ObjectId to string
    return doc

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
        data = request.json
        access_token = data.get('token')
        user_data = data.get('userData', {})
        
        if not access_token:
            return jsonify({'error': 'No token provided'}), 400
            
        # Verify Facebook token
        fb_response = requests.get(
            'https://graph.facebook.com/v12.0/me',
            params={
                'fields': 'id,name,email,picture',
                'access_token': access_token
            }
        )
        
        if not fb_response.ok:
            return jsonify({'error': 'Invalid Facebook token'}), 401
            
        fb_data = fb_response.json()
        
        # Create user data
        user_data = {
            'email': fb_data.get('email') or user_data.get('email'),
            'name': fb_data.get('name') or user_data.get('name'),
            'auth_provider': 'facebook',
            'provider_id': fb_data.get('id'),
            'profile_picture': fb_data.get('picture', {}).get('data', {}).get('url'),
            'last_login': datetime.utcnow()
        }
        
        # Debug print
        print("Facebook user data:", user_data)
        
        # Get database connection
        db = get_db()
        
        # Create or update user
        existing_user = db.users.find_one({'email': user_data['email']})
        if not existing_user:
            result = db.users.insert_one(user_data)
            user_data['_id'] = str(result.inserted_id)
        else:
            db.users.update_one(
                {'email': user_data['email']},
                {'$set': {
                    'last_login': datetime.utcnow(),
                    'profile_picture': user_data['profile_picture']
                }}
            )
            user_data['_id'] = str(existing_user['_id'])
        
        # Create JWT token
        access_token = create_access_token(identity=user_data['email'])
        
        # Serialize the user data
        serialized_user = serialize_doc(user_data)
        
        return jsonify({
            'token': access_token,
            'user': serialized_user
        }), 200
        
    except Exception as e:
        print("Facebook auth error:", str(e))
        return jsonify({'error': str(e)}), 500

# Add this new endpoint for Facebook data deletion
@auth_bp.route('/facebook/data-deletion', methods=['DELETE'])
def facebook_data_deletion():
    try:
        # Verify the request is from Facebook
        signed_request = request.form.get('signed_request')
        if not signed_request:
            return jsonify({'error': 'No signed request provided'}), 400

        # Get user ID from the signed request
        # In production, you should verify the signature
        user_id = request.form.get('user_id')
        
        # Get database connection
        db = get_db()
        
        # Delete user data
        result = db.users.delete_one({
            'auth_provider': 'facebook',
            'provider_id': user_id
        })
        
        if result.deleted_count > 0:
            # Return the confirmation URL that Facebook requires
            confirmation_url = url_for(
                'auth.facebook_data_deletion_status',
                user_id=user_id,
                _external=True,
                _scheme='https'
            )
            
            return jsonify({
                'url': confirmation_url,
                'confirmation_code': 'deletion_confirmed'
            }), 200
        
        return jsonify({'error': 'User not found'}), 404
        
    except Exception as e:
        print("Facebook data deletion error:", str(e))
        return jsonify({'error': str(e)}), 500

# Add status endpoint for Facebook to check deletion status
@auth_bp.route('/facebook/data-deletion/status/<user_id>', methods=['GET'])
def facebook_data_deletion_status(user_id):
    try:
        db = get_db()
        user = db.users.find_one({
            'auth_provider': 'facebook',
            'provider_id': user_id
        })
        
        if user is None:
            return jsonify({
                'status': 'success',
                'message': 'User data has been deleted'
            }), 200
        
        return jsonify({
            'status': 'pending',
            'message': 'Data deletion is in progress'
        }), 202
        
    except Exception as e:
        print("Status check error:", str(e))
        return jsonify({'error': str(e)}), 500 