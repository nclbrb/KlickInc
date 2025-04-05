import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import DashboardProjectManager from './components/Dashboard/DashboardProjectManager';
import DashboardTeamMember from './components/Dashboard/DashboardTeamMember';
import api, { setAuthToken } from './api'; // Import your Axios instance and helper
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check localStorage for a persisted token and fetch user info if available
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setAuthToken(storedToken); // Set token for Axios
      // Attempt to fetch the current user info from the API
      api.get('/user')
        .then(response => {
          setUser(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching user info:', error);
          // If token is invalid, clear the stored credentials
          handleLogout();
          setLoading(false);
        });
    } else {
      setLoading(false);
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

  if (loading) {
    return <div>Loading...</div>;
  }

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
