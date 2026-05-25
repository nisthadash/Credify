import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// TanStack Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Wagmi & Viem
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { injected, coinbaseWallet } from 'wagmi/connectors';

// Universal Gas Framework (UGF)
import { UGFProvider } from '@tychilabs/react-ugf';

import ErrorBoundary from './components/common/ErrorBoundary.jsx';

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'Credify',
      preference: 'all'
    })
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org')
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <UGFProvider mode="testnet">
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </UGFProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </React.StrictMode>
);
