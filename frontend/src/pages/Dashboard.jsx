import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { RefreshCw, MapPin, Layers, Percent, LogOut, PlusCircle, MessageSquare } from 'lucide-react';

// ==========================================================
// SUB-COMPONENT FOR CLEAN CHAT STATE ISOLATION
// ==========================================================
const HistoryRow = ({ h, currentUser }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatLogs, setChatLogs] = useState(h.communications || []);
    const [typedMsg, setTypedMsg] = useState('');

    const sendThreadMsg = async (e) => {
        e.preventDefault();
        if (!typedMsg.trim()) return;
        try {
            const res = await axios.post(`/api/exchange/message/${h.id}`, { message_text: typedMsg });
            setChatLogs(res.data.communications);
            setTypedMsg('');
        } catch (err) {
            alert("Message routing delivery failed.");
        }
    };

    const partnerName = currentUser.company_name === h.seller_name ? h.buyer_company : h.seller_name;

    return (
        <div style={{ background: 'var(--bg-dark)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <span style={{ fontSize: '11px', color: h.status === 'approved' ? '#10b981' : '#ef4444', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        ✓ Deal {h.status}
                    </span>
                    <h3 style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '18px' }}>{h.material_title}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                        Partner Industry: <strong style={{ color: '#fff' }}>{partnerName}</strong>
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                        Date Secured: {new Date(h.created_at).toLocaleDateString()}
                    </p>
                </div>
                <button 
                    onClick={() => setIsChatOpen(!isChatOpen)} 
                    className="btn" 
                    style={{ width: 'auto', padding: '8px 16px', background: isChatOpen ? '#475569' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    <MessageSquare size={16} /> {isChatOpen ? "Close Logistics Thread" : "Open Communications Chat"}
                </button>
            </div>

            {/* EXPANDABLE LOGISTICS CHAT MODULE */}
            {isChatOpen && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed var(--border)' }}>
                    <div style={{ background: '#0b0f19', padding: '15px', borderRadius: '6px', maxHeight: '200px', overflowY: 'auto', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {chatLogs.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, textAlign: 'center' }}>
                                Coordinate dispatch notes, vehicle details, and pick-up arrangements here.
                            </p>
                        ) : (
                            chatLogs.map((msg, index) => (
                                <div 
                                    key={index} 
                                    style={{ 
                                        alignSelf: msg.sender_id === currentUser.id ? 'flex-end' : 'flex-start', 
                                        background: msg.sender_id === currentUser.id ? 'var(--primary-dark)' : '#1e293b', 
                                        padding: '8px 14px', 
                                        borderRadius: '12px', 
                                        maxWidth: '75%', 
                                        boxSizing: 'border-box' 
                                    }}
                                >
                                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 'bold' }}>
                                        {msg.sender_name}
                                    </span>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#fff', wordBreak: 'break-word' }}>
                                        {msg.text}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                    <form onSubmit={sendThreadMsg} style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            value={typedMsg} 
                            onChange={(e) => setTypedMsg(e.target.value)} 
                            placeholder="Type dispatch updates (e.g., 'Truck arrives tomorrow at 10 AM')" 
                            style={{ flex: 1, padding: '10px' }} 
                        />
                        <button type="submit" className="btn" style={{ width: 'auto', padding: '10px 20px' }}>Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

// ==========================================================
// MAIN DASHBOARD COMPONENT HUB
// ==========================================================
const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [matches, setMatches] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [history, setHistory] = useState([]);
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

    const fetchIncomingRequests = async () => {
        try {
            const res = await axios.get('/api/exchange/incoming');
            setIncomingRequests(res.data);
        } catch (err) {
            console.error("Failed to load incoming transactions.", err);
        }
    };

    const fetchExchangeHistory = async () => {
        try {
            const res = await axios.get('/api/exchange/history');
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to load history.", err);
        }
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            await fetchSmartMatches();
            await fetchIncomingRequests();
            await fetchExchangeHistory();
            setLoading(false);
        };
        loadDashboardData();
    }, [user]);

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
            fetchSmartMatches();
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

    const handleUpdateStatus = async (requestId, targetStatus) => {
        try {
            const res = await axios.put(`/api/exchange/status/${requestId}`, { status: targetStatus });
            alert(res.data.message);
            fetchSmartMatches();
            fetchIncomingRequests();
            fetchExchangeHistory();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update transaction status.");
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

            {/* TRANSACTION MONITOR PANEL */}
            <div style={{ marginTop: '50px', background: 'var(--bg-card)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>Incoming Material Exchange Inquiries</h2>
                
                {incomingRequests.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>No active industrial procurement offers received for your items yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {incomingRequests.map((req) => (
                            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '16px' }}>
                                        Offer from: <span style={{ color: 'var(--primary)' }}>{req.buyer_company}</span>
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                                        Requested Asset: <strong>{req.material_title}</strong> | Origin: {req.district}, {req.state}
                                    </p>
                                    <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', background: req.status === 'pending' ? '#eab30820' : req.status === 'approved' ? '#10b98120' : '#ef444420', color: req.status === 'pending' ? '#eab308' : req.status === 'approved' ? '#10b981' : '#ef4444' }}>
                                        Status: {req.status.toUpperCase()}
                                    </span>
                                </div>
                                
                                {req.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleUpdateStatus(req.id, 'approved')} className="btn" style={{ width: 'auto', padding: '8px 15px', background: 'var(--primary)', fontSize: '14px' }}>
                                            Approve Deal
                                        </button>
                                        <button onClick={() => handleUpdateStatus(req.id, 'rejected')} className="btn" style={{ width: 'auto', padding: '8px 15px', background: '#ef4444', fontSize: '14px' }}>
                                            Decline
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* TRANSACTION HISTORY PANEL */}
            <div style={{ marginTop: '50px', background: 'var(--bg-card)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border)', borderTop: '4px solid var(--primary)' }}>
                <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>Industrial Exchange History & Communications</h2>
                
                {history.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>No historical transactions found in your archive archives.</p>
                ) : (
                    <div>
                        {history.map((h) => (
                            <HistoryRow key={h.id} h={h} currentUser={user} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;