import React from 'react';
import { ExternalLink, ArrowUp, Compass, Flame, Star, Award, CheckCircle2 } from 'lucide-react';

const TIER_COLORS = {
  0: '#93c5fd', 1: '#a5b4fc', 2: '#d8b4fe', 3: '#f9a8d4', 4: '#86efac',
};
const TIER_ICONS = { 0: Compass, 1: Flame, 2: Star, 3: Award, 4: CheckCircle2 };
const TIER_NAMES = { 0: 'Event Pass', 1: 'Participant Badge', 2: 'Finalist Badge', 3: 'Winner Certificate', 4: 'Mentor / Volunteer' };

export default function CredentialCard({ credential, onUpgrade }) {
  const { tokenId, tierLevel = 0, eventName = 'Credify Event', eventDate, txHash } = credential;
  const color    = TIER_COLORS[tierLevel] || '#93c5fd';
  const Icon     = TIER_ICONS[tierLevel]  || Compass;
  const tierName = TIER_NAMES[tierLevel]  || 'Event Pass';
  const canUpgrade = tierLevel < 4 && onUpgrade;

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
      <div style={{ display: 'flex', gap: '8px' }}>
        {txHash && (
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank" rel="noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ flex: 1, textDecoration: 'none' }}
          >
            <ExternalLink size={12} /> View Tx
          </a>
        )}
        {canUpgrade && (
          <button onClick={() => onUpgrade(credential)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
            <ArrowUp size={12} /> Upgrade
          </button>
        )}
      </div>
    </div>
  );
}
