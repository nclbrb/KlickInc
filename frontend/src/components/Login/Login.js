import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../../api'; 
import './Login.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make the POST request to your /api/login endpoint
      const response = await api.post('/login', { email, password });
      const { access_token, user } = response.data;

      // Store token and user data in localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_email', user.email);
      localStorage.setItem('user_name', user.username || user.name);
      
      // Log what we're storing for debugging
      console.log('Storing user data in localStorage:', {
        user_id: user.id,
        user_role: user.role,
        user_email: user.email,
        user_name: user.username || user.name
      });
      
      // Set the token for subsequent requests
      setAuthToken(access_token);
      
      // Trigger any onLogin functionality passed down from props, include access token
      onLogin(user, access_token);

      // Redirect based on the user's role
      if (user.role === 'project_manager') {
        navigate('/project-manager-dashboard');
      } else if (user.role === 'team_member') {
        navigate('/team-member-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="login-container">
        <h2 className="text-center">Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
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
          <button type="submit" className="btn btn-purp w-100">Login</button>
        </form>
        <div className="mt-2 text-center">
          Don't have an account? <Link to="/register" className="text-decoration-none text-primary">
           Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
