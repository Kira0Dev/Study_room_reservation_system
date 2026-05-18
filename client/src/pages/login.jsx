import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const loginData = {
      Email: email,
      PasswordHash: password 
    };

    axios.post('http://localhost:3000/auth/login', loginData) //I think is like that.
      .then(response => {
        const { token, user } = response.data;

        // save token and user info in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Redirect based on user role
        if (user.Role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      })
      .catch(err => {
        console.error(err);
        if (err.response && err.response.data) {
          setError(err.response.data.message || 'Invalid credentials.');
        } else {
          setError('Server connection failed.');
        }
      });
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4 fw-bold text-primary">Library Login</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
            Sign In
          </button>
        </form>
        <p className="text-center mt-3">
          Don't have an account? <Link to="/signup" className="fw-bold text-primary text-decoration-none">
              Sign Up
            </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;