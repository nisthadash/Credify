import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import logo from '../assets/logo.png';

const DEMO_EMAIL    = 'organizer@credify.app';
const DEMO_PASSWORD = 'credify2026';

export default function OrganizerLoginPage() {
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      sessionStorage.setItem('credify_organizer', 'true');
      navigate('/organizer/dashboard');
    } else {
      setError(`Incorrect credentials. Use the demo account below.`);
    }
    setLoading(false);
  };

  return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Icon + title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <img 
            src={logo} 
            alt="Credify Logo" 
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 16px rgba(37, 99, 235, 0.25)',
              margin: '0 auto 16px',
              display: 'block',
            }}
          />
          <h1 style={{ fontSize: '24px', marginBottom: '6px' }}>Organizer Login</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Access the Credify admin dashboard</p>
        </div>

        {/* Form */}
        <div className="card animate-fade-up" style={{ padding: '32px' }}>
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

          {/* Demo fill */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '12px', textDecoration: 'underline', fontFamily: 'var(--font-body)' }}
            >
              Fill demo credentials
            </button>
          </div>
        </div>

        {/* Demo hint */}
        <div className="info-note" style={{ marginTop: '16px', textAlign: 'center' }}>
          Demo: <span style={{ fontFamily: 'var(--font-mono)' }}>organizer@credify.app</span> / <span style={{ fontFamily: 'var(--font-mono)' }}>credify2026</span>
        </div>
      </div>
    </div>
  );
}
