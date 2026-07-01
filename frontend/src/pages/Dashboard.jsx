import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { RefreshCw, MapPin, Layers, Percent, LogOut, PlusCircle, MessageSquare, ShieldAlert, Trash2, Building, X } from 'lucide-react';

// ==========================================================
// MONOCHROME DENSE TASK DRAWER FOR COMMUNICATIONS
// ==========================================================
const LogisticsChatDrawer = ({ h, currentUser, isOpen, onClose }) => {
    const { showToast } = useContext(ToastContext);
    const [chatLogs, setChatLogs] = useState(h?.communications || []);
    const [typedMsg, setTypedMsg] = useState('');

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
            showToast("Message routing delivery failed.", "error");
        }
    };

    if (!isOpen || !h) return null;

    const partnerName = currentUser.company_name === h.seller_name ? h.buyer_company : h.seller_name;

    return (
        <div className="clay-card" style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            bottom: '20px',
            width: '420px',
            height: 'calc(100vh - 40px)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            fontFamily: 'var(--font-body)',
            padding: '0',
            overflow: 'hidden'
        }}>
            {/* Drawer Header */}
            <div style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
            }}>
                <div style={{ textAlign: 'left' }}>
                    <h3 style={{ margin: 0, color: 'var(--black)', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h.material_title}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Chat with: {partnerName}
                    </p>
                </div>
                <button 
                    onClick={onClose} 
                    className="clay-btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '11px', cursor: 'pointer' }}
                >
                    CLOSE
                </button>
            </div>

            {/* Chat Ledger */}
            <div className="clay-inset" style={{ 
                flex: 1, 
                margin: '12px 24px',
                padding: '20px', 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
            }}>
                {chatLogs.length === 0 ? (
                    <p style={{ color: 'var(--gray-400)', fontSize: '12px', margin: 'auto 0', textAlign: 'left', lineHeight: '1.6', letterSpacing: '0.02em', border: '1px solid var(--gray-200)', padding: '20px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                        No messages yet. Send a message to coordinate logistics.
                    </p>
                ) : (
                    chatLogs.map((msg, index) => {
                        const isMe = msg.sender_id === currentUser.id;
                        return (
                            <div 
                                key={index} 
                                className={isMe ? "clay-btn-primary" : "clay-card"}
                                style={{ 
                                    alignSelf: isMe ? 'flex-end' : 'flex-start', 
                                    padding: '12px 18px', 
                                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', 
                                    maxWidth: '85%', 
                                    boxSizing: 'border-box',
                                    textAlign: 'left',
                                    cursor: 'default'
                                }}
                            >
                                <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', color: isMe ? 'var(--gray-400)' : 'var(--gray-400)', marginBottom: '4px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                    {msg.sender_name} {isMe && "(You)"}
                                </span>
                                <p style={{ margin: 0, fontSize: '13px', color: isMe ? 'var(--white)' : 'var(--black)', wordBreak: 'break-word', lineHeight: '1.5' }}>
                                    {msg.text}
                                </p>
                            </div>
                        );
                    })
                )}
                {h.status === 'rejected' && (
                    <div style={{
                        backgroundColor: 'var(--red-light, #fee2e2)',
                        border: '1px solid var(--red-border, #fca5a5)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        color: 'var(--red-text, #b91c1c)',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        lineHeight: '1.4',
                        marginTop: '8px'
                    }}>
                        ✕ Deal Cancelled. Communication is locked.
                    </div>
                )}
            </div>

            {/* Chat Input Footbar */}
            {h.status === 'rejected' ? (
                <div style={{ 
                    padding: '24px', 
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
                    textAlign: 'center', 
                    fontSize: '11px', 
                    color: 'var(--gray-400)', 
                    fontWeight: '700', 
                    textTransform: 'uppercase', 
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.1em'
                }}>
                    🔒 Chat Thread Locked
                </div>
            ) : (
                <form onSubmit={sendThreadMsg} style={{ padding: '20px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '8px' }}>
                    <input 
                        type="text" 
                        value={typedMsg} 
                        onChange={(e) => setTypedMsg(e.target.value)} 
                        placeholder="Type a message..." 
                        className="clay-input"
                        style={{ 
                            flex: 1, 
                            height: '46px',
                            fontSize: '12px',
                        }} 
                    />
                    <button type="submit" className="clay-btn-primary" style={{ width: 'auto', padding: '0 24px', fontSize: '11px', cursor: 'pointer' }}>SEND</button>
                </form>
            )}
        </div>
    );
};

// ==========================================================
// MAIN DASHBOARD COMPONENT HUB
// ==========================================================
const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);
    
    const [matches, setMatches] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [myInventory, setMyInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [activeTab, setActiveTab] = useState('hub'); 
    const [ecoData, setEcoData] = useState({ total_listings_closed: 0, total_tons_diverted: 0, co2_saved_kg: 0 });
    const [isAdminMode, setIsAdminMode] = useState(user?.email === 'admin@rewaste.com'); 
    const [adminData, setAdminData] = useState({ industries: [], listings: [], summary: {} });

    const [searchDistrict, setSearchDistrict] = useState('');
    const [searchMaterialType, setSearchMaterialType] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // Client-side sorting
    const [isManualSearch, setIsManualSearch] = useState(false);
    const [selectedChatDeal, setSelectedChatDeal] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
            showToast("Filters applied to exchange index.");
        } catch (err) {
            setError(err.response?.data?.error || 'Search query failed on server.');
            showToast("Search failed.", "error");
        }
        setLoading(false);
    };

    const handleClearSearch = async () => {
        setSearchDistrict('');
        setSearchMaterialType('');
        setSortBy('newest');
        setIsManualSearch(false);
        await fetchSmartMatches();
        showToast("Ecosystem search index reset.");
    };

    const fetchMyInventory = async () => {
        try {
            const res = await axios.get('/api/waste/my-inventory');
            setMyInventory(res.data);
        } catch (err) {
            console.error("Failed to fetch my inventory.");
        }
    };

    const fetchIncomingRequests = async () => {
        try {
            const res = await axios.get('/api/exchange/incoming');
            setIncomingRequests(res.data);
        } catch (err) {
            console.error("Failed to load incoming transit links.");
        }
    };

    const fetchExchangeHistory = async () => {
        try {
            const res = await axios.get('/api/exchange/history');
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to load historical contracts.");
        }
    };

    const fetchSustainabilityMetrics = async () => {
        try {
            const res = await axios.get('/api/exchange/analytics/sustainability');
            setEcoData(res.data);
        } catch (err) {
            console.error("Failed to resolve ESG metrics.");
        }
    };

    const fetchAdminDashboard = async () => {
        try {
            const res = await axios.get('/api/admin/dashboard');
            setAdminData(res.data);
        } catch (err) {
            console.error("Failed to resolve admin stats.");
        }
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            // Check identity bounds immediately during data synchronization loop
            if (user?.email === 'admin@rewaste.com') {
                setIsAdminMode(true);
            }
            
            await fetchSmartMatches();
            await fetchMyInventory();
            await fetchIncomingRequests();
            await fetchExchangeHistory();
            await fetchSustainabilityMetrics();
            if (user?.is_admin) {
                await fetchAdminDashboard();
            }
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
            showToast("Industrial resource added to inventory!");
            setUploadData({ title: '', material_type: 'Wood Mills', quantity: '', unit: 'tons', description: '', keywords: '' });
            fetchSmartMatches();
            fetchMyInventory();
            setActiveTab('hub'); 
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to publish listing.", "error");
        }
    };

    const handleRequestExchange = async (listingId) => {
        try {
            await axios.post('/api/exchange/request', { listing_id: listingId, message: "Interested in this material by-product." });
            showToast("Exchange request submitted successfully!");
            fetchSmartMatches();
        } catch (err) {
            showToast(err.response?.data?.error || "Transaction submission failed.", "error");
        }
    };

    const handleUpdateStatus = async (requestId, targetStatus) => {
        try {
            const res = await axios.put(`/api/exchange/status/${requestId}`, { status: targetStatus });
            showToast(res.data.message);
            fetchSmartMatches();
            fetchIncomingRequests();
            fetchMyInventory();
            await fetchSustainabilityMetrics();
            if (user?.is_admin) await fetchAdminDashboard();

            // Fetch the updated history array and update state
            const historyRes = await axios.get('/api/exchange/history');
            setHistory(historyRes.data);

            // Automatically transition the user into the chat room upon approval
            if (targetStatus === 'approved') {
                const approvedDeal = historyRes.data.find(d => d.id === requestId);
                if (approvedDeal) {
                    openChatBotDrawer(approvedDeal);
                }
            } else if (targetStatus === 'rejected') {
                if (selectedChatDeal && selectedChatDeal.id === requestId) {
                    const cancelledDeal = historyRes.data.find(d => d.id === requestId);
                    setSelectedChatDeal(cancelledDeal || null);
                }
            }
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to update transaction status.", "error");
        }
    };

    const handleVerifyIndustry = async (industryId) => {
        try {
            const res = await axios.patch(`/api/admin/verify-industry/${industryId}`);
            showToast(res.data.message);
            if (user?.is_admin) await fetchAdminDashboard();
        } catch (err) {
            showToast("Failed to update industry verification profile status.", "error");
        }
    };

    const handleModerateDeleteListing = async (listingId) => {
        try {
            await axios.delete(`/api/admin/listing/${listingId}`);
            showToast("Listing removed successfully.");
            if (user?.is_admin) await fetchAdminDashboard();
        } catch (err) {
            showToast("Failed to moderate the requested listing.", "error");
        }
    };

    const openChatBotDrawer = (deal) => {
        setSelectedChatDeal(deal);
        setIsDrawerOpen(true);
    };

    // Client-side sorting logic
    const getSortedMatches = () => {
        return [...matches].sort((a, b) => {
            if (sortBy === 'qty-desc') {
                return parseFloat(b.quantity) - parseFloat(a.quantity);
            }
            if (sortBy === 'qty-asc') {
                return parseFloat(a.quantity) - parseFloat(b.quantity);
            }
            // default: newest
            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        });
    };

    // Tab Button Styles
    const tabButtonStyle = (tabName) => ({
        padding: '0 0 12px 0',
        background: 'none',
        color: activeTab === tabName ? 'var(--black)' : 'var(--gray-400)',
        border: 'none',
        borderBottom: activeTab === tabName ? '2px solid var(--black)' : 'none',
        borderRadius: '0px',
        fontSize: '12px',
        fontFamily: 'var(--font-body)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        cursor: 'pointer',
        transition: 'color 0.2s ease, border-color 0.2s ease'
    });

    return (
        <div className="clay-container" style={{
            minHeight: '100vh',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-body)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            
            <LogisticsChatDrawer 
                h={selectedChatDeal} 
                currentUser={user} 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
            />

            {/* 1. TOP HEADER BAR */}
            <header className="clay-card" style={{
                height: '72px',
                margin: '20px 24px 0 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 32px',
                boxSizing: 'border-box'
            }}>
                {/* Logo left */}
                <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    fontWeight: '800',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--black)'
                }}>
                    REWASTE HUB
                </div>

                {/* Metadata strip center */}
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--gray-400)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    fontWeight: '500'
                }} className="header-metadata-desktop">
                    <span>{user?.company_name}</span>
                    <span style={{ opacity: 0.3 }}>&middot;</span>
                    <span>{user?.industry_type}</span>
                    {user?.district && (
                        <>
                            <span style={{ opacity: 0.3 }}>&middot;</span>
                            <span>{user.district}</span>
                        </>
                    )}
                </div>

                {/* Actions right */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Only show toggle control if the logged in user is NOT the master admin profile */}
                    {user?.is_admin && user?.email !== 'admin@rewaste.com' && (
                        <button 
                            onClick={() => {
                                setIsAdminMode(!isAdminMode);
                                handleClearSearch();
                            }} 
                            className="clay-btn-secondary"
                            style={{ 
                                padding: '10px 20px', 
                                fontSize: '11px', 
                                letterSpacing: '0.1em', 
                                cursor: 'pointer',
                            }}
                        >
                            {isAdminMode ? "EXIT ADMIN" : "ADMIN DASHBOARD"}
                        </button>
                    )}
                    <button 
                        onClick={logout} 
                        className="clay-btn-primary"
                        style={{ 
                            padding: '10px 20px', 
                            fontSize: '11px', 
                            letterSpacing: '0.1em', 
                            cursor: 'pointer',
                        }}
                    >
                        LOG OUT
                    </button>
                </div>
            </header>

            {/* 2. NAV TABS */}
            {/* Guarantee workspace tabs stay locked hidden if admin@rewaste.com is authenticated */}
            {!isAdminMode && user?.email !== 'admin@rewaste.com' && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '24px 24px 0 24px'
                }}>
                    <div className="clay-inset" style={{
                        display: 'flex',
                        padding: '6px',
                        gap: '12px',
                        width: 'fit-content'
                    }}>
                        <button 
                            onClick={() => setActiveTab('hub')} 
                            className={activeTab === 'hub' ? "clay-btn-primary" : "clay-btn-secondary"}
                            style={{ padding: '10px 24px', border: 'none', fontSize: '12px', letterSpacing: '0.08em', cursor: 'pointer' }}
                        >
                            MARKETPLACE
                        </button>
                        <button 
                            onClick={() => setActiveTab('upload')} 
                            className={activeTab === 'upload' ? "clay-btn-primary" : "clay-btn-secondary"}
                            style={{ padding: '10px 24px', border: 'none', fontSize: '12px', letterSpacing: '0.08em', cursor: 'pointer' }}
                        >
                            REGISTER STOCK
                        </button>
                        <button 
                            onClick={() => setActiveTab('inquiries')} 
                            className={activeTab === 'inquiries' ? "clay-btn-primary" : "clay-btn-secondary"}
                            style={{ padding: '10px 24px', border: 'none', fontSize: '12px', letterSpacing: '0.08em', cursor: 'pointer' }}
                        >
                            TRADE REQUESTS ({incomingRequests.length + history.length})
                        </button>
                    </div>
                </div>
            )}

            {/* CSS overrides inside style tag for responsiveness and green-accented claymorphism */}
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

                .clay-inset {
                  background-color: var(--clay-bg) !important;
                  border-radius: 20px !important;
                  border: 1px solid rgba(255, 255, 255, 0.1) !important;
                  box-shadow: inset 5px 5px 10px var(--clay-shadow-in-2), 
                              inset -5px -5px 10px var(--clay-shadow-in-1) !important;
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

                .clay-btn-secondary {
                  background-color: var(--clay-card-bg) !important;
                  color: var(--primary-dark) !important;
                  border-radius: 16px !important;
                  border: 1px solid var(--clay-input-border) !important;
                  box-shadow: 4px 4px 8px var(--clay-shadow-out-1), 
                              -4px -4px 8px var(--clay-shadow-out-2), 
                              inset 3px 3px 6px var(--clay-shadow-in-1), 
                              inset -3px -3px 6px var(--clay-shadow-in-2) !important;
                  cursor: pointer !important;
                  font-weight: 700 !important;
                  font-family: var(--font-mono) !important;
                  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                .clay-btn-secondary:hover {
                  transform: translateY(-2px) !important;
                  box-shadow: 6px 6px 12px var(--clay-shadow-out-1), 
                              -6px -6px 12px var(--clay-shadow-out-2), 
                              inset 3px 3px 6px var(--clay-shadow-in-1), 
                              inset -3px -3px 6px var(--clay-shadow-in-2) !important;
                }

                .clay-btn-secondary:active {
                  transform: translateY(1px) !important;
                  box-shadow: inset 3px 3px 6px var(--clay-shadow-in-2), 
                              inset -3px -3px 6px var(--clay-shadow-in-1) !important;
                }

                .clay-row {
                  background-color: var(--clay-card-bg) !important;
                  border-radius: 16px !important;
                  border: 1px solid var(--clay-input-border) !important;
                  box-shadow: 3px 3px 6px var(--clay-shadow-out-1), 
                              -3px -3px 6px var(--clay-shadow-out-2), 
                              inset 1px 1px 2px var(--clay-shadow-in-1), 
                              inset -1px -1px 2px var(--clay-shadow-in-2) !important;
                  margin-bottom: 12px;
                  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .clay-row:hover {
                  transform: translateX(4px) !important;
                  box-shadow: 4px 4px 8px var(--clay-shadow-out-1), 
                              -4px -4px 8px var(--clay-shadow-out-2) !important;
                }

                @media (max-width: 900px) {
                    .header-metadata-desktop {
                        display: none !important;
                    }
                }
            `}</style>

            {/* 3. MAIN CONTENT AREA */}
            <main style={{
                padding: '32px 48px',
                backgroundColor: 'var(--gray-100)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '32px',
                boxSizing: 'border-box'
            }}>
                
                {/* ==========================================================
                    VIEW 1: SYSTEM MONITORING LAYER (ADMIN CLEARANCE)
                   ========================================================== */}
                {isAdminMode && user?.is_admin ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                         {/* KPI Cards Row (Admin) */}
                         <div className="kpi-grid">
                             <div className="clay-card" style={{ padding: '24px', textAlign: 'left' }}>
                                 <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: '600' }}>TOTAL FACILITIES</div>
                                 <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: '700', color: 'var(--black)', margin: '0 0 12px 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                     {adminData.summary?.total_industries}
                                     <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--gray-400)', fontWeight: '500' }}>UNITS</span>
                                 </div>
                                 <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--gray-700)', lineHeight: '1.6', margin: 0 }}>Registered business units in the ecosystem.</p>
                             </div>
                             <div className="clay-card" style={{ padding: '24px', textAlign: 'left' }}>
                                 <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: '600' }}>ACTIVE OFFERS</div>
                                 <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: '700', color: 'var(--black)', margin: '0 0 12px 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                     {adminData.summary?.total_listings}
                                     <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--gray-400)', fontWeight: '500' }}>LISTINGS</span>
                                 </div>
                                 <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--gray-700)', lineHeight: '1.6', margin: 0 }}>Active listings published by facilities.</p>
                             </div>
                             <div className="clay-card" style={{ padding: '24px', textAlign: 'left' }}>
                                 <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: '600' }}>SAVINGS ACUMULATED</div>
                                 <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '700', color: 'var(--black)', margin: '0', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                     {adminData.summary?.global_tons_diverted}
                                     <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500' }}>TONS DIVERTED</span>
                                 </div>
                                 <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: 'var(--black)', margin: '4px 0 12px 0', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                     {adminData.summary?.global_co2_saved_kg}
                                     <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500' }}>KG CO2 SAVED</span>
                                 </div>
                                 <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--gray-700)', lineHeight: '1.6', margin: 0 }}>Ecosystem carbon and landfill savings stats.</p>
                             </div>
                         </div>

                         {/* Dense Data Split Tables */}
                         <div className="dashboard-content-grid">
                             <div>
                                 <h3 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--black)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '10px', textAlign: 'left' }}>
                                     VERIFIED NETWORK UNITS ({adminData.industries?.length || 0})
                                 </h3>
                                 <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '500px', overflowY: 'auto', padding: '16px' }}>
                                     {adminData.industries.map(ind => (
                                         <div key={ind.id} className="clay-row" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                             <div style={{ textAlign: 'left' }}>
                                                 <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--black)' }}>{ind.company_name}</h4>
                                                 <p style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500' }}>
                                                     Sector: {ind.industry_type} | Region: {ind.district}
                                                 </p>
                                             </div>
                                             <div>
                                                 {ind.is_verified ? (
                                                     <span className="clay-inset" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: '700', padding: '4px 10px', color: 'var(--black)', letterSpacing: '0.08em' }}>
                                                         {ind.is_admin ? "ADMIN" : "VERIFIED"}
                                                     </span>
                                                 ) : (
                                                     <button 
                                                         onClick={() => handleVerifyIndustry(ind.id)}
                                                         className="clay-btn-secondary"
                                                         style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}
                                                     >
                                                         Verify Node
                                                     </button>
                                                 )}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             <div>
                                 <h3 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--black)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '10px', textAlign: 'left' }}>
                                     ALL DIRECTORY OFFERS ({adminData.listings?.length || 0})
                                 </h3>
                                 <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '500px', overflowY: 'auto', padding: '16px' }}>
                                     {adminData.listings.map(list => (
                                         <div key={list.id} className="clay-row" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                             <div style={{ textAlign: 'left', flex: 1, marginRight: '16px' }}>
                                                 <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--black)' }}>{list.title}</h4>
                                                 <p style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500' }}>
                                                     Origin: {list.company_name} | Quantity: {list.quantity} {list.unit.toUpperCase()}
                                                 </p>
                                             </div>
                                             <button 
                                                 onClick={() => handleModerateDeleteListing(list.id)} 
                                                 className="clay-btn-secondary"
                                                 style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '11px', fontWeight: '700' }}
                                             >
                                                 DELETE
                                             </button>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         </div>
                    </div>
                ) : (
                    /* ==========================================================
                        VIEW 2: COMMERCIAL EXCHANGE PLATFORM MODULES
                       ========================================================== */
                    <>
                        {/* HUB DIRECTORY SUBTAB */}
                        {activeTab === 'hub' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                
                                {/* A. KPI ROW */}
                                <div className="kpi-grid">
                                    {/* Card 1: Landfill Diversion Log */}
                                    <div className="clay-card" style={{ padding: '24px', textAlign: 'left' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: '600' }}>
                                            LANDFILL DIVERSION
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: '700', color: 'var(--black)', margin: '0 0 12px 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            {ecoData.total_tons_diverted}
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--gray-400)', fontWeight: '500' }}>TONS</span>
                                        </div>
                                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--gray-700)', lineHeight: '1.6', margin: 0 }}>
                                            Total weight of materials saved from landfills.
                                        </p>
                                    </div>

                                    {/* Card 2: Carbon Displacement Audit */}
                                    <div className="clay-card" style={{ padding: '24px', textAlign: 'left' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: '600' }}>
                                            CARBON SAVED
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: '700', color: 'var(--black)', margin: '0 0 12px 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            {ecoData.co2_saved_kg}
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--gray-400)', fontWeight: '500' }}>KG CO2</span>
                                        </div>
                                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--gray-700)', lineHeight: '1.6', margin: 0 }}>
                                            Estimated greenhouse gas emissions prevented.
                                        </p>
                                    </div>

                                    {/* Card 3: Secured Handshake Ledgers */}
                                    <div className="clay-card" style={{ padding: '24px', textAlign: 'left' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: '600' }}>
                                            COMPLETED DEALS
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: '700', color: 'var(--black)', margin: '0 0 12px 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            {ecoData.total_listings_closed}
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--gray-400)', fontWeight: '500' }}>DEALS</span>
                                        </div>
                                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--gray-700)', lineHeight: '1.6', margin: 0 }}>
                                            Number of successful resource exchanges made.
                                        </p>
                                    </div>
                                </div>

                                {/* B. CONTENT ROW (60% Left / 40% Right) */}
                                <div className="dashboard-content-grid">
                                    
                                    {/* LEFT COLUMN (60%): Live Ecosystem Exchange Listings */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <h3 style={{ margin: '0', fontFamily: 'var(--font-mono)', fontSize: '11px', textAlign: 'left', color: 'var(--black)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--gray-200)', paddingBottom: '10px' }}>
                                            MARKETPLACE LISTINGS
                                            <span className="clay-inset" style={{ color: 'var(--black)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px 10px', marginLeft: '8px', fontWeight: '700' }}>{matches.length}</span>
                                        </h3>

                                        {loading ? (
                                            <div className="clay-card" style={{ padding: '32px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-400)', textAlign: 'left' }}>
                                                Searching for matches...
                                            </div>
                                        ) : matches.length === 0 ? (
                                            <div className="clay-card" style={{ padding: '32px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-400)', textAlign: 'left' }}>
                                                No compatible listings found.
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
                                                {getSortedMatches().map((listing) => (
                                                    <div key={listing.id} className="clay-card" style={{ border: '1px solid var(--clay-input-border)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ flex: 1, paddingRight: '16px', textAlign: 'left' }}>
                                                            <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px', marginBottom: '8px' }}>
                                                                <Percent size={12} /> {listing.match_score ? `${listing.match_score}% Match Ranking` : 'Manual Search Hit'}
                                                            </div>
                                                            <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontSize: '18px', fontWeight: '600' }}>{listing.title}</h4>
                                                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 12px 0', lineHeight: '1.4' }}>{listing.description}</p>
                                                            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={14} color="var(--primary)" /> Supply: <strong style={{ color: 'var(--text-main)' }}>{listing.quantity} {listing.unit.toUpperCase()}</strong></span>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} color="var(--primary)" /> Node: {listing.company_name} ({listing.district})</span>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => handleRequestExchange(listing.id)} className="clay-btn-primary" style={{ width: 'auto', padding: '10px 16px', whiteSpace: 'nowrap', fontSize: '13px' }}>REQUEST TRADE</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* RIGHT COLUMN (40%): Filters Panel + My Internal Record Manifests */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        
                                        {/* Filter Board */}
                                        <div className="clay-card" style={{ padding: '24px' }}>
                                            <h3 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-mono)', fontSize: '11px', textAlign: 'left', color: 'var(--black)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--gray-200)', paddingBottom: '10px' }}>
                                                FILTERS
                                            </h3>
                                            
                                            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                
                                                <select 
                                                    value={searchDistrict} 
                                                    onChange={(e) => setSearchDistrict(e.target.value)} 
                                                    className="clay-input"
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '46px', 
                                                        cursor: 'pointer',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    <option value="">ALL DISTRICTS (KERALA)</option>
                                                    <option value="Kottayam">KOTTAYAM NODE</option>
                                                    <option value="Ernakulam">ERNAKULAM NODE</option>
                                                    <option value="Palakkad">PALAKKAD NODE</option>
                                                    <option value="Thrissur">THRISSUR NODE</option>
                                                    <option value="Kozhikode">KOZHIKODE NODE</option>
                                                </select>

                                                <select 
                                                    value={searchMaterialType} 
                                                    onChange={(e) => setSearchMaterialType(e.target.value)} 
                                                    className="clay-input"
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '46px', 
                                                        cursor: 'pointer',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    <option value="">ALL MATERIAL CLASSES</option>
                                                    <option value="Wood Mills">WOOD & TIMBER RESIDUE</option>
                                                    <option value="Agro-Processing">AGRO RESIDUALS</option>
                                                    <option value="Textiles">TEXTILE FABRIC SCRAPS</option>
                                                    <option value="Construction">CONSTRUCTION CORES</option>
                                                </select>

                                                <select 
                                                    value={sortBy} 
                                                    onChange={(e) => setSortBy(e.target.value)} 
                                                    className="clay-input"
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '46px', 
                                                        cursor: 'pointer',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    <option value="newest">Sort By: Newest</option>
                                                    <option value="qty-desc">Sort By: Highest Quantity</option>
                                                    <option value="qty-asc">Sort By: Lowest Quantity</option>
                                                </select>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                                    <button 
                                                        type="submit" 
                                                        className="clay-btn-primary"
                                                        style={{ 
                                                            width: '100%', 
                                                            height: '46px', 
                                                            fontSize: '12px', 
                                                            letterSpacing: '0.08em', 
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        APPLY FILTERS
                                                    </button>
                                                    
                                                    {isManualSearch && (
                                                        <button 
                                                            type="button" 
                                                            onClick={handleClearSearch} 
                                                            className="clay-btn-secondary"
                                                            style={{ 
                                                                width: '100%', 
                                                                height: '46px', 
                                                                fontSize: '12px', 
                                                                letterSpacing: '0.08em', 
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            RESET
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                        </div>

                                        {/* My Internal Record Manifests inside the right column */}
                                        <div className="clay-card" style={{ padding: '24px' }}>
                                            <h3 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-mono)', fontSize: '11px', textAlign: 'left', color: 'var(--black)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--gray-200)', paddingBottom: '10px' }}>
                                                MY INVENTORY
                                                <span className="clay-inset" style={{ color: 'var(--black)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px 10px', marginLeft: '8px', fontWeight: '700' }}>{myInventory.length}</span>
                                            </h3>
                                            
                                            {myInventory.length === 0 ? (
                                                <div style={{ padding: '16px 0', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-400)', textAlign: 'left' }}>
                                                    No inventory registered.
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    {myInventory.map((item) => (
                                                        <div key={item.id} className="clay-row" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ textAlign: 'left', flex: 1, marginRight: '12px' }}>
                                                                <h4 style={{ margin: 0, color: 'var(--black)', fontSize: '13px', fontWeight: '600' }}>{item.title}</h4>
                                                                <p style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-400)', fontWeight: '700' }}>
                                                                    Quantity: {item.quantity} {item.unit.toUpperCase()}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                {item.is_available ? (
                                                                    <span className="clay-inset" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: '700', padding: '4px 10px', color: 'var(--status-green)' }}>
                                                                        READY
                                                                    </span>
                                                                ) : (
                                                                    <span className="clay-inset" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: '700', padding: '4px 10px', color: 'var(--gray-400)' }}>
                                                                        DONE
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                </div>
                            </div>
                        )}

                        {/* TEXT FORM WRAPPER SUBTAB REGISTER FOR WORKSPACE */}
                        {activeTab === 'upload' && (
                            <div className="dashboard-content-grid">
                                {/* Left column: Form */}
                                <div className="clay-card" style={{ padding: '40px', boxSizing: 'border-box' }}>
                                    <h2 style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '32px', color: 'var(--black)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '14px' }}>
                                        <PlusCircle size={20} /> REGISTER STOCK
                                    </h2>
                                    <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '10px', color: 'var(--black)', fontFamily: 'var(--font-mono)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</label>
                                            <input type="text" name="title" required onChange={handleUploadChange} value={uploadData.title} placeholder="E.G. METALLIC PACKAGING RESIDUES" className="clay-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                                        </div>
                                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '10px', color: 'var(--black)', fontFamily: 'var(--font-mono)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Material Category</label>
                                            <select name="material_type" onChange={handleUploadChange} value={uploadData.material_type} className="clay-input" style={{ width: '100%', cursor: 'pointer', fontWeight: '500' }}>
                                                <option value="Wood Mills">Wood Residue</option>
                                                <option value="Agro-Processing">Agro Residuals</option>
                                                <option value="Textiles">Textile Scraps</option>
                                                <option value="Construction">Construction Waste</option>
                                            </select>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <label style={{ fontSize: '10px', color: 'var(--black)', fontFamily: 'var(--font-mono)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</label>
                                                <input type="number" step="any" name="quantity" required onChange={handleUploadChange} value={uploadData.quantity} className="clay-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                                            </div>
                                            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <label style={{ fontSize: '10px', color: 'var(--black)', fontFamily: 'var(--font-mono)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit</label>
                                                <select name="unit" onChange={handleUploadChange} value={uploadData.unit} className="clay-input" style={{ width: '100%', cursor: 'pointer', fontWeight: '500' }}>
                                                    <option value="tons">Tons</option>
                                                    <option value="kg">Kilograms (kg)</option>
                                                    <option value="liters">Liters</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '10px', color: 'var(--black)', fontFamily: 'var(--font-mono)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                                            <input type="text" name="description" required onChange={handleUploadChange} value={uploadData.description} placeholder="Provide material description..." className="clay-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                                        </div>
                                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '10px', color: 'var(--black)', fontFamily: 'var(--font-mono)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Keywords</label>
                                            <input type="text" name="keywords" required onChange={handleUploadChange} value={uploadData.keywords} placeholder="organic, scrap, wood" className="clay-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                                        </div>
                                        <button 
                                            type="submit" 
                                            className="clay-btn-primary"
                                            style={{ 
                                                marginTop: '16px', 
                                                padding: '14px', 
                                                fontSize: '11px', 
                                                letterSpacing: '0.12em', 
                                                cursor: 'pointer',
                                            }}
                                        >
                                            REGISTER STOCK
                                        </button>
                                    </form>
                                </div>

                                {/* Right column: My Inventory list */}
                                <div className="clay-card" style={{ padding: '24px' }}>
                                    <h3 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-mono)', fontSize: '11px', textAlign: 'left', color: 'var(--black)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--gray-200)', paddingBottom: '10px' }}>
                                        MY INVENTORY
                                        <span className="clay-inset" style={{ color: 'var(--black)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px 10px', marginLeft: '8px', fontWeight: '700' }}>{myInventory.length}</span>
                                    </h3>
                                    
                                    {myInventory.length === 0 ? (
                                        <div style={{ padding: '16px 0', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-400)', textAlign: 'left' }}>
                                            No inventory registered.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {myInventory.map((item) => (
                                                <div key={item.id} className="clay-row" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ textAlign: 'left', flex: 1, marginRight: '12px' }}>
                                                        <h4 style={{ margin: 0, color: 'var(--black)', fontSize: '13px', fontWeight: '600' }}>{item.title}</h4>
                                                        <p style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-400)', fontWeight: '700' }}>
                                                            Quantity: {item.quantity} {item.unit.toUpperCase()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        {item.is_available ? (
                                                            <span className="clay-inset" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: '700', padding: '4px 10px', color: 'var(--status-green)' }}>
                                                                READY
                                                            </span>
                                                        ) : (
                                                            <span className="clay-inset" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: '700', padding: '4px 10px', color: 'var(--gray-400)' }}>
                                                                DONE
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TRADE ORDERS LOGISTICS DIRECTORY LIST OVERVIEW */}
                        {activeTab === 'inquiries' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div className="clay-card" style={{ padding: '24px 32px' }}>
                                    <h3 style={{ textAlign: 'left', marginBottom: '24px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--black)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--gray-200)', paddingBottom: '12px' }}>
                                        RECEIVED REQUESTS
                                    </h3>
                                    
                                    {incomingRequests.length === 0 ? (
                                        <p style={{ color: 'var(--gray-400)', margin: 0, padding: '12px 0', textAlign: 'left', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                                            No pending trade requests.
                                        </p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {incomingRequests.map((req) => (
                                                <div key={req.id} className="clay-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                                                    <div style={{ textAlign: 'left', flex: 1, marginRight: '16px' }}>
                                                        <h4 style={{ margin: '0 0 4px 0', color: 'var(--black)', fontSize: '14px', fontWeight: '600' }}>
                                                            From: {req.buyer_company}
                                                        </h4>
                                                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-700)', lineHeight: '1.4' }}>
                                                            Material: {req.material_title} | Location: {req.district}
                                                        </p>
                                                        <span className="clay-inset" style={{ display: 'inline-block', marginTop: '8px', fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '4px 10px', color: 'var(--black)', fontWeight: '700', letterSpacing: '0.08em' }}>
                                                            Status: {req.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    {req.status === 'pending' && (
                                                        <div style={{ display: 'flex', gap: '12px' }}>
                                                            <button 
                                                                onClick={() => handleUpdateStatus(req.id, 'approved')} 
                                                                className="clay-btn-primary"
                                                                style={{ padding: '8px 16px', fontSize: '11px', letterSpacing: '0.08em', cursor: 'pointer' }}
                                                            >
                                                                APPROVE
                                                            </button>
                                                            <button 
                                                                onClick={() => handleUpdateStatus(req.id, 'rejected')} 
                                                                className="clay-btn-secondary"
                                                                style={{ padding: '8px 16px', fontSize: '11px', letterSpacing: '0.08em', cursor: 'pointer' }}
                                                            >
                                                                DECLINE
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="clay-card" style={{ padding: '24px 32px' }}>
                                    <h3 style={{ textAlign: 'left', marginBottom: '24px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--black)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--gray-200)', paddingBottom: '12px' }}>
                                        TRADE HISTORY
                                    </h3>
                                    
                                    {history.length === 0 ? (
                                        <p style={{ color: 'var(--gray-400)', margin: 0, padding: '12px 0', textAlign: 'left', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                                            No completed trades.
                                        </p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {history.map((h) => {
                                                const partnerName = user.company_name === h.seller_name ? h.buyer_company : h.seller_name;
                                                return (
                                                    <div key={h.id} className="clay-row" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ textAlign: 'left' }}>
                                                            <span className="clay-inset" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-400)', fontWeight: '700', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                                Status: {h.status.toUpperCase()}
                                                            </span>
                                                            <h4 style={{ margin: '8px 0 4px 0', color: 'var(--black)', fontSize: '15px', fontWeight: '600' }}>{h.material_title}</h4>
                                                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-700)' }}>Partner: {partnerName}</p>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '12px' }}>
                                                            <button 
                                                                onClick={() => openChatBotDrawer(h)} 
                                                                className="clay-btn-secondary"
                                                                style={{ width: 'auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', letterSpacing: '0.08em', cursor: 'pointer' }}
                                                            >
                                                                <MessageSquare size={13} /> OPEN CHAT
                                                            </button>
                                                            {h.status === 'approved' && user.company_name === h.seller_name && (
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(h.id, 'rejected')} 
                                                                    className="clay-btn-primary"
                                                                    style={{ width: 'auto', padding: '10px 16px', fontSize: '11px', letterSpacing: '0.08em', cursor: 'pointer', backgroundColor: '#ef4444' }}
                                                                >
                                                                    CANCEL DEAL
                                                                </button>
                                                            )}
                                                        </div>
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

                {/* --- TWO-COLUMN STATUS LINE FOOTER --- */}
                <footer style={{
                    marginTop: '48px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px 0 0 0',
                    background: 'none',
                    borderTop: '1px solid var(--gray-200)'
                }}>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-400)', letterSpacing: '0.12em', fontWeight: '700', textTransform: 'uppercase' }}>
                        System Status: Online
                    </div>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-400)', letterSpacing: '0.12em', fontWeight: '700', textTransform: 'uppercase' }}>
                        Kerala Waste Network
                    </div>
                </footer>

            </main>

        </div>
    );
};

export default Dashboard;