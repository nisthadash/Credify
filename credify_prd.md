# Product Requirements Document (PRD)

## Product Name
**Credify**

## Product Summary
Credify is a beginner-friendly, gasless onchain credential platform built on Base Sepolia. It allows users to claim event passes, badges, and certificates without needing ETH in their wallet. Instead of paying gas with ETH, users pay with Mock USD through UGF, which handles the gas side invisibly in the background.[file:1]

The product is designed for the hackathon problem statement that asks teams to build a real and useful dApp where users take an onchain action and UGF removes the ETH gas dependency.[file:1]

## Problem Statement
Most Web3 apps fail for normal users because even a simple onchain action requires ETH for gas. This creates friction for first-time users, especially in educational, event, and community settings where users only want to claim a badge, pass, or certificate and do not care about crypto mechanics.[file:1]

Traditional badge and certificate products also have limitations. Many are offchain, depend on centralized databases, or do not provide easy ownership and public verification. Existing market players offer credentials or gasless infrastructure, but often focus on enterprise-scale tooling rather than a simple, beginner-first event credential journey.[web:98][web:122][web:132][web:135]

## Product Vision
Make onchain credentials feel as simple as claiming a normal digital pass, while preserving public verification and user ownership.[file:1]

## Goal
Build a gasless credential flow for hackathons, events, workshops, bootcamps, and communities where users can:
- Claim an event pass
- Upgrade it into a badge or certificate
- Verify the credential publicly
- Complete everything without needing ETH

## Why This Product
The hackathon specifically wants teams to build beginner-friendly dApps on Base Sepolia that use UGF so users can pay gas with Mock USD instead of ETH.[file:1] Credify fits this directly because it uses minting, one of the suggested tracks, and turns gasless UX into a clear, understandable use case.[file:1]

## Target Users
- Hackathon participants
- College students attending events or workshops
- Organizers issuing participation proof
- Community managers running online or offline programs
- Mentors, finalists, winners, and volunteers who need verifiable recognition

## Core User Pain Points
- Users do not understand wallets, ETH, gas, or blockchain mechanics
- Users get blocked if they do not hold ETH
- Organizers need easy ways to issue and verify credentials
- Existing credentials are often easy to fake, hard to verify, or not owned by the recipient

## Proposed Solution
Credify will provide a gasless credential lifecycle:
1. User connects wallet on Base Sepolia
2. User claims a gasless event pass
3. Organizer or system confirms attendance/completion
4. Pass upgrades into badge or certificate
5. Anyone can verify the credential through a public verification page

This is not a one-time NFT minter. It is a lightweight onchain credential workflow powered by UGF.[file:1]

## Key Differentiators
| Area | Generic badge/certificate product | Credify |
|---|---|---|
| Gas payment | Often requires ETH or hides blockchain by using enterprise infra | Uses UGF with Mock USD directly on Base Sepolia for gasless user flow.[file:1] |
| User experience | May still feel crypto-heavy | Designed to feel like a normal web app |
| Credential model | One-time issue | Claim -> upgrade -> verify lifecycle |
| Verification | Sometimes centralized | Public verification page |
| Audience | Generic or enterprise | Beginner-first event/community credential use case |
| Demo clarity | Abstract | Easy live demo: user with zero ETH claims a real credential |

## Unique Standout Feature
### Progressive Credential Ladder
The main differentiator will be a progression system rather than a one-time mint:
- Event Pass
- Participant Badge
- Finalist Badge
- Winner Certificate
- Mentor / Volunteer Credential

This gives the product depth and makes it feel like a living onchain reputation flow rather than just an NFT badge generator.

## User Stories
- As a participant, I want to claim my event credential without buying ETH first.
- As an organizer, I want to issue verifiable badges to approved users.
- As a recruiter or verifier, I want to confirm whether a credential is genuine.
- As a mentor or volunteer, I want my contribution to be recognized onchain.

## Functional Requirements
### Must Have
- Wallet connection on Base Sepolia
- UGF integration for quote -> settle -> execute -> confirm flow.[file:1]
- Mock USD settlement for gasless action.[file:1]
- Event pass minting
- Badge or certificate upgrade flow
- Public verification page
- Success state after mint/upgrade showing transaction confirmation

### Should Have
- Tiered credential system
- Eligibility or whitelist logic
- Metadata for event name, role, date, credential type
- Friendly UI copy that avoids crypto jargon

### Nice to Have
- Organizer dashboard
- QR-based verification
- Credential sharing page
- Claim history page
- Badge artwork variants based on tier

## Non-Functional Requirements
- Beginner-friendly UX
- Fast, clear, low-friction claim flow
- Mobile-friendly interface
- Clean visual feedback during transaction states
- Reliable Base Sepolia testing
- Demo-ready within hackathon time constraints

## Product Flow
1. User lands on homepage
2. User clicks Connect Wallet
3. App checks if wallet is eligible
4. User clicks Claim Pass
5. UGF returns cost quote in Mock USD
6. User approves settlement
7. UGF executes the transaction on Base Sepolia
8. NFT pass is minted without ETH in user wallet
9. User sees success screen
10. Later, organizer upgrades credential based on event outcome
11. Verifier checks authenticity on public verify page

## Screens / Modules
- Landing page
- Connect wallet flow
- Claim pass page
- Transaction progress modal
- Success screen
- Verification page
- Admin/organizer panel (optional stretch)

## Tech Stack
| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Wallet | wagmi + viem |
| UGF | @tychilabs/react-ugf or @tychilabs/ugf-testnet-js.[file:1] |
| Smart contract | Solidity + OpenZeppelin ERC-721 |
| Network | Base Sepolia.[file:1] |
| Gas asset | Mock USD from UGF faucet.[file:1] |
| Metadata | JSON / optional IPFS |

## Competitive Landscape
Similar categories exist in the market. Crossmint offers verifiable credentials and gasless blockchain experiences, Fireblocks provides gasless EVM transaction tooling, and Dock and BadgeCert operate in digital credentialing.[web:98][web:122][web:105][web:132][web:135] However, Credify is positioned differently: it is a beginner-first hackathon/event credential flow built specifically around UGF-powered gasless actions on Base Sepolia.[file:1]

## Risks and Limitations
- Badge/certificate ideas are common in hackathons
- Judges may ask why blockchain is needed
- UGF integration issues could affect demo reliability
- A basic mint-only version may feel too shallow

## Risk Mitigation
- Focus on progression, not one-time minting
- Add public verification to justify blockchain use
- Use a strong real-world event use case
- Keep the MVP narrow and polish the demo
- Prepare a backup recorded demo in case live testnet issues occur

## Likely Judge Questions and Prepared Answers
### What makes this different?
Credify is not just a badge minter. It is a gasless onchain credential lifecycle where users can claim, upgrade, and verify credentials without ever touching ETH, using UGF to remove the biggest friction point in Web3 onboarding.[file:1]

### Why not just use a PDF or database?
A PDF can be copied, and a database is controlled by one party. Credify provides public verification, wallet ownership, and a tamper-resistant record of participation or achievement.

### Why use blockchain here?
Because the product is about verifiable ownership and trust. The credential can be checked by anyone and belongs to the user rather than only to the issuing organization.

### Why use UGF?
Because the hackathon problem is specifically about removing ETH gas dependency and making the onchain action feel invisible to the user.[file:1]

## MVP Scope
The minimum winning product should include:
- Landing page
- Wallet connection
- Gasless pass claim via UGF
- Mint confirmation screen
- Verification page

## Stretch Scope
- Credential upgrade flow
- Tier system
- Organizer dashboard
- QR verification
- Better artwork and animations

## Team Split Suggestion
| Role | Responsibility |
|---|---|
| Frontend developer | Build UI, wallet flow, success page, verification page |
| Blockchain developer | Write/deploy contract, credential logic |
| Integration developer | Implement UGF settlement and testnet flow |
| Pitch/demo lead | Presentation, storyline, recording, judge Q&A |

## Demo Script
1. Start with the problem: users normally need ETH for a simple onchain action.[file:1]
2. Show a wallet with zero ETH
3. Connect wallet on Base Sepolia
4. Click Claim Pass
5. Show UGF quote and Mock USD settlement
6. Complete mint gaslessly
7. Show credential owned by user
8. Open verify page and validate credential
9. Explain progression into badge/certificate tiers

## Success Criteria
The product is successful if:
- A user with no ETH can complete the claim flow
- UGF clearly powers the gasless transaction
- The credential feels meaningful, not gimmicky
- The demo is smooth and understandable in under 2 minutes
- Judges can immediately see the real-world use case

## Final Positioning Statement
Credify is a gasless onchain credential platform for events and communities, built on Base Sepolia with UGF, enabling users to claim and verify meaningful credentials without ever needing ETH.[file:1]
