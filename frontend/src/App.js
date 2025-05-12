import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  // useLocation // Not used in App.js directly, but Layout uses it. Keep if Layout is part of App.js file.
} from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import DashboardProjectManager from './components/Dashboard/DashboardProjectManager';
import DashboardTeamMember from './components/Dashboard/DashboardTeamMember';
import TasksPage from './components/Dashboard/TasksPage';
import ProjectsPage from './components/Dashboard/ProjectsPage';
import FilePage from './components/Dashboard/FilePage';
import ActivityFeedPage from './components/Dashboard/ActivityFeed';
// NavBar is likely used within the page components like FilePage, ProjectsPage etc.
// So direct import here might not be needed if those pages handle their own NavBar.
// However, if you have a global Layout component defined elsewhere that uses NavBar, that's fine.
// import NavBar from './components/Dashboard/NavBar';
import api, { setAuthToken } from './api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

// Note: The Layout component was defined in the prompt but not used in the Routes directly.
// If your page components (FilePage, ProjectsPage, etc.) render their own NavBar,
// they need the onLogout prop. If you intended a global Layout wrapper around routes,
// that would be a different structure. The fix below assumes page components handle their NavBar.

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // console.log('App rendering, user:', user, 'loading:', loading); // Keep for debugging if needed

  // Define handleLogout here so it's stable and can be passed down
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    setAuthToken(null);
    // No need to navigate here, ProtectedRoute will handle it
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setAuthToken(storedToken);
      api.get('/user')
        .then(response => {
          setUser(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching user info:', error);
          // Call the stable handleLogout function
          handleLogout(); // This will clear state and token
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleLogin = (userData, token) => {
    if (userData && token) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('access_token', token);
      setAuthToken(token);
    } else {
      console.error('Invalid user data or token');
    }
  };


  if (loading) {
    // console.log('App is loading...'); // Keep for debugging
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" replace /> : <Register />
          } />

          {/* Protected Routes */}
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
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/projects"
            element={
              user ? (
                <ProjectsPage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/tasks"
            element={
              user ? (
                <TasksPage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/files"
            element={
              user ? (
                // Pass the onLogout prop here
                <FilePage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/activity-feed"
            element={
              user ? (
                // Assuming ActivityFeedPage also uses NavBar and needs onLogout
                <ActivityFeedPage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback Route - Redirect to dashboard if logged in, else to login */}
          <Route
            path="*"
            element={
              <Navigate to={user ? '/dashboard' : '/login'} replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;