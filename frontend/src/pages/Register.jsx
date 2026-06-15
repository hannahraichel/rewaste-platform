import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; 

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

        // Process comma-separated raw materials into an array format for the backend
        const keywordsArray = formData.raw_material_keywords
            ? formData.raw_material_keywords.split(',').map(item => item.trim())
            : [];

        const payload = {
            ...formData,
            raw_material_keywords: keywordsArray
        };

        try {
            const res = await axios.post('/api/auth/register', payload);
            login(res.data.user, res.data.token);
            alert('Registration Successful!');
            // We will point this to dashboard later
            navigate('/'); 
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>ReWaste Industry Portal</h2>
                {error && <div className="error-msg">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Company Name</label>
                        <input type="text" name="company_name" required onChange={handleChange} value={formData.company_name} />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" required onChange={handleChange} value={formData.email} />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" required onChange={handleChange} value={formData.password} />
                    </div>

                    <div className="form-group">
                        <label>Industry Sector Sector</label>
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

                    <div className="form-group">
                        <label>District</label>
                        <input type="text" name="district" required onChange={handleChange} value={formData.district} />
                    </div>

                    <div className="form-group">
                        <label>Raw Material Requirements / Needs (Comma Separated)</label>
                        <input type="text" name="raw_material_keywords" placeholder="e.g. sawdust, timber, wood chips" onChange={handleChange} value={formData.raw_material_keywords} />
                    </div>

                    <button type="submit" className="btn">Create Account</button>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginTop: '15px', marginBottom: 0 }}>
    Already have an industry account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Sign In Here</Link>
</p>
                </form>
            </div>
        </div>
    );
};

export default Register;