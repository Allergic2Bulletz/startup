import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import './app.css';
import Header from './header/header.jsx';
import Splash from './splash/splash.jsx';
import Dashboard from './dashboard/dashboard.jsx';

export default function App() {
  return (
    <BrowserRouter>
    <div className="body">
        <Header />

        <Routes>
            <Route path="/" element={<Splash />}/>
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