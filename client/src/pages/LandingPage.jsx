import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, X, Wallet, Coins, Award, BarChart3, Settings2, BadgeCheck, Share2, ChevronRight, Zap, Users } from 'lucide-react';
import logo from '../assets/logo.png';

const ORGANIZER_FEATURES = [
  { icon: BarChart3,  color: '#818cf8', label: 'Live Analytics',        desc: 'Real-time claim rates, tier distribution, and mint timelines.' },
  { icon: Settings2,  color: '#34d399', label: 'Contract Registry',     desc: 'Onboard your own contract or deploy a factory badge contract on Base.' },
  { icon: BadgeCheck, color: '#f9a8d4', label: 'Badge Verification',    desc: 'Public verification page for any issued credential by token or wallet.' },
  { icon: Share2,     color: '#fbbf24', label: 'Profile Sharing',       desc: 'Participants can embed badges in GitHub README or LinkedIn certifications.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const organizersRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const heroEndScroll = vh * 0.6;
  const heroProgress = Math.min(1, Math.max(0, scrollY / (heroEndScroll || 1)));
  const heroOpacity = 1 - heroProgress;
  const heroTranslateY = -heroProgress * 80;

  const organizerEndScroll = vh * 0.8;
  const organizerProgress = Math.min(1, Math.max(0, scrollY / (organizerEndScroll || 1)));
  const organizerContentOpacity = organizerProgress;
  const organizerContentTranslateY = (1 - organizerProgress) * 100;

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      overflowX: 'hidden',
      background: '#09090f',
    }}>

      {/* ── Ambient background layers ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-18%', left: '-12%',
          width: '64vw', height: '64vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 65%)',
          filter: 'blur(48px)',
          animation: 'lp-float-a 14s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', bottom: '-12%', right: '-8%',
          width: '52vw', height: '52vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.16) 0%, transparent 65%)',
          filter: 'blur(56px)',
          animation: 'lp-float-b 18s ease-in-out infinite alternate-reverse',
        }} />
        <div style={{
          position: 'absolute', top: '38%', left: '42%',
          width: '28vw', height: '28vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          filter: 'blur(64px)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)',
        }} />
      </div>

      {/* ── Hero section (Slide 1) ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 60px',
        opacity: heroOpacity,
        transform: `translateY(${heroTranslateY}px)`,
        transition: 'opacity 0.15s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: heroOpacity < 0.1 ? 'none' : 'auto',
        boxSizing: 'border-box',
      }}>
        {/* Soft radial glow under headline — not a box */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -56%)',
          width: '700px', height: '400px',
          background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(37,99,235,0.09) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: '680px',
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px',
        }}>
          {/* Brand mark — fade in first */}
          <div className="lp-fade-0" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginBottom: '28px',
          }}>
            <img src={logo} alt="Credify Logo" style={{
              width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover',
              border: '1.5px solid rgba(255,255,255,0.12)',
              boxShadow: '0 0 18px rgba(37,99,235,0.3)',
            }} />
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '20px',
              fontWeight: 800, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.88)',
            }}>Credify</span>
          </div>

          {/* Eyebrow pill — fade in second */}
          <span className="lp-fade-1" style={{
            background: 'rgba(37,99,235,0.08)',
            border: '1px solid rgba(37,99,235,0.2)',
            padding: '5px 15px', borderRadius: '9999px',
            fontSize: '11px', color: '#93c5fd', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            fontFamily: 'var(--font-display)',
            backdropFilter: 'blur(8px)',
            marginBottom: '28px',
          }}>
            <ShieldCheck size={10} />
            Credify v1.0 &middot; Base Sepolia
          </span>

          {/* Main headline — fade in third */}
          <h1 className="lp-fade-2" style={{
            fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
            fontWeight: 900, lineHeight: 1.12,
            letterSpacing: '-0.04em', color: '#fff',
            margin: '0 0 22px', fontFamily: 'var(--font-display)',
          }}>
            Onchain Reputation,{' '}
            <br />
            <span style={{
              background: 'linear-gradient(130deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Without the Gas.
            </span>
          </h1>

          {/* Subline — fade in fourth */}
          <p className="lp-fade-3" style={{
            fontSize: 'clamp(14.5px, 1.8vw, 16px)',
            color: 'rgba(255,255,255,0.46)',
            lineHeight: 1.8, maxWidth: '420px',
            margin: '0 auto 44px',
            fontFamily: 'var(--font-body)', fontWeight: 400,
          }}>
            Issue and claim verifiable onchain badges for hackathons and events —
            fully gasless via the Universal Gas Framework.
          </p>

          {/* CTA row — fade in fifth */}
          <div className="lp-fade-4" style={{
            display: 'flex', gap: '14px', alignItems: 'center',
            flexWrap: 'wrap', justifyContent: 'center',
            marginBottom: '28px',
          }}>
            <div className="get-started-btn-wrapper">
              <Link to="/home" className="get-started-btn">
                <div className="get-started-btn-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" height="20px" width="20px">
                    <path d="M800 480H160a32 32 0 1 0 0 64h640a32 32 0 1 0 0-64z" fill="#ffffff" />
                    <path d="m786.752 512-265.408 265.344a32 32 0 0 0 45.312 45.312l288-288a32 32 0 0 0 0-45.312l-288-288a32 32 0 1 0-45.312 45.312L786.752 512z" fill="#ffffff" />
                  </svg>
                </div>
                <span className="get-started-btn-text">Get Started</span>
              </Link>
            </div>
            <button onClick={() => setShowGuide(true)} className="new-here-btn" type="button">
              I'm new here
            </button>
          </div>

          {/* Helper text — fade last */}
          <p className="lp-fade-5" style={{
            fontSize: '11.5px', color: 'rgba(255,255,255,0.15)',
            margin: 0, fontFamily: 'var(--font-body)', letterSpacing: '0.04em',
          }}>
            Zero ETH required &nbsp;&middot;&nbsp; Built on Base Sepolia
          </p>
        </div>
      </div>

      {/* ── Slide 2: Next content section (Organizer) ── */}
      <div 
        ref={organizersRef}
        style={{
          position: 'relative',
          zIndex: 2,
          background: '#09090f',
          minHeight: '100vh',
          padding: '80px 20px 100px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 -24px 60px rgba(0, 0, 0, 0.8)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Soft separator */}
        <div style={{
          maxWidth: '560px',
          margin: '0 auto 60px',
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)',
        }} />

        {/* Cinematic Fade/Slide Content Wrapper */}
        <div style={{
          opacity: organizerContentOpacity,
          transform: `translateY(${organizerContentTranslateY}px)`,
          transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          width: '100%',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)',
              padding: '5px 14px', borderRadius: '9999px',
              fontSize: '11px', color: '#a5b4fc', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: '20px',
            }}>
              <Users size={11} /> For Organizers
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.025em', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>
              Run your entire event{' '}
              <span style={{ background: 'linear-gradient(130deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>onchain.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
              Credify gives organizers a full suite of tools — from contract setup to live analytics and third-party integrations.
            </p>
          </div>

          {/* Feature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {ORGANIZER_FEATURES.map(({ icon: Icon, color, label, desc }) => (
              <div key={label} className="glass-panel" style={{
                padding: '22px', borderRadius: '16px',
                background: 'rgba(10,10,20,0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4), 0 0 24px ${color}20`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: `${color}12`, border: `1px solid ${color}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '14px',
                }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: '#fff', fontFamily: 'var(--font-display)' }}>{label}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Organizer CTA cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>

            {/* Login card */}
            <Link to="/organizer/login" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '28px 24px',
                background: 'rgba(37,99,235,0.06)',
                border: '1px solid rgba(37,99,235,0.18)',
                borderRadius: '18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.45)'; e.currentTarget.style.background = 'rgba(37,99,235,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.18)'; e.currentTarget.style.background = 'rgba(37,99,235,0.06)'; e.currentTarget.style.transform = ''; }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Wallet size={16} style={{ color: '#60a5fa' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Organizer Login</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>Sign in with your Ethereum wallet to access the organizer portal.</p>
                </div>
                <ChevronRight size={18} style={{ color: '#60a5fa', flexShrink: 0, marginLeft: '12px' }} />
              </div>
            </Link>

            {/* Dashboard card */}
            <Link to="/organizer/dashboard" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '28px 24px',
                background: 'rgba(129,140,248,0.06)',
                border: '1px solid rgba(129,140,248,0.18)',
                borderRadius: '18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.45)'; e.currentTarget.style.background = 'rgba(129,140,248,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.18)'; e.currentTarget.style.background = 'rgba(129,140,248,0.06)'; e.currentTarget.style.transform = ''; }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Zap size={16} style={{ color: '#a5b4fc' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#a5b4fc', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Dashboard</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>Manage events, participants, upgrades, analytics, and integrations.</p>
                </div>
                <ChevronRight size={18} style={{ color: '#a5b4fc', flexShrink: 0, marginLeft: '12px' }} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes lp-float-a { from { transform: translateY(0px) translateX(0px); } to { transform: translateY(-28px) translateX(18px); } }
        @keyframes lp-float-b { from { transform: translateY(0px) translateX(0px); } to { transform: translateY(22px) translateX(-14px); } }

        @keyframes lp-fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lp-fade-0 { animation: lp-fade-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .lp-fade-1 { animation: lp-fade-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .lp-fade-2 { animation: lp-fade-up 0.8s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
        .lp-fade-3 { animation: lp-fade-up 0.8s cubic-bezier(0.22,1,0.36,1) 0.38s both; }
        .lp-fade-4 { animation: lp-fade-up 0.8s cubic-bezier(0.22,1,0.36,1) 0.50s both; }
        .lp-fade-5 { animation: lp-fade-up 0.8s cubic-bezier(0.22,1,0.36,1) 0.62s both; }
      `}</style>

      {/* ── Beginner's Guide Modal ── */}
      {showGuide && (
        <div className="guide-overlay" onClick={() => setShowGuide(false)}>
          <div className="guide-modal" onClick={(e) => e.stopPropagation()}>
            <button className="guide-close-btn" onClick={() => setShowGuide(false)} aria-label="Close guide"><X size={18} /></button>
            <div className="guide-header">
              <h2 className="guide-title">Getting Started</h2>
              <p className="guide-subtitle">Follow these three simple steps to claim your digital event badges gaslessly.</p>
            </div>
            <div className="guide-cards-grid">
              <div className="guide-step-card">
                <div className="guide-card-header">
                  <div className="guide-card-icon-wrapper"><Wallet size={20} /></div>
                  <h3 className="guide-card-title">Download MetaMask</h3>
                  <p className="guide-card-desc">Install the MetaMask browser extension or mobile app to securely manage and claim credentials.</p>
                </div>
                <a href="https://metamask.io/download" target="_blank" rel="noopener noreferrer" className="guide-card-btn guide-card-btn-metamask">Download MetaMask</a>
              </div>
              <div className="guide-step-card">
                <div className="guide-card-header">
                  <div className="guide-card-icon-wrapper"><Coins size={20} /></div>
                  <h3 className="guide-card-title">Get Test ETH</h3>
                  <p className="guide-card-desc">Request free Base Sepolia testnet ETH from the Optimism console faucet.</p>
                </div>
                <a href="https://console.optimism.io/faucet" target="_blank" rel="noopener noreferrer" className="guide-card-btn guide-card-btn-eth">Get Free ETH</a>
              </div>
              <div className="guide-step-card">
                <div className="guide-card-header">
                  <div className="guide-card-icon-wrapper"><Award size={20} /></div>
                  <h3 className="guide-card-title">Claim Now</h3>
                  <p className="guide-card-desc">Go to the Claim Pass page to claim your badge on Base Sepolia.</p>
                </div>
                <button onClick={() => { setShowGuide(false); navigate('/claim'); }} className="guide-card-btn guide-card-btn-claim">Claim Badge</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
