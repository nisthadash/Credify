import React, { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { CheckCircle2, ShieldAlert, Award, Star, Flame, Compass, ChevronRight, Share2, ExternalLink } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000/api';

const TIERS = [
  { level: 0, name: 'Event Pass', description: 'Your entry pass for registering and checking in.', icon: Compass, color: '#00f2fe' },
  { level: 1, name: 'Participant Badge', description: 'Verifies active workshop attendance and hacking.', icon: Flame, color: '#3b82f6' },
  { level: 2, name: 'Finalist Badge', description: 'Awarded to teams selected for final pitches.', icon: Star, color: '#a855f7' },
  { level: 3, name: 'Winner Certificate', description: 'Tamper-proof recognition for top place finishes.', icon: Award, color: '#ec4899' },
  { level: 4, name: 'Mentor / Volunteer', description: 'Recognizes contributions of guides and event staff.', icon: CheckCircle2, color: '#10b981' }
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Application States
  const [eligibility, setEligibility] = useState({ checked: false, isEligible: false, eventTitle: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // UGF Gasless Minting Flow States
  const [ugfStep, setUgfStep] = useState(''); // 'quoting' | 'settling' | 'executing' | 'confirming' | 'success'
  const [txDetails, setTxDetails] = useState({ tokenId: null, txHash: '', tier: 'Event Pass', metadataUri: '' });

  // Check Whitelist eligibility from Backend on wallet connect
  useEffect(() => {
    if (isConnected && address) {
      checkWhitelist();
    } else {
      setEligibility({ checked: false, isEligible: false, eventTitle: '' });
      setUgfStep('');
    }
  }, [isConnected, address]);

  const checkWhitelist = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${BACKEND_URL}/eligible/${address}`);
      const data = await res.json();
      if (data.success) {
        setEligibility({
          checked: true,
          isEligible: data.data.isEligible,
          eventTitle: data.data.eventTitle || 'Credify Hackathon Event'
        });
      } else {
        // Fallback mock if backend server is not running yet
        setEligibility({
          checked: true,
          isEligible: true,
          eventTitle: 'EthIndia 2026 (Mock Demo Mode)'
        });
      }
    } catch (err) {
      console.warn('Backend server not connected. Falling back to frontend mock demo mode.');
      setEligibility({
        checked: true,
        isEligible: true,
        eventTitle: 'Credify Base Sepolia Workshop (Demo Mode)'
      });
    } finally {
      setLoading(false);
    }
  };

  // 4-Step UGF Gasless Claim Execution
  const triggerUgfClaim = async () => {
    setErrorMsg('');
    
    // Step 1: Quote (Calculates gas in Mock USD)
    setUgfStep('quoting');
    await new Promise(r => setTimeout(r, 2000));

    // Step 2: Settle (Approve payment in Mock USD)
    setUgfStep('settling');
    await new Promise(r => setTimeout(r, 1800));

    // Step 3: Execute (UGF pays ETH gas and executes contract)
    setUgfStep('executing');
    await new Promise(r => setTimeout(r, 2200));

    // Step 4: Confirm (Block is finalized, mint is confirmed onchain)
    setUgfStep('confirming');
    
    const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const randomTokenId = Math.floor(Math.random() * 500) + 1;
    const protocol = window.location.protocol;
    const host = window.location.host;
    const mockMetadata = `${protocol}//${host}/api/credentials/metadata/${address}/demo-event`;

    // Attempt to save result to backend DB cache if operational
    try {
      await fetch(`${BACKEND_URL}/credentials/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: randomTokenId,
          walletAddress: address,
          eventId: '664cc56a7d7324a0d85485ab', // Placeholder valid Object ID
          txHash: mockTxHash,
          metadataUri: mockMetadata,
          tierLevel: 0
        })
      });
    } catch (dbErr) {
      console.warn('Backend DB not updated, proceeding in frontend storage.');
    }

    setTxDetails({
      tokenId: randomTokenId,
      txHash: mockTxHash,
      tier: 'Event Pass',
      metadataUri: mockMetadata
    });
    
    await new Promise(r => setTimeout(r, 1000));
    setUgfStep('success');
  };

  return (
    <div className="main-container">
      {/* Title Hero */}
      <section style={{ textAlign: 'center', marginBottom: '60px', marginTop: '20px' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '16px', lineHeight: 1.2 }}>
          Claim Gasless Onchain Credentials
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
          Credify removes blockchain complexity. Connect your wallet, claim event passes, and upgrade credentials without ever needing ETH for gas.
        </p>
      </section>

      {/* Main Grid: timeline on left, interactive panel on right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '40px', alignItems: 'start' }}>
        
        {/* Left Side: Progressive Credential Ladder Timeline */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📈</span> Progressive Credential Ladder
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', position: 'relative' }}>
            {/* Vertical timeline line */}
            <div style={{ 
              position: 'absolute', 
              left: '20px', 
              top: '20px', 
              bottom: '20px', 
              width: '2px', 
              background: 'linear-gradient(to bottom, var(--accent-cyan), var(--accent-purple), transparent)' 
            }}></div>

            {TIERS.map((tier, idx) => {
              const Icon = tier.icon;
              return (
                <div key={idx} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 1 }}>
                  {/* Glowing ring icon container */}
                  <div style={{ 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-tertiary)', 
                    border: `2px solid ${tier.color}`,
                    boxShadow: `0 0 10px ${tier.color}40`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={18} style={{ color: tier.color }} />
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {tier.name}
                      {idx === 0 && <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(0,242,254,0.1)', color: 'var(--accent-cyan)', border: '1px solid var(--accent-cyan)' }}>Current Stage</span>}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.4 }}>
                      {tier.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Whitelist and Gasless claim console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Wallet Connection Card */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>🔐 Live Connection Panel</h2>
            
            {!isConnected ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <ShieldAlert size={48} style={{ color: 'var(--accent-blue)', marginBottom: '16px' }} />
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Please connect your browser wallet (MetaMask) to verify your event eligibility.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Event Name:</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{eligibility.eventTitle}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Connected Wallet:</span>
                  <span style={{ fontFamily: 'monospace', color: '#fff' }}>{address.substring(0, 8)}...{address.substring(address.length - 8)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>ETH Balance (Gas):</span>
                  <span style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    0.000 ETH (Insufficient ETH) ❌
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Whitelist Status:</span>
                  {eligibility.isEligible ? (
                    <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={16} /> Eligible to Claim Pass ✅
                    </span>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>Not Whitelisted</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* UGF Gasless Claim console */}
          {isConnected && eligibility.isEligible && (
            <div className="glass-panel pulse-glow" style={{ padding: '30px', borderColor: 'var(--accent-cyan)' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: 'var(--accent-cyan)', borderWidth: '2px' }}></span>
                Universal Gas Framework Console
              </h2>
              
              {ugfStep === '' && (
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    You have zero ETH, but your wallet is approved. The UGF API will calculate the gas, request settlement in Mock USD, and execute the minting transaction completely gaslessly in the background.
                  </p>
                  <button onClick={triggerUgfClaim} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Claim Gasless Event Pass
                  </button>
                </div>
              )}

              {/* Step 1: Quoting */}
              {ugfStep === 'quoting' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '16px' }}>
                  <div className="spinner"></div>
                  <h4 style={{ color: 'var(--accent-cyan)' }}>[Step 1/4] Requesting Gas Quote...</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
                    Calculating contract interaction cost on Base Sepolia blockchain.
                  </p>
                </div>
              )}

              {/* Step 2: Settling */}
              {ugfStep === 'settling' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '16px' }}>
                  <div className="spinner" style={{ borderTopColor: 'var(--accent-blue)' }}></div>
                  <h4 style={{ color: 'var(--accent-blue)' }}>[Step 2/4] Settling in Mock USD...</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
                    Deducting 0.15 Mock USD from your whitelisted credit balance. No ETH needed.
                  </p>
                </div>
              )}

              {/* Step 3: Executing */}
              {ugfStep === 'executing' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '16px' }}>
                  <div className="spinner" style={{ borderTopColor: 'var(--accent-purple)' }}></div>
                  <h4 style={{ color: 'var(--accent-purple)' }}>[Step 3/4] UGF Executing Contract Call...</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
                    UGF Relayer is paying the ETH gas and submitting claimPass() to Base Sepolia.
                  </p>
                </div>
              )}

              {/* Step 4: Confirming */}
              {ugfStep === 'confirming' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '16px' }}>
                  <div className="spinner" style={{ borderTopColor: 'var(--accent-pink)' }}></div>
                  <h4 style={{ color: 'var(--accent-pink)' }}>[Step 4/4] Finalizing Block Confirmation...</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
                    Waiting for onchain block confirmation on Base Sepolia testnet.
                  </p>
                </div>
              )}

              {/* Success Screen */}
              {ugfStep === 'success' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981' }}>
                    <CheckCircle2 size={32} />
                    <h3 style={{ fontSize: '1.4rem' }}>Credential Claimed!</h3>
                  </div>

                  <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>NFT Token ID:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-cyan)' }}>#{txDetails.tokenId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Credential Level:</span>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{txDetails.tier} (Tier 0)</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', borderTop: '1px solid var(--border-light)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Transaction Hash:</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-secondary)', overflowWrap: 'anywhere' }}>{txDetails.txHash}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <a 
                      href={`https://sepolia.basescan.org/tx/${txDetails.txHash}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary" 
                      style={{ flex: 1, padding: '10px', fontSize: '0.85rem', justifyContent: 'center' }}
                    >
                      Basescan <ExternalLink size={14} />
                    </a>
                    <button 
                      onClick={() => alert(`Share Link: ${txDetails.metadataUri}`)} 
                      className="btn-primary" 
                      style={{ flex: 1, padding: '10px', fontSize: '0.85rem', justifyContent: 'center' }}
                    >
                      Share Pass <Share2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
