// Header.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthState } from '../authState.js';
import PreferencesModal from '../modals/PreferencesModal.jsx';
import styles from './header.module.css';

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
      <header className={styles.header}>
        <div className={styles.branding}>
          <h1 className={styles.logo} onClick={() => navigate('/')}>ezTimes 🏠</h1>
          <span className={styles.tagline}>Time Zone Coordination finally made easy.</span>
        </div>
        
        {props.currentAuthState === AuthState.Authenticated && (
          <nav className={styles.nav}>
            <span className={styles.welcomeMessage}>Logged in as {props.userName}</span>
            <button className={styles.logoutBtn} onClick={() => navigate('/')}>Logout</button>
            <button className={styles.preferencesBtn} onClick={handlePreferencesClick}>Preferences ⚙️</button>
          </nav>
        )}
        
        {isDashboard && props.currentAuthState === AuthState.Unauthenticated && (
          <nav className={styles.nav}>
            <span className={styles.welcomeMessage}>Logged in as Guest</span>
            <button className={styles.preferencesBtn} onClick={handlePreferencesClick}>Preferences ⚙️</button>
          </nav>
        )}
      </header>

      <PreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        preferences={props.preferences}
        onSave={props.onUpdatePreferences}
        onReset={props.onResetPreferences}
      />
    </>
  );
}

export default Header;