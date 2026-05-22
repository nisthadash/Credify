import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Loader from '../common/Loader.jsx';

const STEPS = [
  { id: 'quoting',    label: 'Fetching Gas Quote',        desc: 'Calculating contract interaction cost on Base Sepolia.' },
  { id: 'settling',   label: 'Settling in Mock USD',       desc: 'Deducting ~0.15 Mock USD. No ETH needed.' },
  { id: 'executing',  label: 'UGF Executing Contract',     desc: 'UGF Relayer pays ETH gas and submits claimPass() onchain.' },
  { id: 'confirming', label: 'Confirming on Base Sepolia', desc: 'Waiting for block finalization on Base Sepolia testnet.' },
];

const IDX = { quoting: 0, settling: 1, executing: 2, confirming: 3, success: 4 };

export default function UGFProgressModal({ isOpen, onClose, step }) {
  const currentIdx = IDX[step] ?? -1;
  const pct = step === 'success' ? 100 : Math.round(((currentIdx + 1) / 4) * 85);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gasless Claim in Progress"
      subtitle="UGF is handling gas on your behalf. No ETH needed."
      maxWidth="460px"
    >
      {/* Progress bar */}
      <div className="progress-track" style={{ marginBottom: '24px' }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Steps */}
      <div className="progress-steps">
        {STEPS.map((s, idx) => {
          const isDone   = currentIdx > idx;
          const isActive = currentIdx === idx;

          return (
            <div key={s.id} className={`progress-step ${isActive ? 'active' : ''}`}>
              {/* Icon */}
              <div className={`step-icon ${isDone ? 'step-icon-done' : isActive ? 'step-icon-active' : 'step-icon-pending'}`}>
                {isDone
                  ? <CheckCircle2 size={14} />
                  : isActive
                    ? <Loader size="sm" style={{ border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
                    : <span>{idx + 1}</span>
                }
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px',
                  color: isDone ? '#86efac' : isActive ? 'var(--text)' : 'var(--text-subtle)',
                  marginBottom: isActive ? '4px' : 0,
                }}>
                  {s.label}
                </p>
                {isActive && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {s.desc}
                  </p>
                )}
                {isDone && (
                  <p style={{ fontSize: '12px', color: '#86efac' }}>Completed</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* UGF note */}
      <div className="info-note" style={{ marginTop: '20px' }}>
        <strong>Universal Gas Framework</strong> — You pay ~0.15 Mock USD. UGF relayer covers ETH gas and submits the transaction.
      </div>
    </Modal>
  );
}
