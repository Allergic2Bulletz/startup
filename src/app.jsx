import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import './app.css';
import Header from './header/header.jsx';
import Splash from './splash/splash.jsx';
import Dashboard from './dashboard/dashboard.jsx';
import NotificationBanner from './banners/notificationBanner.jsx';
import { AuthState } from './hooks/useAuthState.js';
import usePreferences from './hooks/usePreferences.js';
import useNotifications from './hooks/useNotifications.js';
import { NotificationContext } from './contexts/NotificationContext.js';
import NotificationTest from './examples/NotificationTest.jsx';

export default function App() {
    const [userName, setUserName] = React.useState('');
    const currentAuthState = userName ? AuthState.Authenticated : AuthState.Unauthenticated;
    const [authState, setAuthState] = React.useState(currentAuthState);
    
    // Preferences management
    const { preferences, updatePreferences, resetPreferences } = usePreferences();
    
    // Notification management
    const { notification, showNotification, hideNotification } = useNotifications();

    // Fetch username on mount
    React.useEffect(() => {
        const fetchAuthState = async () => {
            try {
                const response = await fetch('api/auth/getuser');
                if (response.ok) {
                    const data = await response.json();
                    setUserName(data.userName || '');
                    setAuthState(data.userName ? AuthState.Authenticated : AuthState.Unauthenticated);
                } else {
                    setUserName('');
                    setAuthState(AuthState.Unauthenticated);
                }
            } catch (error) {
                console.error('Failed to fetch auth state:', error);
                setUserName('');
                setAuthState(AuthState.Unauthenticated);
            }
        };

        fetchAuthState();
    }, []);

    return (
        <BrowserRouter>
            <NotificationContext.Provider value={{ showNotification, hideNotification }}>
                <div className="body">
                    <NotificationBanner 
                        notification={notification} 
                        onClose={hideNotification} 
                    />
                <Header 
                    userName={userName} 
                    currentAuthState={currentAuthState}
                    preferences={preferences}
                    onUpdatePreferences={updatePreferences}
                    onResetPreferences={resetPreferences}
                    onLogout={() => {
                        setUserName('');
                        setAuthState(AuthState.Unauthenticated);
                    }}
                />

                <Routes>
                    <Route path="/" element={<Splash userName={userName} currentAuthState={currentAuthState} onAuthChange={(userName, authState) => {setAuthState(authState);setUserName(userName);}} />}/>
                    <Route path="/dashboard" element={<Dashboard />}/>
                </Routes>

                <footer>
                    <p>Last updated Nov 2025.</p>
                    <span><a href="https://github.com/Allergic2Bulletz/startup">Cameron Coltrin's Github</a></span>
                </footer>
                <NotificationTest />
                </div>
            </NotificationContext.Provider>
        </BrowserRouter>
);
}