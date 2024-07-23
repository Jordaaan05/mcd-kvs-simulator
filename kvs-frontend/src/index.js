import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Admin from './Admin';
import App from './app';
import DayOpen from './dayopen';
import './index.css';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/dayOpen" element={<DayOpen />} />
      </Routes>
    </Router>
  </React.StrictMode>
);