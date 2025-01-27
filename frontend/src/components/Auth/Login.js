import React from 'react';
import AuthButtons from './AuthButtons';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome to Ads Search Engine</h1>
        <p>Please sign in to continue</p>
        <AuthButtons onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  );
};

export default Login; 