import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Award, Clock, Plus, Upload, LogOut, ArrowUp, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';

const MOCK_USERS = [
  { walletAddress: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', tokenId: 1, eventName: 'Credify Workshop',   tierLevel: 0, txHash: '0xabc123', status: 'claimed' },
  { walletAddress: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', tokenId: 2, eventName: 'Credify Workshop',   tierLevel: 1, txHash: '0xdef456', status: 'claimed' },
  { walletAddress: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc', tokenId: 3, eventName: 'EthIndia 2026',       tierLevel: 2, txHash: '0xghi789', status: 'claimed' },
  { walletAddress: '0x90f79bf6eb2c4f870365e785982e1f101e93b906', tokenId: 4, eventName: 'EthIndia 2026',       tierLevel: 0, txHash: '0xjkl012', status: 'claimed' },
  { walletAddress: '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65', tokenId: 5, eventName: 'Credify Workshop',   tierLevel: 3, txHash: '0xmno345', status: 'claimed' },
];

const TIER_NAMES  = { 0: 'Pass', 1: 'Participant', 2: 'Finalist', 3: 'Winner', 4: 'Mentor' };
const TIER_COLORS = { 0: '#93c5fd', 1: '#a5b4fc', 2: '#d8b4fe', 3: '#f9a8d4', 4: '#86efac' };

export default function OrganizerDashboardPage() {
  const navigate = useNavigate();
  const [users, setUsers]     = useState(MOCK_USERS);
  const [tab, setTab]         = useState('credentials');
  const [toast, setToast]     = useState('');

  useEffect(() => {
    if (!sessionStorage.getItem('credify_organizer')) navigate('/organizer/login');
  }, [navigate]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleUpgrade = (user) => {
    setUsers(prev => prev.map(u =>
      u.walletAddress === user.walletAddress && u.tokenId === user.tokenId
        ? { ...u, tierLevel: Math.min(u.tierLevel + 1, 4) }
        : u
    ));
    showToast(`Token #${user.tokenId} upgraded to ${TIER_NAMES[Math.min(user.tierLevel + 1, 4)]}`);
  };

  const stats = [
    { label: 'Approved Users',      value: users.length, icon: <Users size={20} />,   color: '#93c5fd' },
    { label: 'Minted Credentials',  value: users.length, icon: <Award size={20} />,   color: '#86efac', trend: '100% success rate' },
    { label: 'Pending Upgrades',    value: users.filter(u => u.tierLevel < 2).length, icon: <Clock size={20} />, color: '#fcd34d' },
  ];

  return (
    <div className="page-content">
      <div className="container">

        {/* Header */}
        <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', marginBottom: '6px' }}>Organizer Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage events, credentials, and upgrades.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => showToast('Create Event — coming soon!')}>
              <Plus size={13} /> Create Event
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => showToast('Upload CSV — coming soon!')}>
              <Upload size={13} /> Upload CSV
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => { sessionStorage.removeItem('credify_organizer'); navigate('/organizer/login'); }}>
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="animate-fade-up delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {stats.map((s, i) => (
            <div key={i} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${s.color}15`, border: `1px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color,
              }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '4px' }}>
                  {s.label}
                </p>
                <p style={{ fontSize: '30px', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{s.value}</p>
                {s.trend && <p style={{ fontSize: '12px', color: '#86efac', marginTop: '6px' }}>{s.trend}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="animate-fade-up delay-200" style={{ marginBottom: '20px' }}>
          <div className="seg-toggle" style={{ width: 'fit-content' }}>
            {['credentials', 'events'].map(t => (
              <button key={t} className={`seg-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}
                style={{ textTransform: 'capitalize', padding: '8px 20px' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Credentials table */}
        {tab === 'credentials' && (
          <div className="card animate-fade-up delay-300" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Credential Records</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{users.length} total</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {['Wallet', 'Token', 'Event', 'Tier', 'Actions'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        {u.walletAddress.slice(0, 8)}…{u.walletAddress.slice(-6)}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>#{u.tokenId}</td>
                      <td style={{ color: 'var(--text)' }}>{u.eventName}</td>
                      <td>
                        <span style={{ color: TIER_COLORS[u.tierLevel], fontWeight: 700, fontSize: '12px', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {TIER_NAMES[u.tierLevel]}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {u.txHash && (
                            <a href={`https://sepolia.basescan.org/tx/${u.txHash}`} target="_blank" rel="noreferrer"
                              className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                              <ExternalLink size={11} />
                            </a>
                          )}
                          {u.tierLevel < 4 && (
                            <button onClick={() => handleUpgrade(u)} className="btn btn-secondary btn-sm">
                              <ArrowUp size={11} /> Upgrade
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events placeholder */}
        {tab === 'events' && (
          <div className="card animate-fade-up" style={{ padding: '64px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <Calendar size={40} style={{ color: 'var(--primary)', opacity: 0.7 }} />
            </div>
            <h3 style={{ marginBottom: '10px' }}>Events Management</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Full event management coming in v2.</p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 3000,
          background: 'var(--surface)', border: '1px solid rgba(37,99,235,0.3)',
          borderRadius: 12, padding: '12px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          fontSize: '14px', color: 'var(--text)',
          display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'slideUp 0.25s ease',
        }}>
          <CheckCircle2 size={15} style={{ color: '#86efac', flexShrink: 0 }} /> {toast}
        </div>
      )}
    </div>
  );
}
