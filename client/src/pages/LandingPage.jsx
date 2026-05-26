import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, X, Wallet, Coins, Award } from 'lucide-react';
import logo from '../assets/logo.png';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleGetStartedClick = (e) => {
    e.preventDefault();
    setIsClicked(true);
    setTimeout(() => {
      navigate('/home');
    }, 500);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#09090f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>

      {/* ── Ambient background layers ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>

        {/* Top-left blue radial glow */}
        <div style={{
          position: 'absolute',
          top: '-18%',
          left: '-12%',
          width: '64vw',
          height: '64vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 65%)',
          filter: 'blur(48px)',
          animation: 'lp-float-a 14s ease-in-out infinite alternate',
        }} />

        {/* Bottom-right indigo glow */}
        <div style={{
          position: 'absolute',
          bottom: '-12%',
          right: '-8%',
          width: '52vw',
          height: '52vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.16) 0%, transparent 65%)',
          filter: 'blur(56px)',
          animation: 'lp-float-b 18s ease-in-out infinite alternate-reverse',
        }} />

        {/* Subtle centre mid-purple accent */}
        <div style={{
          position: 'absolute',
          top: '38%',
          left: '42%',
          width: '28vw',
          height: '28vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          filter: 'blur(64px)',
        }} />

        {/* Dot grid overlay — masked to ellipse so edges fade */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)',
        }} />

        {/* Very faint top-edge border line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.07) 60%, transparent)',
        }} />
      </div>

      {/* ── Hero Card ── */}
      <div
        className="glass-panel animate-fade-up"
        style={{
          position: 'relative',
          zIndex: 3,
          width: '90%',
          maxWidth: '640px',
          padding: 'clamp(28px, 6vw, 52px) clamp(16px, 5vw, 44px)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '22px',
          background: 'rgba(10, 10, 20, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Brand Logo & Name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '-6px',
        }}>
          <img 
            src={logo} 
            alt="Credify Logo" 
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 0 15px rgba(37, 99, 235, 0.35)',
            }}
          />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#ffffff',
          }}>
            Credify
          </span>
        </div>

        {/* Eyebrow badge */}
        <span style={{
          background: 'rgba(37,99,235,0.1)',
          border: '1px solid rgba(37,99,235,0.22)',
          padding: '5px 14px',
          borderRadius: '9999px',
          fontSize: '11px',
          color: '#93c5fd',
          fontWeight: 600,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          fontFamily: 'var(--font-display)',
        }}>
          <ShieldCheck size={11} />
          Credify v1.0 &middot; Base Sepolia
        </span>

        {/* Heading */}
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800,
          lineHeight: 1.18,
          letterSpacing: '-0.03em',
          color: '#fff',
          margin: 0,
          fontFamily: 'var(--font-display)',
        }}>
          Onchain Reputation,{' '}
          <span style={{
            background: 'linear-gradient(130deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Without the Gas.
          </span>
        </h1>

        {/* Body copy */}
        <p style={{
          fontSize: 'clamp(14px, 1.75vw, 15.5px)',
          color: 'rgba(255,255,255,0.52)',
          lineHeight: 1.75,
          maxWidth: '460px',
          margin: '0 auto',
          fontFamily: 'var(--font-body)',
          fontWeight: 400,
        }}>
          Issue and claim verifiable onchain badges for hackathons and events —
          fully gasless via the Universal Gas Framework on Base Sepolia.
        </p>

        {/* CTA row */}
        <div style={{
          marginTop: '6px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <div className="get-started-btn-wrapper">
            <Link
              to="/home"
              onClick={handleGetStartedClick}
              className={`get-started-btn ${isClicked ? 'clicked' : ''}`}
            >
              <div className="get-started-btn-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1024 1024"
                  height="22px"
                  width="22px"
                >
                  <path
                    d="M800 480H160a32 32 0 1 0 0 64h640a32 32 0 1 0 0-64z"
                    fill="#ffffff"
                  ></path>
                  <path
                    d="m786.752 512-265.408 265.344a32 32 0 0 0 45.312 45.312l288-288a32 32 0 0 0 0-45.312l-288-288a32 32 0 1 0-45.312 45.312L786.752 512z"
                    fill="#ffffff"
                  ></path>
                </svg>
              </div>
              <span className="get-started-btn-text">Get Started</span>
            </Link>
          </div>

          <button
            onClick={() => setShowGuide(true)}
            className="new-here-btn"
            type="button"
          >
            I'm new here
          </button>
        </div>

        {/* Fine print */}
        <p style={{
          fontSize: '11.5px',
          color: 'rgba(255,255,255,0.18)',
          margin: 0,
          fontFamily: 'var(--font-body)',
          letterSpacing: '0.02em',
        }}>
          Zero ETH required &nbsp;&middot;&nbsp; Built on Base Sepolia
        </p>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes lp-float-a {
          from { transform: translateY(0px) translateX(0px); }
          to   { transform: translateY(-28px) translateX(18px); }
        }
        @keyframes lp-float-b {
          from { transform: translateY(0px) translateX(0px); }
          to   { transform: translateY(22px) translateX(-14px); }
        }
      `}</style>

      {/* ── Beginner's Guide Glassmorphism Modal ── */}
      {showGuide && (
        <div className="guide-overlay" onClick={() => setShowGuide(false)}>
          <div className="guide-modal" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button 
              className="guide-close-btn"
              onClick={() => setShowGuide(false)}
              aria-label="Close guide"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="guide-header">
              <h2 className="guide-title">Getting Started</h2>
              <p className="guide-subtitle">
                Follow these three simple steps to claim your digital event badges gaslessly.
              </p>
            </div>

            {/* Step Cards Grid */}
            <div className="guide-cards-grid">
              {/* Step 1 */}
              <div className="guide-step-card">
                <div className="guide-card-header">
                  <div className="guide-card-icon-wrapper">
                    <Wallet size={20} />
                  </div>
                  <h3 className="guide-card-title">Connect MetaMask</h3>
                  <p className="guide-card-desc">
                    Use your installed MetaMask wallet to securely manage and claim credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowGuide(false);
                    navigate('/claim');
                  }}
                  className="guide-card-btn guide-card-btn-metamask"
                >
                  Continue to Connect
                </button>
              </div>

              {/* Step 2 */}
              <div className="guide-step-card">
                <div className="guide-card-header">
                  <div className="guide-card-icon-wrapper">
                    <Coins size={20} />
                  </div>
                  <h3 className="guide-card-title">Get Test ETH</h3>
                  <p className="guide-card-desc">
                    Request free Base Sepolia testnet ETH from the Optimism console faucet.
                  </p>
                </div>
                <a 
                  href="https://console.optimism.io/faucet" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="guide-card-btn guide-card-btn-eth"
                >
                  Get Free ETH
                </a>
              </div>

              {/* Step 3 */}
              <div className="guide-step-card">
                <div className="guide-card-header">
                  <div className="guide-card-icon-wrapper">
                    <Award size={20} />
                  </div>
                  <h3 className="guide-card-title">Claim Now</h3>
                  <p className="guide-card-desc">
                    Go to the Claim Pass page to claim your badge on Base Sepolia.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowGuide(false);
                    navigate('/claim');
                  }}
                  className="guide-card-btn guide-card-btn-claim"
                >
                  Claim Badge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
