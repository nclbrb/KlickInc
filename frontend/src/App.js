import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import DashboardProjectManager from './components/Dashboard/DashboardProjectManager';
import DashboardTeamMember from './components/Dashboard/DashboardTeamMember';
import TasksPage from './components/Dashboard/TasksPage';
import ProjectsPage from './components/Dashboard/ProjectsPage';
import FilePage from './components/Dashboard/FilePage';
import ActivityFeedPage from './components/Dashboard/ActivityFeed';
import NavBar from './components/Dashboard/NavBar';
import api, { setAuthToken } from './api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';


// Layout component that includes the NavBar and content
const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return <div>{children}</div>;
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#4e73df', color: 'white' }}>
        <NavBar user={user} onLogout={onLogout} />
      </div>
      
      {/* Main Content */}
      <div className="flex-grow-1" style={{ paddingLeft: '20px' }}>

        
        {/* Page Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  console.log('App rendering, user:', user, 'loading:', loading);

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
    if (userData && token) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('access_token', token);
      setAuthToken(token);
    } else {
      console.error('Invalid user data or token');
    }
  };

  // On logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    setAuthToken(null);
  };

  if (loading) {
    console.log('App is loading...');
    return <div>Loading...</div>;
  }



  return (

      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/register" element={
              user ? <Navigate to="/" replace /> : <Register />
            } />
            
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
        </div>
      </Router>

  );
}

export default App;
