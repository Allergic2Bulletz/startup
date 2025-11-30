// Header.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthState } from '../authState.js';

function Header(props) {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const navigate = useNavigate();

  return (
    <header>
      <div className="branding">
        <h1 className="logo">ezTimes</h1>
        <span className="tagline">Time Zone Coordination finally made easy.</span>
      </div>
      
      {props.currentAuthState === AuthState.Authenticated && (
        <nav>
          <span className="welcome-message">Logged in as {props.userName}</span>
          <button id="logout-btn" onClick={() => navigate('/')}>Logout</button>
          <button id="preferences-btn">Preferences ⚙️</button>
        </nav>
      )}
    </header>
  );
}

export default Header;