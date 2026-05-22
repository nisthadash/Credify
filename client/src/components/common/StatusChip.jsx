import React from 'react';

const VARIANTS = {
  eligible: 'chip-eligible',
  verified: 'chip-verified',
  claimed: 'chip-claimed',
  pending: 'chip-pending',
  'not-eligible': 'chip-not-eligible',
  error: 'chip-not-eligible',
  network: 'chip-network',
};

const LABELS = {
  eligible: 'Eligible',
  verified: 'Verified',
  claimed: 'Already Claimed',
  pending: 'Pending',
  'not-eligible': 'Not Eligible',
  error: 'Error',
  network: 'Base Sepolia',
};

export default function StatusChip({ variant = 'pending', label, style = {}, className = '' }) {
  const variantClass = VARIANTS[variant] || 'chip-pending';
  const displayLabel = label || LABELS[variant] || variant;

  return (
    <span className={`chip ${variantClass} ${className}`} style={style}>
      <span className="chip-dot" />
      {displayLabel}
    </span>
  );
}
