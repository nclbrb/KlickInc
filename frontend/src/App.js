import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import DashboardProjectManager from './components/Dashboard/DashboardProjectManager';
import DashboardTeamMember from './components/Dashboard/DashboardTeamMember';
import api, { setAuthToken } from './api'; // Import your Axios instance and helper
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [user, setUser] = useState(null);

  // On app load, check localStorage for persisted user data and token
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAuthToken(storedToken); // Set the token for Axios
    }
  }, []);

  // Called after a successful login
  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('access_token', token);
    setAuthToken(token); // Set token for future API calls
  };

  // Called when logging out
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    setAuthToken(null);
  };

  return (
    <Router>
      <Routes>
        {/* Login route */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Register route */}
        <Route path="/register" element={<Register />} />

        {/* Project Manager Dashboard */}
        <Route
          path="/project-manager-dashboard"
          element={user?.role === 'project_manager' ? (
            <DashboardProjectManager user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )}
        />

        {/* Team Member Dashboard */}
        <Route
          path="/team-member-dashboard"
          element={user?.role === 'team_member' ? (
            <DashboardTeamMember user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )}
        />

        {/* Fallback route: Redirect based on authentication status */}
        <Route 
          path="*"
          element={<Navigate to={user ? (user.role === 'project_manager' ? '/project-manager-dashboard' : '/team-member-dashboard') : '/login'} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
