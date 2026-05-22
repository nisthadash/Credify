import React from 'react';
import { useChainId } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

export default function NetworkBadge() {
  const chainId = useChainId();
  const isCorrectNetwork = chainId === baseSepolia.id;

  if (!isCorrectNetwork) {
    return (
      <span
        className="chip chip-pending"
        style={{ fontSize: '11px', padding: '3px 10px' }}
      >
        <span className="chip-dot" />
        Wrong Network
      </span>
    );
  }

  return (
    <span
      className="chip chip-network"
      style={{ fontSize: '11px', padding: '3px 10px' }}
    >
      <span className="chip-dot" style={{ background: 'var(--primary)', boxShadow: '0 0 5px var(--primary)' }} />
      Base Sepolia
    </span>
  );
}
