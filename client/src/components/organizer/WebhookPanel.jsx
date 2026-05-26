import React, { useEffect, useState } from 'react';
import { Key, Plus, Trash2, Copy, CheckCircle2, AlertCircle, Zap, RefreshCw, ExternalLink } from 'lucide-react';
import apiFetch from '../../services/api.js';

const CodeBlock = ({ children }) => (
  <pre style={{
    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, padding: '12px 16px',
    fontFamily: 'var(--font-mono)', fontSize: '11px',
    color: '#86efac', overflowX: 'auto',
    lineHeight: 1.7, margin: 0,
  }}>
    {children}
  </pre>
);

export default function WebhookPanel({ activeEvent }) {
  const [keys, setKeys]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [keyName, setKeyName]       = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [copied, setCopied]         = useState(false);
  const [error, setError]           = useState('');
  const [revoking, setRevoking]     = useState(null);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/webhooks/keys');
      if (res && res.success) setKeys(res.data || []);
      else setError(res?.message || 'Failed to load API keys.');
    } catch {
      setError('Connection error loading keys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    setError('');
    setNewKeyValue('');
    try {
      const res = await apiFetch('/webhooks/keys', {
        method: 'POST',
        body: JSON.stringify({ name: keyName || 'Webhook API Key' }),
      });
      if (res && res.success) {
        setNewKeyValue(res.data.apiKey);
        setKeyName('');
        fetchKeys();
      } else {
        setError(res?.message || 'Failed to generate key.');
      }
    } catch {
      setError('Connection error generating key.');
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleRevoke = async (keyId) => {
    setRevoking(keyId);
    try {
      const res = await apiFetch(`/webhooks/keys/${keyId}`, { method: 'DELETE' });
      if (res && res.success) fetchKeys();
      else setError(res?.message || 'Failed to revoke key.');
    } catch {
      setError('Connection error revoking key.');
    } finally {
      setRevoking(null);
    }
  };

  const eventId = activeEvent?._id || '<your-event-id>';
  const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const curlExample = `curl -X POST ${serverUrl}/api/webhooks/whitelist/${eventId} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: credify_YOUR_KEY" \\
  -d '{"walletAddress":"0xYOUR_WALLET_ADDRESS"}'`;

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={17} style={{ color: 'var(--primary)' }} /> Developer Webhooks
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Connect Credify to Zapier, Typeform, or your own system. Use an API key to automatically whitelist wallets without manual CSV uploads.
        </p>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fca5a5' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* New key shown once */}
      {newKeyValue && (
        <div style={{ padding: '16px', background: 'rgba(52,211,153,0.06)', border: '1.5px solid rgba(52,211,153,0.3)', borderRadius: 10 }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} /> New API Key Generated — Copy it now, it won't be shown again!
          </p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <code style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#a7f3d0', wordBreak: 'break-all' }}>
              {newKeyValue}
            </code>
            <button onClick={() => handleCopy(newKeyValue)} className="btn btn-ghost btn-sm" style={{ gap: '5px', flexShrink: 0 }}>
              {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Generate Key Form */}
      <div className="card" style={{ padding: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
          <Key size={12} style={{ marginRight: 5 }} />Generate New API Key
        </p>
        <form onSubmit={handleGenerateKey} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input-field"
            value={keyName}
            onChange={e => setKeyName(e.target.value)}
            placeholder="Key name (e.g. Zapier Integration)"
            style={{ flex: 1, minWidth: '200px', fontSize: '13px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ gap: '6px', flexShrink: 0 }}>
            <Plus size={14} /> Generate Key
          </button>
        </form>
      </div>

      {/* Existing Keys */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Active API Keys
          </p>
          <button onClick={fetchKeys} className="btn btn-ghost btn-sm" style={{ gap: '5px' }}>
            <RefreshCw size={12} />
          </button>
        </div>

        {loading ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading...</p>
        ) : keys.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-subtle)', padding: '12px 0' }}>No API keys yet. Generate one above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {keys.map(k => (
              <div key={k._id} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                borderRadius: 8
              }}>
                <Key size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600 }}>{k.name}</p>
                  <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{k.prefix}</p>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                  {new Date(k.createdAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleRevoke(k._id)}
                  disabled={revoking === k._id}
                  className="btn btn-danger btn-sm"
                  style={{ gap: '5px', opacity: revoking === k._id ? 0.6 : 1 }}
                >
                  <Trash2 size={12} /> {revoking === k._id ? 'Revoking...' : 'Revoke'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Docs */}
      <div className="card" style={{ padding: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
          <ExternalLink size={12} style={{ marginRight: 5 }} />How to Use — Whitelist via API
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.7 }}>
          Send a <code style={{ color: '#86efac', fontFamily: 'var(--font-mono)' }}>POST</code> request to the webhook endpoint with the wallet address to whitelist a participant automatically.
          Include your API key in the <code style={{ color: '#86efac', fontFamily: 'var(--font-mono)' }}>x-api-key</code> header.
        </p>
        <CodeBlock>{curlExample}</CodeBlock>
        <p style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '10px' }}>
          💡 Use this endpoint with Zapier's "Webhook" action to auto-whitelist anyone who completes a Typeform or purchases a ticket on Eventbrite.
        </p>
      </div>
    </div>
  );
}
