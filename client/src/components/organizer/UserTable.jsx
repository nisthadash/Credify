import React from 'react';
import { ExternalLink, ArrowUp } from 'lucide-react';
import StatusChip from '../common/StatusChip.jsx';

const TIER_NAMES = {
  0: 'Event Pass', 1: 'Participant', 2: 'Finalist',
  3: 'Winner', 4: 'Mentor',
};
const TIER_COLORS = {
  0: '#38bdf8', 1: '#2563eb', 2: '#a855f7', 3: '#ec4899', 4: '#22c55e',
};

export default function UserTable({ users = [], onUpgrade }) {
  if (!users.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No credential records found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Wallet', 'Token ID', 'Event', 'Tier', 'Status', 'Actions'].map(h => (
              <th key={h} style={{
                padding: '10px 16px', textAlign: 'left',
                fontSize: '11px', color: 'var(--text-muted)',
                fontFamily: 'var(--font-display)', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--t)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                {u.walletAddress ? `${u.walletAddress.slice(0, 8)}...${u.walletAddress.slice(-6)}` : '—'}
              </td>
              <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                #{u.tokenId || '—'}
              </td>
              <td style={{ padding: '14px 16px', color: 'var(--text)' }}>
                {u.eventName || 'Credify Event'}
              </td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{
                  color: TIER_COLORS[u.tierLevel] || '#2563eb',
                  fontWeight: 700, fontSize: '12px', fontFamily: 'var(--font-display)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {TIER_NAMES[u.tierLevel] || 'Pass'}
                </span>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <StatusChip variant="claimed" />
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {u.txHash && (
                    <a
                      href={`https://sepolia.basescan.org/tx/${u.txHash}`}
                      target="_blank" rel="noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                  {u.tierLevel < 4 && onUpgrade && (
                    <button
                      onClick={() => onUpgrade(u)}
                      className="btn btn-secondary btn-sm"
                    >
                      <ArrowUp size={12} /> Upgrade
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
