import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { RefreshCw, MapPin, Layers, Percent, LogOut, PlusCircle } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form State
    const [uploadData, setUploadData] = useState({
        title: '',
        material_type: 'Wood Mills',
        quantity: '',
        unit: 'tons',
        description: '',
        keywords: ''
    });

    const fetchSmartMatches = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('/api/waste/smart-matches');
            setMatches(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to compute matching logistics.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSmartMatches();
    }, []);

    const handleUploadChange = (e) => {
        setUploadData({ ...uploadData, [e.target.name]: e.target.value });
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        try {
            const keywordsArray = uploadData.keywords
                ? uploadData.keywords.split(',').map(item => item.trim())
                : [];

            await axios.post('/api/waste/upload', {
                ...uploadData,
                quantity: parseFloat(uploadData.quantity),
                keywords: keywordsArray
            });

            alert("Industrial resource added to inventory!");
            setUploadData({ title: '', material_type: 'Wood Mills', quantity: '', unit: 'tons', description: '', keywords: '' });
            fetchSmartMatches(); // Refresh stream
        } catch (err) {
            alert(err.response?.data?.error || "Failed to publish listing.");
        }
    };

    const handleRequestExchange = async (listingId) => {
        try {
            await axios.post('/api/exchange/request', { listing_id: listingId, message: "Interested in this material by-product." });
            alert("Exchange request submitted successfully!");
            fetchSmartMatches();
        } catch (err) {
            alert(err.response?.data?.error || "Transaction submission failed.");
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--primary)' }}>ReWaste Hub</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Logged in: <strong>{user?.company_name}</strong> | Type: {user?.industry_type} | Region: {user?.district}</p>
                </div>
                <button onClick={logout} className="btn" style={{ width: 'auto', padding: '10px 20px', background: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={18} /> Logout
                </button>
            </div>

            {/* Twin Panel Grid System Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                
                {/* LEFT PANEL: UPLOAD WASTE FORM */}
                <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border)', height: 'fit-content' }}>
                    <h2 style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', marginBottom: '20px' }}>
                        <PlusCircle color="var(--primary)" /> List Reusable By-Product
                    </h2>
                    <form onSubmit={handleUploadSubmit}>
                        <div className="form-group">
                            <label>Listing Title</label>
                            <input type="text" name="title" required onChange={handleUploadChange} value={uploadData.title} placeholder="e.g. Mixed Softwood Shavings" />
                        </div>
                        <div className="form-group">
                            <label>Material Category Base</label>
                            <select name="material_type" onChange={handleUploadChange} value={uploadData.material_type}>
                                <option value="Wood Mills">Wood & Timber Waste</option>
                                <option value="Agro-Processing">Agro-Processing Residuals</option>
                                <option value="Textiles">Textile Fabric Scraps</option>
                                <option value="Construction">Construction Aggregates</option>
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input type="number" step="any" name="quantity" required onChange={handleUploadChange} value={uploadData.quantity} />
                            </div>
                            <div className="form-group">
                                <label>Unit</label>
                                <select name="unit" onChange={handleUploadChange} value={uploadData.unit}>
                                    <option value="tons">Tons</option>
                                    <option value="kg">Kilograms (kg)</option>
                                    <option value="liters">Liters</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Logistical Description</label>
                            <input type="text" name="description" required onChange={handleUploadChange} value={uploadData.description} placeholder="Describe quality, moisture, packaging..." />
                        </div>
                        <div className="form-group">
                            <label>Search Keywords / Tags (Comma Separated)</label>
                            <input type="text" name="keywords" required onChange={handleUploadChange} value={uploadData.keywords} placeholder="sawdust, shavings, organic, wood" />
                        </div>
                        <button type="submit" className="btn">Publish Resource</button>
                    </form>
                </div>

                {/* RIGHT PANEL: MATCHES VIEWPORT */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h2 style={{ margin: 0, textAlign: 'left' }}>Automated Industry Matches</h2>
                        <button onClick={fetchSmartMatches} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
                            <RefreshCw size={16} /> Force Recalculation
                        </button>
                    </div>

                    {loading && <p style={{ color: 'var(--text-muted)' }}>Running calculations inside Python sub-engine...</p>}
                    {error && <div className="error-msg">{error}</div>}
                    
                    {!loading && matches.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '30px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            No industrial waste listings match your company profile requirements yet. Try listing an item on the left panel or switch profiles!
                        </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {matches.map((listing) => (
                            <div key={listing.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '25px', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1, paddingRight: '20px' }}>
                                    <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                                        <Percent size={14} /> {listing.match_score}% Match Score
                                    </div>
                                    <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '20px' }}>{listing.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 15px 0' }}>{listing.description}</p>
                                    
                                    <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Layers size={15} color="var(--primary)" /> <span>Supply: <strong>{listing.quantity} {listing.unit}</strong></span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={15} color="var(--primary)" /> <span>Source: {listing.company_name} ({listing.district})</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleRequestExchange(listing.id)} className="btn" style={{ width: 'auto', padding: '12px 20px', whiteSpace: 'nowrap' }}>
                                    Request Exchange
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;