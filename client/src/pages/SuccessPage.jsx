import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ExternalLink, Award, Compass, Download, Twitter } from 'lucide-react';

export default function SuccessPage() {
  const [params] = useSearchParams();
  const tokenId  = params.get('tokenId') || Math.floor(Math.random() * 500 + 1);
  const txHash   = params.get('txHash')  || '0x' + 'a'.repeat(64);
  const eventName= params.get('event')   || 'Credify Base Sepolia Workshop';
  const [show, setShow] = useState(false);

  useEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t); }, []);

  const escapeXml = (unsafe) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const downloadBadgeSvg = () => {
    const decodedEventName = decodeURIComponent(eventName);
    const escapedEventName = escapeXml(decodedEventName);
    
    // Split text into up to 2 lines for better layout
    let line1 = escapedEventName;
    let line2 = '';
    if (escapedEventName.length > 22) {
      const lastSpace = escapedEventName.lastIndexOf(' ', 22);
      if (lastSpace !== -1) {
        line1 = escapedEventName.substring(0, lastSpace);
        line2 = escapedEventName.substring(lastSpace + 1);
      } else {
        line1 = escapedEventName.substring(0, 22) + '...';
      }
    }

    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">' +
  '<defs>' +
    '<!-- Deep premium background gradient -->' +
    '<linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#0a0f1d" />' +
      '<stop offset="60%" stop-color="#070a13" />' +
      '<stop offset="100%" stop-color="#020408" />' +
    '</linearGradient>' +
    '<!-- Neon border/glow gradient -->' +
    '<linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#3b82f6" />' +
      '<stop offset="40%" stop-color="#1d4ed8" />' +
      '<stop offset="60%" stop-color="#7c3aed" />' +
      '<stop offset="100%" stop-color="#10b981" />' +
    '</linearGradient>' +
    '<!-- Gold/cyan highlights for text -->' +
    '<linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="#60a5fa" />' +
      '<stop offset="100%" stop-color="#a78bfa" />' +
    '</linearGradient>' +
    '<!-- Soft glow filter -->' +
    '<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feGaussianBlur stdDeviation="18" result="blur" />' +
      '<feComposite in="SourceGraphic" in2="blur" operator="over" />' +
    '</filter>' +
  '</defs>' +
  '<!-- Card Border -->' +
  '<rect x="10" y="10" width="380" height="480" rx="28" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="2.5" />' +
  '<!-- Futuristic corner accents -->' +
  '<path d="M 12 40 L 12 24 A 12 12 0 0 1 24 12 L 40 12" stroke="#60a5fa" stroke-width="2.5" fill="none" opacity="0.8" />' +
  '<path d="M 388 40 L 388 24 A 12 12 0 0 0 376 12 L 360 12" stroke="#60a5fa" stroke-width="2.5" fill="none" opacity="0.8" />' +
  '<path d="M 12 460 L 12 476 A 12 12 0 0 0 24 488 L 40 488" stroke="#7c3aed" stroke-width="2.5" fill="none" opacity="0.8" />' +
  '<path d="M 388 460 L 388 476 A 12 12 0 0 1 376 488 L 360 488" stroke="#7c3aed" stroke-width="2.5" fill="none" opacity="0.8" />' +
  '<!-- Radial grid backdrop decoration -->' +
  '<circle cx="200" cy="180" r="160" fill="none" stroke="#1e293b" stroke-width="0.75" opacity="0.4" stroke-dasharray="4,4" />' +
  '<circle cx="200" cy="180" r="120" fill="none" stroke="#334155" stroke-width="0.75" opacity="0.3" />' +
  '<circle cx="200" cy="180" r="80" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.2" />' +
  '<!-- Glowing core background -->' +
  '<circle cx="200" cy="180" r="45" fill="#3b82f6" opacity="0.2" filter="url(#glow)" />' +
  '<circle cx="200" cy="180" r="35" fill="#7c3aed" opacity="0.15" filter="url(#glow)" />' +
  '<!-- Logo/Header -->' +
  '<text x="200" y="55" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="14" fill="#94a3b8" letter-spacing="6" text-anchor="middle" opacity="0.8">CREDIFY</text>' +
  '<line x1="170" y1="65" x2="230" y2="65" stroke="#334155" stroke-width="1" />' +
  '<!-- Badge Icon in Center -->' +
  '<g transform="translate(160, 140)">' +
    '<!-- Hexagonal or outer ring -->' +
    '<polygon points="40,2 78,22 78,64 40,84 2,64 2,22" fill="#111827" stroke="url(#textGrad)" stroke-width="2.5" />' +
    '<!-- Central Icon: Compass/Star -->' +
    '<path d="M 40,16 L 44.5,35.5 L 64,40 L 44.5,44.5 L 40,64 L 35.5,44.5 L 16,40 L 35.5,35.5 Z" fill="url(#textGrad)" />' +
    '<circle cx="40" cy="40" r="5" fill="#ffffff" />' +
  '</g>' +
  '<!-- Tag / Tier Badge -->' +
  '<rect x="145" y="252" width="110" height="24" rx="12" fill="#1e3a8a" stroke="#2563eb" stroke-width="1.5" opacity="0.8" />' +
  '<text x="200" y="268" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="10" fill="#93c5fd" letter-spacing="2" text-anchor="middle">EVENT PASS</text>' +
  '<!-- Event Title line 1 -->' +
  '<text x="200" y="312" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="' + (line2 ? '19' : '22') + '" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">' +
    line1 +
  '</text>' +
  '<!-- Event Title line 2 (optional) -->' +
  (line2 ? '<text x="200" y="338" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="19" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">' + line2 + '</text>' : '') +
  '<!-- Date -->' +
  '<text x="200" y="' + (line2 ? '375' : '360') + '" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="13" fill="#64748b" text-anchor="middle">May 30, 2026</text>' +
  '<!-- Bottom Details Block -->' +
  '<rect x="30" y="415" width="340" height="50" rx="12" fill="#0b0f19" stroke="#1e293b" stroke-width="1" />' +
  '<text x="50" y="445" font-family="monospace" font-weight="700" font-size="13" fill="#94a3b8">#' + tokenId.toString().padStart(4, '0') + '</text>' +
  '<!-- Network status pill -->' +
  '<g transform="translate(255, 431)">' +
    '<rect width="95" height="18" rx="9" fill="#10b981" opacity="0.1" />' +
    '<circle cx="10" cy="9" r="3.5" fill="#10b981" />' +
    '<text x="22" y="13" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="9" fill="#34d399" letter-spacing="0.5">BASE SEPOLIA</text>' +
  '</g>' +
'</svg>';

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Credify_Badge_${tokenId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareOnX = () => {
    const decodedEventName = decodeURIComponent(eventName);
    const text = `I just claimed my onchain Event Pass for "${decodedEventName}" (Token #${tokenId}) gaslessly via @CredifyApp on Base! 🚀🛡️\n\nVerify or claim yours here: ${window.location.origin}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
          <button onClick={downloadBadgeSvg} className="btn btn-ghost">
            <Download size={14} /> Download
          </button>
          <button onClick={handleShareOnX} className="btn btn-primary">
            <Twitter size={14} /> Share on X
          </button>
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
