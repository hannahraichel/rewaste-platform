import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import greenAuthBg from '../assets/greenish.jpg';

const Login = () => {
    const { login } = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);
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
            showToast('Welcome Back!');
            navigate('/dashboard'); 
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials.');
        }
    };

    return (
        <div className="clay-container" style={{
            width: '100vw',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            fontFamily: 'var(--font-body)',
            padding: '2rem',
            overflowX: 'hidden',
            position: 'relative',
            boxSizing: 'border-box',
            backgroundImage: `url(${greenAuthBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            
            <style>{`
                :root {
                  --clay-bg: #f2f7f4;
                  --clay-card-bg: #ffffff;
                  --clay-shadow-out-1: #d5e3db;
                  --clay-shadow-out-2: #ffffff;
                  --clay-shadow-in-1: #ffffff;
                  --clay-shadow-in-2: #d5e3db;
                  --clay-input-bg: #fafdfb;
                  --clay-input-border: rgba(255, 255, 255, 0.5);
                  --primary: #10b981;
                  --primary-dark: #059669;
                }

                [data-theme='dark'] {
                  --clay-bg: #0b0f0d;
                  --clay-card-bg: #121815;
                  --clay-shadow-out-1: #050806;
                  --clay-shadow-out-2: #1e2621;
                  --clay-shadow-in-1: #1e2621;
                  --clay-shadow-in-2: #050806;
                  --clay-input-bg: #0a0d0c;
                  --clay-input-border: rgba(255, 255, 255, 0.03);
                  --primary: #10b981;
                  --primary-dark: #059669;
                }

                .clay-container {
                  background-color: var(--clay-bg) !important;
                  background-image: radial-gradient(circle, rgba(16, 185, 129, 0.06) 1.2px, transparent 1.2px);
                  background-size: 24px 24px;
                  transition: background-color 0.3s ease;
                }

                .clay-card {
                  background-color: var(--clay-card-bg) !important;
                  border-radius: 24px !important;
                  border: 1px solid var(--clay-input-border) !important;
                  box-shadow: 9px 9px 18px var(--clay-shadow-out-1), 
                              -9px -9px 18px var(--clay-shadow-out-2), 
                              inset 3px 3px 6px var(--clay-shadow-in-1), 
                              inset -3px -3px 6px var(--clay-shadow-in-2) !important;
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .clay-card:hover {
                  box-shadow: 12px 12px 24px var(--clay-shadow-out-1), 
                              -12px -12px 24px var(--clay-shadow-out-2), 
                              inset 3px 3px 6px var(--clay-shadow-in-1), 
                              inset -3px -3px 6px var(--clay-shadow-in-2) !important;
                }

                .clay-input {
                  background-color: var(--clay-input-bg) !important;
                  border-radius: 16px !important;
                  border: 1px solid var(--clay-input-border) !important;
                  box-shadow: inset 3px 3px 6px var(--clay-shadow-in-2), 
                              inset -3px -3px 6px var(--clay-shadow-in-1) !important;
                  padding: 12px 16px !important;
                  color: var(--text-main) !important;
                  font-family: var(--font-body) !important;
                  outline: none !important;
                  transition: all 0.2s ease;
                }

                .clay-input:focus {
                  border-color: var(--primary) !important;
                  box-shadow: inset 1px 1px 2px var(--clay-shadow-in-2), 
                              inset -1px -1px 2px var(--clay-shadow-in-1),
                              0 0 8px rgba(16, 185, 129, 0.15) !important;
                }

                .clay-btn-primary {
                  background-color: var(--primary) !important;
                  color: var(--white) !important;
                  border-radius: 16px !important;
                  border: 1px solid rgba(255, 255, 255, 0.2) !important;
                  box-shadow: 4px 4px 8px rgba(16, 185, 129, 0.25), 
                              -4px -4px 8px rgba(255, 255, 255, 0.05), 
                              inset 3px 3px 6px rgba(255, 255, 255, 0.25), 
                              inset -3px -3px 6px rgba(0, 0, 0, 0.3) !important;
                  cursor: pointer !important;
                  font-weight: 700 !important;
                  font-family: var(--font-mono) !important;
                  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                .clay-btn-primary:hover {
                  background-color: var(--primary-dark) !important;
                  transform: translateY(-2px) !important;
                  box-shadow: 6px 6px 12px rgba(5, 150, 105, 0.35), 
                              -6px -6px 12px rgba(255, 255, 255, 0.08), 
                              inset 3px 3px 6px rgba(255, 255, 255, 0.3), 
                              inset -3px -3px 6px rgba(0, 0, 0, 0.4) !important;
                }

                .clay-btn-primary:active {
                  transform: translateY(1px) !important;
                  box-shadow: inset 3px 3px 6px rgba(0, 0, 0, 0.4), 
                              inset -3px -3px 6px rgba(255, 255, 255, 0.05) !important;
                }
            `}</style>

            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center', 
                padding: '24px 2rem',
            }}>
                <span style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: '800',
                    color: 'var(--primary-dark)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase'
                }}>
                    REWASTE HUB
                </span>
            </div>

            <div className="clay-card" style={{ 
                position: 'relative',
                zIndex: 2,
                width: '100%',
                maxWidth: '460px', 
                padding: '40px',
                marginTop: '60px',
                marginBottom: '40px',
                boxSizing: 'border-box'
            }}>
                <h2 style={{ 
                    fontFamily: 'var(--font-display)',
                    fontSize: '28px', 
                    fontWeight: '800', 
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    marginBottom: '10px', 
                    color: 'var(--black)', 
                    textAlign: 'left' 
                }}>
                    Welcome Back
                </h2>
                
                <p style={{ 
                    margin: '0 0 32px 0', 
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px', 
                    color: 'var(--text-muted)', 
                    textAlign: 'left',
                    lineHeight: '1.5'
                }}>
                    Sign in to manage your industrial waste listings, handle exchange requests, and monitor environmental metrics.
                </p>

                {error && (
                    <div style={{ 
                        textAlign: 'left',
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        color: 'var(--error-text)',
                        background: 'var(--error-bg)',
                        border: '1px solid var(--error-border)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700' }}>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            required 
                            onChange={handleChange} 
                            value={formData.email} 
                            placeholder="name@company.com" 
                            className="clay-input"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700' }}>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            required 
                            onChange={handleChange} 
                            value={formData.password} 
                            placeholder="••••••••" 
                            className="clay-input"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="clay-btn-primary"
                        style={{ 
                            width: '100%',
                            fontSize: '12px',
                            letterSpacing: '0.08em',
                            padding: '14px', 
                            cursor: 'pointer',
                            marginTop: '8px'
                        }}
                    >
                        LOG IN
                    </button>
                    
                    <p style={{ 
                        color: 'var(--text-muted)', 
                        fontSize: '14px', 
                        textAlign: 'center', 
                        marginTop: '12px', 
                        marginBottom: 0 
                    }}>
                        New to ReWaste? {' '}
                        <Link to="/register" style={{ 
                            color: 'var(--primary-dark)', 
                            textDecoration: 'underline', 
                            fontWeight: '700' 
                        }}>
                            Create Account
                        </Link>
                    </p>
                </form>
            </div>

            <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '24px 2rem',
            }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', fontWeight: '600' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-green)', marginRight: '8px' }}></span>
                    System secured and active
                </div>
            </div>

        </div>
    );
};

export default Login;