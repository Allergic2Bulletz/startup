import React, { useState } from 'react';
import '../app.css'; // Import shared styles
import styles from './splash.module.css';
import { useNavigate } from 'react-router-dom';
import { AuthState } from '../authState.js';
import { Unauthenticated } from './unauthenticated.jsx';

function Splash({ userName, currentAuthState, onAuthChange }) {
    const navigate = useNavigate();

    const handleTestClick = () => {
        navigate('/dashboard');
    };

  return (
    <main className={styles.main}>
        <div className={styles.splashContainer}>
            <section className={styles.welcome}>
                <h2>Welcome to ezTimes</h2>
                <p>Keep track of everyone's local time with minimal hassle. Bookmark your frequently-checked time zones, convert times across regions, and get notifications for your important reminders.</p>
            </section>
        
        {currentAuthState === AuthState.Unauthenticated && <Unauthenticated userName={userName} currentAuthState={currentAuthState} onAuthChange={onAuthChange} />}
        {currentAuthState === AuthState.Authenticated && (
            <section className={styles.authenticated}>
                <h2>Logged in as {userName}</h2>
                <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            </section>
        )}
        <button type="button" className={styles.testBtn} onClick={handleTestClick}>Test - Goto Dashboard</button>
        </div>
    </main>
  );
}

export default Splash;