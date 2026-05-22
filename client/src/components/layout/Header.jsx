import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ShieldCheck } from 'lucide-react';
import ConnectWalletButton from '../wallet/ConnectWalletButton.jsx';
import NetworkBadge from '../wallet/NetworkBadge.jsx';

const NAV = [
  { label: 'Home',           to: '/home' },
  { label: 'Claim Pass',     to: '/claim' },
  { label: 'My Credentials', to: '/my-credentials' },
  { label: 'Verify',         to: '/verify' },
  { label: 'Organizer',      to: '/organizer/login' },
];

export default function Header() {
  const { pathname } = useLocation();
  const { isConnected } = useAccount();
  const navRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0, opacity: 0 });

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
    <header className="app-header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <div className="logo-icon">
            <ShieldCheck size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="logo-text">Credify</span>
        </Link>

        {/* Nav */}
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
                style={{
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="header-actions">
          {isConnected && <NetworkBadge />}
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
