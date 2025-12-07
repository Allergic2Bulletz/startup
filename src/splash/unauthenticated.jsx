import React from 'react';
import styles from './splash.module.css';
import { useNavigate } from 'react-router-dom';
import { AuthState } from '../hooks/useAuthState.js';
import { useState } from 'react';
import { useNotificationContext } from '../hooks/useNotifications.js';

export function Unauthenticated({ onAuthChange }) {
    const { showNotification } = useNotificationContext();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userName: '',
        password: ''
    });

    const validateBeforeSubmit = () => {
        if (!formData.userName || !formData.password) {
            showNotification('Please fill in both username and password fields.', 'error', true);
            return false; // Basic validation
        }
        if (isLoading) {
            return false; // Prevent multiple submissions
        }
        return true;
    }
    // todo - have a toggle for whether or not to import existing data from localStorage upon registration
    
    // Placeholder function for authentication - replace with real authentication later
    // For now, just set userName and mark as authenticated
    // The discrepancy between hanldeLogin and handleRegister is due to login being a submit and register being a button click
    const handleLogin = async (userName, password) => {
        try {
            setIsLoading(true);
            const response = await fetch('api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, password })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }
            onAuthChange(userName, AuthState.Authenticated);
            navigate('/dashboard');
        } 
        catch (error) {
            console.error('Login error:', error);
            showNotification('Login failed: ' + (error.message || 'Unknown error'), 'error', true);
        }
        finally {
            setIsLoading(false);
        }
    }

    const handleRegister = async (userName, password) => {
        // TODO: Replace with actual authentication logic
        if (!validateBeforeSubmit()) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch('api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, password })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Register failed');
            }
            onAuthChange(userName, AuthState.Authenticated);
            navigate('/dashboard');
        } 
        catch (error) {
            console.error('Registration error:', error);
            showNotification('Registration failed: ' + (error.message || 'Unknown error'), 'error', true);
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateBeforeSubmit()) {
            return;
        }
        handleLogin(formData.userName, formData.password);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <section className={styles.loginRegisterSection}>
            <h3>Login or Register</h3>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="userName">Username:</label>
                    <input 
                        type="text" 
                        id="userName" 
                        name="userName" 
                        value={formData.userName}
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
                    <button type="submit" className={styles.loginBtn} onClick={handleSubmit}>Login</button>
                    <button type="button" className={styles.registerBtn} onClick={() => handleRegister(formData.userName, formData.password)}>Register</button>
                </div>
            </form>
        </section>
    )
}