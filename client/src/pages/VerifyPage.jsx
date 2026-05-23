import React, { useState } from 'react';
import { Search, ShieldX, CheckCircle2, ExternalLink, Wallet, Compass, Award, AlertTriangle, HelpCircle, Flame, Star } from 'lucide-react';
import { verifyByTokenId, verifyByWallet } from '../services/verifyService.js';
import Loader from '../components/common/Loader.jsx';

const TIER_COLORS = {
  'event pass': '#93c5fd',
  'participant badge': '#a5b4fc',
  'finalist badge': '#d8b4fe',
  'winner certificate': '#f9a8d4',
  'mentor / volunteer': '#86efac',
};

const TIER_ICONS = {
  'event pass':         Compass,
  'participant badge':  Flame,
  'finalist badge':     Star,
  'winner certificate': Award,
  'mentor badge':       CheckCircle2,
  'mentor / volunteer': CheckCircle2,
};

export default function VerifyPage() {
  const [searchType, setSearchType] = useState('token');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const toggle = (type) => { setSearchType(type); setQuery(''); setResult(null); setError(''); };

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const data = searchType === 'token' ? await verifyByTokenId(q) : await verifyByWallet(q);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Credential not found. Check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  const tierColor = result ? (TIER_COLORS[result.tier?.toLowerCase()] || '#93c5fd') : '#93c5fd';

  return (
    <div className="page-content">
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)' }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', marginBottom: '12px' }}>
            Verify a Credential
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, maxWidth: '460px', margin: '0 auto' }}>
            Enter a Token ID or wallet address to verify onchain authenticity on Base Sepolia.
          </p>
        </div>

        {/* Search panel */}
        <div className="card animate-fade-up delay-100" style={{ padding: '28px', marginBottom: '24px' }}>
          <form onSubmit={handleSearch}>
            {/* Segmented toggle */}
            <div className="seg-toggle" style={{ marginBottom: '20px' }}>
              <button type="button" className={`seg-btn ${searchType === 'token' ? 'active' : ''}`} onClick={() => toggle('token')}>
                # Token ID
              </button>
              <button type="button" className={`seg-btn ${searchType === 'wallet' ? 'active' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => toggle('wallet')}>
                <Wallet size={13} /> Wallet Address
              </button>
            </div>

            {/* Input + button */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="input-wrapper" style={{ flex: 1 }}>
                <Search size={15} className="input-icon" />
                <input
                  id="verify-input"
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={searchType === 'token' ? 'e.g. 42' : 'e.g. 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'}
                  className={`input-field input-icon-left ${searchType === 'wallet' ? 'input-mono' : ''}`}
                  style={{ fontSize: searchType === 'wallet' ? '12px' : '14px' }}
                />
              </div>
              <button
                id="verify-btn"
                type="submit"
                disabled={loading || !query.trim()}
                className="btn btn-primary"
                style={{ flexShrink: 0, padding: '0 24px' }}
              >
                {loading
                  ? <Loader size="sm" style={{ border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff' }} />
                  : 'Verify'
                }
              </button>
            </div>

            {/* Helper */}
            <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-subtle)' }}>
              {searchType === 'token'
                ? 'Enter the numeric token ID of the credential NFT'
                : 'Enter a full 0x wallet address (42 characters)'}
            </p>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', padding: '48px 0', color: 'var(--text-muted)' }}>
            <Loader size="lg" />
            <span style={{ fontSize: '14px' }}>Querying Base Sepolia…</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="card animate-fade-up" style={{ padding: '24px', borderColor: 'rgba(239,68,68,0.3)', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <ShieldX size={28} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, color: '#fca5a5', marginBottom: '4px', fontSize: '14px' }}>Verification Failed</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="card animate-fade-up" style={{ overflow: 'hidden' }}>
            {/* Result header */}
            <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                {(() => {
                  const tierKey = result.tier?.toLowerCase() || 'event pass';
                  const TierIcon = TIER_ICONS[tierKey] || Compass;
                  return (
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: `${tierColor}15`, border: `1px solid ${tierColor}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <TierIcon size={20} style={{ color: tierColor }} />
                    </div>
                  );
                })()}
                <div>
                  <p style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '4px' }}>
                    {result.eventName}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{result.eventDescription}</p>
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px', borderRadius: 99,
                background: 'var(--success-soft)', border: '1px solid rgba(34,197,94,0.3)',
                color: '#86efac', fontSize: '12px', fontWeight: 700,
                fontFamily: 'var(--font-display)', flexShrink: 0,
              }}>
                <CheckCircle2 size={12} /> VERIFIED
              </div>
            </div>

            {/* Result grid */}
            <div className="grid-2col" style={{ padding: '24px', gap: '20px' }}>
              <MetaItem label="Token ID"    value={`#${result.tokenId}`}   mono />
              <MetaItem label="Issued"      value={result.eventDate ? new Date(result.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} />
              <MetaItem label="Tier"        value={<span style={{ color: tierColor, fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '0.04em' }}>{result.tier}</span>} />
              <MetaItem label="Holder"      value={result.recipient ? `${result.recipient.slice(0, 8)}…${result.recipient.slice(-6)}` : '—'} mono />
              <div className="grid-col-span-2-resp">
                <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 600 }}>
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
                  {result.txHash} <ExternalLink size={11} style={{ flexShrink: 0 }} />
                </a>
              </div>
            </div>

            {result.onchain?.isMock && (
              <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={13} style={{ color: 'var(--warning)', flexShrink: 0 }} /> Demo mode — live contract data would appear on full deployment
              </div>
            )}
          </div>
        )}

        {/* Empty state hint */}
        {!result && !loading && !error && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-subtle)', padding: '32px 0', lineHeight: 1.7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <HelpCircle size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} /> Try Token ID <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>42</span> or any wallet address to see demo verification.
          </p>
        )}
      </div>
    </div>
  );
}

function MetaItem({ label, value, mono }) {
  return (
    <div>
      <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px', fontWeight: 600 }}>
        {label}
      </p>
      {typeof value === 'string'
        ? <p style={{ fontWeight: 600, color: 'var(--text)', fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontSize: mono ? '13px' : '14px', wordBreak: 'break-all' }}>{value}</p>
        : value
      }
    </div>
  );
}
