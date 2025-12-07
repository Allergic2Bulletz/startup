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
import WebSocketClient from './websocket/wsClient.js';

export default function App() {
    const [userName, setUserName] = React.useState('');
    const currentAuthState = userName ? AuthState.Authenticated : AuthState.Unauthenticated;
    const [authState, setAuthState] = React.useState(currentAuthState);

    const [activeAlert, setActiveAlert] = React.useState(false);
    
    // WebSocket client instance
    const wsClient = React.useRef(null);
    
    // Notification management
    const { notification, showNotification, hideNotification } = useNotifications();

    // Preferences management
    const { preferences, updatePreferences, resetPreferences } = usePreferences( currentAuthState, showNotification );
    
    // Initialize WebSocket
    React.useEffect(() => {
        // Create WebSocket client
        wsClient.current = new WebSocketClient();
        
        // Set up alert callback
        wsClient.current.onAlert((alertMessage) => {
            console.log('📱 Alert received:', alertMessage);
            setActiveAlert(true);
            showNotification(`WebSocket Alert: ${alertMessage}`, 'info');
            
            // Auto-clear alert after 5 seconds
            setTimeout(() => setActiveAlert(false), 5000);
        });
        
        // Set up connection callbacks
        wsClient.current.onConnected(() => {
            console.log('📱 WebSocket connected in React');
            showNotification('WebSocket connected', 'success');
        });
        
        wsClient.current.onDisconnected(() => {
            console.log('📱 WebSocket disconnected in React');
            showNotification('WebSocket disconnected', 'warning');
        });
        
        // Connect when component mounts
        wsClient.current.connect();
        
        // Cleanup on unmount
        return () => {
            if (wsClient.current) {
                wsClient.current.disconnect();
            }
        };
    }, []);
    
    // Update WebSocket auth when userName changes
    React.useEffect(() => {
        if (wsClient.current && userName) {
            wsClient.current.sendAuth(userName);
        }
    }, [userName]);
    
    // Test functions for WebSocket
    const testWebSocketPing = React.useCallback(() => {
        if (wsClient.current) {
            const success = wsClient.current.sendPing();
            if (success) {
                showNotification('Ping sent to server', 'info');
            } else {
                showNotification('WebSocket not connected', 'error');
            }
        }
    }, [showNotification]);
    
    const clearActiveAlert = React.useCallback(() => {
        setActiveAlert(false);
        showNotification('Alert cleared', 'success');
    }, [showNotification]);
    
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

        const keepAlive = setInterval(async () => {
            try {
                await fetch('api/ping', { method: 'HEAD'})
            } catch (error) {
                // Ignore errors in keep-alive
            }
        }, 45 * 1000); // every 45 seconds

        return () => clearInterval(keepAlive);
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
                    <Route path="/dashboard" element={<Dashboard currentAuthState={currentAuthState}/>}/>
                </Routes>

                {/* WebSocket Test Controls */}
                <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000, background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '5px' }}>
                    <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                        WebSocket Status: {wsClient.current?.getStatus().connected ? '🟢 Connected' : '🔴 Disconnected'}
                        {activeAlert && <span style={{ color: 'red', marginLeft: '10px' }}>🚨 ALERT ACTIVE</span>}
                    </div>
                    <button onClick={testWebSocketPing} style={{ margin: '2px', fontSize: '10px' }}>Test Ping</button>
                    {activeAlert && (
                        <button onClick={clearActiveAlert} style={{ margin: '2px', fontSize: '10px', backgroundColor: 'orange' }}>Clear Alert</button>
                    )}
                </div>

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