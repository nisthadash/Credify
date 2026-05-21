# Credify Design System PRD

## Product Name
Credify Design System

## Purpose
This design system defines the visual language, spacing, typography, motion, colors, and component structure for Credify so the app feels neat, clean, beginner-friendly, and modern across all pages.

## Product Summary
Credify is a gasless onchain credential platform. The design system must make the product feel like a polished event and fintech app rather than a complex crypto interface. It should support the landing page, claim flow, verification flow, user dashboard, and organizer dashboard while keeping blockchain complexity invisible until needed.[file:1]

## Design Goals
- Make the UI clean and easy to understand.
- Make the product feel trustworthy and premium.
- Keep the design consistent across all pages.
- Support beginner-friendly interaction patterns.
- Make the gasless claim flow feel smooth and clear.[file:1]
- Keep the branding strong without being noisy.

## Design Principles
- Clarity first.
- One primary action per page.
- Clean hierarchy.
- Calm visual tone.
- Minimal but modern motion.
- Strong readability.
- Consistent spacing.
- Mobile-friendly by default.

## Brand Personality
- Trustworthy.
- Modern.
- Friendly.
- Clear.
- Lightweight.
- Premium but simple.

## Typography System
### Brand font
Use a geometric sans-serif style for the Credify wordmark and major headings.

### Recommended font pairing
- Headings / logo: Space Grotesk or Sora.
- Body text: Manrope or DM Sans.
- Numbers / IDs / hashes: optional JetBrains Mono for technical values.

### Typography rules
- Headings should be bold and confident.
- Body text should be highly readable.
- Helper text should be smaller and soft.
- Use consistent letter spacing on the wordmark.
- Avoid decorative or overly stylized fonts.

## Color System
### Core palette
- Background: very light gray or off-white.
- Surface: white.
- Primary text: near-black.
- Secondary text: medium gray.
- Primary accent: blue, teal, or violet.
- Success: green.
- Warning: amber.
- Error: red.
- Border: soft gray.

### Suggested token values
- Background: #F8FAFC
- Surface: #FFFFFF
- Primary text: #0F172A
- Secondary text: #64748B
- Border: #E2E8F0
- Accent: #2563EB or #0F766E
- Success: #22C55E
- Warning: #F59E0B
- Error: #EF4444

### Color rules
- Use one accent color for primary actions.
- Keep cards neutral.
- Use green only for success and verified states.
- Avoid excessive bright colors.

## Spacing System
### Grid
Use an 8px spacing system.

### Spacing scale
- 4px: micro spacing.
- 8px: small spacing.
- 16px: standard spacing.
- 24px: card padding.
- 32px: section spacing.
- 40px+: major section separation.

### Layout rules
- Use generous whitespace.
- Keep content centered and balanced.
- Maintain consistent alignment.
- Avoid crowding cards or buttons.

## Component Library
### Buttons
#### Primary button
Used for Claim Pass, Verify Credential, Login, and Save actions.
Style: filled accent background, white text, rounded corners, clear hover and loading states.

#### Secondary button
Used for View on Explorer, Go to My Credentials, Back, and Cancel.
Style: outline or soft fill, lower emphasis.

#### Tertiary button
Used for share, copy, retry, and learn more actions.
Style: subtle text button or soft icon button.

### Cards
Used for event info, credentials, stats, and verification results.
Style: white surface, soft shadow, rounded corners, clean border, strong padding.

### Status chips
Used for Eligible, Verified, Already Claimed, Pending, Not Eligible, and Claim Success.
Style: pill shape, small text, color coded but soft.

### Inputs
Used for wallet search, token ID search, organizer login.
Style: labeled, clean border, visible focus state, helper text if needed.

### Modals
Used for UGF progress and wallet connect flows.
Style: centered, blurred backdrop, strong title, clear action states.

### Tables
Used mainly in organizer dashboard.
Style: compact, readable, with clear row spacing and minimal borders.

## Motion System
### Motion principles
- Keep animations subtle.
- Animate only what helps understanding.
- Avoid flashy or distracting effects.
- Make transitions short and calm.

### Motion usage
- Hero text fade-up.
- Feature cards appear sequentially.
- Claim button hover scale.
- UGF modal step transitions.
- Success badge pop-in.
- Verification result reveal.
- Scroll reveal for landing sections.

### Timing guidance
- Standard transitions: 200–300ms.
- Modal open/close: 250–350ms.
- Success reveal: slightly more expressive, but still short.

## Page Design Rules
### Landing page
- Clear brand headline.
- Strong subheadline.
- Two main CTAs.
- Three feature cards.
- Minimal preview illustration.

### Claim page
- Event card at top.
- Eligibility chip clearly visible.
- Badge preview.
- Primary claim button centered and obvious.

### UGF modal
- Show quote, settlement, execution, and confirm steps.
- Use a progress bar or step indicator.
- Keep the language simple.

### Success page
- Show a large badge preview.
- Present token ID, tier, event, and transaction hash clearly.
- Provide explorer and share actions.

### My Credentials page
- Show cards in a neat grid.
- Add filters if needed.
- Make ownership obvious.

### Verify page
- Large search input.
- Simple verify button.
- Clear verified/not verified result card.

### Organizer dashboard
- Use summary cards.
- Use one table for actions.
- Keep it functional and clean.

## Responsive Rules
### Mobile
- Single-column layout.
- Large buttons.
- No heavy tables.
- Prioritize main CTA.
- Keep cards stacked and readable.

### Desktop
- Use two-column layouts where helpful.
- Keep content width comfortable.
- Show side panels only when they add value.

## Accessibility Requirements
- High contrast text.
- Clear focus states.
- Large touch targets.
- Avoid color-only meaning.
- Respect reduced motion preferences.
- Maintain legible font sizes on all screens.

## Asset Style
- Use simple line icons or minimal filled icons.
- Badge art should be modern and clean.
- Illustrations should be subtle, not crowded.
- Avoid mixed visual styles.

## UI Consistency Rules
- One button style language across the app.
- One card style language across the app.
- One shadow system across the app.
- One border radius scale across the app.
- One accent color system across the app.

## Implementation Guidelines
- Define reusable tokens first.
- Build shared components before pages.
- Use the same typography and color tokens in every screen.
- Add motion only after the layout is stable.
- Validate every component on mobile and desktop.

## MVP Scope
### Must include
- Typography system.
- Color palette.
- Button system.
- Card system.
- Status chips.
- Input styles.
- Modal styles.
- Motion rules.
- Landing page styles.
- Claim page styles.
- Success and verify styles.

### Nice to have
- Dark mode tokens.
- Advanced animation states.
- Illustration pack.
- Expanded icon set.

## Success Criteria
- The app looks clean and modern.
- The brand feels consistent.
- The interface is easy for beginners.
- The claim flow feels smooth and trustworthy.
- The product looks polished in demo screens.

## Final Outcome
The Credify design system should make the product feel like a refined, beginner-friendly, modern event credential platform with calm motion, clean typography, and a simple visual language across all pages.
