import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle'; 

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('/api/auth/login', formData);
            login(res.data.user, res.data.token);
            alert('Welcome Back!');
            navigate('/'); 
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials.');
        }
    };

    return (
        <div className="auth-container" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Elegant Floating Top Bar for Theme Toggle - Matches Register View Layout */}
            <div style={{ width: '100%', maxWidth: '450px', display: 'flex', justifyContent: 'flex-end', boxSizing: 'border-box' }}>
                <ThemeToggle />
            </div>

            <div className="auth-card" style={{ maxWidth: '450px', padding: '35px 40px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)', textAlign: 'left' }}>
                    Welcome Back
                </h2>
                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'left' }}>
                    Sign in to manage your industrial waste listings and monitor circular analytics.
                </p>

                {error && (
                    <div className="error-msg" style={{ textAlign: 'left', marginBottom: '20px' }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '18px', textAlign: 'left' }}>
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            required 
                            onChange={handleChange} 
                            value={formData.email} 
                            placeholder="name@company.com" 
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px', textAlign: 'left' }}>
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            required 
                            onChange={handleChange} 
                            value={formData.password} 
                            placeholder="••••••••" 
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button type="submit" className="btn" style={{ padding: '14px', fontSize: '15px' }}>
                        Sign In
                    </button>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginTop: '20px', margin: 0 }}>
                        New platform user? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Register Industry Account</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;