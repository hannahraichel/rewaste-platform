import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

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
            setError(err.response?.data?.error || 'Invalid credentials. Please check your email and password.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>ReWaste Portal Sign-In</h2>
                {error && <div className="error-msg">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" required onChange={handleChange} value={formData.email} placeholder="name@company.com" />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" required onChange={handleChange} value={formData.password} placeholder="••••••••" />
                    </div>

                    <button type="submit" className="btn" style={{ marginBottom: '15px' }}>Sign In</button>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                        New platform user? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Register Industry Account</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;