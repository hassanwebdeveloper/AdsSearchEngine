import React from 'react';
import UserMenu from '../UserMenu/UserMenu';
import './Header.css';

const Header = ({ onLogout }) => {
  return (
    <header className="header">
      <div className="header-logo">
        Ads Search Engine
      </div>
      <div className="header-right">
        <UserMenu onLogout={onLogout} />
      </div>
    </header>
  );
};

export default Header; 