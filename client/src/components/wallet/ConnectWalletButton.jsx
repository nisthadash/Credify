import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { LogOut, Wallet, AlertTriangle, Copy, CheckCheck, ExternalLink } from 'lucide-react';

export default function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCorrectNetwork = isConnected && chainId === baseSepolia.id;

  const formatAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  const handleConnect = () => {
    const connector = connectors.find((c) => c.id === 'injected') || connectors[0];
    if (connector) connect({ connector });
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <button
        id="connect-wallet-btn"
        onClick={handleConnect}
        disabled={isPending}
        className="btn btn-primary animate-pulse-glow"
        style={{ padding: '0 20px', height: '40px', fontSize: '14px' }}
      >
        <Wallet size={15} />
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  if (!isCorrectNetwork) {
    return (
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
        }}
      >
        <AlertTriangle size={15} />
        Switch to Base Sepolia
      </button>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
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
        }}
      >
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#22c55e', display: 'inline-block',
          boxShadow: '0 0 6px #22c55e'
        }} />
        {formatAddress(address)}
      </button>

      {showDropdown && (
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
              background: 'rgba(13, 13, 26, 0.97)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(37, 99, 235, 0.12)',
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
    </div>
  );
}
