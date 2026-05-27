import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import logo from '../assets/logo.png';
import apiFetch from '../services/api.js';
import { useAccount } from 'wagmi';
import { useEthersSigner } from '../utils/ethers.js';
import ConnectWalletButton from '../components/wallet/ConnectWalletButton.jsx';

const DEMO_EMAIL    = 'organizer@credify.app';
const DEMO_PASSWORD = 'credify2026';

export default function OrganizerLoginPage() {
  const navigate  = useNavigate();
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'siwe'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Web3 States
  const { address: walletAddress, isConnected } = useAccount();
  const signer = useEthersSigner();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      // Auto-register demo account if it doesn't exist yet on backend
      if (!data.success && email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        console.log('[Login] Demo account not found. Auto-registering on-the-fly...');
        const regData = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Credify Organizer',
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD,
            role: 'organizer'
          })
        });
        if (regData.success) {
          data = regData;
        }
      }

      if (data && data.success) {
        sessionStorage.setItem('credify_organizer', JSON.stringify({
          id: data.data._id,
          name: data.data.name,
          email: data.data.email,
          token: data.data.token
        }));
        navigate('/organizer/dashboard');
      } else {
        setError(data.message || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      setError('Connection to backend failed. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSiweLogin = async () => {
    if (!isConnected || !walletAddress) {
      setError('Please connect your wallet first.');
      return;
    }
    if (!signer) {
      setError('Wallet signer is not ready.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // 1. Get nonce from backend
      const nonceRes = await apiFetch('/auth/siwe/nonce');
      if (!nonceRes || !nonceRes.success) {
        throw new Error(nonceRes?.message || 'Failed to get auth nonce.');
      }
      const nonce = nonceRes.data.nonce;

      // 2. Prepare SIWE message
      const domain = window.location.host;
      const origin = window.location.origin;
      const addressLower = walletAddress.toLowerCase();
      const chainId = 84532; // Base Sepolia
      const issuedAt = new Date().toISOString();
      
      const message = `${domain} wants you to sign in with your Ethereum account:
${addressLower}

Sign in to Credify Organizer Portal

URI: ${origin}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;

      // 3. Sign the message
      const signature = await signer.signMessage(message);

      // 4. Verify signature on backend
      const verifyRes = await apiFetch('/auth/siwe/verify', {
        method: 'POST',
        body: JSON.stringify({
          message,
          signature,
          name: `Organizer ${addressLower.slice(0, 6)}`
        })
      });

      if (verifyRes && verifyRes.success) {
        sessionStorage.setItem('credify_organizer', JSON.stringify({
          id: verifyRes.data._id,
          name: verifyRes.data.name,
          email: verifyRes.data.email,
          token: verifyRes.data.token,
          walletAddress: verifyRes.data.walletAddress
        }));
        navigate('/organizer/dashboard');
      } else {
        setError(verifyRes?.message || 'Wallet signature verification failed.');
      }
    } catch (err) {
      console.error('SIWE login error:', err);
      setError(err.message || 'Signature request rejected or connection failed.');
    } finally {
      setLoading(false);
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

        {/* Form Card */}
        <div className="card animate-fade-up" style={{ padding: '32px' }}>
          
          {/* Method Toggle */}
          <div className="seg-toggle" style={{ width: '100%', marginBottom: '24px', display: 'flex' }}>
            <button 
              type="button" 
              className={`seg-btn ${loginMethod === 'password' ? 'active' : ''}`} 
              onClick={() => { setLoginMethod('password'); setError(''); }} 
              style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
            >
              Password
            </button>
            <button 
              type="button" 
              className={`seg-btn ${loginMethod === 'siwe' ? 'active' : ''}`} 
              onClick={() => { setLoginMethod('siwe'); setError(''); }} 
              style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
            >
              Wallet Login
            </button>
          </div>

          {loginMethod === 'password' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                  Email Address
                </label>
                <input
                  id="organizer-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="organizer@credify.app"
                  className="input-field"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                  Password
                </label>
                <div className="input-wrapper">
                  <Lock size={14} className="input-icon" />
                  <input
                    id="organizer-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field input-icon-left"
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  fontSize: '13px', color: '#fca5a5',
                }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                id="organizer-login-btn"
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-full"
                style={{ height: '46px', fontSize: '15px', marginTop: '4px' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <ConnectWalletButton />
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.5' }}>
                Connect your Ethereum wallet, then sign a cryptographic message containing a secure nonce to authenticate.
              </p>

              {/* Error */}
              {error && (
                <div style={{
                  width: '100%',
                  padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  fontSize: '13px', color: '#fca5a5',
                }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleSiweLogin}
                disabled={loading || !isConnected}
                className="btn btn-primary btn-full"
                style={{ height: '46px', fontSize: '15px' }}
              >
                {loading ? 'Verifying Signature…' : 'Sign-In with Ethereum'}
              </button>
            </div>
          )}

          {/* Demo fill */}
          {loginMethod === 'password' && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '12px', textDecoration: 'underline', fontFamily: 'var(--font-body)' }}
              >
                Fill demo credentials
              </button>
            </div>
          )}
        </div>

        <div className="info-note" style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px' }}>
          Demo: <span style={{ fontFamily: 'var(--font-mono)' }}>organizer@credify.app</span> / <span style={{ fontFamily: 'var(--font-mono)' }}>credify2026</span>
        </div>
      </div>
    </div>
  );
}
