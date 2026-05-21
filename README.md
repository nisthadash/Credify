# Credify 🛡️

**Credify** is a beginner-friendly, gasless onchain credential platform built on **Base Sepolia**. It enables users to claim event passes, participation badges, and certificates without needing any ETH in their wallet. Instead of paying gas with ETH, users settle the gas cost via the **Universal Gas Framework (UGF)** using Mock USD, which processes the gas transaction invisibly in the background.

---

## 🏗️ Project Architecture

```text
Credify/
├── client/                     # React + Vite Frontend (Port 3000)
│   ├── src/
│   │   ├── components/         # Premium UI Components (WalletConnect, etc.)
│   │   ├── pages/              # App Screens (Home, Verify)
│   │   ├── index.css           # Styling (Custom Premium Dark Glassmorphism)
│   │   └── main.jsx            # Wagmi / QueryClient / React Bootstrap
│
├── server/                     # Express Node.js API (Port 5000)
│   ├── test_api.js             # E2E API integration verification script
│   ├── src/
│   │   ├── config/             # DB & Network connections
│   │   ├── controllers/        # Route logic handlers
│   │   ├── models/             # Mongoose database models
│   │   ├── routes/             # API routes definition
│   │   └── services/           # Viem Blockchain interfaces
│
└── contracts/                  # Solidity Smart Contracts
    └── CredifyBadge.sol        # ERC-721 credential contract (OpenZeppelin)
```

---

## ⚡ Quick Start Guide

### 1. Smart Contract Deployment
1. Open the [Remix IDE](https://remix.ethereum.org/).
2. Create a new file named `CredifyBadge.sol` and paste the contents of [contracts/CredifyBadge.sol](contracts/CredifyBadge.sol).
3. Select Solidity compiler version `0.8.20` or higher and compile.
4. Deploy using **Injected Provider** (ensure your MetaMask is connected to the **Base Sepolia** testnet).
5. Copy the deployed contract address and add it to your server configuration.

---

### 2. Run the Express Backend Server
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Create or verify the [.env](server/.env) settings:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/credify
   JWT_SECRET=supersecretjwtkeyforcredifyhackathon2026
   BASE_RPC_URL=https://sepolia.base.org
   CONTRACT_ADDRESS=<YOUR_DEPLOYED_CONTRACT_ADDRESS>
   ```
3. Start the API backend:
   ```bash
   npm run dev
   ```
4. Run the automated API testing suite in another window to verify:
   ```bash
   node test_api.js
   ```

---

### 3. Run the React Frontend Client
1. Navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Start the Vite local development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000/`.

---

## ⚙️ Features Completed
* **Gasless Claim Engine:** Simulated 4-step UGF flow handles the transaction without prompting for ETH gas.
* **Onchain Contract State Reads:** Integrates Viem to read owner coordinates and token URIs onchain.
* **Responsive Timeline Progression:** Tracks and transitions recipient credentials from Event Pass (Tier 0) up to Winner (Tier 3).
* **Public Verifier Dashboard:** Merges offchain database details with live onchain ownership statuses to verify validity.
