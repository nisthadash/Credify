import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import {
  Sparkles, ShieldCheck, Zap, Trophy, ChevronRight,
  Calendar, Tag, RefreshCw, Info, CheckCircle2, AlertCircle
} from 'lucide-react';
import { checkEligibility } from '../services/credentialService.js';
import ConnectWalletButton from '../components/wallet/ConnectWalletButton.jsx';

/* ──────────────────────────────────────────────
   Feature Cards displayed in the hero section
────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: ShieldCheck,
    color: '#2563EB',
    glow: 'rgba(37,99,235,0.18)',
    title: 'Claim Event Passes',
    desc: 'Get your onchain credential for attending, competing, or mentoring at hackathons — gaslessly.',
  },
  {
    icon: Zap,
    color: '#818CF8',
    glow: 'rgba(129,140,248,0.18)',
    title: 'Build Progression',
    desc: 'Climb the credential ladder tier by tier. Each stage is verifiable and tamper-proof onchain.',
  },
  {
    icon: Trophy,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.18)',
    title: 'Showcase Achievements',
    desc: 'Share your finalist badge, winner certificate, or mentor credential with the world.',
  },
];

export default function Home() {
  const { address, isConnected } = useAccount();

  /* ── Active hackathon event state ── */
  const [eventInfo, setEventInfo] = useState(null);       // { eventTitle, eventId, isEligible }
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [eventError, setEventError] = useState('');

  const fetchActiveEvent = async () => {
    if (!address) return;
    setLoadingEvent(true);
    setEventError('');
    try {
      const data = await checkEligibility(address);
      if (data && data.eventId) {
        setEventInfo({
          eventTitle: data.eventTitle || 'Unnamed Event',
          eventId: data.eventId,
          isEligible: data.isEligible,
        });
      } else {
        setEventInfo(null);
      }
    } catch (err) {
      console.error('Failed fetching active event:', err);
      setEventError('Could not fetch active hackathon event.');
      setEventInfo(null);
    } finally {
      setLoadingEvent(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchActiveEvent();
    } else {
      setEventInfo(null);
      setEventError('');
    }
  }, [address, isConnected]);

  return (
    <div className="container page-content">

      {/* ── Hero Section ── */}
      <section style={{ textAlign: 'center', marginBottom: '72px', marginTop: '10px' }}>

        {/* Eyebrow */}
        <div className="eyebrow" style={{ marginBottom: '20px', display: 'inline-flex' }}>
          <Sparkles size={13} style={{ color: 'var(--secondary)' }} />
          <span>ONCHAIN CREDENTIALS FOR WEB3 EVENTS</span>
        </div>

        {/* Main heading */}
        <h1
          style={{
            fontSize: 'clamp(2.6rem, 5vw, 4rem)',
            marginBottom: '20px',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
          }}
        >
          <span className="gradient-text">Credify</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            maxWidth: '560px',
            margin: '0 auto 12px',
            lineHeight: 1.6,
            fontWeight: 500,
          }}
        >
          Onchain credentials for hackathons and communities
        </p>

        {/* Description */}
        <p
          style={{
            color: 'var(--text-subtle)',
            fontSize: '1rem',
            maxWidth: '640px',
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}
        >
          Credify helps participants claim event passes, build verifiable progression, and
          showcase hackathon achievements through gasless onchain credentials.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to="/ladder"
            id="home-view-ladder-btn"
            className="btn btn-primary btn-lg"
            style={{ gap: '10px' }}
          >
            View Progression Ladder <ChevronRight size={18} />
          </Link>
          <Link
            to="/claim"
            id="home-claim-pass-btn"
            className="btn btn-ghost btn-lg"
          >
            Claim Event Pass
          </Link>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section style={{ marginBottom: '80px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {FEATURES.map(({ icon: Icon, color, glow, title, desc }) => (
            <div
              key={title}
              className="glass-panel"
              style={{
                padding: '28px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${glow}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              {/* Subtle radial glow behind icon */}
              <div
                style={{
                  position: 'absolute',
                  top: '-24px',
                  left: '-24px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: glow,
                  filter: 'blur(32px)',
                  pointerEvents: 'none',
                }}
              />

              {/* Icon */}
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                  position: 'relative',
                }}
              >
                <Icon size={22} style={{ color }} />
              </div>

              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: '8px',
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Select Active Hackathon Event ── */}
      <section style={{ maxWidth: '680px', margin: '0 auto 80px' }}>

        {/* Section heading */}
        <div style={{ marginBottom: '24px' }}>
          <div className="eyebrow" style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <Calendar size={13} style={{ color: 'var(--secondary)' }} />
            <span>ACTIVE HACKATHON</span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              lineHeight: 1.2,
              marginBottom: '8px',
            }}
          >
            Select Active Hackathon Event
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Your wallet is checked against the active event registry. Connect your wallet to
            see the currently assigned hackathon event and your eligibility status.
          </p>
        </div>

        <div
          className="glass-panel"
          style={{ padding: '28px' }}
        >

          {/* ── Not connected ── */}
          {!isConnected && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(37,99,235,0.1)',
                  border: '1px solid rgba(37,99,235,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Info size={24} style={{ color: 'var(--primary)' }} />
              </div>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  marginBottom: '20px',
                  maxWidth: '360px',
                  margin: '0 auto 20px',
                }}
              >
                Connect your wallet to check if you're registered for an active hackathon event.
              </p>
              <ConnectWalletButton style={{ margin: '0 auto', display: 'inline-flex' }} />
            </div>
          )}

          {/* ── Loading ── */}
          {isConnected && loadingEvent && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 0',
                justifyContent: 'center',
              }}
            >
              <div className="spinner spinner-md" style={{ borderTopColor: 'var(--secondary)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Checking active hackathon event…
              </span>
            </div>
          )}

          {/* ── Error ── */}
          {isConnected && !loadingEvent && eventError && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'center',
                padding: '16px 0',
              }}
            >
              <AlertCircle size={32} style={{ color: 'var(--error)', margin: '0 auto' }} />
              <p style={{ color: '#ff8a8a', fontSize: '0.9rem' }}>{eventError}</p>
              <button
                onClick={fetchActiveEvent}
                className="btn btn-sm btn-ghost"
                style={{ alignSelf: 'center', gap: '6px' }}
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {/* ── Active event found ── */}
          {isConnected && !loadingEvent && !eventError && eventInfo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Event details */}
              <div
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  overflow: 'hidden',
                }}
              >
                {[
                  { label: 'Event Name', value: eventInfo.eventTitle },
                  {
                    label: 'Eligibility',
                    value: eventInfo.isEligible ? (
                      <span className="chip chip-eligible" style={{ fontSize: '11px' }}>
                        <span className="chip-dot" /> Eligible
                      </span>
                    ) : (
                      <span className="chip chip-not-eligible" style={{ fontSize: '11px' }}>
                        <span className="chip-dot" /> Not Eligible
                      </span>
                    ),
                  },
                  { label: 'Event ID', value: eventInfo.eventId },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '13px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>{label}</span>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: '#fff',
                        fontFamily: label === 'Event ID' ? 'var(--font-mono)' : 'inherit',
                        fontSize: label === 'Event ID' ? '0.78rem' : '0.9rem',
                        color: label === 'Event Name' ? 'var(--secondary)' : '#fff',
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Eligibility note */}
              {eventInfo.isEligible ? (
                <div className="info-note" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    Your wallet is eligible for this event. Head to{' '}
                    <Link to="/claim" style={{ color: '#93c5fd', textDecoration: 'underline' }}>
                      Claim Pass
                    </Link>{' '}
                    to mint your gasless Event Pass, or visit the{' '}
                    <Link to="/ladder" style={{ color: '#93c5fd', textDecoration: 'underline' }}>
                      Ladder
                    </Link>{' '}
                    to track your full progression.
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    fontSize: '13px',
                    color: '#ff8a8a',
                    lineHeight: 1.6,
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    Your wallet is not on the allowlist for this event. Contact the organizer to get
                    registered.
                  </span>
                </div>
              )}

              {/* CTA row */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link
                  to="/ladder"
                  id="home-go-ladder-btn"
                  className="btn btn-primary"
                  style={{ flex: 1, minWidth: '140px', justifyContent: 'center', gap: '6px' }}
                >
                  <Zap size={15} /> View Ladder
                </Link>
                <Link
                  to="/claim"
                  id="home-go-claim-btn"
                  className="btn btn-ghost"
                  style={{ flex: 1, minWidth: '140px', justifyContent: 'center', gap: '6px' }}
                >
                  <Tag size={15} /> Claim Pass
                </Link>
                <button
                  onClick={fetchActiveEvent}
                  className="btn btn-ghost"
                  style={{ height: '40px', padding: '0 14px', gap: '6px' }}
                  title="Refresh event status"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── No event found (empty state) ── */}
          {isConnected && !loadingEvent && !eventError && !eventInfo && (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                }}
              >
                <Calendar size={26} style={{ color: 'var(--text-subtle)' }} />
              </div>
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '8px',
                  fontFamily: 'var(--font-display)',
                }}
              >
                No Active Event Found
              </h3>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  maxWidth: '380px',
                  margin: '0 auto 20px',
                }}
              >
                Your wallet isn't registered to any active hackathon event right now. Check
                back later or contact the organizer to get added to an event.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={fetchActiveEvent}
                  className="btn btn-sm btn-ghost"
                  style={{ gap: '6px' }}
                >
                  <RefreshCw size={13} /> Refresh
                </button>
                <Link
                  to="/organizer/login"
                  id="home-organizer-link"
                  className="btn btn-sm btn-ghost"
                >
                  Organizer Portal
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
