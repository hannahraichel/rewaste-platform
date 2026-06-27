import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, ArrowRight, Layers, Cpu, Compass, Activity, ShieldCheck, HelpCircle } from 'lucide-react';
import ecoFactory from '../assets/eco_factory.png';
import recycleLoop from '../assets/recycle_loop.png';
import circularEconomy from '../assets/circular_economy.png';

export default function LandingPage() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  
  const slides = [ecoFactory, recycleLoop, circularEconomy];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch live listings from backend
    axios.get('/api/waste/all')
      .then(res => {
        // Take the top 3-4 listings
        setListings(res.data.slice(0, 3));
        setLoadingListings(false);
      })
      .catch(err => {
        console.error("Error fetching marketplace listings:", err);
        setLoadingListings(false);
      });
  }, []);

  // Generate deterministic price per ton for presentation matching database types
  const getDisplayPrice = (item) => {
    if (item.price_per_ton) return `${item.price_per_ton} / ton`;
    const mat = item.material_type || '';
    if (mat.includes('Wood')) return '$85 / ton';
    if (mat.includes('Textile')) return '$120 / ton';
    if (mat.includes('Chemical')) return '$240 / ton';
    if (mat.includes('Metal') || mat.includes('Alloy')) return '$215 / ton';
    if (mat.includes('Glass')) return '$95 / ton';
    if (mat.includes('Paper') || mat.includes('Pulp')) return '$75 / ton';
    return '$135 / ton';
  };

  // Fallback listings to display if backend database doesn't return enough entries
  const fallbackListings = [
    {
      id: 'dummy-1',
      title: 'Premium Dry Sawdust Scraps',
      material_type: 'Wood Mills',
      quantity: '2.5',
      unit: 'tons',
      district: 'Ernakulam',
      state: 'Kerala',
      company_name: 'Malabar Timber Woods'
    },
    {
      id: 'dummy-2',
      title: 'Cotton Thread & Yarn Waste',
      material_type: 'Textiles',
      quantity: '4.2',
      unit: 'tons',
      district: 'Alappuzha',
      state: 'Kerala',
      company_name: 'Seemati Production Co.'
    },
    {
      id: 'dummy-3',
      title: 'Spent Glass Cullet Batches',
      material_type: 'Glass & Ceramic',
      quantity: '12.0',
      unit: 'tons',
      district: 'Kozhikode',
      state: 'Kerala',
      company_name: 'EcoGlass Processing'
    }
  ];

  const activeListings = listings.length > 0 ? listings : fallbackListings;

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleCTA = () => {
    navigate('/register');
  };

  const handleDashboardOrRegister = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--white)',
      color: 'var(--black)',
      fontFamily: "'Inter', 'DM Sans', -apple-system, sans-serif",
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      
      {/* 1. NAVBAR */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: '64px',
        backgroundColor: 'var(--white)',
        borderBottom: '1px solid var(--gray-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 48px',
      }}>
        {/* Logo left */}
        <Link to="/" style={{
          textDecoration: 'none',
          color: 'var(--black)',
          fontSize: '18px',
          fontWeight: '800',
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          ReWaste Hub
        </Link>

        {/* Nav Links centered */}
        <div className="nav-links-desktop" style={{
          display: 'flex',
          gap: '32px',
          alignItems: 'center'
        }}>
          {['Marketplace', 'How It Works', 'Why ReWaste', 'Pricing', 'About'].map((link) => {
            const sectionId = link.toLowerCase().replace(/\s+/g, '-');
            return (
              <button
                key={link}
                onClick={() => scrollToSection(sectionId)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 0',
                  fontSize: '14px',
                  fontWeight: '500',
                  letterSpacing: '0.04em',
                  color: '#111111',
                  cursor: 'pointer',
                  position: 'relative',
                  fontFamily: 'inherit',
                  transition: 'color 0.2s ease'
                }}
                className="nav-link-btn"
              >
                {link}
              </button>
            );
          })}
          {token && (
            <Link
              to="/dashboard"
              style={{
                textDecoration: 'none',
                color: '#111111',
                padding: '8px 0',
                fontSize: '14px',
                fontWeight: '500',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                position: 'relative',
                fontFamily: 'inherit',
                transition: 'color 0.2s ease'
              }}
              className="nav-link-btn"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* CTA right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={handleCTA}
            className="clay-btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Get Started
          </button>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--gray-border)',
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              display: 'none',
              color: 'var(--black)'
            }}
            className="hamburger-btn"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          width: '100vw',
          height: 'calc(100vh - 64px)',
          backgroundColor: 'var(--white)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          paddingBottom: '100px'
        }}>
          {['Marketplace', 'How It Works', 'Why ReWaste', 'Pricing', 'About'].map((link) => {
            const sectionId = link.toLowerCase().replace(/\s+/g, '-');
            return (
              <button
                key={link}
                onClick={() => scrollToSection(sectionId)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  fontWeight: '600',
                  letterSpacing: '0.04em',
                  color: 'var(--black)',
                  cursor: 'pointer'
                }}
              >
                {link}
              </button>
            );
          })}
          {token && (
            <button
              onClick={() => {
                navigate('/dashboard');
                setMobileMenuOpen(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                fontWeight: '600',
                letterSpacing: '0.04em',
                color: 'var(--black)',
                cursor: 'pointer'
              }}
            >
              Dashboard
            </button>
          )}
          <button
            onClick={handleCTA}
            style={{
              backgroundColor: 'var(--black)',
              color: 'var(--white)',
              border: 'none',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '4px',
              marginTop: '16px',
              width: '200px',
              cursor: 'pointer'
            }}
          >
            Get Started
          </button>
        </div>
      )}

      {/* CSS overrides inside style tag for dynamic underline animation, green-accented claymorphism, and responsiveness */}
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
          transform: translateY(-2px);
          box-shadow: 12px 12px 24px var(--clay-shadow-out-1), 
                      -12px -12px 24px var(--clay-shadow-out-2), 
                      inset 3px 3px 6px var(--clay-shadow-in-1), 
                      inset -3px -3px 6px var(--clay-shadow-in-2) !important;
        }

        .clay-inset {
          background-color: var(--clay-bg) !important;
          border-radius: 16px !important;
          border: 1px solid var(--clay-input-border) !important;
          box-shadow: inset 3px 3px 6px var(--clay-shadow-in-2), 
                      inset -3px -3px 6px var(--clay-shadow-in-1) !important;
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
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .clay-btn-primary:hover {
          background-color: var(--primary-dark) !important;
          transform: translateY(-2px) !important;
          box-shadow: 6px 6px 12px rgba(5, 150, 105, 0.35), 
                      -6px -6px 12px rgba(255, 255, 255, 0.08), 
                      inset 3px 3px 6px rgba(255, 255, 255, 0.3), 
                      inset -3px -3px 6px rgba(0, 0, 0, 0.5) !important;
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

        .nav-link-btn::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: var(--primary);
          transform-origin: bottom left;
          transition: transform 0.2s ease;
        }
        .nav-link-btn:hover::after {
          transform: scaleX(1);
        }
        .hero-pattern {
          background-image: radial-gradient(circle, rgba(16, 185, 129, 0.08) 1.5px, transparent 1.5px);
          background-size: 32px 32px;
        }
        @media (max-width: 768px) {
          .nav-links-desktop {
            display: none !important;
          }
          .hamburger-btn {
            display: block !important;
          }
        }
      `}</style>

      {/* MAIN CONTAINER */}
      <main style={{ flex: 1 }}>

        {/* 1. HERO SECTION */}
        <section style={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--clay-bg)',
          padding: '96px 24px',
          borderBottom: '1px solid var(--gray-border)',
          overflow: 'hidden'
        }}>
          {/* Background Slideshow */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            overflow: 'hidden'
          }}>
            {slides.map((slide, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${slide})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: currentSlide === index ? 0.3 : 0,
                  transition: 'opacity 1.5s ease-in-out',
                  zIndex: currentSlide === index ? 2 : 1
                }}
              />
            ))}
            {/* Eco radial dot pattern overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              zIndex: 3
            }} className="hero-pattern" />
          </div>

          <div style={{
            maxWidth: '1200px',
            width: '100%',
            textAlign: 'center',
            zIndex: 4,
            margin: '0 auto',
            position: 'relative'
          }}>
            <h1 style={{
              fontSize: 'clamp(40px, 6vw, 64px)',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              color: 'var(--black)',
              marginBottom: '24px',
              lineHeight: '1.1'
            }}>
              Turn Industrial Waste<br />Into Value
            </h1>
            
            <p style={{
              fontSize: '18px',
              color: '#555555',
              maxWidth: '650px',
              margin: '0 auto 40px auto',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              The secure B2B digital ecosystem connecting manufacturers to exchange, trace, and repurpose secondary industrial by-products.
            </p>

            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={handleDashboardOrRegister}
                className="clay-btn-primary"
                style={{
                  padding: '14px 28px',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Post Waste <ArrowRight size={16} />
              </button>
              
              <button 
                onClick={() => scrollToSection('marketplace')}
                className="clay-btn-secondary"
                style={{
                  padding: '14px 28px',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
              >
                Browse Listings
              </button>
            </div>
          </div>
        </section>

        {/* 2. TRUST BAR */}
        <section style={{
          height: 'auto',
          minHeight: '80px',
          borderBottom: '1px solid var(--gray-border)',
          backgroundColor: 'var(--gray-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 48px',
        }}>
          <div style={{
            maxWidth: '1200px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <span style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--gray-muted)',
              fontWeight: '600'
            }}>
              // Trusted by 200+ manufacturers across 12 industries
            </span>
            
            <div style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {['CHEM_NODE_01', 'STEEL_NODE_04', 'TEX_NODE_12', 'PULP_NODE_09', 'GLASS_NODE_02'].map((node) => (
                <span 
                  key={node} 
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#666666',
                    fontWeight: '700',
                    border: '1px solid #D5D5D5',
                    padding: '3px 8px',
                    backgroundColor: '#FFFFFF',
                    letterSpacing: '0.05em'
                  }}
                >
                  [{node}]
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS */}
        <section id="how-it-works" style={{
          padding: '96px 24px',
          borderBottom: '1px solid var(--gray-border)',
          backgroundColor: 'var(--white)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '13px',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--gray-muted)',
              marginBottom: '48px'
            }}>
              [ Process Ledger // How It Works ]
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
              padding: '24px 0'
            }}>
              {/* Step 1 */}
              <div className="clay-card" style={{
                padding: '40px 32px',
                boxSizing: 'border-box',
                textAlign: 'left'
              }}>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--black)',
                  marginBottom: '16px'
                }}>
                  01
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em'
                }}>
                  Post waste
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666666',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Upload your industrial scrap specifications, quantities, and material manifests. Securely index them to your corporate node.
                </p>
              </div>

              {/* Step 2 */}
              <div className="clay-card" style={{
                padding: '40px 32px',
                boxSizing: 'border-box',
                textAlign: 'left'
              }}>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--black)',
                  marginBottom: '16px'
                }}>
                  02
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em'
                }}>
                  Match manifests
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666666',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Our automated symbiosis engine analyzes chemical keywords and process data to link by-products to manufacturing inputs.
                </p>
              </div>

              {/* Step 3 */}
              <div className="clay-card" style={{
                padding: '40px 32px',
                boxSizing: 'border-box',
                textAlign: 'left'
              }}>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--black)',
                  marginBottom: '16px'
                }}>
                  03
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em'
                }}>
                  Transact securely
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666666',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Coordinate logistics, secure raw material manifests, and establish recurring material routing feeds with clear documentation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. MARKETPLACE PREVIEW */}
        <section id="marketplace" style={{
          padding: '96px 24px',
          borderBottom: '1px solid var(--gray-border)',
          backgroundColor: 'var(--gray-light)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '48px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                Live Waste Listings
              </h2>
              <span style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                color: 'var(--gray-muted)',
                fontWeight: '600'
              }}>
                // FEED UPDATE ACTIVE
              </span>
            </div>

            {loadingListings ? (
              <div style={{
                padding: '48px',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: '14px',
                color: 'var(--gray-muted)'
              }}>
                SYNCHRONIZING REPOSITORY INDEX...
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                marginBottom: '48px'
              }}>
                {activeListings.map((item) => (
                  <div 
                    key={item.id}
                    className="clay-card"
                    style={{
                      padding: '28px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '230px'
                    }}
                  >
                    <div>
                      {/* Meta information row */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '16px'
                      }}>
                        <span className="clay-inset" style={{
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '4px 10px',
                          color: 'var(--black)',
                          textTransform: 'uppercase'
                        }}>
                          {item.material_type || 'Industrial By-Product'}
                        </span>
                        
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          color: 'var(--gray-muted)',
                          fontWeight: '600'
                        }}>
                          {item.district}, KL
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        margin: '0 0 12px 0',
                        color: 'var(--black)',
                        lineHeight: '1.3'
                      }}>
                        {item.title}
                      </h3>
                      
                      {/* Sub-details */}
                      <p style={{
                        fontSize: '13px',
                        color: '#666666',
                        margin: '0 0 20px 0',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.description || 'Verified industrial symbiosis material by-product manifest.'}
                      </p>
                    </div>

                    {/* Quantity & Price Ledger */}
                    <div style={{
                      borderTop: '1px dashed var(--gray-border)',
                      paddingTop: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline'
                    }}>
                      <div>
                        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--gray-muted)', display: 'block', textTransform: 'uppercase' }}>Quantity</span>
                        <span style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--black)' }}>
                          {item.quantity} {item.unit || 'tons'}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--gray-muted)', display: 'block', textTransform: 'uppercase' }}>EST. Valuation</span>
                        <span style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--black)' }}>
                          {getDisplayPrice(item)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Link below grid */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleDashboardOrRegister}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--black)',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderBottom: '2px solid var(--black)',
                  fontFamily: 'inherit'
                }}
              >
                Browse All Listings <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* 5. WHY REWASTE HUB */}
        <section id="why-rewaste" style={{
          padding: '96px 24px',
          borderBottom: '1px solid var(--gray-border)',
          backgroundColor: 'var(--white)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px'
          }}>
            {/* Left Column: bold statement */}
            <div style={{ textAlign: 'left' }}>
              <h2 style={{
                fontSize: '13px',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--gray-muted)',
                marginBottom: '24px'
              }}>
                [ Operational Philosophy ]
              </h2>
              <p style={{
                fontSize: '28px',
                fontWeight: '700',
                lineHeight: '1.3',
                color: 'var(--black)',
                letterSpacing: '-0.01em'
              }}>
                Industrial symbiosis is no longer an optional sustainability goal. It is the new baseline for cost-efficient manufacturing operations.
              </p>
            </div>

            {/* Right Column: 4 benefits */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
              justifyContent: 'center'
            }}>
              {[
                {
                  title: 'Cost Mitigation',
                  desc: 'Reduce waste disposal expenditure by routing by-products directly to secondary buyers.'
                },
                {
                  title: 'Raw Material Arbitrage',
                  desc: 'Acquire high-quality production inputs at pricing well below traditional virgin resources.'
                },
                {
                  title: 'Regulatory & SDG Reporting',
                  desc: 'Trace diverted waste tons and calculated carbon savings automatically for ESG verification.'
                },
                {
                  title: 'Secure Logistical Feeds',
                  desc: 'Establish recurring dispatch loops with industrial nodes under verified cargo manifests.'
                }
              ].map((benefit) => (
                <div key={benefit.title} style={{ textAlign: 'left' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px'
                  }}>
                    <span style={{ color: 'var(--gray-muted)' }}>—</span> {benefit.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#666666',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. TESTIMONIALS */}
        <section style={{
          padding: '96px 24px',
          borderBottom: '1px solid var(--gray-border)',
          backgroundColor: 'var(--gray-light)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '13px',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--gray-muted)',
              marginBottom: '56px',
              textAlign: 'center'
            }}>
              [ Peer Manifest Evaluations ]
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px'
            }}>
              {/* Quote 1 */}
              <div className="clay-card" style={{
                textAlign: 'left',
                padding: '32px',
                boxSizing: 'border-box'
              }}>
                <p style={{
                  fontSize: '16px',
                  fontStyle: 'italic',
                  lineHeight: '1.6',
                  color: 'var(--black)',
                  marginBottom: '16px'
                }}>
                  "By-product matching on ReWaste Hub diverted 400 tons of our mill sawdust directly into the regional cement plant's combustion feeds, turning our primary processing cost centers into clean secondary revenues."
                </p>
                <span style={{
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  color: 'var(--gray-muted)',
                  fontWeight: '700'
                }}>
                  — Rajesh K., Logistics Superintendent, Malabar Timber Woods
                </span>
              </div>

              {/* Quote 2 */}
              <div className="clay-card" style={{
                textAlign: 'left',
                padding: '32px',
                boxSizing: 'border-box'
              }}>
                <p style={{
                  fontSize: '16px',
                  fontStyle: 'italic',
                  lineHeight: '1.6',
                  color: 'var(--black)',
                  marginBottom: '16px'
                }}>
                  "Securing reliable textile yarn clippings as raw input for our recycled packaging fibers used to take weeks of broker validation. Now we trace material parameters directly from the local node manifests."
                </p>
                <span style={{
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  color: 'var(--gray-muted)',
                  fontWeight: '700'
                }}>
                  — Susan Mathew, Raw Materials Planner, Seemati Production Co.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 7. CTA BANNER */}
        <section style={{
          backgroundColor: 'var(--primary-dark)',
          color: 'var(--white)',
          padding: '96px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: '800',
              marginBottom: '16px',
              letterSpacing: '-0.02em'
            }}>
              Ready to close the loop on waste?
            </h2>
            
            <p style={{
              fontSize: '16px',
              color: 'var(--gray-muted)',
              maxWidth: '500px',
              margin: '0 auto 40px auto',
              lineHeight: '1.5'
            }}>
              Deploy your corporate industrial exchange nodes and configure your material streams today.
            </p>

            <button
              onClick={handleCTA}
              className="clay-btn-secondary"
              style={{
                padding: '14px 32px',
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              Start for Free
            </button>
          </div>
        </section>

      </main>

      {/* 8. FOOTER */}
      <footer style={{
        backgroundColor: 'var(--white)',
        borderTop: '1px solid var(--gray-border)',
        padding: '64px 48px 32px 48px',
        color: 'var(--gray-muted)',
        fontSize: '14px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Main Footer columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '64px'
          }}>
            {/* Column 1: Logo & Tagline */}
            <div style={{ textAlign: 'left' }}>
              <span style={{
                color: 'var(--black)',
                fontWeight: '800',
                fontFamily: 'monospace',
                fontSize: '16px',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '16px'
              }}>
                REWASTE HUB
              </span>
              <p style={{ lineHeight: '1.6', fontSize: '13px', margin: 0 }}>
                Clean, verified B2B industrial symbiosis directory. Closing the loop on industrial material processes.
              </p>
            </div>

            {/* Column 2: Product links */}
            <div style={{ textAlign: 'left' }}>
              <span style={{ color: 'var(--black)', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', fontFamily: 'monospace', display: 'block', marginBottom: '16px' }}>Product</span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <li><button onClick={() => scrollToSection('marketplace')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Live Marketplace</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>How it Works</button></li>
                <li><button onClick={() => scrollToSection('why-rewaste')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Why ReWaste</button></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>Operational Pricing</a></li>
              </ul>
            </div>

            {/* Column 3: Company links */}
            <div style={{ textAlign: 'left' }}>
              <span style={{ color: 'var(--black)', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', fontFamily: 'monospace', display: 'block', marginBottom: '16px' }}>Company</span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>About ReWaste</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>Press Archives</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>Developer APIs</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>Security Node</a></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div style={{ textAlign: 'left' }}>
              <span style={{ color: 'var(--black)', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', fontFamily: 'monospace', display: 'block', marginBottom: '16px' }}>Terminal Node</span>
              <p style={{ lineHeight: '1.6', fontSize: '13px', margin: 0 }}>
                Operations HQ: Ernakulam, Kerala<br />
                System Status: Active<br />
                Email: support@rewastehub.org
              </p>
            </div>
          </div>

          {/* Bottom copyright line */}
          <div style={{
            borderTop: '1px solid var(--gray-border)',
            paddingTop: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '12px'
          }}>
            <span>&copy; {new Date().getFullYear()} ReWaste Hub Inc. All rights reserved.</span>
            <span style={{ fontFamily: 'monospace', textTransform: 'uppercase', color: 'var(--black)', fontWeight: '600' }}>
              // Built for circular economy
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
