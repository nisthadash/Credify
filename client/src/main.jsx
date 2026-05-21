import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// TanStack Query Imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Wagmi & Viem Imports
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Create a reactive Query Client for caching network states
const queryClient = new QueryClient();

// Configure Wagmi for Base Sepolia as required by the hackathon specifications
const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected() // Connects MetaMask / Coinbase Wallet
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org')
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
