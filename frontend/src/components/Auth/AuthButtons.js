import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login';
import './AuthButtons.css';

const AuthButtons = ({ onLoginSuccess }) => {
  const [error, setError] = useState(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('Credential Response:', credentialResponse); // Debug log
      
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          token: credentialResponse.credential 
        }),
      });
      
      // Debug logs
      console.log('Response status:', res.status);
      const contentType = res.headers.get('content-type');
      console.log('Content type:', contentType);
      
      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to authenticate');
        } else {
          const text = await res.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server returned non-JSON response');
        }
      }
      
      const data = await res.json();
      console.log('Response data:', data); // Debug log
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (typeof onLoginSuccess !== 'function') {
        console.error('onLoginSuccess is not a function:', onLoginSuccess);
        return;
      }
      
      onLoginSuccess(data.token, data.user);
    } catch (error) {
      setError('Failed to login with Google: ' + error.message);
      console.error('Google login error:', error);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleFacebookResponse = async (response) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.accessToken }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to authenticate');
      }
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      onLoginSuccess(data.token, data.user);
    } catch (error) {
      setError('Failed to login with Facebook: ' + error.message);
      console.error('Facebook login error:', error);
    }
  };

  return (
    <div className="auth-buttons">
      {error && <div className="auth-error">{error}</div>}
      
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap
        theme="filled_blue"
        size="large"
        text="signin_with"
        shape="rectangular"
      />
      
      <FacebookLogin
        appId={process.env.REACT_APP_FACEBOOK_APP_ID}
        autoLoad={false}
        fields="name,email,picture"
        callback={handleFacebookResponse}
        cssClass="facebook-login-button"
        icon="fa-facebook"
      />
    </div>
  );
};

export default AuthButtons; 