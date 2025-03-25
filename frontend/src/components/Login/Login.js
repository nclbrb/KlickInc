import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './Login.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const credentials = {
    'projectmanager@example.com': { email: 'projectmanager@example.com', role: 'project_manager', password: 'manager123' },
    'teammember@example.com': { email: 'teammember@example.com', role: 'team_member', password: 'team123' }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (credentials[email] && credentials[email].password === password) {
      onLogin(credentials[email]);
      navigate(credentials[email].role === 'project_manager' ? '/project-manager-dashboard' : '/team-member-dashboard');
    } else {
      alert('Invalid email or password');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="login-container">
        <h2 className="text-center">Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group mb-3">
            <label>Email:</label>
            <input 
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required 
            />
          </div>
          <div className="form-group mb-3">
            <label>Password:</label>
            <input 
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <div className="mt-2 text-center">
          {/* Fixed the link path to '/register' */}
          <Link to="/register" className="text-decoration-none text-primary">Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;