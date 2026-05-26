import React from 'react';
import { ExternalLink, ArrowUp, Compass, Flame, Star, Award, CheckCircle2, Download, Twitter } from 'lucide-react';

const TIER_COLORS = {
  0: '#93c5fd', 1: '#a5b4fc', 2: '#d8b4fe', 3: '#f9a8d4', 4: '#86efac',
};
const TIER_ICONS = { 0: Compass, 1: Flame, 2: Star, 3: Award, 4: CheckCircle2 };
const TIER_NAMES = { 0: 'Event Pass', 1: 'Participant Badge', 2: 'Finalist Badge', 3: 'Winner Certificate', 4: 'Mentor / Volunteer' };

export default function CredentialCard({ credential, onUpgrade }) {
  const { tokenId, tierLevel = 0, txHash } = credential;
  const eventName = credential.eventName || (credential.eventId && typeof credential.eventId === 'object' ? credential.eventId.title : 'Credify Event');
  const eventDate = credential.eventDate || (credential.eventId && typeof credential.eventId === 'object' ? credential.eventId.date : null);
  const color    = TIER_COLORS[tierLevel] || '#93c5fd';
  const Icon     = TIER_ICONS[tierLevel]  || Compass;
  const tierName = TIER_NAMES[tierLevel]  || 'Event Pass';
  const canUpgrade = tierLevel < 4 && onUpgrade;

  const dateObj = eventDate ? new Date(eventDate) : new Date();
  const issueYear = dateObj.getFullYear();
  const issueMonth = dateObj.getMonth() + 1;
  const certUrl = `${window.location.origin}/verify?tokenId=${tokenId}`;
  const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(eventName + ' - ' + tierName)}&organizationName=Credify&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(certUrl)}&certId=${tokenId}`;

  const cleanEventName = eventName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanTierName = tierName.replace(/[^a-zA-Z0-9]/g, '_');
  const githubMarkdown = `[![Credify Badge](https://img.shields.io/badge/Credify-${cleanEventName}_${cleanTierName}-blue?style=for-the-badge&logo=ethereum)](${certUrl})`;

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
    const escapedEventName = escapeXml(eventName);
    
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

    const formattedDate = eventDate
      ? new Date(eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'May 30, 2026';

    const textGradStop1 = color;
    const textGradStop2 = '#a78bfa';

    // Different icons for SVG depending on tier
    const svgIcon = tierLevel === 0 
      ? '<path d="M 40,16 L 44.5,35.5 L 64,40 L 44.5,44.5 L 40,64 L 35.5,44.5 L 16,40 L 35.5,35.5 Z" fill="url(#textGrad)" />'
      : tierLevel === 1
      ? '<path d="M 40,16 Q 48,32 40,56 Q 32,32 40,16 Z M 40,24 Q 45,36 40,52 Q 35,36 40,24 Z" fill="url(#textGrad)" />' // Flame shape
      : tierLevel === 2
      ? '<path d="M 40,15 L 47,30 L 64,32 L 52,44 L 55,60 L 40,52 L 25,60 L 28,44 L 16,32 L 33,30 Z" fill="url(#textGrad)" />' // Star
      : tierLevel === 3
      ? '<path d="M 24,20 L 56,20 L 56,36 L 40,52 L 24,36 Z M 32,52 L 48,52 L 48,60 L 32,60 Z" fill="url(#textGrad)" />' // Trophy/Award
      : '<path d="M 22,40 L 34,52 L 58,28 M 22,40" fill="none" stroke="url(#textGrad)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />'; // Checkmark

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
      `<stop offset="0%" stop-color="${color}" />` +
      '<stop offset="40%" stop-color="#1d4ed8" />' +
      '<stop offset="60%" stop-color="#7c3aed" />' +
      '<stop offset="100%" stop-color="#10b981" />' +
    '</linearGradient>' +
    '<!-- Gold/cyan highlights for text -->' +
    '<linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
      `<stop offset="0%" stop-color="${textGradStop1}" />` +
      `<stop offset="100%" stop-color="${textGradStop2}" />` +
    '</linearGradient>' +
    '<!-- Soft glow filter -->' +
    '<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">' +
      `<feGaussianBlur stdDeviation="18" result="blur" />` +
      '<feComposite in="SourceGraphic" in2="blur" operator="over" />' +
    '</filter>' +
  '</defs>' +
  '<!-- Card Border -->' +
  '<rect x="10" y="10" width="380" height="480" rx="28" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="2.5" />' +
  '<!-- Futuristic corner accents -->' +
  `<path d="M 12 40 L 12 24 A 12 12 0 0 1 24 12 L 40 12" stroke="${color}" stroke-width="2.5" fill="none" opacity="0.8" />` +
  `<path d="M 388 40 L 388 24 A 12 12 0 0 0 376 12 L 360 12" stroke="${color}" stroke-width="2.5" fill="none" opacity="0.8" />` +
  '<path d="M 12 460 L 12 476 A 12 12 0 0 0 24 488 L 40 488" stroke="#7c3aed" stroke-width="2.5" fill="none" opacity="0.8" />' +
  '<path d="M 388 460 L 388 476 A 12 12 0 0 1 376 488 L 360 488" stroke="#7c3aed" stroke-width="2.5" fill="none" opacity="0.8" />' +
  '<!-- Radial grid backdrop decoration -->' +
  '<circle cx="200" cy="180" r="160" fill="none" stroke="#1e293b" stroke-width="0.75" opacity="0.4" stroke-dasharray="4,4" />' +
  '<circle cx="200" cy="180" r="120" fill="none" stroke="#334155" stroke-width="0.75" opacity="0.3" />' +
  `<circle cx="200" cy="180" r="80" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.2" />` +
  '<!-- Glowing core background -->' +
  `<circle cx="200" cy="180" r="45" fill="${color}" opacity="0.2" filter="url(#glow)" />` +
  '<circle cx="200" cy="180" r="35" fill="#7c3aed" opacity="0.15" filter="url(#glow)" />' +
  '<!-- Logo/Header -->' +
  '<text x="200" y="55" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="14" fill="#94a3b8" letter-spacing="6" text-anchor="middle" opacity="0.8">CREDIFY</text>' +
  '<line x1="170" y1="65" x2="230" y2="65" stroke="#334155" stroke-width="1" />' +
  '<!-- Badge Icon in Center -->' +
  '<g transform="translate(160, 140)">' +
    '<!-- Hexagonal or outer ring -->' +
    '<polygon points="40,2 78,22 78,64 40,84 2,64 2,22" fill="#111827" stroke="url(#textGrad)" stroke-width="2.5" />' +
    '<!-- Central Icon -->' +
    svgIcon +
    (tierLevel !== 4 ? '<circle cx="40" cy="40" r="5" fill="#ffffff" />' : '') +
  '</g>' +
  '<!-- Tag / Tier Badge -->' +
  `<rect x="100" y="252" width="200" height="24" rx="12" fill="#1e3a8a" stroke="${color}" stroke-width="1.5" opacity="0.8" />` +
  `<text x="200" y="268" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="10" fill="#93c5fd" letter-spacing="2" text-anchor="middle">${tierName.toUpperCase()}</text>` +
  '<!-- Event Title line 1 -->' +
  '<text x="200" y="312" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="' + (line2 ? '19' : '22') + '" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">' +
    line1 +
  '</text>' +
  '<!-- Event Title line 2 (optional) -->' +
  (line2 ? '<text x="200" y="338" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="19" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">' + line2 + '</text>' : '') +
  '<!-- Date -->' +
  '<text x="200" y="' + (line2 ? '375' : '360') + '" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="13" fill="#64748b" text-anchor="middle">' + formattedDate + '</text>' +
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
    const text = `I just claimed my onchain ${tierName} for "${eventName}" (Token #${tokenId}) gaslessly via @CredifyApp on Base! 🚀🛡️\n\nVerify or claim yours here: ${window.location.origin}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="credential-card" style={{ '--tier-color': color }}>

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={22} style={{ color }} />
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: 99,
          background: 'rgba(37,99,235,0.1)', color: '#93c5fd',
          border: '1px solid rgba(37,99,235,0.2)',
          fontSize: '11px', fontWeight: 700,
          fontFamily: 'var(--font-display)', letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>Claimed</span>
      </div>

      {/* Event name */}
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', marginBottom: '4px', lineHeight: 1.3, color: 'var(--text)' }}>
        {eventName}
      </p>

      {/* Tier label */}
      <p style={{ color, fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '16px' }}>
        {tierName}
      </p>

      {/* Meta row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-subtle)', marginBottom: '2px' }}>Token ID</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>#{tokenId}</p>
        </div>
        {eventDate && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-subtle)', marginBottom: '2px' }}>Issued</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {new Date(eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {canUpgrade && (
          <button onClick={() => onUpgrade(credential)} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            <ArrowUp size={12} /> Upgrade Credential
          </button>
        )}
        <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
          {txHash && (
            <a
              href={`https://sepolia.basescan.org/tx/${txHash}`}
              target="_blank" rel="noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ flex: 1, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', padding: '6px' }}
              title="View on Explorer"
            >
              <ExternalLink size={12} /> Explorer
            </a>
          )}
          <button
            onClick={downloadBadgeSvg}
            className="btn btn-ghost btn-sm"
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', padding: '6px' }}
            title="Download Badge SVG"
          >
            <Download size={12} /> Download
          </button>
          <button
            onClick={handleShareOnX}
            className="btn btn-primary btn-sm"
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', padding: '6px' }}
            title="Share on X"
          >
            <Twitter size={12} /> Share
          </button>
        </div>
      </div>

      {/* Social Embeds & Integrations */}
      <div style={{ marginTop: '16px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* LinkedIn Button */}
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', background: 'rgba(10, 102, 194, 0.15)', border: '1px solid rgba(10, 102, 194, 0.3)', color: '#0a66c2' }}
        >
          Add to LinkedIn Profile
        </a>

        {/* GitHub Badge Generator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '10px', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            GitHub Readme Markdown
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              readOnly
              value={githubMarkdown}
              onClick={e => { e.target.select(); }}
              className="input-field input-mono"
              style={{ fontSize: '10px', height: '28px', padding: '4px 8px', flex: 1, background: 'var(--surface-alt)' }}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(githubMarkdown);
                alert('GitHub markdown badge copied to clipboard!');
              }}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '10px', height: '28px', padding: '0 10px', whiteSpace: 'nowrap' }}
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
