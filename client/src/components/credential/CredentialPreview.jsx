import React from 'react';
import { Compass, Flame, Star, Award, CheckCircle2 } from 'lucide-react';

const TIER_CONFIG = {
  0: { name: 'Event Pass',         icon: Compass,      color: '#38bdf8', label: 'Pass' },
  1: { name: 'Participant Badge',   icon: Flame,        color: '#2563eb', label: 'Participant' },
  2: { name: 'Finalist Badge',      icon: Star,         color: '#a855f7', label: 'Finalist' },
  3: { name: 'Winner Certificate',  icon: Award,        color: '#ec4899', label: 'Winner' },
  4: { name: 'Mentor / Volunteer',  icon: CheckCircle2, color: '#22c55e', label: 'Mentor' },
};

export default function CredentialPreview({
  tierLevel = 0,
  eventName = 'Credify Event',
  eventDate,
  tokenId,
  animated = false,
}) {
  const tier = TIER_CONFIG[tierLevel] || TIER_CONFIG[0];
  const Icon = tier.icon;
  const dateStr = eventDate
    ? new Date(eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div
      className={animated ? 'animate-pop-in' : ''}
      style={{
        background: 'var(--surface-alt)',
        border: `1px solid ${tier.color}30`,
        borderRadius: '20px',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        width: '200px', height: '200px',
        borderRadius: '50%',
        background: tier.color,
        filter: 'blur(80px)',
        opacity: 0.12,
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      {/* Badge icon ring */}
      <div style={{
        width: '88px', height: '88px',
        borderRadius: '50%',
        background: `${tier.color}18`,
        border: `2px solid ${tier.color}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1,
        boxShadow: `0 0 24px ${tier.color}25`,
      }}>
        <Icon size={38} style={{ color: tier.color }} />
      </div>

      {/* Tier label chip */}
      <div style={{
        padding: '4px 14px',
        borderRadius: '99px',
        background: `${tier.color}18`,
        border: `1px solid ${tier.color}40`,
        color: tier.color,
        fontSize: '11px',
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        position: 'relative', zIndex: 1,
      }}>
        {tier.label}
      </div>

      {/* Event name */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)', lineHeight: 1.3 }}>
          {eventName}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
          {dateStr}
        </p>
        {tokenId && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '12px',
            color: 'var(--text-subtle)', marginTop: '4px'
          }}>
            Token #{tokenId}
          </p>
        )}
      </div>

      {/* Credify watermark */}
      <div style={{
        position: 'absolute', bottom: '14px', right: '16px',
        fontSize: '10px', color: 'var(--text-subtle)',
        fontFamily: 'var(--font-display)', letterSpacing: '0.05em',
        zIndex: 1,
      }}>
        CREDIFY &middot; BASE SEPOLIA
      </div>
    </div>
  );
}
