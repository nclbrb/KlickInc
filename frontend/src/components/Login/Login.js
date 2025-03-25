// src/components/Login/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Since this is a dummy setup, we accept any password.
    onLogin({ email });
    navigate('/dashboard');
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
              placeholder="Enter any password"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
