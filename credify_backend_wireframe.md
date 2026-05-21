# Credify Backend Wireframe Structure

## Purpose
This file gives a **wireframe-style structure** for the backend of Credify so the team can understand what modules exist, how data moves, and what each backend part is responsible for.

It is not UI wireframe. It is a **system wireframe** for backend planning.

---

## 1. Backend at a Glance

```text
                ┌──────────────────────┐
                │     React Frontend   │
                │ Wallet + Claim UI    │
                └──────────┬───────────┘
                           │
                           │ API calls
                           ▼
                ┌──────────────────────┐
                │    Backend Server    │
                │   Node.js / Express  │
                └──────────┬───────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌────────────────┐
│   Database   │   │ SmartContract│   │  UGF Services  │
│ Mongo / SQL  │   │ Base Sepolia │   │ Gasless Flow   │
└──────────────┘   └──────────────┘   └────────────────┘
```

---

## 2. Main Backend Blocks

```text
Backend Server
│
├── Auth Block
├── Event Block
├── Eligibility Block
├── Credential Block
├── Verification Block
├── Organizer Block
├── Blockchain Service Block
├── UGF Service Block
└── Database Layer
```

Each block should do **one clear job**.

---

## 3. Module Wireframe

## A. Auth Block

### Purpose
Handles organizer/admin login only.
Participants usually connect wallet from frontend, so backend auth is mainly for event management.

### Inputs
- email
- password

### Outputs
- JWT token
- organizer profile

### Connected To
- Organizer Block
- Event Block

```text
[Login Request] --> [Auth Controller] --> [User DB] --> [JWT Response]
```

---

## B. Event Block

### Purpose
Stores and serves event details.

### Stores
- event name
- description
- date
- organizer id
- claim open status
- allowed credential tiers

### Connected To
- Frontend event page
- Eligibility Block
- Credential Block
- Organizer Block

```text
[Frontend Event Page]
        │
        ▼
 [Event Controller]
        │
        ▼
    [Event DB]
```

---

## C. Eligibility Block

### Purpose
Checks whether a wallet can claim a pass/badge/certificate.

### Inputs
- wallet address
- event id

### Decision
- approved
- rejected
- already claimed

### Connected To
- Credential Block
- Event Block
- Organizer Block

```text
[Wallet Address + Event ID]
           │
           ▼
 [Eligibility Controller]
           │
     ┌─────┴─────┐
     ▼           ▼
[Eligibility DB] [Claim History DB]
           │
           ▼
    [Allowed / Blocked]
```

---

## D. Credential Block

### Purpose
This is the **core backend module**.
It manages claim preparation, metadata preparation, DB save after mint, and upgrade flow.

### Responsibilities
- start claim request
- validate claim
- prepare metadata
- store tx/token info after success
- upgrade tiers later

### Connected To
- Eligibility Block
- UGF Service Block
- Blockchain Service Block
- Database

```text
[Claim Request]
      │
      ▼
[Credential Controller]
      │
      ├── check eligibility
      ├── prepare metadata
      ├── start UGF flow
      ├── wait for tx result
      └── save token data
```

---

## E. Verification Block

### Purpose
Used by the public verification page.
This lets any user verify whether a token is real.

### Inputs
- token ID
- wallet address

### Outputs
- event name
- credential tier
- issued date
- owner wallet
- transaction hash
- verification status

```text
[Verify Page]
     │
     ▼
[Verify Controller]
     │
 ┌───┴──────────────┐
 ▼                  ▼
[Database]   [Blockchain Read]
     │                  │
     └───────Merge──────┘
             │
             ▼
      [Verified Result]
```

---

## F. Organizer Block

### Purpose
Handles organizer-only operations.

### Responsibilities
- create event
- upload whitelist
- approve wallet
- trigger upgrade
- monitor claims

```text
[Organizer Dashboard]
       │
       ▼
[Organizer Controller]
       │
 ┌─────┼───────────────┐
 ▼     ▼               ▼
[Event DB] [Eligibility DB] [Credential DB]
```

---

## G. Blockchain Service Block

### Purpose
This block talks to the deployed smart contract on Base Sepolia.

### Responsibilities
- read token owner
- fetch token URI
- call upgrade functions
- listen to mint/upgrade events if needed

### Important
This service should isolate blockchain logic from the rest of backend.
Do not spread contract calls across many files.

```text
[Backend Logic]
      │
      ▼
[Contract Service]
      │
      ▼
[ERC-721 Contract on Base Sepolia]
```

---

## H. UGF Service Block

### Purpose
Handles gasless transaction support.

### Responsibilities
- prepare quote request
- handle settlement data
- execute gasless transaction flow
- return confirmation info

### Flow
```text
[Claim Request]
      │
      ▼
 [UGF Service]
      │
  Quote -> Settle -> Execute -> Confirm
      │
      ▼
[Transaction Result]
```

This should remain a separate service so the app can easily change implementation later.

---

## I. Database Layer

### Main Collections / Tables

```text
Users
Events
Eligibility
Credentials
VerificationLogs
Claims
```

### Relationship view

```text
User ---- claims ----> Credential ---- belongs to ----> Event
   \                                             \
    \---- approved in ----> Eligibility           \---- checked in ----> VerificationLog
```

---

## 4. Request Flow Wireframes

## Flow 1: Claim Pass

```text
User clicks Claim
      │
      ▼
Frontend sends wallet + eventId
      │
      ▼
Backend checks eligibility
      │
      ▼
Credential block prepares claim data
      │
      ▼
UGF flow starts
      │
      ▼
Smart contract mints NFT on Base Sepolia
      │
      ▼
Backend stores tokenId + txHash + tier
      │
      ▼
Frontend shows success screen
```

---

## Flow 2: Upgrade Credential

```text
Organizer selects user/token
      │
      ▼
Backend verifies organizer auth
      │
      ▼
Credential block sends upgrade request
      │
      ▼
Blockchain service calls contract upgrade function
      │
      ▼
DB updates credential tier
      │
      ▼
Frontend/admin dashboard reflects new status
```

---

## Flow 3: Verify Credential

```text
Verifier enters tokenId or wallet
      │
      ▼
Backend fetches DB + onchain data
      │
      ▼
Verification block merges result
      │
      ▼
Frontend shows Verified / Not Verified
```

---

## 5. Minimal Backend Screens / Logical Interfaces

Even though backend has no UI, think of it in these logical interfaces:

| Logical Interface | Who uses it | Purpose |
|---|---|---|
| Public Event API | Frontend | Show event data |
| Claim API | Frontend | Start claim flow |
| Verify API | Frontend/Public | Verify token |
| Organizer API | Organizer dashboard | Manage events and upgrades |
| Auth API | Organizer only | Login and authorization |

---

## 6. Clean Folder Wireframe

```text
server/
└── src/
    ├── config/
    ├── controllers/
    ├── routes/
    ├── models/
    ├── middleware/
    ├── services/
    │   ├── ugfService.js
    │   ├── contractService.js
    │   ├── metadataService.js
    │   └── eligibilityService.js
    ├── utils/
    └── server.js
```

---

## 7. Best Architecture Rule

Keep these responsibilities separate:

- **Frontend** = user interaction
- **Backend** = business logic and permissions
- **Database** = off-chain app data
- **Smart contract** = ownership/proof layer
- **UGF** = gasless execution layer

If you mix these too much, the project becomes confusing and hard to debug.

---

## 8. Best MVP Backend Layout

If you want the simplest structure that still works well, only build:

```text
1. Event module
2. Eligibility module
3. Credential module
4. Verify module
5. UGF service
6. Contract service
```

Skip advanced dashboard features until the core flow works.

---

## 9. Final Summary

The backend wireframe for Credify should look like a **central control layer** between the frontend and the blockchain stack.

It should:
- decide who can claim,
- prepare the claim flow,
- save results,
- support verification,
- and help organizers upgrade credentials.

The blockchain proves ownership.
The backend makes the product usable.
The UGF service makes it gasless.
