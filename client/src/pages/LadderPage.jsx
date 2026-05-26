import React, { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { CheckCircle2, ShieldAlert, Award, Star, Flame, Compass, ChevronRight, ChevronDown, Share2, ExternalLink, Lock, Unlock, Sparkles, RefreshCw, Zap, Info, Trophy, Sliders, Check } from 'lucide-react';
import { useEligibility } from '../hooks/useEligibility.js';
import { useUGFClaim } from '../hooks/useUGFClaim.js';
import { saveClaim, getCredentialsByWallet, getEvents } from '../services/credentialService.js';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { Contract } from 'ethers';
import { useEthersSigner } from '../utils/ethers.js';
import { CONTRACT_ADDRESS, ABI } from '../config/contract.js';
import ConnectWalletButton from '../components/wallet/ConnectWalletButton.jsx';

const TIERS = [
  { level: 0, name: 'Event Pass', description: 'Your entry pass for registering and checking in.', icon: Compass, color: '#00f2fe', subtitle: 'Tier 0 - Registration' },
  { level: 1, name: 'Participant Badge', description: 'Verifies active workshop attendance and hacking.', icon: Flame, color: '#3b82f6', subtitle: 'Tier 1 - Attendance' },
  { level: 2, name: 'Finalist Badge', description: 'Awarded to teams selected for final pitches.', icon: Star, color: '#a855f7', subtitle: 'Tier 2 - Competition' },
  { level: 3, name: 'Winner Certificate', description: 'Tamper-proof recognition for top place finishes.', icon: Award, color: '#ec4899', subtitle: 'Tier 3 - Triumph' },
  { level: 4, name: 'Mentor / Volunteer', description: 'Recognizes contributions of guides and event staff.', icon: CheckCircle2, color: '#10b981', subtitle: 'Tier 4 - Leadership' }
];

const UGF_STEPS = [
  { key: 'quoting', number: 1, title: 'Gas Quotation', desc: 'Calculating contract interaction fee in Mock USD' },
  { key: 'settling', number: 2, title: 'USD Settlement', desc: 'Deducting gas cost ($0.15) from your credit balance' },
  { key: 'executing', number: 3, title: 'UGF Relayer Execution', desc: 'Relayer pays ETH gas and submits transaction on Base Sepolia' },
  { key: 'confirming', number: 4, title: 'Block Confirmation', desc: 'Waiting for the block to be finalized onchain' }
];

const MOCK_EVENTS = [
  { _id: '664cc56a7d7324a0d85485ab', title: 'Credify Base Sepolia Workshop' },
  { _id: '664cc56a7d7324a0d85485ac', title: 'ETHGlobal London 2026' },
  { _id: '664cc56a7d7324a0d85485ad', title: 'Base Builder House Paris' },
  { _id: '664cc56a7d7324a0d85485ae', title: 'Superhack 2026' },
  { _id: '664cc56a7d7324a0d85485af', title: 'Arbitrum Ascent Hackathon' }
];

export default function LadderPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Selected Hackathon / Event States
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState('664cc56a7d7324a0d85485ab');

  // Load events from database if available
  useEffect(() => {
    const loadApiEvents = async () => {
      try {
        const data = await getEvents();
        if (data && data.length > 0) {
          // Merge API events with mock events (avoid duplicate _ids)
          const merged = [...data];
          MOCK_EVENTS.forEach(mock => {
            if (!merged.some(e => e._id === mock._id)) {
              merged.push(mock);
            }
          });
          setEvents(merged);
        }
      } catch (err) {
        console.warn('[LadderPage] Failed to fetch events from backend. Running with mock events.', err);
      }
    };
    loadApiEvents();
  }, []);

  // Load actual claimed credentials
  const [credentials, setCredentials] = useState([]);

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
      console.log('[Onchain Check] Owner:', ownerAddress, 'User:', address, 'Eligible:', isUserEligible, 'Claimed:', credentialInfo[2]);
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
      console.log('[Onchain Whitelist] Sending addEligible transaction for:', address);
      const tx = await contract.addEligible(address);
      console.log('[Onchain Whitelist] Transaction sent:', tx.hash);
      
      // Wait for 1 confirmation
      const receipt = await tx.wait();
      console.log('[Onchain Whitelist] Transaction confirmed:', receipt);
      
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

  useEffect(() => {
    if (isConnected && address) {
      checkOnchainStatus();
    } else {
      setContractOwner('');
      setOnchainEligible(false);
      setOnchainClaimed(false);
    }
  }, [address, isConnected]);

  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [simulateApproval, setSimulateApproval] = useState(false);

  // UGF Gasless Claiming States
  const [claimingTier, setClaimingTier] = useState(null);
  const [ugfStep, setUgfStep] = useState('');
  const [txDetails, setTxDetails] = useState({ tokenId: null, txHash: '', tier: '', metadataUri: '' });
  const [ugfError, setUgfError] = useState('');

  // Standard eligibility check for Event Pass (Tier 0)
  const { checked, isEligible, eventTitle, eventId, loading: loadingEligibility } = useEligibility(address, isConnected, selectedEventId);

  // Dynamically resolve active event title from either selected mock list or eligibility result
  const activeEvent = events.find(e => e._id === selectedEventId);
  const activeEventTitle = activeEvent ? activeEvent.title : (eventTitle || 'Credify Hackathon Ladder');

  // Real UGF Claim Flow Hook
  const { ugfStep: realUgfStep, txDetails: realTxDetails, error: realError, triggerClaim, reset: resetRealUgf } = useUGFClaim();

  // Sync real UGF states to local states when claiming Tier 0 (onchain)
  useEffect(() => {
    if (claimingTier && claimingTier.level === 0) {
      setUgfStep(realUgfStep);
      setTxDetails(realTxDetails);
      if (realError) {
        setUgfError(realError);
      }
    }
  }, [realUgfStep, realTxDetails, realError, claimingTier]);

  const loadCredentials = async () => {
    if (!address) return;
    setLoadingCredentials(true);
    try {
      const data = await getCredentialsByWallet(address);
      setCredentials(data || []);
    } catch (err) {
      console.error('Failed loading credentials:', err);
    } finally {
      setLoadingCredentials(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      loadCredentials();
    } else {
      setCredentials([]);
    }
  }, [address, isConnected]);

  // Reset states on disconnect
  useEffect(() => {
    if (!isConnected || !address) {
      setUgfStep('');
      setUgfError('');
      setClaimingTier(null);
      setSimulateApproval(false);
      resetRealUgf();
    }
  }, [isConnected, address]);

  // Smooth scroll to UGF console when claimingTier changes
  useEffect(() => {
    if (claimingTier) {
      const timer = setTimeout(() => {
        const consoleEl = document.getElementById('ugf-console');
        if (consoleEl) {
          consoleEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [claimingTier]);

  // Computed state calculations
  const claimedLevels = new Set(
    credentials
      .filter(c => c.eventId === selectedEventId)
      .map(c => c.tierLevel)
  );
  if (onchainClaimed && selectedEventId === '664cc56a7d7324a0d85485ab') {
    claimedLevels.add(0);
  }
  const highestClaimedLevel = claimedLevels.size > 0 
    ? Math.max(...Array.from(claimedLevels)) 
    : -1;

  // Determine stage status
  const getTierStatus = (level) => {
    if (claimedLevels.has(level)) {
      return 'claimed';
    }
    
    if (level === 0) {
      if (highestClaimedLevel === -1 && (isEligible || simulateApproval)) {
        return 'eligible';
      }
      return highestClaimedLevel >= 0 ? 'locked-prereq' : 'locked';
    }

    if (level === highestClaimedLevel + 1) {
      if (simulateApproval) {
        return 'eligible';
      }
      return 'awaiting-approval';
    }

    return 'locked';
  };

  // UGF Gasless Minting
  const triggerUgfClaim = async () => {
    if (claimingTier === null) return;
    setUgfError('');
    
    if (claimingTier.level === 0 && onchainEligible) {
      try {
        await triggerClaim(address, eventId || selectedEventId || '664cc56a7d7324a0d85485ab', 0);
        await loadCredentials();
        setSimulateApproval(false);
      } catch (err) {
        console.error('Real UGF claim failed:', err);
        setUgfError(err.message || 'Real UGF claim failed');
        setUgfStep('');
      }
    } else {
      setUgfStep('quoting');
      await new Promise(r => setTimeout(r, 1800));

      setUgfStep('settling');
      await new Promise(r => setTimeout(r, 1600));

      setUgfStep('executing');
      await new Promise(r => setTimeout(r, 2000));

      setUgfStep('confirming');
      
      try {
        const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        const randomTokenId = Math.floor(Math.random() * 500) + 1;
        const protocol = window.location.protocol;
        const host = window.location.host;
        const mockMetadata = `${protocol}//${host}/api/credentials/metadata/${address}/event-tier-${claimingTier.level}`;

        await saveClaim({
          tokenId: randomTokenId,
          walletAddress: address,
          eventId: selectedEventId || eventId || '664cc56a7d7324a0d85485ab',
          txHash: mockTxHash,
          metadataUri: mockMetadata,
          tierLevel: claimingTier.level,
          eventName: activeEventTitle
        });

        setTxDetails({
          tokenId: randomTokenId,
          txHash: mockTxHash,
          tier: claimingTier.name,
          metadataUri: mockMetadata
        });
        
        await new Promise(r => setTimeout(r, 1200));
        setUgfStep('success');

        await loadCredentials();
        setSimulateApproval(false);
      } catch (err) {
        console.error('Simulated UGF claim failed:', err);
        setUgfError(err.message || 'Simulated UGF claim failed');
        setUgfStep('');
      }
    }
  };

  const handleResetDemo = () => {
    localStorage.removeItem('credify_credentials');
    setCredentials([]);
    setSimulateApproval(false);
    setClaimingTier(null);
    setUgfStep('');
    setUgfError('');
    resetRealUgf();
    alert('Demo reset successfully! All mock credentials have been cleared.');
  };

  const getClaimedTxDetails = (level) => {
    return credentials.find(c => c.tierLevel === level && c.eventId === selectedEventId);
  };

  function startClaimFlow(tier) {
    setClaimingTier(tier);
    setUgfStep('');
    setUgfError('');
  }

  return (
    <div className="container page-content">
      {/* Title Hero */}
      <section style={{ textAlign: 'center', marginBottom: '50px', marginTop: '10px' }}>
        <div className="eyebrow" style={{ marginBottom: '16px' }}>
          <Sparkles size={13} style={{ color: 'var(--secondary)' }} />
          <span>PROGRESSIVE CREDENTIAL LADDER</span>
        </div>
        <h1 className="gradient-text" style={{ fontSize: '3.2rem', marginBottom: '16px', lineHeight: 1.15 }}>
          Onchain Hackathon Progression
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          Build your reputation throughout the hackathon in sequential tiers, and claim credentials gaslessly through UGF.
        </p>
      </section>

      {/* Main Grid Layout */}
      <div className="home-main-grid">
        
        {/* Left Side: Interactive Progression Timeline */}
        <div className="glass-panel" style={{ padding: '32px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <Zap size={20} style={{ color: 'var(--secondary)' }} />
                Progression Ladder
              </h2>
              
              {/* Premium Glassmorphism Event Select Dropdown */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <select 
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    fontSize: '0.82rem',
                    padding: '6px 32px 6px 12px',
                    height: '32px',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    width: '210px',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.currentTarget) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--secondary)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(129, 140, 248, 0.2)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                >
                  {events.map(ev => (
                    <option 
                      key={ev._id} 
                      value={ev._id}
                      style={{
                        background: 'var(--surface-alt)',
                        color: 'var(--text)',
                        padding: '10px'
                      }}
                    >
                      {ev.title}
                    </option>
                  ))}
                </select>
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--text-subtle)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
            {isConnected && (
              <span className="chip chip-claimed" style={{ fontSize: '11px', margin: 0 }}>
                <span className="chip-dot"></span>
                Level {highestClaimedLevel + 1} / 5
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
            
            {TIERS.map((tier, idx) => {
              const Icon = tier.icon;
              const status = getTierStatus(tier.level);
              const isClaimed = status === 'claimed';
              const isEligibleTier = status === 'eligible';
              const isAwaiting = status === 'awaiting-approval';
              const isLocked = status === 'locked' || status === 'locked-prereq';
              const claimedTx = getClaimedTxDetails(tier.level);

              let borderStyle = '1px solid rgba(255, 255, 255, 0.06)';
              let bgStyle = 'rgba(255, 255, 255, 0.02)';
              let opacityStyle = '1';
              let iconBg = 'var(--surface-alt)';
              let iconBorderColor = 'rgba(255, 255, 255, 0.1)';
              let glowStyle = 'none';

              if (isClaimed) {
                borderStyle = '1px solid rgba(34, 197, 94, 0.3)';
                bgStyle = 'rgba(34, 197, 94, 0.03)';
                iconBg = 'rgba(34, 197, 94, 0.1)';
                iconBorderColor = 'var(--success)';
                glowStyle = '0 0 15px rgba(34, 197, 94, 0.1)';
              } else if (isEligibleTier) {
                borderStyle = `1px solid ${tier.color}`;
                bgStyle = `${tier.color}07`;
                iconBg = `${tier.color}15`;
                iconBorderColor = tier.color;
                glowStyle = `0 0 20px ${tier.color}25`;
              } else if (isLocked) {
                opacityStyle = '0.55';
              } else if (isAwaiting) {
                borderStyle = '1px solid rgba(245, 158, 11, 0.25)';
                bgStyle = 'rgba(245, 158, 11, 0.02)';
                opacityStyle = '0.85';
              }

              return (
                <div 
                  key={tier.level} 
                  className="timeline-row"
                  style={{ 
                    opacity: opacityStyle,
                  }}
                >
                  {/* Left Side: Timeline column with connection lines and node icon */}
                  <div className="timeline-line-col">
                    {/* Upper line segment */}
                    {idx > 0 && (
                      <div 
                        className="timeline-line-upper"
                        style={{
                          background: claimedLevels.has(TIERS[idx - 1].level) ? 'var(--success)' : 'rgba(255,255,255,0.06)',
                        }} 
                      />
                    )}

                    {/* Lower line segment */}
                    {idx < TIERS.length - 1 && (
                      <div 
                        className="timeline-line-lower"
                        style={{
                          background: claimedLevels.has(tier.level) ? 'var(--success)' : 'rgba(255,255,255,0.06)',
                        }} 
                      />
                    )}

                    {/* Node Icon Container */}
                    <div 
                      className="timeline-node"
                      style={{ 
                        background: iconBg, 
                        border: `2px solid ${iconBorderColor}`,
                        boxShadow: isClaimed ? '0 0 10px rgba(34,197,94,0.3)' : (isEligibleTier ? `0 0 10px ${tier.color}40` : 'none'),
                      }}
                    >
                      {isClaimed ? (
                        <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />
                      ) : isAwaiting ? (
                        <Lock size={20} style={{ color: 'var(--warning)' }} />
                      ) : isLocked ? (
                        <Lock size={20} style={{ color: 'var(--text-subtle)' }} />
                      ) : (
                        <Icon size={24} style={{ color: tier.color }} />
                      )}
                    </div>
                  </div>

                  {/* Right Side: Content Card */}
                  <div 
                    className={`card ${isEligibleTier ? 'pulse-glow' : ''}`}
                    style={{ 
                      flex: 1,
                      padding: '20px', 
                      borderRadius: 'var(--radius-lg)', 
                      border: borderStyle,
                      background: bgStyle,
                      boxShadow: glowStyle,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {tier.subtitle}
                      </span>
                      {isClaimed && (
                        <span className="chip chip-verified" style={{ fontSize: '9px', padding: '2px 8px' }}>
                          <span className="chip-dot"></span> Claimed
                        </span>
                      )}
                      {isEligibleTier && (
                        <span className="chip chip-eligible" style={{ fontSize: '9px', padding: '2px 8px', animation: 'pulse 2s infinite' }}>
                          <span className="chip-dot"></span> Ready to Claim
                        </span>
                      )}
                      {isAwaiting && (
                        <span className="chip chip-pending" style={{ fontSize: '9px', padding: '2px 8px' }}>
                          <span className="chip-dot"></span> Awaiting Approval
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                      {tier.name}
                    </h3>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4, marginBottom: isClaimed || isEligibleTier || isAwaiting ? '14px' : '0' }}>
                      {tier.description}
                    </p>

                    {/* Claimed Info Panel */}
                    {isClaimed && claimedTx && (
                      <div style={{ 
                        background: 'rgba(0,0,0,0.2)', 
                        padding: '12px 14px', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid rgba(255,255,255,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-subtle)' }}>Token ID:</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--secondary)' }}>#{claimedTx.tokenId}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-subtle)' }}>Transaction:</span>
                          <a 
                            href={`https://sepolia.basescan.org/tx/${claimedTx.txHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: 'var(--text)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            Basescan <ExternalLink size={11} />
                          </a>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                          <span style={{ color: 'var(--text-subtle)' }}>Metadata URI:</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(claimedTx.metadataUri);
                              alert('Metadata URI copied to clipboard!');
                            }}
                            className="btn-sm btn-ghost"
                            style={{ height: '24px', padding: '0 8px', fontSize: '10px' }}
                          >
                            <Share2 size={10} /> Share Pass
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Eligible Claims trigger button */}
                    {isEligibleTier && (
                      <button 
                        onClick={() => startClaimFlow(tier)}
                        className="btn btn-sm btn-primary"
                        style={{ background: tier.color, color: '#000', fontWeight: 700 }}
                      >
                        Claim Gasless via UGF <ChevronRight size={14} />
                      </button>
                    )}

                    {/* Awaiting Approval note */}
                    {isAwaiting && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--warning)', fontSize: '0.8rem' }}>
                        <Info size={12} />
                        <span>Awaiting event criteria completion. Use Developer Tools to simulate.</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: UGF Console + Live Connection + Demo tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Wallet Connection Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: 'var(--primary)' }} /> Web3 Connection Status
            </h3>
            
            {!isConnected ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <ShieldAlert size={40} style={{ color: 'var(--warning)', marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '18px' }}>
                  Connect your wallet to view connection status and claim your credentials.
                </p>
                <ConnectWalletButton style={{ margin: '0 auto', display: 'inline-flex' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Active Event:</span>
                  <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{activeEventTitle}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Your Wallet:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>
                    {address.substring(0, 6)}...{address.substring(address.length - 4)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>ETH Balance:</span>
                  <span style={{ color: 'var(--error)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    0.000 ETH (No Gas Needed)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Progression Status:</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {highestClaimedLevel === 4 ? (
                      <>
                        Fully Completed! <Trophy size={14} />
                      </>
                    ) : (
                      `Level ${highestClaimedLevel + 1} Eligible`
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Centralized UGF Gasless claiming console */}
          <div 
            className="glass-panel" 
            id="ugf-console"
            style={{ 
              padding: '28px', 
              border: claimingTier ? `1px solid ${claimingTier.color}` : '1px solid rgba(255,255,255,0.08)',
              boxShadow: claimingTier ? `0 0 25px ${claimingTier.color}15` : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} style={{ color: claimingTier ? claimingTier.color : 'var(--secondary)' }} />
              UGF Gasless Console
            </h3>

            {!isConnected ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ color: 'var(--text-subtle)', fontSize: '0.9rem', marginBottom: '18px' }}>
                  Connect your wallet to enable gasless credential minting.
                </p>
                <ConnectWalletButton style={{ margin: '0 auto', display: 'inline-flex' }} />
              </div>
            ) : !claimingTier ? (
              <div style={{ padding: '10px 0', textAlign: 'center' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px dashed rgba(255,255,255,0.1)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <Unlock size={20} style={{ color: 'var(--text-subtle)' }} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Select an eligible stage from the progression timeline on the left to start your gasless claim or upgrade transaction.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Console Target Credential Header */}
                <div style={{ 
                  background: 'rgba(0,0,0,0.15)', 
                  border: `1px solid ${claimingTier.color}20`,
                  borderRadius: 'var(--radius-lg)', 
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: `${claimingTier.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${claimingTier.color}`
                  }}>
                    {React.createElement(claimingTier.icon, { size: 16, style: { color: claimingTier.color } })}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Claiming Destination</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{claimingTier.name}</div>
                  </div>
                </div>

                {ugfStep === '' && (
                  <div>
                    <div className="info-note" style={{ marginBottom: '16px' }}>
                      {claimingTier.level === 0 && !onchainEligible ? (
                        <>
                          <strong>Simulation Mode:</strong> Since your wallet is not whitelisted on-chain, we are running in simulated gasless claim mode. Whitelist your wallet using Owner helper tools to run the real UGF flow.
                        </>
                      ) : (
                        <>
                          <strong>Gasless Abstraction:</strong> The Universal Gas Framework pays the required network gas fee on Base Sepolia. The interaction costs 0.15 Mock USD settled directly from your event credit account.
                        </>
                      )}
                    </div>
                    {ugfError && (
                      <div style={{ 
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#ff8a8a',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                        marginBottom: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <span style={{ fontWeight: 700 }}>Transaction Failed:</span>
                        <span>{ugfError}</span>
                      </div>
                    )}
                    <button 
                      onClick={triggerUgfClaim} 
                      className="btn btn-full btn-primary animate-pop-in"
                      style={{ background: claimingTier.color, color: '#000', fontWeight: 700 }}
                    >
                      Execute Gasless Transaction
                    </button>
                  </div>
                )}

                {/* Live UGF Steps List */}
                {ugfStep !== '' && ugfStep !== 'success' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {UGF_STEPS.map((step) => {
                      const isActive = ugfStep === step.key;
                      
                      let isDone = false;
                      const activeIndex = UGF_STEPS.findIndex(s => s.key === ugfStep);
                      const stepIndex = UGF_STEPS.findIndex(s => s.key === step.key);
                      if (activeIndex > stepIndex) isDone = true;

                      return (
                        <div 
                          key={step.key} 
                          style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            padding: '10px 12px',
                            background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                            borderRadius: 'var(--radius-md)',
                            border: isActive ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
                            opacity: isDone || isActive ? 1 : 0.45,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {/* Step Icon */}
                          <div style={{ flexShrink: 0, marginTop: '2px' }}>
                            {isDone ? (
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(34,197,94,0.2)', border: '1px solid var(--success)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                                <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />
                              </div>
                            ) : isActive ? (
                              <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: claimingTier.color }}></div>
                            ) : (
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                                {step.number}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 650, color: isActive ? claimingTier.color : '#fff' }}>
                              {step.title}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Successful Claim Console Screen */}
                {ugfStep === 'success' && (
                  <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)' }}>
                      <CheckCircle2 size={28} />
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Mint Finalized Gaslessly!</h4>
                    </div>

                    <div style={{ 
                      background: 'rgba(0,0,0,0.2)', 
                      padding: '14px', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-subtle)' }}>Credential Tier:</span>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{txDetails.tier}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-subtle)' }}>NFT Token ID:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: claimingTier.color }}>#{txDetails.tokenId}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '4px' }}>
                        <span style={{ color: 'var(--text-subtle)' }}>Base Sepolia Transaction Hash:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', overflowWrap: 'anywhere' }}>
                          {txDetails.txHash}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <a 
                        href={`https://sepolia.basescan.org/tx/${txDetails.txHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary" 
                        style={{ flex: 1, height: '36px', fontSize: '0.8rem', justifyContent: 'center' }}
                      >
                        Basescan <ExternalLink size={12} />
                      </a>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(txDetails.metadataUri);
                          alert('Metadata URI copied to clipboard!');
                        }} 
                        className="btn btn-primary" 
                        style={{ flex: 1, height: '36px', fontSize: '0.8rem', justifyContent: 'center', background: claimingTier.color, color: '#000' }}
                      >
                        Share Pass <Share2 size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Demo operator controls for hackathon judges */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px dashed rgba(255, 255, 255, 0.15)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} style={{ color: 'var(--primary)' }} /> Demo Helper Controls
            </h3>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '16px' }}>
              Simulate hackathon stage updates to review the progression logic instantly without swapping tabs.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Onchain Whitelist Control for Smart Contract Owner */}
              {isConnected && contractOwner && address && address.toLowerCase() === contractOwner.toLowerCase() && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px', 
                  padding: '12px 14px', 
                  background: onchainEligible ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)', 
                  borderRadius: 'var(--radius-md)', 
                  border: onchainEligible ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: onchainEligible ? 'var(--success)' : 'var(--error)' }}></span>
                        Onchain Whitelist Status
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {onchainEligible ? 'Whitelisted (Ready for UGF claim)' : 'Not Whitelisted (UGF will fail)'}
                      </div>
                    </div>
                    {!onchainEligible && (
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
                          fontWeight: 700
                        }}
                      >
                        {whitelisting ? 'Whitelisting...' : 'Whitelist Me'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isConnected && highestClaimedLevel < 4 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Approve Stage Upgrade</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Unlock: {TIERS[highestClaimedLevel + 1]?.name}</div>
                  </div>
                  <button 
                    onClick={() => setSimulateApproval(!simulateApproval)}
                    className="btn btn-sm"
                    style={{ 
                      background: simulateApproval ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.05)',
                      border: simulateApproval ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.1)',
                      color: simulateApproval ? 'var(--success)' : 'var(--text-muted)',
                      fontWeight: 600
                    }}
                  >
                    {simulateApproval ? 'Approved' : 'Approve'}
                  </button>
                </div>
              )}

              <button 
                onClick={handleResetDemo}
                className="btn btn-sm btn-ghost btn-full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <RefreshCw size={12} />
                Reset Demo Progression
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
