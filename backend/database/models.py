from datetime import datetime

class User:
    def __init__(self, email, name, auth_provider, provider_id, profile_picture=None):
        self.email = email
        self.name = name
        self.auth_provider = auth_provider  # 'google' or 'facebook'
        self.provider_id = provider_id
        self.profile_picture = profile_picture
        self.created_at = datetime.utcnow()
        self.last_login = datetime.utcnow()

    def to_dict(self):
        return {
            'email': self.email,
            'name': self.name,
            'auth_provider': self.auth_provider,
            'provider_id': self.provider_id,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at,
            'last_login': self.last_login
        } 