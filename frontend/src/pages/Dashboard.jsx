import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { RefreshCw, MapPin, Layers, Percent, LogOut, PlusCircle, MessageSquare, ShieldAlert, Trash2, Building, X } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

// ==========================================================
// CHATBOT-STYLE SLIDE-OUT PANEL FOR COMMUNICATIONS
// ==========================================================
const LogisticsChatDrawer = ({ h, currentUser, isOpen, onClose }) => {
    const [chatLogs, setChatLogs] = useState(h?.communications || []);
    const [typedMsg, setTypedMsg] = useState('');

    // Sync chat logs if the selected transaction changes
    useEffect(() => {
        if (h) setChatLogs(h.communications || []);
    }, [h]);

    const sendThreadMsg = async (e) => {
        e.preventDefault();
        if (!typedMsg.trim() || !h) return;
        try {
            const res = await axios.post(`/api/exchange/message/${h.id}`, { message_text: typedMsg });
            setChatLogs(res.data.communications);
            setTypedMsg('');
        } catch (err) {
            alert("Message routing delivery failed.");
        }
    };

    if (!isOpen || !h) return null;

    const partnerName = currentUser.company_name === h.seller_name ? h.buyer_company : h.seller_name;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '380px',
            height: '100vh',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
            borderLeft: '1px solid var(--border)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease-in-out',
            boxSizing: 'border-box'
        }}>
            {/* Drawer Header */}
            <div style={{ 
                padding: '20px', 
                background: 'var(--bg-dark)', 
                borderBottom: '1px solid var(--border)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
            }}>
                <div style={{ textAlign: 'left' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '16px', fontWeight: 'bold' }}>{h.material_title}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                        Partner: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{partnerName}</span>
                    </p>
                </div>
                <button 
                    onClick={onClose} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Chat Messages Log Area */}
            <div style={{ 
                flex: 1, 
                padding: '20px', 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                background: 'var(--bg-main)'
            }}>
                {chatLogs.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 'auto 0', textAlign: 'center', lineHeight: '1.5' }}>
                        💬 No arrangements logged yet.<br/>Coordinate dispatch notes, vehicle details, and pick-up timestamps right here.
                    </p>
                ) : (
                    chatLogs.map((msg, index) => {
                        const isMe = msg.sender_id === currentUser.id;
                        return (
                            <div 
                                key={index} 
                                style={{ 
                                    alignSelf: isMe ? 'flex-end' : 'flex-start', 
                                    background: isMe ? 'var(--primary-dark)' : 'var(--bg-dark)', 
                                    padding: '10px 14px', 
                                    borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px', 
                                    maxWidth: '85%', 
                                    boxSizing: 'border-box',
                                    textAlign: 'left'
                                }}
                            >
                                <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: 'bold' }}>
                                    {msg.sender_name}
                                </span>
                                <p style={{ margin: 0, fontSize: '13px', color: isMe ? '#fff' : 'var(--text-main)', wordBreak: 'break-word', lineHeight: '1.4' }}>
                                    {msg.text}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Chat Input Footer Form */}
            <form onSubmit={sendThreadMsg} style={{ padding: '15px', background: 'var(--bg-dark)', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                <input 
                    type="text" 
                    value={typedMsg} 
                    onChange={(e) => setTypedMsg(e.target.value)} 
                    placeholder="Type dispatch updates..." 
                    style={{ 
                        flex: 1, 
                        padding: '10px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border)', 
                        background: 'var(--bg-card)', 
                        color: 'var(--text-main)',
                        fontSize: '13px'
                    }} 
                />
                <button type="submit" className="btn" style={{ width: 'auto', padding: '0 16px', fontSize: '13px' }}>Send</button>
            </form>
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
    const [myInventory, setMyInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // NAVIGATION ACTIVE TAB TRACKER
    const [activeTab, setActiveTab] = useState('hub'); // Alternatives: 'hub', 'upload', 'inquiries'

    // Eco-Analytics State Tracker
    const [ecoData, setEcoData] = useState({ total_listings_closed: 0, total_tons_diverted: 0, co2_saved_kg: 0 });

    // Administrative System View States
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [adminData, setAdminData] = useState({ industries: [], listings: [], summary: {} });

    // Module 3 Search and Filter States
    const [searchDistrict, setSearchDistrict] = useState('');
    const [searchMaterialType, setSearchMaterialType] = useState('');
    const [isManualSearch, setIsManualSearch] = useState(false);

    // Slide-out Drawer State Trackers
    const [selectedChatDeal, setSelectedChatDeal] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

    const handleSearchSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('/api/waste/search', {
                params: { 
                    district: searchDistrict || undefined, 
                    material_type: searchMaterialType || undefined 
                }
            });
            setMatches(res.data);
            setIsManualSearch(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Search query failed on server.');
        }
        setLoading(false);
    };

    const handleClearSearch = () => {
        setSearchDistrict('');
        setSearchMaterialType('');
        setIsManualSearch(false);
        fetchSmartMatches();
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

    const fetchMyInventory = async () => {
        try {
            const res = await axios.get('/api/waste/my-inventory');
            setMyInventory(res.data);
        } catch (err) {
            console.error("Failed to fetch custom inventory records.", err);
        }
    };

    const fetchSustainabilityMetrics = async () => {
        try {
            const res = await axios.get('/api/waste/analytics/sustainability');
            setEcoData(res.data);
        } catch (err) {
            console.error("Failed to load eco metrics.", err);
        }
    };

    const fetchAdminDashboard = async () => {
        try {
            const res = await axios.get('/api/admin/dashboard');
            setAdminData(res.data);
        } catch (err) {
            console.error("Administrative authentication clearance rejected.", err);
        }
    };

    const handleModerateDeleteListing = async (id) => {
        if (!window.confirm("Are you sure you want to remove this listing from the platform pool?")) return;
        try {
            await axios.delete(`/api/admin/listing/${id}`);
            alert("Listing removed successfully.");
            fetchAdminDashboard();
            fetchSmartMatches();
        } catch (err) {
            alert("Failed to moderate the requested listing.");
        }
    };

    const handleVerifyIndustry = async (id) => {
        try {
            const res = await axios.patch(`/api/admin/verify-industry/${id}`);
            alert(res.data.message);
            fetchAdminDashboard();
        } catch (err) {
            alert("Failed to update industry verification profile status.");
        }
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                const profileCheck = await axios.get('/api/auth/profile');
                const liveUser = profileCheck.data.user;

                await fetchSmartMatches();
                await fetchIncomingRequests();
                await fetchExchangeHistory();
                await fetchMyInventory();
                await fetchSustainabilityMetrics();

                if (liveUser && liveUser.is_admin) {
                    await fetchAdminDashboard();
                }
            } catch (err) {
                console.error("Error loading secure synchronous platform parameters.", err);
                await fetchSmartMatches();
                await fetchIncomingRequests();
                await fetchExchangeHistory();
                await fetchMyInventory();
                await fetchSustainabilityMetrics();
                if (user?.is_admin) {
                    await fetchAdminDashboard();
                }
            }
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
            fetchMyInventory();
            setActiveTab('hub'); // Redirect to Hub overview to see their listing updates
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
            fetchMyInventory();
            await fetchSustainabilityMetrics();
            if (user?.is_admin) await fetchAdminDashboard();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update transaction status.");
        }
    };

    const openChatBotDrawer = (deal) => {
        setSelectedChatDeal(deal);
        setIsDrawerOpen(true);
    };

    // Helper method to simplify active routing button styles
    const tabButtonStyle = (tabName) => ({
        padding: '12px 24px',
        background: activeTab === tabName ? 'var(--primary)' : 'transparent',
        color: activeTab === tabName ? '#fff' : 'var(--text-muted)',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    });

    return (
        <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            {/* Slide-Out Chatbot Panel Anchor */}
            <LogisticsChatDrawer 
                h={selectedChatDeal} 
                currentUser={user} 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
            />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                <div style={{ textAlign: 'left' }}>
                    <h1 style={{ margin: 0, color: 'var(--primary)' }}>ReWaste Hub</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Logged in: <strong style={{ color: 'var(--text-main)' }}>{user?.company_name}</strong> | Type: {user?.industry_type} | Region: {user?.district}</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <ThemeToggle /> 
                    {user?.is_admin && (
                        <button 
                            onClick={() => {
                                setIsAdminMode(!isAdminMode);
                                handleClearSearch();
                            }} 
                            className="btn" 
                            style={{ width: 'auto', padding: '10px 20px', background: isAdminMode ? '#ef4444' : '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <ShieldAlert size={18} /> {isAdminMode ? "Exit Admin Control" : "Open Admin Portal"}
                        </button>
                    )}
                    <button onClick={logout} className="btn" style={{ width: 'auto', padding: '10px 20px', background: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={18} /> Logout
                    </button>
                    
                </div>
            </div>

            {/* ==========================================================
                DYNAMIC TAB NAVBAR (Hidden if Admin mode is switched on)
               ========================================================== */}
            {!isAdminMode && (
                <div style={{ display: 'flex', gap: '10px', background: 'var(--bg-card)', padding: '8px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '35px', width: 'fit-content' }}>
                    <button onClick={() => setActiveTab('hub')} style={tabButtonStyle('hub')}>📊 Ecosystem Hub</button>
                    <button onClick={() => setActiveTab('upload')} style={tabButtonStyle('upload')}>➕ List Material</button>
                    <button onClick={() => setActiveTab('inquiries')} style={tabButtonStyle('inquiries')}>📥 Trade Inquiries ({incomingRequests.length + history.length})</button>
                </div>
            )}

            {/* ==========================================================
                VIEW CONDITIONAL 1: ADMIN CONTROL PORTAL PANEL
               ========================================================== */}
            {isAdminMode && user?.is_admin ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {/* Administrative Global Metrics Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Global Registered Facilities</span>
                            <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: 'var(--text-main)' }}>{adminData.summary?.total_industries} Entities</h2>
                        </div>
                        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Active Marketplace Listings</span>
                            <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: 'var(--primary)' }}>{adminData.summary?.total_listings} Listings</h2>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #111827 0%, #064e3b 100%)', padding: '20px', borderRadius: '8px', border: '1px solid #047857' }}>
                            <span style={{ color: '#a7f3d0', fontSize: '12px', textTransform: 'uppercase' }}>Total Circular Footprint Saved</span>
                            <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#fff' }}>{adminData.summary?.global_tons_diverted} Tons</h2>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #111827 0%, #1e3a8a 100%)', padding: '20px', borderRadius: '8px', border: '1px solid #1d4ed8' }}>
                            <span style={{ color: '#bfdbfe', fontSize: '12px', textTransform: 'uppercase' }}>Global CO₂ Avoided</span>
                            <h2 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#fff' }}>{adminData.summary?.global_co2_saved_kg} kg</h2>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                        {/* Column Left: Industry Registration Directory Audit */}
                        <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}><Building size={20} color="var(--primary)" /> Registered Industrial Networks</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                                {adminData.industries.map(ind => (
                                    <div key={ind.id} style={{ padding: '12px', background: 'var(--bg-dark)', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'left' }}>
                                            <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{ind.company_name}</h4>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Sector: {ind.industry_type} | {ind.district}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {ind.is_verified ? (
                                                <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', background: ind.is_admin ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: ind.is_admin ? '#ef4444' : '#10b981' }}>
                                                    {ind.is_admin ? "SYSTEM ADMIN" : "✓ VERIFIED"}
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => handleVerifyIndustry(ind.id)}
                                                    style={{
                                                        backgroundColor: '#fbbf24',
                                                        color: '#0f172a',
                                                        border: 'none',
                                                        padding: '4px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Approve Hub
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column Right: Global Listing Moderator */}
                        <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}><Layers size={20} color="var(--primary)" /> Global Material Listing Audits</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                                {adminData.listings.map(list => (
                                    <div key={list.id} style={{ padding: '12px', background: 'var(--bg-dark)', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'left', paddingRight: '15px', flex: 1 }}>
                                            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '14px' }}>{list.title}</h4>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>By: {list.company_name} | Weight: <strong>{list.quantity} {list.unit}</strong></p>
                                        </div>
                                        <button 
                                            onClick={() => handleModerateDeleteListing(list.id)} 
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ==========================================================
                    VIEW CONDITIONAL 2: ORDINARY CROSS-INDUSTRY TAB SEGMENTS
                   ========================================================== */
                <>
                    {/* SUB-VIEW TAB 1: ECO SYSTEM HUB MATCHES OVERVIEW */}
                    {activeTab === 'hub' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            {/* SUSTAINABILITY METRICS IMPACT BOARD WIDGET */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                <div style={{ background: 'linear-gradient(135deg, #257b63 0%, #064e3b 100%)', padding: '25px', borderRadius: '12px', border: '1px solid #fafafa', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' }}>
                                    <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', color: '#a7f3d0', textAlign: 'left' }}>Landfill Diversion Rate</h4>
                                    <h2 style={{ fontSize: '36px', margin: '15px 0 5px 0', color: '#fff', textAlign: 'left' }}>
                                        {ecoData.total_tons_diverted} <span style={{ fontSize: '18px', fontWeight: 'normal' }}>Metric Tons</span>
                                    </h2>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#d1fae5', textAlign: 'left' }}>By-product waste material kept inside active local production chains.</p>
                                </div>

                                <div style={{ background: 'linear-gradient(135deg, #3c559b 0%, #172554 100%)', padding: '25px', borderRadius: '12px', border: '1px solid #fefefe', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' }}>
                                    <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', color: '#bfdbfe', textAlign: 'left' }}>Net Carbon Displacement</h4>
                                    <h2 style={{ fontSize: '36px', margin: '15px 0 5px 0', color: '#fff', textAlign: 'left' }}>
                                        {ecoData.co2_saved_kg} <span style={{ fontSize: '18px', fontWeight: 'normal' }}>kg CO₂</span>
                                    </h2>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#dbeafe', textAlign: 'left' }}>Greenhouse emission savings calculated across materials handling extraction baselines.</p>
                                </div>

                                <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '12px', border: '1px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                    <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', color: 'var(--text-muted)', textAlign: 'left' }}>Handshake Summary</h4>
                                    <h2 style={{ fontSize: '36px', margin: '15px 0 5px 0', color: 'var(--primary)', textAlign: 'left' }}>
                                        {ecoData.total_listings_closed} <span style={{ fontSize: '18px', fontWeight: 'normal', color: 'var(--text-main)' }}>Deals Finalized</span>
                                    </h2>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', textAlign: 'left' }}>Successful cross-industry asset exchanges completed via ReWaste.</p>
                                </div>
                            </div>

                            {/* Split Marketplace Match / Stock Repository Grid Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px', alignItems: 'start' }}>
                                
                                {/* Personal Postings List */}
                                <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', textAlign: 'left', color: 'var(--text-main)', fontWeight: 'bold' }}>My Live Corporate Stock ({myInventory.length})</h3>
                                    {myInventory.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, textAlign: 'left' }}>You haven't listed any circular by-product materials yet.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                                            {myInventory.map((item) => (
                                                <div key={item.id} style={{ padding: '14px', background: 'var(--bg-dark)', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '14px', fontWeight: '600' }}>{item.title}</h4>
                                                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                            Weight Pool: <strong style={{ color: 'var(--primary)' }}>{item.quantity} {item.unit}</strong>
                                                        </p>
                                                    </div>
                                                    <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '6px', background: item.is_available ? 'rgba(16, 185, 129, 0.15)' : 'rgba(71, 85, 105, 0.2)', color: item.is_available ? '#10b981' : '#94a3b8' }}>
                                                        {item.is_available ? "ACTIVE POOL" : "FULFILLED"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Active Exchange Searches and Filter Board */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                    
                                    {/* MODULE 3 DUAL DROPDOWN COMPONENT */}
                                    <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <h3 style={{ margin: 0, textAlign: 'left', fontSize: '16px', color: 'var(--text-main)', fontWeight: 'bold' }}>
                                                {isManualSearch ? "🔍 Filter Parameters Active" : "✨ Automated Strategic Matches"}
                                            </h3>
                                            {isManualSearch ? (
                                                <button onClick={handleClearSearch} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Clear Filters</button>
                                            ) : (
                                                <button onClick={fetchSmartMatches} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                                                    <RefreshCw size={12} /> Recalculate
                                                </button>
                                            )}
                                        </div>

                                        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            <select value={searchDistrict} onChange={(e) => setSearchDistrict(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
                                                <option value="">All Districts (Kerala)</option>
                                                <option value="Kottayam">Kottayam</option>
                                                <option value="Ernakulam">Ernakulam</option>
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
                                            <select value={searchMaterialType} onChange={(e) => setSearchMaterialType(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
                                                <option value="">All Material Types</option>
                                                <option value="Wood Mills">Wood & Timber Waste</option>
                                                <option value="Agro-Processing">Agro-Processing Residuals</option>
                                                <option value="Textiles">Textile Fabric Scraps</option>
                                                <option value="Construction">Construction Aggregates</option>
                                            </select>
                                            <button type="submit" className="btn" style={{ width: 'auto', padding: '0 20px' }}>Filter</button>
                                        </form>
                                    </div>

                                    {/* Matches Grid List Output */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
                                        {matches.map((listing) => (
                                            <div key={listing.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ flex: 1, paddingRight: '16px', textAlign: 'left' }}>
                                                    <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px', marginBottom: '8px' }}>
                                                        <Percent size={12} /> {listing.match_score ? `${listing.match_score}% Match Ranking` : 'Manual Search Hit'}
                                                    </div>
                                                    <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontSize: '18px', fontWeight: '600' }}>{listing.title}</h4>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 12px 0', lineHeight: '1.4' }}>{listing.description}</p>
                                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={14} color="var(--primary)" /> Supply: <strong style={{ color: 'var(--text-main)' }}>{listing.quantity} {listing.unit}</strong></span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} color="var(--primary)" /> Node: {listing.company_name} ({listing.district})</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleRequestExchange(listing.id)} className="btn" style={{ width: 'auto', padding: '10px 16px', whiteSpace: 'nowrap', fontSize: '13px' }}>Request Exchange</button>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUB-VIEW TAB 2: CLEAN SINGLE FORM ENVIRONMENT FOR LISTING */}
                    {activeTab === 'upload' && (
                        <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)', maxWidth: '600px', margin: '0 auto' }}>
                            <h2 style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px', marginBottom: '24px', color: 'var(--text-main)', fontWeight: 'bold' }}>
                                <PlusCircle color="var(--primary)" size={24} /> Register Reusable Industrial By-Product
                            </h2>
                            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="form-group" style={{ textAlign: 'left' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Listing Asset Title</label>
                                    <input type="text" name="title" required onChange={handleUploadChange} value={uploadData.title} placeholder="e.g. Mixed Softwood Woodchips" style={{ width: '100%', boxSizing: 'border-box' }} />
                                </div>
                                <div className="form-group" style={{ textAlign: 'left' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Material Category Classification</label>
                                    <select name="material_type" onChange={handleUploadChange} value={uploadData.material_type} style={{ width: '100%' }}>
                                        <option value="Wood Mills">Wood & Timber Waste</option>
                                        <option value="Agro-Processing">Agro-Processing Residuals</option>
                                        <option value="Textiles">Textile Fabric Scraps</option>
                                        <option value="Construction">Construction Aggregates</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group" style={{ textAlign: 'left' }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Available Quantity</label>
                                        <input type="number" step="any" name="quantity" required onChange={handleUploadChange} value={uploadData.quantity} style={{ width: '100%' }} />
                                    </div>
                                    <div className="form-group" style={{ textAlign: 'left' }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Measurement Unit</label>
                                        <select name="unit" onChange={handleUploadChange} value={uploadData.unit} style={{ width: '100%' }}>
                                            <option value="tons">Tons</option>
                                            <option value="kg">Kilograms (kg)</option>
                                            <option value="liters">Liters</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group" style={{ textAlign: 'left' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Logistical Description & Storage Quality</label>
                                    <input type="text" name="description" required onChange={handleUploadChange} value={uploadData.description} placeholder="Describe packaging conditions, dry mass state..." style={{ width: '100%', boxSizing: 'border-box' }} />
                                </div>
                                <div className="form-group" style={{ textAlign: 'left' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Search Keywords / Query Identifiers</label>
                                    <input type="text" name="keywords" required onChange={handleUploadChange} value={uploadData.keywords} placeholder="sawdust, organic, timber, scrap" style={{ width: '100%', boxSizing: 'border-box' }} />
                                </div>
                                <button type="submit" className="btn" style={{ marginTop: '10px', padding: '12px' }}>Publish Material to Circular Stream</button>
                            </form>
                        </div>
                    )}

                    {/* SUB-VIEW TAB 3: DEDICATED EXCHANGE ORDERS AND LOGISTICS MANAGEMENT */}
                    {activeTab === 'inquiries' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            {/* INCOMING REQUESTS PANEL */}
                            <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <h3 style={{ textAlign: 'left', marginBottom: '20px', fontSize: '18px', color: 'var(--text-main)', fontWeight: 'bold' }}>Incoming Procurement Offers</h3>
                                {incomingRequests.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', margin: 0, padding: '15px 0', textAlign: 'left' }}>No external facilities have requested your listed items yet.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {incomingRequests.map((req) => (
                                            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                <div style={{ textAlign: 'left' }}>
                                                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-main)', fontSize: '15px', fontWeight: '600' }}>
                                                        Offer from: <span style={{ color: 'var(--primary)' }}>{req.buyer_company}</span>
                                                    </h4>
                                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                                                        Requested Resource: <strong>{req.material_title}</strong> | Region Node: {req.district}
                                                    </p>
                                                    <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', background: req.status === 'pending' ? 'rgba(234, 179, 8, 0.15)' : req.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: req.status === 'pending' ? '#eab308' : req.status === 'approved' ? '#10b981' : '#ef4444' }}>
                                                        STATUS: {req.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                {req.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => handleUpdateStatus(req.id, 'approved')} style={{ padding: '6px 14px', background: 'var(--primary)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Approve</button>
                                                        <button onClick={() => handleUpdateStatus(req.id, 'rejected')} style={{ padding: '6px 14px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Decline</button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* HISTORICAL EXCHANGE DIRECTORY GRID LIST */}
                            <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border)', borderTop: '4px solid var(--primary)' }}>
                                <h3 style={{ textAlign: 'left', marginBottom: '20px', fontSize: '18px', color: 'var(--text-main)', fontWeight: 'bold' }}>Finalized Network Ledgers & Dispatch</h3>
                                {history.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', margin: 0, padding: '15px 0', textAlign: 'left' }}>No secured circular trade history lines recorded yet.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {history.map((h) => {
                                            const partnerName = user.company_name === h.seller_name ? h.buyer_company : h.seller_name;
                                            return (
                                                <div key={h.id} style={{ background: 'var(--bg-dark)', padding: '15px 20px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <span style={{ fontSize: '10px', color: h.status === 'approved' ? '#10b981' : '#ef4444', fontWeight: 'bold', textTransform: 'uppercase' }}>✓ Deal {h.status}</span>
                                                        <h4 style={{ margin: '4px 0 6px 0', color: 'var(--text-main)', fontSize: '16px', fontWeight: '600' }}>{h.material_title}</h4>
                                                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Partner Symbiosis Network: <strong style={{ color: 'var(--text-main)' }}>{partnerName}</strong></p>
                                                    </div>
                                                    <button 
                                                        onClick={() => openChatBotDrawer(h)} 
                                                        className="btn" 
                                                        style={{ width: 'auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', fontSize: '13px' }}
                                                    >
                                                        <MessageSquare size={14} /> Open Logistics Chat
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;