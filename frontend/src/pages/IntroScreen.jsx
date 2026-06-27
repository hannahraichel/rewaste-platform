import { useState, useEffect, useRef } from "react";
import "./IntroScreen.css";

export default function IntroScreen({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const myRef = useRef(null);
  const vantaInstanceRef = useRef(null);

  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // Load Three.js r121 then the Vanta Net component module layout
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js")
      .then(() => loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js"))
      .then(() => {
        if (!vantaInstanceRef.current && myRef.current && window.VANTA) {
          vantaInstanceRef.current = window.VANTA.NET({
            el: myRef.current,
            mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.00,
  minWidth: 200.00,
  scale: 1.00,
  scaleMobile: 1.00,
            color: 0x10b981,
            backgroundColor: 0x0a0a0a,
            points: 17.00,
            maxDistance: 21.00,
            spacing: 16.00,
            showDots: false
          });
        }
      })
      .catch((err) => console.error("Error loading Vanta scripts:", err));

    return () => {
      if (vantaInstanceRef.current) {
        vantaInstanceRef.current.destroy();
        vantaInstanceRef.current = null;
      }
    };
  }, []);

  function handleEnter() {
    setVisible(false);
    setTimeout(() => onComplete?.(), 650);
  }

  if (!visible) return null;

  return (
    <div className={`intro-wrapper ${!visible ? "fade-out" : ""}`}>
      <div id="intro-screen" ref={myRef}>
        <div className="scan-line"></div>

        <div className="terminal-header">
          <span className="terminal-title">ReWaste Workspace Engine // Production Mode</span>
        </div>

        <div className="content-area">
          <div style={{ marginBottom: '40px' }}>
            <h2 className="glowing-title">
              WELCOME TO <br /> REWASTE NETWORK
            </h2>
            <p className="intro-subtitle">
              Secure Industrial Symbiosis Hub // Kerala Regional Ecosystem
            </p>
          </div>

          <div className="badge-row">
            <div className="badge badge-1">SDG 9: INDUSTRY & INNOVATION</div>
            <div className="badge badge-2">SDG 12: RESPONSIBLE CONSUMPTION</div>
            <div className="badge badge-3">CIRCULAR ECONOMY SYMBIOSIS</div>
          </div>

          <div className="cta-row">
            <button className="btn-enter" onClick={handleEnter}>
              ACCESS ENVIRONMENT
            </button>
            <button className="btn-skip" onClick={handleEnter}>
              Skip Setup
            </button>
          </div>
        </div>

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