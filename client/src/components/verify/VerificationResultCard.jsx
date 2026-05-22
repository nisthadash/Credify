import React from 'react';
import { CheckCircle2, ShieldX, ExternalLink, Hash, Calendar, User, AlertTriangle, Compass, Flame, Star, Award } from 'lucide-react';

const TIER_COLORS = {
  'event pass':         '#38bdf8',
  'participant badge':  '#2563eb',
  'finalist badge':     '#a855f7',
  'winner certificate': '#ec4899',
  'mentor badge':       '#22c55e',
  'mentor / volunteer': '#22c55e',
};
const TIER_ICONS = {
  'event pass':         Compass,
  'participant badge':  Flame,
  'finalist badge':     Star,
  'winner certificate': Award,
  'mentor badge':       CheckCircle2,
  'mentor / volunteer': CheckCircle2,
};

export default function VerificationResultCard({ result, searchType }) {
  if (!result) return null;

  if (searchType === 'token') {
    const tierKey   = result.tier?.toLowerCase() || 'event pass';
    const tierColor = TIER_COLORS[tierKey] || '#2563eb';
    const TierIcon  = TIER_ICONS[tierKey]  || Compass;

    return (
      <div className="card animate-fade-up" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '28px' }}>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '12px',
                background: `${tierColor}18`, border: `1.5px solid ${tierColor}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <TierIcon size={24} style={{ color: tierColor }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', lineHeight: 1.2 }}>
                  {result.eventName}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {result.eventDescription || 'Onchain credential issued via Credify'}
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '99px',
              background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
              color: '#86efac', fontSize: '11px', fontWeight: 700,
              fontFamily: 'var(--font-display)', flexShrink: 0, letterSpacing: '0.06em',
            }}>
              <CheckCircle2 size={12} /> VERIFIED
            </div>
          </div>

          {/* Details grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '20px', paddingTop: '20px',
            borderTop: '1px solid var(--border)',
          }}>
            <InfoRow icon={<Hash size={14} />} label="Token ID" value={`#${result.tokenId}`} mono />
            <InfoRow
              icon={<Calendar size={14} />}
              label="Issued"
              value={result.eventDate
                ? new Date(result.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : '—'}
            />
            <div style={{ gridColumn: 'span 2' }}>
              <InfoRow
                icon={<div style={{ width: 8, height: 8, borderRadius: '50%', background: tierColor, marginTop: '2px', flexShrink: 0 }} />}
                label="Credential Tier"
                value={<span style={{ color: tierColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '13px' }}>{result.tier}</span>}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <InfoRow icon={<User size={14} />} label="Holder Address" value={result.recipient} mono />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-subtle)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Transaction Hash
              </p>
              <a
                href={`https://sepolia.basescan.org/tx/${result.txHash}`}
                target="_blank" rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontFamily: 'var(--font-mono)', fontSize: '12px',
                  color: '#93c5fd', textDecoration: 'none', wordBreak: 'break-all',
                }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                {result.txHash} <ExternalLink size={12} style={{ flexShrink: 0 }} />
              </a>
            </div>
          </div>

          {/* Demo mode badge */}
          {result.onchain?.isMock && (
            <div style={{
              marginTop: '16px', padding: '8px 12px', borderRadius: '8px',
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              fontSize: '12px', color: '#fcd34d',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <AlertTriangle size={13} style={{ flexShrink: 0 }} />
              Demo mode — live contract data would appear here on full deployment
            </div>
          )}
        </div>
      </div>
    );
  }

  // Wallet result
  if (searchType === 'wallet' && result.credentials) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Found <strong style={{ color: 'var(--text)' }}>{result.totalCredentials}</strong> verified credential(s) for this wallet.
        </p>
        {result.credentials.map((cred, idx) => (
          <VerificationResultCard key={idx} result={cred} searchType="token" />
        ))}
      </div>
    );
  }

  return null;
}

function InfoRow({ icon, label, value, mono }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <span style={{ color: 'var(--text-subtle)', marginTop: '2px', flexShrink: 0 }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '11px', color: 'var(--text-subtle)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          {label}
        </p>
        {typeof value === 'string'
          ? <p style={{ fontWeight: 600, color: 'var(--text)', fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontSize: mono ? '13px' : '14px', wordBreak: 'break-all' }}>{value}</p>
          : value
        }
      </div>
    </div>
  );
}
