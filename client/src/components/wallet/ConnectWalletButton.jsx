import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { LogOut, Wallet, AlertTriangle, Copy, CheckCheck, ExternalLink, X, ChevronRight, ShieldCheck, Sparkles, Info } from 'lucide-react';

export default function ConnectWalletButton({ style, className, ...props }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCorrectNetwork = isConnected && chainId === baseSepolia.id;

  const formatAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenMetaMaskDeepLink = () => {
    const deepLink = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}${window.location.search}`;
    window.open(deepLink, '_blank');
  };

  const handleOpenCoinbaseDeepLink = () => {
    const deepLink = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`;
    window.open(deepLink, '_blank');
  };

  const handleConnectInjected = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const injConnector = connectors.find(c => c.id === 'injected') || connectors[0];
      if (injConnector) {
        connect({ connector: injConnector });
        setShowConnectModal(false);
      }
    } else {
      // Injected browser wallet not detected
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        handleOpenMetaMaskDeepLink();
      } else {
        window.open('https://metamask.io/download/', '_blank');
      }
    }
  };

  const handleConnectCoinbase = () => {
    const cbConnector = connectors.find(c => c.id.toLowerCase().includes('coinbase'));
    if (cbConnector) {
      connect({ connector: cbConnector });
      setShowConnectModal(false);
    } else {
      alert("Coinbase Wallet SDK is loading, please try again in a moment.");
    }
  };

  return (
    <div style={{ position: 'relative', ...style }} className={className} {...props}>
      <style>{`
        @keyframes wallet-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes wallet-slide-up {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .wallet-overlay {
          animation: wallet-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .wallet-card {
          animation: wallet-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Trigger Button */}
      {!isConnected ? (
        <button
          id="connect-wallet-btn"
          onClick={() => setShowConnectModal(true)}
          disabled={isPending}
          className="btn btn-primary animate-pulse-glow"
          style={{ padding: '0 20px', height: '40px', fontSize: '14px', width: style?.width || 'auto' }}
        >
          <Wallet size={15} />
          {isPending ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : !isCorrectNetwork ? (
        <button
          id="switch-network-btn"
          onClick={() => switchChain({ chainId: baseSepolia.id })}
          className="btn"
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fcd34d',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            padding: '0 20px',
            height: '40px',
            fontSize: '14px',
            borderRadius: '12px',
            width: style?.width || 'auto'
          }}
        >
          <AlertTriangle size={15} />
          Switch to Base Sepolia
        </button>
      ) : (
        <button
          id="wallet-address-btn"
          onClick={() => setShowDropdown(!showDropdown)}
          className="btn btn-ghost"
          style={{
            height: '40px',
            padding: '0 16px',
            fontSize: '14px',
            borderColor: 'rgba(37, 99, 235, 0.35)',
            background: 'rgba(37, 99, 235, 0.08)',
            color: '#93c5fd',
            gap: '8px',
            width: style?.width || '100%',
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#22c55e', display: 'inline-block',
            boxShadow: '0 0 6px #22c55e'
          }} />
          {formatAddress(address)}
        </button>
      )}

      {/* Connected Dropdown */}
      {isConnected && showDropdown && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={() => setShowDropdown(false)}
          />
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '240px',
              padding: '8px',
              zIndex: 1000,
              background: 'rgba(10, 10, 18, 0.99)',
              border: '1px solid rgba(37, 99, 235, 0.35)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(37, 99, 235, 0.15)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            <div style={{
              padding: '10px 12px 10px',
              borderBottom: '1px solid var(--border)',
              marginBottom: '6px',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Connected wallet
              </div>
              <div className="mono" style={{ fontSize: '13px', color: 'var(--text)', wordBreak: 'break-all' }}>
                {address}
              </div>
            </div>

            <button
              onClick={handleCopy}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '13px',
                transition: 'var(--t)', fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {copied ? <CheckCheck size={14} color="#22c55e" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Address'}
            </button>

            <a
              href={`https://sepolia.basescan.org/address/${address}`}
              target="_blank"
              rel="noreferrer"
              style={{
                width: '100%', background: 'transparent', border: 'none',
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '13px',
                transition: 'var(--t)', textDecoration: 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ExternalLink size={14} />
              View on Basescan
            </a>

            <div style={{ borderTop: '1px solid var(--border)', marginTop: '6px', paddingTop: '6px' }} />

            <button
              onClick={() => { disconnect(); setShowDropdown(false); }}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                color: '#fca5a5', fontSize: '13px',
                transition: 'var(--t)', fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={14} />
              Disconnect
            </button>
          </div>
        </>
      )}

      {/* Connect Modal / Bottom Sheet */}
      {!isConnected && showConnectModal && (
        <div 
          className="wallet-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4, 4, 8, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          {/* Backdrop Closer */}
          <div style={{ position: 'absolute', inset: 0 }} onClick={() => setShowConnectModal(false)} />

          {/* Modal Box */}
          <div 
            className="glass-panel wallet-card"
            style={{
              position: 'relative',
              zIndex: 10000,
              width: '100%',
              maxWidth: '420px',
              background: 'rgba(13, 13, 26, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(37, 99, 235, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                  Connect Wallet
                </h3>
              </div>
              <button 
                onClick={() => setShowConnectModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'var(--t)',
                  padding: 0
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <X size={15} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Connect with your preferred wallet extension or create a quick smart wallet instantly to claim gaslessly.
            </p>

            {/* Providers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Option 1: Coinbase Smart Wallet (RECOMMENDED) */}
              <button
                onClick={handleConnectCoinbase}
                style={{
                  width: '100%',
                  background: 'rgba(37, 99, 235, 0.07)',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(37, 99, 235, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(37, 99, 235, 0.07)';
                  e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.3)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: '#0052FF', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: '#fff',
                    fontSize: '18px', fontWeight: 900
                  }}>
                    C
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Coinbase / Smart Wallet <span style={{ fontSize: '9px', background: 'rgba(34,197,94,0.15)', color: '#86efac', padding: '2px 6px', borderRadius: '6px', fontWeight: 700, letterSpacing: '0.03em' }}>EASY</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                      No app downloads. Securely use FaceID / Passkey.
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-subtle)' }} />
              </button>

              {/* Option 2: Browser Wallet (MetaMask / Injected) */}
              <button
                onClick={handleConnectInjected}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: '#fff',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <Wallet size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                      Injected Browser Wallet
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                      MetaMask, Coinbase browser extension, etc.
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-subtle)' }} />
              </button>

              {/* Option 3: Open MetaMask App (Mobile Helper) */}
              {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
                <button
                  onClick={handleOpenMetaMaskDeepLink}
                  style={{
                    width: '100%',
                    background: 'rgba(249, 115, 22, 0.05)',
                    border: '1px solid rgba(249, 115, 22, 0.25)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(249, 115, 22, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(249, 115, 22, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.25)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'rgba(249, 115, 22, 0.1)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#f97316',
                      fontSize: '18px'
                    }}>
                      🦊
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                        Open in MetaMask
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                        Launch secure in-app browser automatically.
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-subtle)' }} />
                </button>
              )}

              {/* Option 4: Open Coinbase Wallet App (Mobile Helper) */}
              {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
                <button
                  onClick={handleOpenCoinbaseDeepLink}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 82, 255, 0.05)',
                    border: '1px solid rgba(0, 82, 255, 0.25)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0, 82, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(0, 82, 255, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0, 82, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(0, 82, 255, 0.25)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'rgba(0, 82, 255, 0.1)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#0052ff',
                      fontSize: '18px', fontWeight: 900
                    }}>
                      🛡️
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                        Open in Coinbase Wallet
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                        Launch secure Coinbase Wallet app browser.
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-subtle)' }} />
                </button>
              )}
            </div>

            {/* Note */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'start',
              gap: '10px'
            }}>
              <ShieldCheck size={16} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                <strong>Zero ETH gas friction</strong>: Credify's mock credits whitelist allows UGF to settle gas costs automatically. You pay zero gas and zero network fees!
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
