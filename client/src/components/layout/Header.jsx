import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ShieldCheck, Home, Award, Wallet, Search, Shield } from 'lucide-react';
import ConnectWalletButton from '../wallet/ConnectWalletButton.jsx';
import NetworkBadge from '../wallet/NetworkBadge.jsx';
import logo from '../../assets/logo.png';

const NAV = [
  { label: 'Home',           to: '/home',              icon: Home },
  { label: 'Claim Pass',     to: '/claim',             icon: Award },
  { label: 'My Credentials', to: '/my-credentials',    icon: Wallet },
  { label: 'Verify',         to: '/verify',            icon: Search },
  { label: 'Organizer',      to: '/organizer/login',   icon: Shield },
];

export default function Header() {
  const { pathname } = useLocation();
  const { isConnected } = useAccount();
  const navRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Close menu on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (navRef.current) {
      const activeIndex = NAV.findIndex(({ to }) => {
        if (to === '/') return pathname === '/';
        return pathname.startsWith(to);
      });

      if (activeIndex !== -1) {
        const navLinks = navRef.current.querySelectorAll('.nav-link');
        const activeLink = navLinks[activeIndex];
        if (activeLink) {
          setSliderStyle({
            left: `${activeLink.offsetLeft}px`,
            width: `${activeLink.offsetWidth}px`,
            opacity: 1,
          });
          return;
        }
      }
      setSliderStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [pathname]);

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          {/* Logo */}
          <Link to="/" className="header-logo">
            <img 
              src={logo} 
              alt="Credify Logo" 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 0 10px rgba(37, 99, 235, 0.25)',
              }}
            />
            <span className="logo-text">Credify</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header-nav" ref={navRef}>
            {/* Sliding dark capsule background */}
            <div
              className="nav-slider"
              style={{
                position: 'absolute',
                left: sliderStyle.left,
                width: sliderStyle.width,
                opacity: sliderStyle.opacity,
                height: 'calc(100% - 8px)',
                top: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'left 0.3s cubic-bezier(0.25, 1, 0.5, 1), width 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
            {NAV.map(({ label, to }) => {
              const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`nav-link ${active ? 'active' : ''}`}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="header-actions">
            {isConnected && <NetworkBadge />}
            <ConnectWalletButton />

            {/* Hamburger — mobile only */}
            <button
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="mobile-nav-overlay"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="mobile-nav-drawer" role="navigation">
            {NAV.map(({ label, to, icon: Icon }) => {
              const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`mobile-nav-link ${active ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}

            {/* Wallet connect inside drawer */}
            <div className="mobile-nav-divider" />
            <div style={{ padding: '4px 8px' }}>
              <ConnectWalletButton style={{ width: '100%' }} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
