import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import DashboardProjectManager from './components/Dashboard/DashboardProjectManager';
import DashboardTeamMember from './components/Dashboard/DashboardTeamMember';
import TasksPage from './components/Dashboard/TasksPage';
import ProjectsPage from './components/Dashboard/ProjectsPage';
import FilePage from './components/Dashboard/FilePage'; // Corrected import for FilePage
import ActivityFeedPage from './components/Dashboard/ActivityFeed'; // Assuming ActivityFeedPage component
import api, { setAuthToken } from './api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setAuthToken(storedToken);
      // Fetch current user info from the API
      api.get('/user')
        .then(response => {
          setUser(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching user info:', error);
          handleLogout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // After a successful login
  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('access_token', token);
    setAuthToken(token);
  };

  // On logout
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
        {/* Public Routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        {/* Unified Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            user ? (
              user.role === 'project_manager' ? (
                <DashboardProjectManager user={user} onLogout={handleLogout} />
              ) : (
                <DashboardTeamMember user={user} onLogout={handleLogout} />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Projects Page */}
        <Route
          path="/projects"
          element={
            user ? (
              <ProjectsPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Tasks Page */}
        <Route
          path="/tasks"
          element={
            user ? (
              <TasksPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* File Page Route */}
        <Route
          path="/files"
          element={
            user ? (
              <FilePage user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Activity Feed Route */}
        <Route
          path="/activity-feed"
          element={
            user ? (
              <ActivityFeedPage user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Fallback Route */}
        <Route
          path="*"
          element={
            <Navigate
              to={user ? '/dashboard' : '/login'}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
