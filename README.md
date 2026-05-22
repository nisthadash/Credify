# Credify 🛡️

**Credify** is a premium, gasless onchain credential progression platform built on **Base Sepolia**. It enables developers and event organizers to distribute verified, upgradeable achievement badges without forcing participants to hold ETH. By combining an **ERC-721 contract** with a simulated **Universal Gas Framework (UGF)** relay, Credify executes transaction settlement invisibly in the background, offering a seamless Web2-style onboarding experience.

---

## 🎨 Design Philosophy & UX Highlights

Credify features a high-end, responsive dark-glass interface designed to engage and delight users:

*   **Premium Interactive Hero CTA**: The "Get Started" button features a custom capsule-slider overlay. Hovering expands the gradient theme cover (`width: 100%`) while translating the text and arrow in opposite directions. On click, it triggers a custom exit animation where the arrow slides smoothly out of bounds during a 500ms transition.
*   **Neo-Brutalist Button States**: Core action elements use bold solid borders (`1px solid #000000`) and a pill shape. Hovering translates the element upwards while casting a solid drop shadow offset (glowing white offsets for ghost buttons, dark offsets for colored ones), and clicking depresses the button.
*   **Animated Ambient Background**: The landing screen features a lightweight, pure-CSS animated mesh background comprising drifting, breathing radial gradient spheres. No external runtime assets or iframe watermarks are loaded, ensuring lightning-fast performance.
*   **Fully Responsive Hamburger Menu**: Responsive grid utilities (`.grid-2col`, `.grid-3col`, `.home-main-grid`) collapse layout modules dynamically on smaller viewports. Mobile viewports unlock a smooth slide-in navigation drawer with scroll-locking and keyboard accessibility listeners.

---

## ⚙️ Key Features

*   **Gasless Claim Engine**: Recipient wallets claim event passes without gas prompts. The backend relays transactions through the UGF simulation using a custodial key.
*   **Dynamic Credential Tiers**: Verifiable progression tiers transition achievement states recursively from event registration up to finalist/winner tiers:
    *   **Tier 0**: Event Pass 🎟️ (Lucide `Ticket`)
    *   **Tier 1**: Participant ⚡ (Lucide `Flame`)
    *   **Tier 2**: Finalist ⭐ (Lucide `Star`)
    *   **Tier 3**: Winner 🏆 (Lucide `Trophy`)
    *   **Tier 4**: Mentor 🎓 (Lucide `Award`)
*   **Public Verification Dashboard**: Instantly inspects ownership status. It queries the live smart contract states using **Viem** read calls and matches them against offchain database states.
*   **Organizer Admin Portal**: Enables organizers to whitelist participant addresses, mint initial passes, and dynamically upgrade existing credentials to higher tiers.

---

## 🛠️ Technology Stack

### Frontend Client
*   **Framework**: React (v18) + Vite
*   **Web3 Integrations**: Wagmi (v2), Viem (v2), TanStack Query (v5)
*   **Icons**: Lucide React
*   **Styling**: Modern Vanilla CSS (Fluid clamp spacing, Glassmorphism, CSS keyframe animations)

### Backend API
*   **Runtime**: Node.js + Express
*   **Database**: MongoDB + Mongoose
*   **Web3 Interface**: Viem Client (Base Sepolia RPC calls)
*   **Security**: JSON Web Token (JWT) auth, bcryptjs password hashing

### Smart Contracts
*   **Language**: Solidity (v0.8.20)
*   **Standards**: OpenZeppelin ERC-721 + ERC721URIStorage extensions

---

## 🏗️ Project Architecture

```text
Credify/
├── client/                     # React + Vite Frontend (Port 3000)
│   ├── src/
│   │   ├── assets/             # Branding materials and logo assets
│   │   ├── components/         # Modular layout, wallet, and credential elements
│   │   │   ├── layout/         # Header (hamburger navigation), Footer
│   │   │   ├── credential/     # Claim previews, UGF progress modals
│   │   │   └── wallet/         # Web3 Connect Wallet elements
│   │   ├── pages/              # Routing screens (Home, Verify, Organizer, Claim)
│   │   ├── index.css           # Global typography & responsive neo-brutalist system
│   │   └── main.jsx            # React root, Wagmi provider, QueryClient wrapper
│   └── vite.config.js          # Port setup (localhost:3000) and plugins
│
├── server/                     # Node.js + Express Backend (Port 5000)
│   ├── src/
│   │   ├── config/             # MongoDB client and Viem RPC client setups
│   │   ├── controllers/        # Route handler functions (auth, user, claims)
│   │   ├── models/             # Mongoose schemas (User, Credential)
│   │   ├── routes/             # Express routes mapped to controllers
│   │   └── server.js           # API entry point & server configuration
│   └── test_api.js             # Automated end-to-end API verification suite
│
└── contracts/                  # Solidity smart contracts
    └── CredifyBadge.sol        # ERC-721 token representing credentials
```

---

## ⚡ Setup & Installation

### Prerequisite Software
Ensure you have the following installed on your system:
*   [Node.js](https://nodejs.org/) (v18.x or newer)
*   [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally on port 27017)
*   A Web3 wallet (e.g., [MetaMask](https://metamask.io/)) connected to **Base Sepolia**

---

### 1. Smart Contract Deployment
1. Copy the code in `contracts/CredifyBadge.sol`.
2. Open the [Remix IDE](https://remix.ethereum.org/).
3. Paste the code into a new contract file and compile using Solidity compiler version `0.8.20` or higher.
4. Deploy the contract using the **Injected Provider** environment (ensure your MetaMask is on Base Sepolia).
5. Copy the deployed contract address. You will need this for the backend configuration.

---

### 2. Backend Server Configuration
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `server/` directory and supply the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/credify
   JWT_SECRET=your_jwt_signing_key_here
   BASE_RPC_URL=https://sepolia.base.org
   CONTRACT_ADDRESS=0xYourDeployedContractAddressHere
   ORGANIZER_PRIVATE_KEY=0xYourOrganizerWalletPrivateKeyForRelayingTransactions
   ```
4. Start the backend in development mode:
   ```bash
   npm run dev
   ```
5. *(Optional)* Run the end-to-end integration tests to verify API endpoints:
   ```bash
   node test_api.js
   ```

---

### 3. Frontend Client Configuration
1. Navigate to the `client/` directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000/`.

---

## 🧪 Verification & Usage Flows
1. **Organizer Dashboard**: Connect your wallet, login using the organizer account (`organizer@credify.app` / `credify2026`), and whitelist participant wallet addresses.
2. **Claim Flow**: Connect a participant's whitelisted wallet to the app, click the **Claim Pass** screen, and trigger the gasless relay transaction.
3. **Upgrade Path**: As an organizer, locate the participant under the dashboard roster and select a tier upgrade (e.g., *Participant* to *Finalist*).
4. **Credential Verification**: Copy any wallet address or transaction ID and search on the **Verify** screen to see live onchain status and metadata updates.
