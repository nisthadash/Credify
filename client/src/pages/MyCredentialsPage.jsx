import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { Award, Filter, Wallet, Inbox, Github, Linkedin, Copy, Check, Share2, ExternalLink } from 'lucide-react';
import { getCredentialsByWallet } from '../services/credentialService.js';
import CredentialCard from '../components/credential/CredentialCard.jsx';
import Loader from '../components/common/Loader.jsx';
import ConnectWalletButton from '../components/wallet/ConnectWalletButton.jsx';

const FILTERS = ['All', 'Pass', 'Badge', 'Certificate'];
const MOCK = [
  { tokenId: 42, tierLevel: 0, eventName: 'Credify Base Sepolia Workshop', eventDate: new Date().toISOString(), txHash: '0x3213a48e7786b5c03c494', status: 'claimed' },
  { tokenId: 7,  tierLevel: 1, eventName: 'EthIndia 2026 Hackathon',       eventDate: new Date(Date.now() - 86400000 * 5).toISOString(), txHash: '0xabcdef1234567890abcd', status: 'claimed' },
];

export default function MyCredentialsPage() {
  const { address, isConnected } = useAccount();
  const [creds, setCreds]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!isConnected || !address) return;
    setLoading(true);
    getCredentialsByWallet(address)
      .then(d => setCreds(d?.length ? d : MOCK.map(c => ({ ...c, walletAddress: address }))))
      .catch(()  => setCreds(MOCK.map(c => ({ ...c, walletAddress: address }))))
      .finally(() => setLoading(false));
  }, [address, isConnected]);

  const filtered = creds.filter(c => {
    if (filter === 'All')         return true;
    if (filter === 'Pass')        return c.tierLevel === 0;
    if (filter === 'Badge')       return [1, 2, 4].includes(c.tierLevel);
    if (filter === 'Certificate') return c.tierLevel === 3;
    return true;
  });

  return (
    <div className="page-content">
      <div className="container">

        {/* Header row */}
        <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', marginBottom: '8px' }}>My Credentials</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>All onchain credentials owned by your wallet.</p>
          </div>
          {isConnected && (
            <Link to="/claim" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <Award size={16} /> Claim New Pass
            </Link>
          )}
        </div>

        {/* Not connected */}
        {!isConnected && (
          <div className="card animate-fade-up" style={{ padding: '64px 40px', textAlign: 'center' }}>
            <p style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><Wallet size={48} style={{ color: 'var(--primary)' }} /></p>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Connect Your Wallet</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px', maxWidth: '360px', margin: '0 auto 28px' }}>
              Connect your wallet to view all credentials associated with your address.
            </p>
            <ConnectWalletButton />
          </div>
        )}

        {/* Loading */}
        {isConnected && loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', padding: '80px 0', color: 'var(--text-muted)' }}>
            <Loader size="lg" />
            <span>Loading your credentials…</span>
          </div>
        )}

        {/* Credentials */}
        {isConnected && !loading && (
          <>
            {/* Filter bar */}
            <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <Filter size={14} style={{ color: 'var(--text-subtle)' }} />
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`btn btn-sm ${filter === f ? 'btn-secondary' : 'btn-ghost'}`}
                >
                  {f}
                </button>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-subtle)' }}>
                {filtered.length} credential{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Empty */}
            {filtered.length === 0 && (
              <div className="card animate-fade-up" style={{ padding: '64px 40px', textAlign: 'center' }}>
                <p style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><Inbox size={48} style={{ color: 'var(--text-subtle)' }} /></p>
                <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>No credentials yet</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  {filter === 'All' ? 'You haven\'t claimed any credentials yet.' : `No ${filter.toLowerCase()} credentials found.`}
                </p>
                <Link to="/claim" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  Claim Your First Pass
                </Link>
              </div>
            )}

            {/* Grid */}
            {filtered.length > 0 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                  {filtered.map((cred, i) => (
                    <div key={cred.tokenId || i} className={`animate-fade-up delay-${Math.min(i * 100, 400)}`}>
                      <CredentialCard credential={cred} />
                    </div>
                  ))}
                </div>

                {/* Share & Export hub */}
                <ShareHub credentials={filtered} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ShareHub({ credentials }) {
  const [copiedId, setCopiedId] = useState(null);
  const verifyUrl = `${window.location.origin}/verify`;

  const getMarkdown = (cred) => {
    const name = cred.eventName || 'Credify Badge';
    return `[![Credify Badge](https://img.shields.io/badge/Credify-${encodeURIComponent(name).replace(/-/g,'--')}-818cf8?style=flat&logo=ethereum&logoColor=white)](${verifyUrl})`;
  };

  const getLinkedIn = (cred) => {
    const name = cred.eventName || 'Credify Badge';
    return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(name)}&organizationName=Credify&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth()+1}&certUrl=${encodeURIComponent(verifyUrl)}&certId=${cred.tokenId || ''}`;
  };

  const copy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="card animate-fade-up" style={{ padding: '24px', background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.14)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Share2 size={16} style={{ color: '#818cf8' }} />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#c4b5fd', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Share & Export</span>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-subtle)' }}>{credentials.length} credential{credentials.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {credentials.map((cred) => {
          const id = cred.tokenId || cred._id;
          const name = cred.eventName || 'Credify Badge';
          const md = getMarkdown(cred);
          return (
            <div key={id} style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>{name}</p>
                  <code style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', lineHeight: 1.5, display: 'block' }}>{md}</code>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => copy(id, md)} className="btn btn-sm btn-ghost" style={{ gap: '5px', padding: '0 10px', height: '30px' }} title="Copy GitHub README markdown">
                    {copiedId === id ? <><Check size={11} style={{ color: '#22c55e' }} /> Copied</> : <><Github size={11} /> README</>}
                  </button>
                  <a href={getLinkedIn(cred)} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost" style={{ textDecoration: 'none', gap: '5px', padding: '0 10px', height: '30px' }} title="Add to LinkedIn">
                    <Linkedin size={11} style={{ color: '#0ea5e9' }} /> LinkedIn
                  </a>
                  <a href={`${verifyUrl}?token=${id}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost" style={{ textDecoration: 'none', padding: '0 8px', height: '30px' }} title="Verify">
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
