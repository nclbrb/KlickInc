import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link from react-router-dom
import api from '../../api'; // Make sure this is your configured Axios instance
import './Register.css';

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState(''); // Using username as per your database table
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that all fields are filled
    if (!username || !email || !password || !passwordConfirmation || !role) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      // Call your backend registration endpoint
      const response = await api.post('/register', {
        username, // This field must match what your AuthController expects
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
      });

      // Optional: You can display a success message or automatically log the user in
      alert("Registration successful. Please log in.");
      navigate('/login');
    } catch (err) {
      console.error("Registration error:", err);
      // Optionally, extract error messages from the response
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="register-container">
        <h2 className="text-center">Register</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group mb-3">
            <label>Username:</label>
            <input 
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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
            <label>Confirm Password:</label>
            <input 
              type="password"
              className="form-control"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Confirm your password"
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

          <button type="submit" className="btn btn-purp w-100">Register</button>
        </form>

        {/* New link added below the register button */}
        <div className="text-center mt-3">
        <div className="mt-2 text-center">
          Already Have an Account? <Link to="/login" className="text-decoration-none text-primary">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
