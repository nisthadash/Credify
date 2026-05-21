# Credify Backend Structure

## Overview
Credify does not need a very heavy backend. The blockchain and smart contract already store the credential ownership layer, while the backend handles app logic like eligibility, organizer actions, metadata, and verification support.[file:1][web:190]

So the backend should be **simple, clear, and hackathon-friendly**:
- **Frontend** = user interface and wallet connection
- **Backend API** = event logic, whitelist, organizer actions, verification helpers
- **Smart Contract** = actual credential minting and ownership on Base Sepolia
- **UGF** = gasless transaction flow so users do not need ETH[ file:1]

---

## High-Level Architecture

```text
Frontend (React)
   |
   | REST API / JSON
   v
Backend (Node.js + Express)
   |
   | Reads/Writes
   v
Database (MongoDB / PostgreSQL)
   |
   | Stores app-side records
   v
Smart Contract (ERC-721 on Base Sepolia)
   |
   | Mint / upgrade / verify ownership
   v
UGF Flow (Quote -> Settle -> Execute -> Confirm)
```

---

## What Goes Where

### 1. Frontend
The frontend is responsible for:
- Connecting the wallet
- Showing event details
- Starting the UGF gasless claim flow
- Showing transaction state
- Showing success/failure screens
- Opening the verify page

The frontend should **not** contain secret keys, admin controls, or organizer-only logic.

### 2. Backend
The backend is responsible for:
- Checking whether a user is allowed to claim
- Managing event details
- Managing badge/certificate tiers
- Storing organizer approvals
- Saving metadata references
- Serving verification data
- Protecting organizer/admin actions with login/auth

### 3. Smart Contract
The smart contract is responsible for:
- Minting the credential NFT
- Storing token ownership
- Upgrading a pass to a badge/certificate
- Defining token metadata URI
- Emitting onchain events for mint and upgrade

### 4. Database
The database stores off-chain app data such as:
- users
- organizers
- events
- credential templates
- eligibility list
- claim status
- token history mirror
- verification logs

---

## Recommended Stack

| Layer | Recommended choice | Why |
|---|---|---|
| Frontend | React + Vite | Fast and simple for hackathon |
| Backend | Node.js + Express | Easy REST API, common stack |
| Database | MongoDB | Flexible and quick for hackathon builds |
| Auth | JWT + simple organizer login | Enough for admin actions |
| Blockchain library | viem / ethers | Contract interaction |
| Contract | Solidity ERC-721 | Good for badges/certificates |
| Network | Base Sepolia | Required by problem statement[file:1] |

---

## Suggested Folder Structure

```text
credify/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   └── App.jsx
│
├── server/                     # Backend API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── env.js
│   │   │   └── blockchain.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── eventController.js
│   │   │   ├── credentialController.js
│   │   │   ├── organizerController.js
│   │   │   └── verifyController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Event.js
│   │   │   ├── Credential.js
│   │   │   ├── Eligibility.js
│   │   │   └── VerificationLog.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   ├── credentialRoutes.js
│   │   │   ├── organizerRoutes.js
│   │   │   └── verifyRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── services/
│   │   │   ├── ugfService.js
│   │   │   ├── contractService.js
│   │   │   ├── metadataService.js
│   │   │   └── eligibilityService.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── response.js
│   │   └── server.js
│
├── contracts/                  # Solidity smart contracts
│   ├── CredifyCredential.sol
│   ├── scripts/
│   └── test/
│
├── metadata/                   # JSON metadata for NFTs
├── docs/
└── README.md
```

---

## Core Backend Modules

### Auth Module
Used only for organizers/admins.

**Endpoints:**
- `POST /auth/login`
- `POST /auth/register-organizer`
- `GET /auth/me`

### Event Module
Handles event creation and retrieval.

**Endpoints:**
- `POST /events`
- `GET /events`
- `GET /events/:id`
- `PATCH /events/:id`

Fields in event:
- event name
- description
- date
- organizer
- claim start/end
- credential tiers

### Eligibility Module
Checks whether a wallet can claim.

**Endpoints:**
- `POST /eligibility/upload`
- `GET /eligibility/:wallet/:eventId`

This can use:
- whitelisted wallet addresses
- email approval
- team registration IDs

### Credential Module
Main product logic.

**Endpoints:**
- `POST /credentials/claim-init`
- `POST /credentials/upgrade`
- `GET /credentials/user/:wallet`
- `GET /credentials/:tokenId`

Responsibilities:
- validate claim request
- check eligibility
- prepare metadata
- trigger UGF flow / contract interaction
- save token reference in DB

### Verification Module
Used by public verify page.

**Endpoints:**
- `GET /verify/token/:tokenId`
- `GET /verify/wallet/:wallet`

Returns:
- credential type
- event name
- issued date
- owner wallet
- token status
- tier
- metadata URI

### Organizer Module
Organizer-only actions.

**Endpoints:**
- `POST /organizer/approve/:wallet`
- `POST /organizer/upgrade/:tokenId`
- `GET /organizer/dashboard/:eventId`

---

## Database Models

### User
```json
{
  "walletAddress": "0x123...",
  "role": "participant | organizer | mentor",
  "name": "Aman",
  "email": "aman@example.com"
}
```

### Event
```json
{
  "title": "Credify Workshop",
  "description": "Gasless credential event",
  "date": "2026-05-30",
  "organizerId": "org123",
  "claimOpen": true,
  "tiers": ["pass", "participant", "finalist", "winner"]
}
```

### Credential
```json
{
  "tokenId": 14,
  "walletAddress": "0x123...",
  "eventId": "evt001",
  "tier": "participant",
  "metadataUri": "ipfs://...",
  "txHash": "0xabc...",
  "status": "minted"
}
```

### Eligibility
```json
{
  "walletAddress": "0x123...",
  "eventId": "evt001",
  "approved": true,
  "approvedBy": "organizerId"
}
```

---

## How the Backend Works in Real Flow

### Claim Flow
1. User connects wallet on frontend
2. Frontend calls `GET /eligibility/:wallet/:eventId`
3. Backend checks DB and returns allowed/not allowed
4. Frontend starts claim request
5. Backend prepares claim data and metadata
6. Frontend uses UGF to execute gasless mint flow[file:1]
7. After success, backend stores token ID, tx hash, tier, wallet, metadata
8. Frontend shows success page

### Upgrade Flow
1. Organizer logs in
2. Organizer selects user/token
3. Backend checks organizer permission
4. Backend calls smart contract upgrade method
5. Transaction completes on Base Sepolia
6. Backend updates DB status/tier

### Verification Flow
1. Verifier enters wallet or token ID
2. Frontend calls `/verify/...`
3. Backend fetches onchain + DB data
4. Returns human-readable credential details
5. Frontend displays “Verified” status

---

## Smart Contract Responsibilities

The contract should stay simple.

### Main functions
- `claimPass(address user, string memory tokenURI)`
- `upgradeCredential(uint256 tokenId, string memory newTier, string memory newTokenURI)`
- `tokenURI(uint256 tokenId)`
- `ownerOf(uint256 tokenId)`

### Contract events
- `CredentialClaimed(tokenId, wallet, tier)`
- `CredentialUpgraded(tokenId, oldTier, newTier)`

The contract should not try to store all app logic. Keep heavy logic in backend, and keep ownership/proof onchain.

---

## Simplest MVP Backend

If you want the **smallest possible backend** for the hackathon, do this:

### Backend only needs:
- `events`
- `eligibility`
- `verify`
- `organizer upgrade`

### Skip for MVP:
- full admin dashboard
- complex role system
- analytics
- notifications
- multi-event support

This keeps your product realistic to finish.

---

## Suggested API Endpoints for MVP

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/events/:id` | Get event details |
| GET | `/eligibility/:wallet/:eventId` | Check if wallet can claim |
| POST | `/credentials/claim-init` | Prepare claim request |
| POST | `/credentials/save` | Save tx/token after mint |
| POST | `/credentials/upgrade` | Upgrade tier |
| GET | `/verify/token/:tokenId` | Verify by token |
| GET | `/verify/wallet/:wallet` | Verify by wallet |

---

## Environment Variables

```env
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_jwt_secret
BASE_RPC_URL=your_base_sepolia_rpc
PRIVATE_KEY=backend_wallet_private_key
CONTRACT_ADDRESS=deployed_contract_address
UGF_API_KEY=if_needed
```

Never expose private keys in the frontend.

---

## Final Recommendation

For a hackathon, the best backend is **simple and boring**.
Do not overbuild.

### Best structure:
- React frontend
- Node/Express backend
- MongoDB database
- One ERC-721 contract on Base Sepolia
- UGF for gasless claim flow
- Only 5 to 7 API routes for MVP

That is enough to make Credify work properly, demo clearly, and stay manageable in limited time.[file:1][web:182][web:185]
