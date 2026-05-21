import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    

    const handleSignup = (e) => {
        e.preventDefault();
        setError('');

        const signupData = {
            Username: username,
            Email: email,
            PasswordHash: password,
            Role: role
        };

        axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, signupData)
            .then(response => {
                navigate('/login');
            })
            .catch(err => {
                console.error(err);
                setError('Failed to create account.');
            });
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4 fw-bold text-primary">Library Signup</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSignup}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Name & Last Name</label>
                        <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Your full name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        />
                    </div>
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
                        Sign Up
                    </button> 
                </form>
                <p className="text-center mt-3">
                    Already have an account? <Link to="/login" className="fw-bold text-primary text-decoration-none">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Signup;