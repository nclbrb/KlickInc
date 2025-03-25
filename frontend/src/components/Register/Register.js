import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); 

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name && email && password && role) {
      alert(`Registration successful for ${role} (${name})`);
      navigate('/login'); 
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="register-container">
        <h2 className="text-center">Register</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group mb-3">
            <label>Name:</label>
            <input 
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required 
            />
          </div>
          
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

          <div className="form-group mb-3">
            <label>Role:</label>
            <select 
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="project_manager">Project Manager</option>
              <option value="team_member">Team Member</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;