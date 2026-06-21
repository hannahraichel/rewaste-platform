import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; 
import ThemeToggle from '../components/ThemeToggle'; 

const Register = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        company_name: '',
        email: '',
        password: '',
        industry_type: 'Wood Mills',
        district: 'Ernakulam',
        state: 'Kerala',
        raw_material_keywords: ''
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const keywordsArray = formData.raw_material_keywords
            ? formData.raw_material_keywords.split(',').map(item => item.trim())
            : [];

        const payload = { ...formData, raw_material_keywords: keywordsArray };

        try {
            const res = await axios.post('/api/auth/register', payload);
            login(res.data.user, res.data.token);
            alert('Registration Successful!');
            navigate('/'); 
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Try again.');
        }
    };

    return (
        <div className="auth-container" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Elegant Floating Top Bar for Theme Toggle */}
            <div style={{ width: '100%', maxWidth: '650px', display: 'flex', justifyContent: 'flex-end', boxSizing: 'border-box' }}>
                <ThemeToggle />
            </div>

            <div className="auth-card" style={{ maxWidth: '650px', padding: '35px 40px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)', textAlign: 'left' }}>
                    Create Industry Account
                </h2>
                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'left' }}>
                    Join the circular economy grid and trade strategic reusable by-products.
                </p>

                {error && <div className="error-msg" style={{ textAlign: 'left' }}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    
                    {/* PROFESSIONAL TWO-COLUMN RESPONSIVE FORM GRID */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '18px 24px',
                        marginBottom: '24px'
                    }}>
                        
                        <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
                            <label>Company Name</label>
                            <input type="text" name="company_name" required onChange={handleChange} value={formData.company_name} placeholder="e.g. Malabar Extracts Ltd" />
                        </div>

                        <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
                            <label>Email Address</label>
                            <input type="email" name="email" required onChange={handleChange} value={formData.email} placeholder="operations@company.com" />
                        </div>

                        <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
                            <label>Password</label>
                            <input type="password" name="password" required onChange={handleChange} value={formData.password} placeholder="••••••••" />
                        </div>

                        <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
                            <label>Industry Sector</label>
                            <select name="industry_type" onChange={handleChange} value={formData.industry_type}>
                                <option value="Wood Mills">Wood & Timber Mills</option>
                                <option value="Particle Board">Particle Board Manufacturing</option>
                                <option value="Biomass Energy">Biomass Energy Plant</option>
                                <option value="Agro-Processing">Agro-Processing & Food Industry</option>
                                <option value="Agriculture/Fertilizer">Agriculture & Fertilizers</option>
                                <option value="Textiles">Textile & Garment Unit</option>
                                <option value="Paper Recycling">Paper Recycling Mills</option>
                            </select>
                        </div>

                        {/* DISTRICT DROPDOWN SELECTOR (Eliminates presenter typo bugs) */}
                        <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
                            <label>District (Kerala Node)</label>
                            <select name="district" onChange={handleChange} value={formData.district}>
                                <option value="Ernakulam">Ernakulam</option>
                                <option value="Kottayam">Kottayam</option>
                                <option value="Palakkad">Palakkad</option>
                                <option value="Thrissur">Thrissur</option>
                                <option value="Kozhikode">Kozhikode</option>
                                <option value="Alappuzha">Alappuzha</option>
                                <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                                <option value="Malappuram">Malappuram</option>
                                <option value="Kannur">Kannur</option>
                                <option value="Kollam">Kollam</option>
                                <option value="Idukki">Idukki</option>
                                <option value="Wayanad">Wayanad</option>
                                <option value="Kasaragod">Kasaragod</option>
                                <option value="Pathanamthitta">Pathanamthitta</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
                            <label>Raw Material Requirements / Demands</label>
                            <input type="text" name="raw_material_keywords" placeholder="e.g. sawdust, husks, wood chips" onChange={handleChange} value={formData.raw_material_keywords} />
                        </div>

                    </div>

                    <button type="submit" className="btn" style={{ padding: '14px', fontSize: '15px' }}>Create Account</button>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginTop: '20px', marginBottom: 0 }}>
                        Already have an industry account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Sign In Here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;