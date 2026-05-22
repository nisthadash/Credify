import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 28, height: 28, background: 'var(--primary)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={15} color="#fff" strokeWidth={2.5} />
          </div>
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
