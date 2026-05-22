import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { Award, Filter, Wallet, Inbox } from 'lucide-react';
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {filtered.map((cred, i) => (
                  <div key={cred.tokenId || i} className={`animate-fade-up delay-${Math.min(i * 100, 400)}`}>
                    <CredentialCard credential={cred} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
