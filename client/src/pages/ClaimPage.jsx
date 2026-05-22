import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Tag, Ticket, ShieldAlert, ShieldCheck, Compass } from 'lucide-react';
import { useEligibility } from '../hooks/useEligibility.js';
import { useUGFClaim } from '../hooks/useUGFClaim.js';
import UGFProgressModal from '../components/credential/UGFProgressModal.jsx';
import Loader from '../components/common/Loader.jsx';
import ConnectWalletButton from '../components/wallet/ConnectWalletButton.jsx';

const EVENT = {
  name: 'Credify Base Sepolia Workshop',
  date: 'May 30, 2026',
  tier: 'Event Pass',
  tierLevel: 0,
};

export default function ClaimPage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const { checked, isEligible, eventTitle, loading: eligLoading } = useEligibility(address, isConnected);
  const { ugfStep, txDetails, triggerClaim, isRunning } = useUGFClaim();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClaim = async () => {
    setModalOpen(true);
    const result = await triggerClaim(address);
    setTimeout(() => {
      setModalOpen(false);
      navigate(`/success?tokenId=${result.tokenId}&txHash=${result.txHash}&event=${encodeURIComponent(eventTitle || EVENT.name)}`);
    }, 1200);
  };

  return (
    <div className="page-content">
      <div className="container">

        {/* Page header */}
        <div className="animate-fade-up" style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', marginBottom: '8px' }}>
            Claim Your Event Pass
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Your onchain credential — gasless and instant.
          </p>
        </div>

        {/* 60/40 grid */}
        <div className="grid-2col" style={{ alignItems: 'start' }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Event card */}
            <div className="card animate-fade-up" style={{ padding: '24px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '20px' }}>
                Event Details
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <Row label="Event"  value={eventTitle || EVENT.name} />
                <Row label="Date"   value={EVENT.date} />
                <Row label="Tier"   value={<span style={{ color: '#93c5fd', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Ticket size={13} /> {EVENT.tier} (Tier 0)</span>} />
                {isConnected && checked && (
                  <Row label="Eligibility" value={
                    isEligible
                      ? <span className="chip chip-eligible" style={{ fontSize: '11px' }}><span className="chip-dot" /> Eligible</span>
                      : <span className="chip chip-not-eligible" style={{ fontSize: '11px' }}><span className="chip-dot" /> Not Eligible</span>
                  } />
                )}
              </div>
            </div>

            {/* Claim panel */}
            <div className="card animate-fade-up delay-100" style={{ padding: '24px' }}>
              {!isConnected ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
                    Connect your wallet to check eligibility and claim your gasless credential.
                  </p>
                  <ConnectWalletButton />
                </div>
              ) : eligLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', padding: '12px' }}>
                  <Loader size="md" />
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Checking eligibility…</span>
                </div>
              ) : checked && !isEligible ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}><ShieldAlert size={28} style={{ color: 'var(--error)' }} /></p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                    Your wallet isn't on the whitelist for this event. Contact the organizer.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    You have <strong style={{ color: 'var(--text)' }}>zero ETH</strong> — but that's fine. UGF calculates gas, settles in Mock USD, and mints your credential on Base Sepolia.
                  </p>
                  <button
                    id="claim-pass-btn"
                    onClick={handleClaim}
                    disabled={isRunning}
                    className="btn btn-primary btn-full"
                    style={{ height: '48px', fontSize: '15px', gap: '10px' }}
                  >
                    {isRunning
                      ? <><Loader size="sm" style={{ border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff' }} /> Processing…</>
                      : <>Claim Gasless Event Pass <ArrowRight size={17} /></>
                    }
                  </button>
                  <p style={{ fontSize: '12px', color: 'var(--text-subtle)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <ShieldCheck size={13} /> No ETH needed &middot; UGF handles gas in the background
                  </p>
                </div>
              )}
            </div>

            {/* UGF note */}
            <div className="info-note animate-fade-up delay-200">
              <strong>How UGF works: </strong>
              Universal Gas Framework quotes the gas cost → settles in Mock USD (~0.15) → executes the contract call. You pay zero ETH.
            </div>
          </div>

          {/* RIGHT — Credential Preview */}
          <div className="animate-fade-up delay-200">
            <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '14px' }}>
              Credential Preview
            </p>

            {/* Badge card with glow */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: -4,
                background: 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(129,140,248,0.2))',
                borderRadius: '20px', filter: 'blur(20px)', opacity: 0.7, zIndex: 0,
              }} />
              <div className="card" style={{ padding: '32px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12,
                    background: 'var(--primary-soft)', border: '1px solid rgba(37,99,235,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Compass size={24} style={{ color: 'var(--primary)' }} /></div>
                  <span style={{
                    padding: '4px 12px', borderRadius: 99,
                    background: 'var(--primary-soft)', color: '#93c5fd',
                    fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-display)',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>Event Pass</span>
                </div>
                <div>
                  <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 6 }}>
                    {eventTitle || EVENT.name}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>{EVENT.date}</p>
                </div>
                <div style={{
                  borderTop: '1px solid var(--border)', paddingTop: 16,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)' }}>Token pending…</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Credify · Base Sepolia
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UGFProgressModal
        isOpen={modalOpen}
        onClose={() => !isRunning && setModalOpen(false)}
        step={ugfStep}
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{value}</span>
    </div>
  );
}
