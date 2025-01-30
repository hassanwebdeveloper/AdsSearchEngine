import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/Auth/Login';
import Header from './components/Header/Header';
import Search from './components/Search/Search';
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

  console.log('Environment Variables in App:', {
    fromEnv: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    fb:process.env.REACT_APP_FACEBOOK_APP_ID
  });

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
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
                    <Search />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/search"
                element={
                  isAuthenticated ? (
                    <Search />
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
