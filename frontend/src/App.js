import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';  
import DashboardProjectManager from './components/Dashboard/DashboardProjectManager'; 
import DashboardTeamMember from './components/Dashboard/DashboardTeamMember'; 
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        {/* Login route */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Register route */}
        <Route path="/register" element={<Register />} />  {/* Add Register route */}

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
        
        {/* Redirect if the user is not logged in */}
        <Route 
          path="*"
          element={<Navigate to={user ? (user.role === 'project_manager' ? '/project-manager-dashboard' : '/team-member-dashboard') : '/login'} />}
        />
        
      </Routes>
    </Router>
  );
}

export default App;