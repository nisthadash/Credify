import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ExternalLink, Share2, Award, Compass } from 'lucide-react';

export default function SuccessPage() {
  const [params] = useSearchParams();
  const tokenId  = params.get('tokenId') || Math.floor(Math.random() * 500 + 1);
  const txHash   = params.get('txHash')  || '0x' + 'a'.repeat(64);
  const eventName= params.get('event')   || 'Credify Base Sepolia Workshop';
  const [show, setShow] = useState(false);

  useEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t); }, []);

  const handleShare = () => {
    const text = `I just claimed onchain credential #${tokenId} on @CredifyApp (Base Sepolia) — gasless via UGF`;
    if (navigator.share) navigator.share({ title: 'My Credify Credential', text }).catch(() => {});
    else { navigator.clipboard.writeText(text); }
  };

  return (
    <div className="page-content">
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)' }}>

        {/* Check mark */}
        <div className={show ? 'animate-pop-in' : ''} style={{
          width: 68, height: 68, borderRadius: '50%', margin: '0 auto 20px',
          background: 'var(--success-soft)', border: '1.5px solid rgba(34,197,94,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: show ? 1 : 0,
        }}>
          <CheckCircle2 size={32} color="#22C55E" />
        </div>

        {/* Headline */}
        <div className={show ? 'animate-fade-up' : ''} style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', marginBottom: '10px' }}>
            Credential <span className="gradient-text">Claimed!</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
            Minted gaslessly on Base Sepolia via UGF. You paid zero ETH.
          </p>
        </div>

        {/* Badge preview */}
        <div className={`card ${show ? 'animate-fade-up delay-100' : ''}`} style={{ padding: 'clamp(20px, 5vw, 32px)', marginBottom: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
            background: 'var(--primary-soft)', border: '2px solid rgba(37,99,235,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Compass size={32} style={{ color: 'var(--primary)' }} /></div>
          <span style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 99, marginBottom: '14px',
            background: 'var(--primary-soft)', color: '#93c5fd',
            fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>Event Pass</span>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', marginBottom: '6px' }}>
            {decodeURIComponent(eventName)}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-subtle)', marginBottom: '16px' }}>May 30, 2026</p>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)' }}>Token #{tokenId}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Credify · Base Sepolia
            </span>
          </div>
        </div>

        {/* Mint details */}
        <div className={`card ${show ? 'animate-fade-up delay-200' : ''}`} style={{ padding: '24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '18px' }}>
            Mint Details
          </p>
          <div className="grid-2col" style={{ gap: '18px', marginBottom: '18px' }}>
            <DItem label="NFT Token ID"      value={`#${tokenId}`}  mono />
            <DItem label="Credential Tier"   value="Event Pass (Tier 0)" />
            <DItem label="Network"           value="Base Sepolia" />
            <DItem label="Gas Paid"          value="0 ETH" />
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', fontWeight: 600 }}>
              Transaction Hash
            </p>
            <a
              href={`https://sepolia.basescan.org/tx/${txHash}`}
              target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'var(--font-mono)', fontSize: '12px',
                color: '#93c5fd', textDecoration: 'none', wordBreak: 'break-all',
              }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              {txHash} <ExternalLink size={11} style={{ flexShrink: 0 }} />
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className={`grid-3col ${show ? 'animate-fade-up delay-300' : ''}`}
          style={{ gap: '10px', marginBottom: '20px' }}>
          <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noreferrer"
            className="btn btn-ghost" style={{ textDecoration: 'none' }}>
            <ExternalLink size={14} /> Explorer
          </a>
          <button onClick={handleShare} className="btn btn-ghost">
            <Share2 size={14} /> Share
          </button>
          <Link to="/my-credentials" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Award size={14} /> My Creds
          </Link>
        </div>

        {/* Zero ETH note */}
        <div style={{
          padding: '12px 16px', borderRadius: 8,
          background: 'var(--success-soft)', border: '1px solid rgba(34,197,94,0.2)',
          textAlign: 'center', fontSize: '13px', color: '#86efac',
        }}>
          Minted gaslessly — you paid <strong>0 ETH</strong>. Gas covered by UGF via Mock USD.
        </div>
      </div>
    </div>
  );
}

function DItem({ label, value, mono }) {
  return (
    <div>
      <p style={{ fontSize: '11px', color: 'var(--text-subtle)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</p>
      <p style={{ fontWeight: 600, color: 'var(--text)', fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontSize: '14px' }}>{value}</p>
    </div>
  );
}
