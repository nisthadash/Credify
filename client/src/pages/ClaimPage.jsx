import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Tag, Ticket, ShieldAlert, ShieldCheck, Compass } from 'lucide-react';
import { useEligibility } from '../hooks/useEligibility.js';
import { useUGFClaim } from '../hooks/useUGFClaim.js';
import UGFProgressModal from '../components/credential/UGFProgressModal.jsx';
import Loader from '../components/common/Loader.jsx';
import ConnectWalletButton from '../components/wallet/ConnectWalletButton.jsx';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { Contract } from 'ethers';
import { useEthersSigner } from '../utils/ethers.js';
import { CONTRACT_ADDRESS, ABI } from '../config/contract.js';

const EVENT = {
  name: 'Credify Base Sepolia Workshop',
  date: 'May 30, 2026',
  tier: 'Event Pass',
  tierLevel: 0,
};

export default function ClaimPage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const { checked, isEligible, eventTitle, eventId, loading: eligLoading } = useEligibility(address, isConnected);
  const { ugfStep, txDetails, triggerClaim, isRunning } = useUGFClaim();
  const [modalOpen, setModalOpen] = useState(false);

  // On-chain owner and eligibility checks
  const signer = useEthersSigner();
  const [contractOwner, setContractOwner] = useState('');
  const [onchainEligible, setOnchainEligible] = useState(false);
  const [onchainClaimed, setOnchainClaimed] = useState(false);
  const [checkingOnchain, setCheckingOnchain] = useState(false);
  const [whitelisting, setWhitelisting] = useState(false);

  const checkOnchainStatus = async () => {
    if (!address) return;
    setCheckingOnchain(true);
    try {
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http('https://sepolia.base.org')
      });
      
      const ownerAddress = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'owner'
      });
      setContractOwner(ownerAddress);

      const isUserEligible = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'isEligible',
        args: [address]
      });
      setOnchainEligible(isUserEligible);

      const credentialInfo = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'getCredential',
        args: [address]
      });
      setOnchainClaimed(credentialInfo[2]); // Third index is claimed (bool)
      console.log('[ClaimPage Onchain Check] Owner:', ownerAddress, 'User:', address, 'Eligible:', isUserEligible, 'Claimed:', credentialInfo[2]);
    } catch (err) {
      console.error('Error checking onchain status:', err);
    } finally {
      setCheckingOnchain(false);
    }
  };

  const handleWhitelistOnchain = async () => {
    if (!signer || !address) return;
    setWhitelisting(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
      console.log('[ClaimPage Onchain Whitelist] Sending addEligible transaction for:', address);
      const tx = await contract.addEligible(address);
      console.log('[ClaimPage Onchain Whitelist] Transaction sent:', tx.hash);
      
      // Wait for 1 confirmation
      const receipt = await tx.wait();
      console.log('[ClaimPage Onchain Whitelist] Transaction confirmed:', receipt);
      
      // Refresh status
      await checkOnchainStatus();
      alert('Wallet whitelisted on-chain successfully!');
    } catch (err) {
      console.error('Error whitelisting onchain:', err);
      alert('Failed to whitelist on-chain: ' + (err.reason || err.message || err));
    } finally {
      setWhitelisting(false);
    }
  };

  React.useEffect(() => {
    if (isConnected && address) {
      checkOnchainStatus();
    } else {
      setContractOwner('');
      setOnchainEligible(false);
      setOnchainClaimed(false);
    }
  }, [address, isConnected]);

  const handleClaim = async () => {
    setModalOpen(true);
    try {
      const result = await triggerClaim(address, eventId);
      setTimeout(() => {
        setModalOpen(false);
        navigate(`/success?tokenId=${result.tokenId}&txHash=${result.txHash}&event=${encodeURIComponent(eventTitle || EVENT.name)}`);
      }, 1200);
    } catch (err) {
      setModalOpen(false);
      console.error('UGF Claim Flow Failed:', err);
    }
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
              ) : onchainClaimed ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}><ShieldCheck size={28} style={{ color: 'var(--success)' }} /></p>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Credential Already Claimed</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
                    You have already claimed this credential pass on Base Sepolia.
                  </p>
                  <button 
                    onClick={() => navigate('/my-credentials')}
                    className="btn btn-primary btn-full"
                    style={{ height: '48px', fontSize: '15px' }}
                  >
                    View My Credentials
                  </button>
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
                  {/* Onchain Whitelist Warning for Smart Contract Owner */}
                  {contractOwner && address && address.toLowerCase() === contractOwner.toLowerCase() && !onchainEligible && (
                    <div style={{ 
                      padding: '12px 14px', 
                      background: 'rgba(239, 68, 68, 0.07)', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: '#ff8a8a' }}>
                        <ShieldAlert size={14} /> Owner Wallet Not Whitelisted Onchain
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', lineHeight: 1.4 }}>
                        Your wallet is the smart contract owner but is not whitelisted on-chain yet. The UGF transaction dry-run simulation will revert.
                      </p>
                      <button 
                        onClick={handleWhitelistOnchain}
                        disabled={whitelisting}
                        className="btn btn-sm btn-primary"
                        style={{ 
                          fontSize: '11px', 
                          padding: '6px 12px', 
                          height: 'auto',
                          background: 'var(--primary)',
                          color: '#000',
                          fontWeight: 700,
                          alignSelf: 'flex-start'
                        }}
                      >
                        {whitelisting ? 'Whitelisting...' : 'Whitelist On-Chain Now'}
                      </button>
                    </div>
                  )}

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
