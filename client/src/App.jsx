import React, { useState } from 'react';
import Home from './pages/Home.jsx';
import Verify from './pages/Verify.jsx';
import WalletConnect from './components/WalletConnect.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="app-layout">
      {/* Premium Glassmorphic Header */}
      <header className="app-header">
        <div className="header-content">
          <div 
            className="logo" 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => setCurrentPage('home')}
          >
            <span style={{ fontSize: '2rem' }}>🛡️</span>
            <span style={{ 
              fontFamily: 'var(--font-heading)', 
              fontWeight: 800, 
              fontSize: '1.5rem', 
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Credify
            </span>
          </div>

          <nav className="nav-links">
            <span 
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              Claim Credential
            </span>
            <span 
              className={`nav-link ${currentPage === 'verify' ? 'active' : ''}`}
              onClick={() => setCurrentPage('verify')}
            >
              Public Verifier
            </span>
            
            {/* Wallet Connect Component */}
            <WalletConnect />
          </nav>
        </div>
      </header>

      {/* Render active page state */}
      <main className="main-content">
        {currentPage === 'home' && <Home />}
        {currentPage === 'verify' && <Verify />}
      </main>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '40px 20px', 
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        borderTop: '1px solid var(--border-light)',
        marginTop: '60px'
      }}>
        <p>© 2026 Credify Network. Powered by UGF on Base Sepolia. Built for gasless user reputation.</p>
      </footer>
    </div>
  );
}

export default App;
