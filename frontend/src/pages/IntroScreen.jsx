import { useState } from "react";
import "./IntroScreen.css";

export default function IntroScreen({ onComplete }) {
  const [visible, setVisible] = useState(true);

  function handleEnter() {
    setVisible(false);
    setTimeout(() => onComplete?.(), 650);
  }

  if (!visible) return null;

  return (
    <div className={`intro-wrapper ${!visible ? "fade-out" : ""}`}>
      
      <div id="intro-screen">
        <div className="scan-line"></div>

        {/* Minimal Header */}
        <div className="terminal-header">
          <span className="terminal-title">ReWaste Workspace Engine // Production Mode</span>
        </div>

        {/* Console Workspace */}
        <div className="content-area">
          
          {/* PROFESSIONAL GLOWING TEXT TITLE */}
          <div style={{ marginBottom: '40px' }}>
            <h2 className="glowing-title">
              WELCOME TO <br /> REWASTE NETWORK
            </h2>
            <p style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '13px', marginTop: '12px', margin: 0, fontFamily: 'Times New Roman, serif', letterSpacing: '0.05em' }}>
              Secure Industrial Symbiosis Hub // Kerala Regional Ecosystem
            </p>
          </div>

          {/* SDG Compliance Badges with pure structural CSS delay tracking tags */}
          <div className="badge-row">
            <div className="badge badge-1">SDG 9: INDUSTRY & INNOVATION</div>
            <div className="badge badge-2">SDG 12: RESPONSIBLE CONSUMPTION</div>
            <div className="badge badge-3">CIRCULAR ECONOMY SYMBIOSIS</div>
          </div>

          {/* Action Navigation Entry Buttons */}
          <div className="cta-row">
            <button className="btn-enter" onClick={handleEnter}>
              ACCESS ENVIRONMENT
            </button>
            <button className="btn-skip" onClick={handleEnter}>
              Skip Setup
            </button>
          </div>

        </div>

        {/* Bottom Parameters Status Bar */}
        <div className="status-bar">
          <div className="status-item">
            <span className="status-dot"></span>WORKSPACE SECURED
          </div>
          <div className="status-item">REG: KERALA_IND</div>
        </div>

      </div>
    </div>
  );
}