import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import './app.css';
import Header from './header/header.jsx';
import Splash from './splash/splash.jsx';
import Dashboard from './dashboard/dashboard.jsx';
import { AuthState } from './authState.js';

export default function App() {
    const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
    const currentAuthState = userName ? AuthState.Authenticated : AuthState.Unauthenticated;
    const [authState, setAuthState] = React.useState(currentAuthState);

    return (
        <BrowserRouter>
            <div className="body">
                <Header />

                <Routes>
                    <Route path="/" element={<Splash userName={userName} currentAuthState={currentAuthState} onAuthChange={(userName, authState) => {setAuthState(authState);setUserName(userName);}} />}/>
                    <Route path="/dashboard" element={<Dashboard />}/>
                </Routes>

                <footer>
                    <p>Last updated Nov 2025.</p>
                    <span><a href="https://github.com/Allergic2Bulletz/startup">Cameron Coltrin's Github</a></span>
                </footer>
            </div>
        </BrowserRouter>
);
}