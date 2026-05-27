import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, ChevronRight, ChevronLeft, Rocket, FileCode2, CheckCircle2, Info, Copy, ExternalLink, Zap } from 'lucide-react';
import { useAccount } from 'wagmi';
import logo from '../assets/logo.png';

const STEPS = [
  { id: 1, label: 'Organization', icon: Building2 },
  { id: 2, label: 'Contract',     icon: FileCode2 },
  { id: 3, label: 'Confirm',      icon: CheckCircle2 },
];

const DEFAULT_FACTORY = '0x6506937Cf8c1d67cc08A86AA4f13263964eada28'; // Credify factory

export default function OrganizerOnboardingPage() {
  const navigate  = useNavigate();
  const { address, isConnected } = useAccount();
  const [step, setStep]       = useState(1);
  const [orgName, setOrgName] = useState('');
  const [eventName, setEventName] = useState('');
  const [contractMode, setContractMode] = useState('existing'); // 'existing' | 'deploy'
  const [contractAddress, setContractAddress] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState('');
  const [copied, setCopied] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    const org = sessionStorage.getItem('credify_organizer');
    if (!org) navigate('/organizer/login');
  }, [navigate]);

  const finalContract = contractMode === 'deploy' ? (deployedAddress || DEFAULT_FACTORY) : contractAddress;

  const handleDeploy = async () => {
    setDeploying(true);
    // Simulate factory deployment — replace with real factory call
    await new Promise(r => setTimeout(r, 2000));
    setDeployedAddress(`0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`);
    setDeploying(false);
  };

  const handleFinish = () => {
    const org = JSON.parse(sessionStorage.getItem('credify_organizer') || '{}');
    sessionStorage.setItem('credify_organizer', JSON.stringify({
      ...org, orgName, eventName, contractAddress: finalContract,
    }));
    navigate('/organizer/dashboard');
  };

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <img src={logo} alt="Credify" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 14px rgba(37,99,235,0.25)', margin: '0 auto 14px', display: 'block' }} />
          <h1 style={{ fontSize: '22px', marginBottom: '6px' }}>Set Up Your Organization</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Complete this one-time setup to start issuing onchain credentials.</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '32px' }}>
          {STEPS.map((s, i) => {
            const active  = step === s.id;
            const done    = step > s.id;
            const color   = done ? '#22c55e' : active ? '#818cf8' : 'rgba(255,255,255,0.15)';
            const Icon    = s.icon;
            return (
              <React.Fragment key={s.id}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: done ? 'rgba(34,197,94,0.12)' : active ? 'rgba(129,140,248,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease',
                  }}>
                    {done ? <CheckCircle2 size={16} style={{ color: '#22c55e' }} /> : <Icon size={16} style={{ color }} />}
                  </div>
                  <span style={{ fontSize: '11px', color: active ? '#c4b5fd' : done ? '#86efac' : 'var(--text-subtle)', fontWeight: active ? 700 : 500 }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 60, height: 1, background: step > s.id ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.08)', margin: '0 8px', marginBottom: '20px', transition: 'background 0.3s' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step panels */}
        <div className="card animate-fade-up" style={{ padding: '32px' }}>

          {/* ── Step 1: Org Info ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <Building2 size={18} style={{ color: '#818cf8' }} />
                  <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Organization Details</h2>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="e.g. ETHIndia Foundation"
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Event / Hackathon Name *
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  placeholder="e.g. ETHIndia 2026"
                  className="input-field"
                />
              </div>
              {isConnected && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.14)', fontSize: '12px', color: 'var(--text-subtle)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Info size={12} style={{ color: '#818cf8', flexShrink: 0 }} />
                  Organizer wallet: <span style={{ fontFamily: 'var(--font-mono)', color: '#c4b5fd' }}>{address?.slice(0, 8)}…{address?.slice(-6)}</span>
                </div>
              )}
              <button
                onClick={() => setStep(2)}
                disabled={!orgName.trim() || !eventName.trim()}
                className="btn btn-primary btn-full"
                style={{ height: '46px', marginTop: '4px', gap: '8px' }}
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── Step 2: Contract ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <FileCode2 size={18} style={{ color: '#818cf8' }} />
                <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Badge Contract</h2>
              </div>

              {/* Mode toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { mode: 'existing', label: 'Use Existing',  desc: 'I already have a contract address', icon: FileCode2 },
                  { mode: 'deploy',   label: 'Deploy New',    desc: 'Deploy via Credify factory on Base', icon: Rocket },
                ].map(({ mode, label, desc, icon: MIcon }) => (
                  <button
                    key={mode}
                    onClick={() => setContractMode(mode)}
                    style={{
                      padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                      background: contractMode === mode ? 'rgba(129,140,248,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${contractMode === mode ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.2s', color: 'inherit',
                    }}
                  >
                    <MIcon size={16} style={{ color: contractMode === mode ? '#818cf8' : 'var(--text-subtle)', marginBottom: '8px' }} />
                    <p style={{ fontSize: '13px', fontWeight: 700, color: contractMode === mode ? '#c4b5fd' : '#fff', marginBottom: '4px' }}>{label}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-subtle)', lineHeight: 1.5 }}>{desc}</p>
                  </button>
                ))}
              </div>

              {/* Existing address input */}
              {contractMode === 'existing' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contract Address (Base Sepolia)</label>
                  <input
                    type="text"
                    value={contractAddress}
                    onChange={e => setContractAddress(e.target.value)}
                    placeholder="0x…"
                    className="input-field"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '6px' }}>Leave blank to use the default Credify contract.</p>
                </div>
              )}

              {/* Factory deploy */}
              {contractMode === 'deploy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <Info size={14} style={{ color: '#93c5fd', flexShrink: 0, marginTop: '2px' }} />
                    <span>A new ERC-721 badge contract will be deployed on <strong style={{ color: '#93c5fd' }}>Base Sepolia</strong> using the Credify factory. You'll be the contract owner.</span>
                  </div>
                  {deployedAddress ? (
                    <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <p style={{ fontSize: '12px', color: '#86efac', fontWeight: 700, marginBottom: '6px' }}>✓ Contract Deployed</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <code style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#6ee7b7', flex: 1, wordBreak: 'break-all' }}>{deployedAddress}</code>
                        <button onClick={() => copyAddress(deployedAddress)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#22c55e' : 'var(--text-subtle)', padding: '4px' }}><Copy size={13} /></button>
                        <a href={`https://sepolia.basescan.org/address/${deployedAddress}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-subtle)' }}><ExternalLink size={13} /></a>
                      </div>
                    </div>
                  ) : (
                    <button onClick={handleDeploy} disabled={deploying} className="btn btn-primary btn-full" style={{ height: '46px', gap: '8px' }}>
                      {deploying ? <><div className="spinner spinner-sm" /> Deploying on Base Sepolia…</> : <><Zap size={16} /> Deploy My Badge Contract</>}
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ flex: '0 0 auto', gap: '6px' }}><ChevronLeft size={16} /> Back</button>
                <button
                  onClick={() => setStep(3)}
                  className="btn btn-primary"
                  style={{ flex: 1, gap: '8px' }}
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
                <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Confirm Setup</h2>
              </div>

              {/* Summary */}
              <div style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                {[
                  { label: 'Organization', value: orgName },
                  { label: 'Event', value: eventName },
                  { label: 'Contract', value: finalContract ? `${finalContract.slice(0, 12)}…${finalContract.slice(-8)}` : 'Default Credify Contract' },
                  { label: 'Network', value: 'Base Sepolia' },
                  { label: 'Deployment', value: contractMode === 'deploy' ? 'Factory Deployed' : 'Existing / Default' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.14)', fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Info size={13} style={{ color: '#818cf8', flexShrink: 0, marginTop: '1px' }} />
                You can update your contract address anytime from the Dashboard → Settings tab.
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setStep(2)} className="btn btn-ghost" style={{ flex: '0 0 auto', gap: '6px' }}><ChevronLeft size={16} /> Back</button>
                <button onClick={handleFinish} className="btn btn-primary" style={{ flex: 1, height: '46px', gap: '8px' }}>
                  <Rocket size={16} /> Launch Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-subtle)', marginTop: '20px' }}>
          You can skip this setup by going directly to the{' '}
          <button onClick={() => navigate('/organizer/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontSize: '12px', textDecoration: 'underline' }}>Dashboard</button>.
        </p>
      </div>
    </div>
  );
}
