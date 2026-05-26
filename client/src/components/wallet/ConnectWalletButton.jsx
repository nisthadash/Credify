import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { LogOut, Wallet, AlertTriangle, Copy, CheckCheck, ExternalLink, X, ChevronRight, ShieldCheck } from 'lucide-react';

const MetaMaskIcon = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M30.05 13.9L25.37 5.75L23.47 9.87L27.42 15.35L30.05 13.9Z" fill="#E2761B"/>
    <path d="M1.95 13.9L6.63 5.75L8.53 9.87L4.58 15.35L1.95 13.9Z" fill="#E2761B"/>
    <path d="M26.27 22.02L27.52 15.22L23.57 9.74L19.45 15.84L22.18 19.34L26.27 22.02Z" fill="#E2761B"/>
    <path d="M5.73 22.02L4.48 15.22L8.43 9.74L12.55 15.84L9.82 19.34L5.73 22.02Z" fill="#E2761B"/>
    <path d="M12.55 15.83L8.43 9.73L14.7 8.54L16 11.83L17.3 8.54L23.57 9.73L19.45 15.83L16 17.65L12.55 15.83Z" fill="#E2761B"/>
    <path d="M22.18 19.34L19.45 15.84L16 17.66L12.55 15.84L9.82 19.34L16 23.35L22.18 19.34Z" fill="#D7C1B1"/>
    <path d="M22.18 19.34L16 23.35L16 29.35L25.27 23.35L22.18 19.34Z" fill="#231F20"/>
    <path d="M9.82 19.34L16 23.35L16 29.35L6.73 23.35L9.82 19.34Z" fill="#231F20"/>
    <path d="M25.27 23.35L16 29.35L26.57 26.6L30.05 13.9L25.27 23.35Z" fill="#C0AC9D"/>
    <path d="M6.73 23.35L16 29.35L5.43 26.6L1.95 13.9L6.73 23.35Z" fill="#C0AC9D"/>
  </svg>
);

const CoinbaseWalletIcon = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="32" height="32" rx="16" fill="#0052FF"/>
    <path d="M9 16C9 12.134 12.134 9 16 9C19.866 9 23 12.134 23 16C23 19.866 19.866 23 16 23C12.134 23 9 19.866 9 16Z" fill="white"/>
    <rect x="13.5" y="13.5" width="5" height="5" rx="1" fill="#0052FF"/>
  </svg>
);

export default function ConnectWalletButton({ style, className, ...props }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [providerReady, setProviderReady] = useState(false);

  const isCorrectNetwork = isConnected && chainId === baseSepolia.id;

  // Adaptive viewport listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const detectProvider = () => {
      const ethereum = window.ethereum;
      const hasProvider = Boolean(
        ethereum?.isMetaMask ||
        ethereum?.providers?.some(provider => provider.isMetaMask) ||
        ethereum
      );
      setProviderReady(hasProvider);
    };

    detectProvider();
    const timers = [250, 750, 1500].map(delay => setTimeout(detectProvider, delay));
    window.addEventListener('ethereum#initialized', detectProvider, { once: true });

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('ethereum#initialized', detectProvider);
    };
  }, []);

  // Lock body scroll when any overlay is open on mobile
  useEffect(() => {
    const isOpen = (showDropdown || showConnectModal) && isMobile;
    document.body.classList.toggle('wallet-open', isOpen);
    return () => document.body.classList.remove('wallet-open');
  }, [showDropdown, showConnectModal, isMobile]);

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
    window.location.href = deepLink;
  };

  // ── Mobile: directly connect, no modal ──
  // The MetaMask SDK connector handles the deep link / in-app browser detection automatically.
  const handleMobileConnect = () => {
    const mmConnector =
      connectors.find(c => c.id === 'metaMask') ||
      connectors.find(c => c.id === 'injected') ||
      connectors.find(c => c.type === 'injected') ||
      connectors[0];

    if (!mmConnector) {
      handleOpenMetaMaskDeepLink();
      return;
    }

    connect(
      { connector: mmConnector },
      {
        onError: (err) => {
          console.error('[Mobile connect]', err);
          if (err?.name === 'ConnectorAlreadyConnectedError') return;
          if (err?.message?.includes('rejected') || err?.code === 4001) return;
          // All other failures on mobile → send to MetaMask app
          handleOpenMetaMaskDeepLink();
        }
      }
    );
  };

  // ── Desktop: modal option → injected connector ──
  const handleConnectInjected = () => {
    if (!providerReady) {
      window.open('https://metamask.io/download', '_blank', 'noopener,noreferrer');
      return;
    }

    const injConnector =
      connectors.find(c => c.id === 'metaMask') ||
      connectors.find(c => c.id === 'injected') ||
      connectors.find(c => c.name?.toLowerCase().includes('metamask')) ||
      connectors.find(c => c.type === 'injected') ||
      connectors[0];

    if (!injConnector) return;

    connect(
      { connector: injConnector },
      {
        onSuccess: () => setShowConnectModal(false),
        onError: (err) => {
          console.error('Wallet connect failed:', err);
          if (err?.name === 'ConnectorAlreadyConnectedError') { setShowConnectModal(false); return; }
          if (err?.message?.includes('rejected') || err?.code === 4001) return;
          if (err?.message?.toLowerCase().includes('already pending') || err?.code === -32002) {
            alert('A MetaMask request is already pending. Open your MetaMask extension and approve it.');
            return;
          }
          alert('Failed to connect: ' + (err?.message || 'Unknown error'));
        }
      }
    );
  };

  const handleConnectCoinbase = () => {
    const cbConnector =
      connectors.find(c => c.id === 'coinbaseWallet') ||
      connectors.find(c => c.id === 'coinbaseWalletSDK') ||
      connectors.find(c => c.name?.toLowerCase().includes('coinbase'));

    if (cbConnector) {
      connect(
        { connector: cbConnector },
        {
          onSuccess: () => setShowConnectModal(false),
          onError: (err) => {
            console.error('Coinbase Wallet connect failed:', err);
            if (err?.name === 'ConnectorAlreadyConnectedError') {
              setShowConnectModal(false);
              return;
            }
            alert('Failed to connect: ' + (err?.message || 'Unknown error'));
          }
        }
      );
      return;
    }

    alert('Coinbase Wallet connector is not available. Please check configuration.');
  };

  return (
    <div style={{ position: 'relative', ...style }} className={className} {...props}>
      <style>{`
        @keyframes wallet-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes wallet-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes wallet-scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .wallet-overlay {
          animation: wallet-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .wallet-sheet {
          animation: wallet-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .wallet-modal-dialog {
          animation: wallet-scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Trigger Button */}
      {!isConnected ? (
        <button
          id="connect-wallet-btn"
          onClick={() => isMobile ? handleMobileConnect() : setShowConnectModal(true)}
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

      {/* Account Info: Adaptive Dropdown vs Mobile Drawer */}
      {isConnected && showDropdown && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: isMobile ? 'rgba(4,4,8,0.7)' : 'transparent', backdropFilter: isMobile ? 'blur(4px)' : 'none' }}
            onClick={() => setShowDropdown(false)}
          />

          {!isMobile ? (
            /* Desktop absolute dropdown card */
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '240px',
                padding: '8px',
                zIndex: 10000,
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
          ) : (
            /* Mobile bottom sheet drawer */
            <div
              className="wallet-sheet"
              onClick={e => e.stopPropagation()}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10000,
                background: 'rgba(13, 13, 26, 0.98)',
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '24px 24px 0 0',
                padding: '16px 20px 32px',
                boxShadow: '0 -16px 48px rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Drawer Handle */}
              <div style={{ width: '36px', height: '4px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '2px', margin: '0 auto' }} />

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>Wallet Details</span>
                <button 
                  onClick={() => setShowDropdown(false)}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%',
                    width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Info Block */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#86efac', fontWeight: 600 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                    Connected to Base Sepolia
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Wallet Address
                </div>
                <div className="mono" style={{ fontSize: '13px', color: '#fff', wordBreak: 'break-all', lineHeight: 1.5 }}>
                  {address}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleCopy}
                  className="btn btn-ghost"
                  style={{ width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}
                >
                  {copied ? <CheckCheck size={14} color="#22c55e" /> : <Copy size={14} />}
                  {copied ? 'Copied to Clipboard' : 'Copy Address'}
                </button>

                <a
                  href={`https://sepolia.basescan.org/address/${address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost"
                  style={{ width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', textDecoration: 'none' }}
                >
                  <ExternalLink size={14} />
                  View on Basescan
                </a>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

                <button
                  onClick={() => { disconnect(); setShowDropdown(false); }}
                  className="btn btn-danger btn-full"
                  style={{ width: '100%', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}
                >
                  <LogOut size={14} />
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Connect Modal: Adaptive Dialog vs Bottom Sheet */}
      {!isConnected && showConnectModal && (
        <div 
          className="wallet-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4, 4, 8, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: isMobile ? 0 : '16px'
          }}
        >
          {/* Backdrop Click Close */}
          <div style={{ position: 'absolute', inset: 0 }} onClick={() => setShowConnectModal(false)} />

          {/* Modal Container */}
          <div 
            className={`glass-panel ${isMobile ? 'wallet-sheet' : 'wallet-modal-dialog'}`}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              zIndex: 100000,
              width: '100%',
              maxWidth: isMobile ? '100%' : '380px',
              background: 'rgba(13, 13, 26, 0.98)',
              border: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
              borderTop: isMobile ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: isMobile ? '24px 24px 0 0' : '24px',
              padding: isMobile ? '16px 20px 32px' : '24px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(37, 99, 235, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            {/* Drawer Handle (Mobile Only) */}
            {isMobile && <div style={{ width: '36px', height: '4px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '2px', margin: '0 auto 6px' }} />}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                  Connect Wallet
                </h3>
              </div>
              <button 
                onClick={() => setShowConnectModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <X size={14} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              {isMobile 
                ? 'Open this page inside MetaMask Mobile, or use Coinbase Wallet to scan a QR code.'
                : 'Connect with MetaMask to manage and claim your digital credential pass.'
              }
            </p>

            {/* Custom MetaMask Option */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleConnectInjected}
                className="wallet-connect-option"
                style={{
                  width: '100%',
                  background: 'rgba(249, 115, 22, 0.06)',
                  border: '1px solid rgba(249, 115, 22, 0.25)',
                  borderRadius: '16px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(249, 115, 22, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(249, 115, 22, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.25)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <MetaMaskIcon />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      MetaMask <span style={{ fontSize: '9px', background: 'rgba(249,115,22,0.15)', color: '#fca5a5', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>REQUIRED</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                      {isMobile
                        ? providerReady ? 'Wallet detected — tap to connect' : 'Use MetaMask in-app browser'
                        : providerReady
                          ? 'Extension detected'
                          : 'Download MetaMask'
                      }
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-subtle)' }} />
              </button>

              <button
                onClick={handleConnectCoinbase}
                className="wallet-connect-option"
                style={{
                  width: '100%',
                  background: 'rgba(0, 82, 255, 0.06)',
                  border: '1px solid rgba(0, 82, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0, 82, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(0, 82, 255, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0, 82, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(0, 82, 255, 0.25)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <CoinbaseWalletIcon />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isMobile ? 'Coinbase Wallet' : 'Coinbase Wallet / QR'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                      {isMobile ? 'Connect with Coinbase Wallet app' : 'Scan QR code or use Coinbase app'}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-subtle)' }} />
              </button>
            </div>

            {/* Neon Tip */}
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
                <strong>No gas, no friction</strong>: Whitelisted credentials enable UGF to cover all Base Sepolia transaction fees behind the scenes.
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
