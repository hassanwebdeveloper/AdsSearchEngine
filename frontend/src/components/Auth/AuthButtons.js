import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import './AuthButtons.css';

const AuthButtons = ({ onLoginSuccess }) => {
  const [error, setError] = useState(null);
  const [isFBSDKLoaded, setIsFBSDKLoaded] = useState(false);

  useEffect(() => {
    // Check if FB SDK is loaded
    if (window.FB) {
      setIsFBSDKLoaded(true);
    } else {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: process.env.REACT_APP_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v12.0'
        });
        setIsFBSDKLoaded(true);
      };
    }
  }, []);

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

  const handleDataDeletionRequest = async (userId) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/facebook/data-deletion', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (!res.ok) {
        throw new Error('Failed to process data deletion request');
      }

      const data = await res.json();
      console.log('Data deletion response:', data);
    } catch (error) {
      console.error('Data deletion error:', error);
      setError('Failed to process data deletion request');
    }
  };

  const handleFacebookResponse = async (response) => {
    try {
      console.log('Facebook Response:', response);

      if (!response.accessToken) {
        throw new Error('Facebook login failed');
      }

      const res = await fetch('http://localhost:5000/api/auth/facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          token: response.accessToken,
          userData: {
            email: response.email,
            name: response.name,
            picture: response.picture?.data?.url
          }
        }),
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

      // Store the user ID for potential data deletion requests
      localStorage.setItem('fb_user_id', response.id);

      onLoginSuccess(data.token, data.user);
    } catch (error) {
      setError('Failed to login with Facebook: ' + error.message);
      console.error('Facebook login error:', error);
    }
  };

  const handleFacebookLogin = (renderProps) => {
    if (!isFBSDKLoaded) {
      setError('Facebook SDK is not loaded yet. Please try again in a moment.');
      return;
    }
    renderProps.onClick();
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
        render={renderProps => (
          <button 
            onClick={() => handleFacebookLogin(renderProps)}
            className="facebook-login-button"
            disabled={!isFBSDKLoaded}
          >
            <i className="fab fa-facebook-f"></i>
            Login with Facebook
          </button>
        )}
        disableMobileRedirect={true}
        isMobile={false}
      />
    </div>
  );
};

export default AuthButtons; 