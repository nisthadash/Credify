import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Wallet, Info, ChevronRight, Lock } from 'lucide-react';
import { useAccount, useSignMessage, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import logo from '../assets/logo.png';
import apiFetch from '../services/api.js';

const DEMO_EMAIL    = 'organizer@credify.app';
const DEMO_PASSWORD = 'credify2026';

export default function OrganizerLoginPage() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { connect } = useConnect();

  const [signing,  setSigning]  = useState(false);
  const [error,    setError]    = useState('');
  const [showLegacy, setShowLegacy] = useState(false);

  // Legacy form state (kept as fallback)
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [legacyLoading, setLegacyLoading] = useState(false);

  /* ── SIWE login ── */
  const handleSIWELogin = async () => {
    setError('');
    setSigning(true);
    try {
      if (!isConnected) {
        connect({ connector: injected() });
        setSigning(false);
        return;
      }

      const message = [
        'Credify Organizer Login',
        '',
        `Address: ${address}`,
        `Timestamp: ${new Date().toISOString()}`,
        '',
        'Signing this message proves wallet ownership.',
        'No gas is charged for signing.',
      ].join('\n');

      const signature = await signMessageAsync({ message });

      // Try SIWE-style login: use wallet address as identifier
      let data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: `${address.toLowerCase()}@wallet.credify`, password: signature.slice(0, 32) }),
      });

      // If wallet account not found, auto-register it
      if (!data.success) {
        const regData = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: `Organizer ${address.slice(0, 6)}`,
            email: `${address.toLowerCase()}@wallet.credify`,
            password: signature.slice(0, 32),
            role: 'organizer',
            walletAddress: address,
          }),
        });
        if (regData.success) data = regData;
      }

      if (data && data.success) {
        sessionStorage.setItem('credify_organizer', JSON.stringify({
          id: data.data._id,
          name: data.data.name,
          email: data.data.email,
          token: data.data.token,
          walletAddress: address,
        }));
        navigate('/organizer/dashboard');
      } else {
        setError(data.message || 'Sign-in failed. Try the legacy login below.');
      }
    } catch (err) {
      if (err.code === 4001 || err.message?.includes('User rejected')) {
        setError('Signature rejected. Please approve the message in your wallet.');
      } else {
        console.error('SIWE login error:', err);
        setError('Connection failed. Try legacy login below.');
      }
    } finally {
      setSigning(false);
    }
  };

  /* ── Legacy email/password login ── */
  const handleLegacyLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLegacyLoading(true);
    try {
      let data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!data.success && email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        const regData = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name: 'Credify Organizer', email: DEMO_EMAIL, password: DEMO_PASSWORD, role: 'organizer' }),
        });
        if (regData.success) data = regData;
      }

      if (data && data.success) {
        sessionStorage.setItem('credify_organizer', JSON.stringify({
          id: data.data._id, name: data.data.name, email: data.data.email, token: data.data.token,
        }));
        navigate('/organizer/dashboard');
      } else {
        setError(data.message || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      setError('Connection to backend failed. Please ensure the server is running.');
    } finally {
      setLegacyLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <img src={logo} alt="Credify Logo" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 16px rgba(37,99,235,0.25)', margin: '0 auto 16px', display: 'block' }} />
          <h1 style={{ fontSize: '24px', marginBottom: '6px' }}>Organizer Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sign in with your Ethereum wallet to manage events</p>
        </div>

        {/* SIWE Card */}
        <div className="card animate-fade-up" style={{ padding: '32px', marginBottom: '16px' }}>

          {/* Wallet status */}
          {isConnected ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px', borderRadius: '10px', marginBottom: '24px',
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#86efac', fontFamily: 'var(--font-mono)' }}>
                {address.slice(0, 8)}…{address.slice(-6)}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-subtle)', marginLeft: 'auto' }}>Connected</span>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px', borderRadius: '10px', marginBottom: '24px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Wallet size={16} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>No wallet connected</span>
            </div>
          )}

          {/* Main SIWE button */}
          <button
            id="siwe-login-btn"
            onClick={handleSIWELogin}
            disabled={signing}
            className="btn btn-primary btn-full"
            style={{ height: '50px', fontSize: '15px', fontWeight: 700, gap: '10px', marginBottom: '16px' }}
          >
            {signing ? (
              <>
                <div className="spinner spinner-sm" />
                {isConnected ? 'Waiting for signature…' : 'Connecting…'}
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                {isConnected ? 'Sign in with Ethereum' : 'Connect Wallet & Sign In'}
              </>
            )}
          </button>

          {/* Gas-free note */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.14)' }}>
            <Info size={13} style={{ color: '#93c5fd', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
              Signing a message <strong style={{ color: 'rgba(255,255,255,0.65)' }}>does not cost gas</strong>. It simply proves you own this wallet address.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '13px', color: '#fca5a5' }}>
              {error}
            </div>
          )}
        </div>

        {/* Legacy fallback toggle */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <button
            onClick={() => setShowLegacy(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)' }}
          >
            <Lock size={11} />
            {showLegacy ? 'Hide' : 'Use email/password instead'}
            <ChevronRight size={11} style={{ transform: showLegacy ? 'rotate(90deg)' : '', transition: 'transform 0.2s' }} />
          </button>
        </div>

        {/* Legacy form */}
        {showLegacy && (
          <div className="card animate-fade-up" style={{ padding: '24px' }}>
            <form onSubmit={handleLegacyLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Email</label>
                <input id="organizer-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="organizer@credify.app" className="input-field" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Password</label>
                <div className="input-wrapper">
                  <Lock size={14} className="input-icon" />
                  <input id="organizer-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-field input-icon-left" required />
                </div>
              </div>
              <button id="organizer-login-btn" type="submit" disabled={legacyLoading} className="btn btn-ghost btn-full" style={{ height: '42px' }}>
                {legacyLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '12px', textDecoration: 'underline', fontFamily: 'var(--font-body)' }}>
                Fill demo credentials
              </button>
            </div>
          </div>
        )}

        <div className="info-note" style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px' }}>
          Demo: <span style={{ fontFamily: 'var(--font-mono)' }}>organizer@credify.app</span> / <span style={{ fontFamily: 'var(--font-mono)' }}>credify2026</span>
        </div>
      </div>
    </div>
  );
}
