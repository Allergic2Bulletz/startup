import React from 'react';
import styles from './splash.module.css';
import { useNavigate } from 'react-router-dom';

function Splash() {
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

            <section className={styles.loginRegisterSection}>
                <h3>Login or Register</h3>
                <form>
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" required />
                    </div>
                    
                    <div>
                        {/* Login button will take priority if the user hits enter. */}
                        <a href="dashboard.html">
                            <button type="submit" id="login-btn">Login</button>
                        </a>
                        <button type="submit" className={styles.registerBtn}>Register</button>
                        <button type="button" className={styles.testBtn} onClick={handleTestClick}>Test</button>
                    </div>
                </form>
            </section>
        </div>
    </main>
  );
}

export default Splash;