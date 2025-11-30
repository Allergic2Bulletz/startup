import React, { useState } from 'react';
import '../app.css'; // Import shared styles
import styles from './splash.module.css';
import { useNavigate } from 'react-router-dom';
import { AuthState } from '../authState.js';

function Splash({ userName, currentAuthState, onAuthChange }) {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Placeholder function for authentication - replace with real authentication later
    // For now, just set userName to email and mark as authenticated
    const handleLogin = async (email, password) => {
        // TODO: Replace with actual authentication logic
        try {
            setIsLoading(true);
            localStorage.setItem('userName', email);
            onAuthChange(email, AuthState.Authenticated);
            navigate('/dashboard');
        } finally {
            setIsLoading(false);
        }
    }

    const handleRegister = async (email, password) => {
        // TODO: Replace with actual authentication logic
        try {
            setIsLoading(true);
            localStorage.setItem('userName', email);
            onAuthChange(email, AuthState.Authenticated);
            navigate('/dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLoading) return; // Prevent multiple submissions
        if (!formData.email || !formData.password) return; // Basic validation
        handleLogin(formData.email, formData.password);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

            <section className={styles.loginRegisterSection}>
                <h3>Login or Register</h3>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleInputChange}
                            required 
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            value={formData.password}
                            onChange={handleInputChange}
                            required 
                        />
                    </div>
                    
                    <div className={styles.buttonGroup}>
                        {/* Login button will take priority if the user hits enter. */}
                        <button type="submit" className={styles.loginBtn}>Login</button>
                        <button type="button" className={styles.registerBtn}>Register</button>
                        <button type="button" className={styles.testBtn} onClick={handleTestClick}>Test</button>
                    </div>
                </form>
            </section>
        </div>
    </main>
  );
}

export default Splash;