import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserMenu.css';

const UserMenu = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  return (
    <div className="user-menu" ref={dropdownRef}>
      <div className="user-icon" onClick={() => setIsOpen(!isOpen)}>
        {userData.profile_picture ? (
          <img 
            src={userData.profile_picture} 
            alt={userData.name} 
            className="profile-picture"
          />
        ) : (
          <div className="profile-placeholder">
            {userData.name ? userData.name[0].toUpperCase() : 'U'}
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className="dropdown-menu">
          <div className="user-info">
            <div className="user-name">{userData.name}</div>
            <div className="user-email">{userData.email}</div>
          </div>
          <div className="dropdown-divider"></div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 