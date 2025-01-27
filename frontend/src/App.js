import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/Auth/Login';
import Header from './components/Header/Header';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  const handleLoginSuccess = (token, userData) => {
    console.log('Login success:', { token, userData }); // Debug log
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Hardcode the client ID temporarily for testing
  const GOOGLE_CLIENT_ID = "253595159397-0uui61960q5gvv0lc66jmetv2gbsrqja.apps.googleusercontent.com";
  
  console.log('Environment Variables in App:', {
    fromEnv: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    hardcoded: GOOGLE_CLIENT_ID
  });

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="App">
          {isAuthenticated && <Header onLogout={handleLogout} />}
          <div className={`app-content ${isAuthenticated ? 'with-header' : ''}`}>
            <Routes>
              <Route 
                path="/login" 
                element={
                  !isAuthenticated ? (
                    <Login onLoginSuccess={handleLoginSuccess} />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                } 
              />
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? (
                    <div>Dashboard (Coming Soon)</div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/"
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
              />
            </Routes>
          </div>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
