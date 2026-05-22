import React, { useState } from 'react';
import { Search, CheckCircle2, ShieldX, ExternalLink, ShieldCheck, Calendar, Hash, Lock, Link2 } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000/api';

const TIER_COLORS = {
  'event pass': '#00f2fe',
  'participant badge': '#3b82f6',
  'finalist badge': '#a855f7',
  'winner certificate': '#ec4899',
  'mentor badge': '#10b981'
};

export default function Verify() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('token'); // 'token' | 'wallet'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    const query = searchQuery.trim();
    const endpoint = searchType === 'token' 
      ? `${BACKEND_URL}/verify/token/${query}`
      : `${BACKEND_URL}/verify/wallet/${query}`;

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setErrorMsg(data.message || 'Credential verification failed. The record could not be found.');
      }
    } catch (err) {
      console.warn('Backend server not connected. Simulating offline test check.');
      // Mock simulator if backend is offline
      simulateMockVerify(query);
    } finally {
      setLoading(false);
    }
  };

  // Mock verify database fallback if backend server is not running
  const simulateMockVerify = (query) => {
    if (searchType === 'token') {
      const tokenId = Number(query);
      if (isNaN(tokenId)) {
        setErrorMsg('Invalid token ID format');
        return;
      }
      setResult({
        tokenId,
        verified: true,
        recipient: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        eventName: 'Credify Base Sepolia Workshop (Demo Mode)',
        eventDescription: 'Completed attendance and verified gasless claim via UGF relayer.',
        eventDate: new Date().toISOString(),
        tier: 'event pass',
        txHash: '0x3213a48e7786b5c03c494e5eb53dc8b5ff3507b7868126cdb0d2c5c03c494e5e',
        metadataUri: 'http://localhost:5000/api/credentials/metadata/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266/demo',
        onchain: { isMock: true, owner: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' }
      });
    } else {
      if (!query.startsWith('0x') || query.length !== 42) {
        setErrorMsg('Invalid Ethereum wallet address format');
        return;
      }
      setResult({
        walletAddress: query,
        totalCredentials: 1,
        credentials: [
          {
            tokenId: 42,
            verified: true,
            eventName: 'Credify Base Sepolia Workshop (Demo Mode)',
            eventDescription: 'Completed attendance and verified gasless claim via UGF relayer.',
            eventDate: new Date().toISOString(),
            tier: 'event pass',
            txHash: '0x3213a48e7786b5c03c494e5eb53dc8b5ff3507b7868126cdb0d2c5c03c494e5e',
            metadataUri: 'http://localhost:5000/api/credentials/metadata/' + query + '/demo',
            onchain: { isMock: true }
          }
        ]
      });
    }
  };

  return (
    <div className="main-container" style={{ maxWidth: '850px' }}>
      
      {/* Title Header */}
      <section style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
          Public Credential Verification
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
          Enter a credential Token ID or a recipient's Wallet Address to query onchain authenticity records on Base Sepolia.
        </p>
      </section>

      {/* Query Search Form Panel */}
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Search Toggle selectors */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: searchType === 'token' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.95rem'
            }}>
              <input 
                type="radio" 
                name="searchType" 
                checked={searchType === 'token'} 
                onChange={() => { setSearchType('token'); setSearchQuery(''); setResult(null); setErrorMsg(''); }}
                style={{ accentColor: 'var(--accent-cyan)' }}
              />
              Search by Token ID
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: searchType === 'wallet' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.95rem'
            }}>
              <input 
                type="radio" 
                name="searchType" 
                checked={searchType === 'wallet'} 
                onChange={() => { setSearchType('wallet'); setSearchQuery(''); setResult(null); setErrorMsg(''); }}
                style={{ accentColor: 'var(--accent-cyan)' }}
              />
              Search by Recipient Wallet
            </label>
          </div>

          {/* Search Input Bar */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchType === 'token' ? 'e.g. 42' : 'e.g. 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  paddingLeft: '44px',
                  borderRadius: '12px', 
                  border: '1px solid var(--border-light)',
                  background: 'rgba(255,255,255,0.02)',
                  color: '#fff',
                  fontFamily: searchType === 'wallet' ? 'monospace' : 'inherit',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-cyan)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
              />
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Verify Status'}
            </button>
          </div>
        </form>
      </div>

      {/* Error Alert Display */}
      {errorMsg && (
        <div className="glass-panel" style={{ padding: '24px', borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.03)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ShieldX size={36} style={{ color: '#ef4444', flexShrink: 0 }} />
          <div>
            <h4 style={{ color: '#ef4444', marginBottom: '4px' }}>Verification Unsuccessful</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Loading State Spinner */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner"></div>
        </div>
      )}

      {/* Result Display: Token Query */}
      {result && searchType === 'token' && (
        <div className="glass-panel pulse-glow" style={{ padding: '40px', position: 'relative', border: '1px solid rgba(0, 242, 254, 0.3)', overflow: 'hidden' }}>
          {/* Subtle watermark shield background */}
          <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.03, pointerEvents: 'none' }}>
            <ShieldCheck size={320} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '4px' }}>{result.eventName}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{result.eventDescription}</p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              color: '#10b981',
              border: '1px solid #10b981',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <CheckCircle2 size={14} />
              VERIFIED
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 40px' }}>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
              <Hash size={18} style={{ color: 'var(--accent-cyan)', marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Token ID</span>
                <span style={{ fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>#{result.tokenId}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
              <Calendar size={18} style={{ color: 'var(--accent-cyan)', marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Issued Date</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{result.eventDate ? new Date(result.eventDate).toLocaleDateString() : 'Dec 5, 2026'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'start', gridColumn: 'span 2' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: TIER_COLORS[result.tier.toLowerCase()] || 'var(--accent-cyan)',
                marginTop: '8px'
              }}></div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Credential Tier</span>
                <span style={{ 
                  fontWeight: 700, 
                  color: TIER_COLORS[result.tier.toLowerCase()] || 'var(--accent-cyan)', 
                  textTransform: 'uppercase',
                  fontSize: '1.05rem',
                  letterSpacing: '0.05em'
                }}>
                  {result.tier}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'start', gridColumn: 'span 2', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <Lock size={18} style={{ color: 'var(--accent-cyan)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Holder Address</span>
                <span style={{ fontWeight: 600, color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>{result.recipient}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'start', gridColumn: 'span 2', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <Link2 size={18} style={{ color: 'var(--accent-cyan)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Base Sepolia Transaction Hash</span>
                <a 
                  href={`https://sepolia.basescan.org/tx/${result.txHash}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ fontWeight: 500, color: 'var(--accent-blue)', fontFamily: 'monospace', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all' }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  {result.txHash} <ExternalLink size={12} />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Result Display: Wallet Query */}
      {result && searchType === 'wallet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            Found {result.totalCredentials} Verified Credential(s) for wallet address:
          </h3>
          
          {result.credentials.map((cred, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '30px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '4px' }}>{cred.eventName}</h4>
                  <span style={{ 
                    fontWeight: 700, 
                    color: TIER_COLORS[cred.tier.toLowerCase()] || 'var(--accent-cyan)', 
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                    letterSpacing: '0.05em'
                  }}>
                    {cred.tier}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  backgroundColor: 'rgba(16, 185, 129, 0.08)', 
                  color: '#10b981',
                  border: '1px solid #10b981',
                  fontWeight: 600,
                  fontSize: '0.78rem'
                }}>
                  <CheckCircle2 size={12} />
                  VERIFIED
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Token ID</span>
                  <span style={{ fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>#{cred.tokenId}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Transaction ID</span>
                  <a 
                    href={`https://sepolia.basescan.org/tx/${cred.txHash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontWeight: 500, color: 'var(--accent-blue)', fontFamily: 'monospace', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all' }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                  >
                    {cred.txHash.substring(0, 16)}... <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
