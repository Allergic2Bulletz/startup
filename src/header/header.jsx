// Header.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const navigate = useNavigate();

  return (
    <header>
      <div className="branding">
        <h1 className="logo">ezTimes</h1>
        <span className="tagline">Time Zone Coordination finally made easy.</span>
      </div>
      
      {isDashboard && (
        <nav>
          <span className="welcome-message">Logged in as User</span>
          <button id="logout-btn" onClick={() => navigate('/')}>Logout</button>
          <button id="preferences-btn">Preferences</button>
        </nav>
      )}
    </header>
  );
}

export default Header;