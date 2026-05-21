import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { LogOut, Link2, AlertTriangle, Wallet } from 'lucide-react';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [showDropdown, setShowDropdown] = useState(false);

  // Base Sepolia Chain ID is 84532
  const isCorrectNetwork = isConnected && chainId === baseSepolia.id;

  // Format wallet address for premium visual display
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleConnect = () => {
    // Connect to injected wallet (MetaMask, Rabby, Coinbase)
    const injectedConnector = connectors.find((c) => c.id === 'injected') || connectors[0];
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  if (!isConnected) {
    return (
      <button 
        onClick={handleConnect} 
        className="btn-primary pulse-glow"
        style={{ padding: '8px 18px', fontSize: '0.9rem', gap: '6px' }}
      >
        <Wallet size={16} />
        Connect Wallet
      </button>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <button 
        onClick={() => switchChain({ chainId: baseSepolia.id })} 
        className="btn-primary"
        style={{ 
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.25)',
          padding: '8px 18px', 
          fontSize: '0.9rem',
          gap: '6px'
        }}
      >
        <AlertTriangle size={16} />
        Switch to Base Sepolia
      </button>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="btn-secondary"
        style={{ 
          padding: '8px 18px', 
          fontSize: '0.9rem',
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          borderColor: 'rgba(0, 242, 254, 0.4)',
          background: 'rgba(0, 242, 254, 0.05)'
        }}
      >
        <span style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: '#00f2fe',
          display: 'inline-block'
        }}></span>
        {formatAddress(address)}
      </button>

      {showDropdown && (
        <div 
          className="glass-panel"
          style={{ 
            position: 'absolute', 
            top: 'calc(100% + 8px)', 
            right: 0, 
            width: '200px', 
            padding: '8px', 
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div style={{ 
            padding: '6px 12px', 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '4px'
          }}>
            Connected to Base Sepolia
          </div>
          <button 
            onClick={() => {
              disconnect();
              setShowDropdown(false);
            }}
            style={{ 
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
            className="dropdown-item"
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <LogOut size={14} />
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
}
