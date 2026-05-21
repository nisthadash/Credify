```
# Credify Frontend Structure + Wireframes
```

```
## 1. Frontend Overview
```

```
Credify frontend is a wallet-first web app that lets users claim gasless event
credentials, view owned credentials, verify credentials publicly, and optionally
access an organizer dashboard.[file:1]
```

```
The frontend should feel like a normal event website, not a crypto dashboard.
The blockchain complexity stays hidden behind wallet connection, UGF flow, and
clear status states.[file:1]
```

```
## 2. Frontend Page Structure
```

```
```text
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── StatusChip.jsx
│   │   └── Loader.jsx
│   ├── wallet/
│   │   ├── ConnectWalletButton.jsx
│   │   └── NetworkBadge.jsx
│   ├── credential/
│   │   ├── CredentialPreview.jsx
│   │   ├── CredentialCard.jsx
│   │   └── UGFProgressModal.jsx
│   ├── verify/
│   │   └── VerificationResultCard.jsx
│   └── organizer/
│       ├── StatsCard.jsx
│       └── UserTable.jsx
│
├── pages/
│   ├── LandingPage.jsx
│   ├── ClaimPage.jsx
│   ├── MyCredentialsPage.jsx
│   ├── VerifyPage.jsx
│   ├── SuccessPage.jsx
│   ├── OrganizerLoginPage.jsx
│   └── OrganizerDashboardPage.jsx
│
├── hooks/
│   ├── useWallet.js
│   ├── useEligibility.js
│   └── useUGFClaim.js
│
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── credentialService.js
│   └── verifyService.js
│
├── routes/
│   └── AppRoutes.jsx
│
├── assets/
│   └── images, icons, badge art
```

```
│
└── App.jsx
```
```

```
## 3. Page List and Purpose
```

```
### 3.1 Landing Page
```

```
Purpose: explain the product and send the user to claim or verify.
```

```
### 3.2 Claim Page
Purpose: let eligible users claim a credential gaslessly.
```

```
### 3.3 UGF Progress Modal
Purpose: show the quote → settle → execute → confirm flow.
```

```
### 3.4 Success Page
Purpose: confirm minting and show token details.
```

```
### 3.5 My Credentials Page
Purpose: show all credentials owned by the connected wallet.
```

```
### 3.6 Verify Page
Purpose: allow public verification by token ID or wallet.
```

```
### 3.7 Organizer Login Page
Purpose: allow organizer access to admin tools.
```

```
### 3.8 Organizer Dashboard Page
Purpose: manage events, approvals, and upgrades.
```

```
## 4. Global Layout Wireframe
```

```
```text
```

```
┌────────────────────────────────────────────────────────────────────┐
│ LOGO                                   [Connect Wallet] [Network]  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                         Page Content                               │
│                                                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```
```

```
### Global elements
```

```
- Logo on the left.
- Wallet connect / wallet address on the right.
- Base Sepolia network badge on the right.
- Footer only if needed.
```

```
## 5. Detailed Page Wireframes
```

```
## 5.1 Landing Page
```

```
```text
```

```
┌────────────────────────────────────────────────────────────────────┐
│ LOGO                                   [Connect Wallet] [Base Sepolia]
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Gasless Event Credentials                                         │
│  Claim badges and certificates without needing ETH.               │
│                                                                    │
│  [ Claim Your Pass ]   [ Verify Credential ]                      │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
```

```
│  │ No ETH Needed│  │ Onchain Proof │  │ UGF Powered  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                    │
│  Badge preview / event illustration                                │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```
```

```
### Sections
```

```
- Hero headline.
```

- `Subheadline.` 

```
- Primary CTA buttons.
```

- `Feature cards.` 

- `Preview visual.` 

```
## 5.2 Claim Page
```

```
```text
```

**==> picture [427 x 218] intentionally omitted <==**

**----- Start of picture text -----**<br>
┌────────────────────────────────────────────────────────────────────┐<br>│ LOGO                              Wallet: 0x1234...   [Disconnect] │<br>├────────────────────────────────────────────────────────────────────┤<br>│                                                                    │<br>│  ┌──────────────────────────────────────────────────────────────┐   │<br>│  │ Event: Credify Workshop                                      │   │<br>│  │ Date: May 30, 2026                                           │   │<br>│  │ Tier: Participant Badge                                      │   │<br>│  │ Status: Eligible                                             │   │<br>│  └──────────────────────────────────────────────────────────────┘   │<br>│                                                                    │<br>│  ┌──────────────────────────────────────────────────────────────┐   │<br>│  │               [ Credential Preview ]                         │   │<br>│  └──────────────────────────────────────────────────────────────┘   │<br>│                                                                    │<br>│                      [ Claim Pass ]                                │<br>│                                                                    │<br>│  No ETH needed. UGF handles gas in the background.                │<br>│                                                                    │<br>└────────────────────────────────────────────────────────────────────┘<br>**----- End of picture text -----**<br>


```
```
```

```
### Key states
- Eligible.
- Not eligible.
- Already claimed.
```

```
- Claim in progress.
```

- `Claim failed.` 

```
## 5.3 UGF Progress Modal
```

```
```text
```

```
┌───────────────────────────────┐
│ Gasless Claim in Progress     │
├───────────────────────────────┤
│ Step 1: Quote fetched ✅       │
│ Step 2: Mock USD settled ✅    │
│ Step 3: Transaction executing │
│ Step 4: Confirming onchain    │
│                               │
│ [██████████░░░░░░░░░░] 50%     │
└───────────────────────────────┘
```
```

```
### Purpose
Shows the hidden blockchain work in a way the user can understand.
```

```
## 5.4 Success Page
```

```
```text
```

```
┌────────────────────────────────────────────────────────────────────┐
│                    ✅ Claimed Successfully                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                     [ Large Badge Preview ]                       │
│                                                                    │
│  Token ID: #14                                                    │
│  Tier: Participant                                                │
│  Event: Credify Workshop                                          │
│  Network: Base Sepolia                                            │
│  Tx Hash: 0xabc...                                                │
│                                                                    │
│  [ View on Explorer ]   [ Share ]   [ Go to My Credentials ]      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

```
```
```

```
### Purpose
```

```
Confirm the mint and make the reward feel real.
```

```
## 5.5 My Credentials Page
```

```
```text
```

```
┌────────────────────────────────────────────────────────────────────┐
│ My Credentials                                                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  [ Pass Card ]   [ Badge Card ]   [ Certificate Card ]            │
│                                                                    │
│  Each card shows:                                                  │
│  - Event name                                                      │
│  - Tier                                                            │
│  - Status                                                          │
│  - Upgrade button if available                                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```
```

## `### Purpose` 

```
User dashboard for all owned credentials.
```

```
## 5.6 Verify Page
```

```
```text
```

```
┌────────────────────────────────────────────────────────────────────┐
│ Verify Credential                                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  [ Search by Wallet Address __________________ ] [Verify]         │
│  [ Search by Token ID ________________________ ] [Verify]         │
│                                                                    │
│  Result Card:                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Status: Verified                                              │   │
│  │ Owner: 0x1234...                                              │   │
│  │ Event: Credify Workshop                                       │   │
│  │ Tier: Participant                                             │   │
│  │ Issued: May 21, 2026                                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                    │
```

```
└────────────────────────────────────────────────────────────────────┘
```

```
```
```

## `### Purpose` 

```
Public verification page for anyone to confirm authenticity.
```

```
## 5.7 Organizer Login Page
```

```
```text
```

**==> picture [421 x 104] intentionally omitted <==**

**----- Start of picture text -----**<br>
┌────────────────────────────────────────────────────────────────────┐<br>│ Organizer Login                                                    │<br>├────────────────────────────────────────────────────────────────────┤<br>│                                                                    │<br>│  Email Address  [________________________]                         │<br>│  Password       [________________________]                         │<br>│                                                                    │<br>│  [ Login ]                                                         │<br>│                                                                    │<br>└────────────────────────────────────────────────────────────────────┘<br>**----- End of picture text -----**<br>


```
```
```

## `### Purpose` 

```
Optional admin access for event organizers.
```

```
## 5.8 Organizer Dashboard Page
```

```
```text
```

```
┌────────────────────────────────────────────────────────────────────┐
│ Organizer Dashboard                                                │
├────────────────────────────────────────────────────────────────────┤
│  [Create Event] [Upload Eligibility] [Upgrade Users]              │
│                                                                    │
│  Summary Cards                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                      │
│  │ Approved   │ │ Minted     │ │ Pending    │                      │
│  │ Users      │ │ Credentials│ │ Upgrades   │                      │
│  └────────────┘ └────────────┘ └────────────┘                      │
│                                                                    │
│  User Table / Credential Table                                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

```
```
```

```
### Purpose
```

```
Used to manage approvals, credential issuance, and upgrades.
```

```
## 6. Mobile Layout Priority
```

```
On mobile, show in this order:
```

`1. Logo.` 

`2. Wallet connect button.` 

`3. Main CTA.` 

`4. Status chip.` 

`5. Preview card.` 

`6. Additional details below.` 

```
Do not overload mobile with too many sections.
```

```
## 7. Shared Components
```

- `Header.` 

- `Footer.` 

- `Wallet connect button.` 

- `Network badge.` 

- `Event card.` 

```
- Status chip.
- Credential preview.
- Credential card.
- UGF progress modal.
- Verification result card.
- Stats card.
- Admin table.
- Primary button.
- Secondary button.
```

```
## 8. Routing Structure
```

```
```text
/                   -> LandingPage
/claim              -> ClaimPage
/my-credentials     -> MyCredentialsPage
/verify             -> VerifyPage
/success            -> SuccessPage
/organizer/login    -> OrganizerLoginPage
/organizer/dashboard-> OrganizerDashboardPage
```
```

```
## 9. State Flow
```

```
```text
Landing
→ Connect Wallet
→ Claim Page
→ Eligibility Check
→ UGF Progress Modal
→ Success Page
→ My Credentials Page
→ Verify Page
```
```

```
## 10. MVP Priority
### Must build
- Landing page.
- Claim page.
- UGF modal.
- Success page.
- Verify page.
- My Credentials page.
### Nice to have
- Organizer login page.
- Organizer dashboard.
- Credential upgrades.
- QR verification.
```

```
## 11. Final Frontend Rule
The frontend should feel like a simple event product while the blockchain and
gasless mechanics stay invisible until the moment of success.
```
```

