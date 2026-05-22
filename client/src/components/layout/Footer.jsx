import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src={logo} 
            alt="Credify Logo" 
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-muted)' }}>
            Credify
          </span>
        </div>

        {/* Links */}
        <div className="footer-links">
          {[
            { label: 'Home',           to: '/'            },
            { label: 'Claim Pass',     to: '/claim'       },
            { label: 'My Credentials', to: '/my-credentials' },
            { label: 'Verify',         to: '/verify'      },
          ].map(({ label, to }) => (
            <Link key={to} to={to} className="footer-link">{label}</Link>
          ))}
          <a
            href="https://sepolia.basescan.org"
            target="_blank" rel="noreferrer"
            className="footer-link"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Basescan <ExternalLink size={11} />
          </a>
        </div>

        {/* Attribution */}
        <p className="footer-text">Base Sepolia · UGF</p>
      </div>
    </footer>
  );
}
