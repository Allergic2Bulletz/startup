// Header.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthState } from '../authState.js';
import PreferencesModal from '../modals/PreferencesModal.jsx';

function Header(props) {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const navigate = useNavigate();
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const handlePreferencesClick = () => {
    setShowPreferencesModal(true);
  };

  return (
    <>
      <header>
        <div className="branding">
          <h1 className="logo">ezTimes</h1>
          <span className="tagline">Time Zone Coordination finally made easy.</span>
        </div>
        
        {props.currentAuthState === AuthState.Authenticated && (
          <nav>
            <span className="welcome-message">Logged in as {props.userName}</span>
            <button id="logout-btn" onClick={() => navigate('/')}>Logout</button>
            <button id="preferences-btn" onClick={handlePreferencesClick}>Preferences ⚙️</button>
          </nav>
        )}
      </header>

      <PreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        preferences={props.preferences}
        onSave={props.onUpdatePreferences}
        onReset={props.onResetPreferences}
        onExport={props.onExportPreferences}
      />
    </>
  );
}

export default Header;