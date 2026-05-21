# Credify Design Token Sheet

## Typography Tokens

| Token | Value |
|---|---|
| `font.brand` | `"Space Grotesk", sans-serif` |
| `font.heading` | `"Space Grotesk", sans-serif` |
| `font.body` | `"Manrope", sans-serif` |
| `font.mono` | `"JetBrains Mono", monospace` |
| `font.size.xs` | `12px` |
| `font.size.sm` | `14px` |
| `font.size.md` | `16px` |
| `font.size.lg` | `18px` |
| `font.size.xl` | `24px` |
| `font.size.2xl` | `32px` |
| `font.size.3xl` | `40px` |
| `font.weight.regular` | `400` |
| `font.weight.medium` | `500` |
| `font.weight.semibold` | `600` |
| `font.weight.bold` | `700` |

## Color Tokens

| Token | Value |
|---|---|
| `color.bg` | `#F8FAFC` |
| `color.surface` | `#FFFFFF` |
| `color.surfaceAlt` | `#F1F5F9` |
| `color.text.primary` | `#0F172A` |
| `color.text.secondary` | `#64748B` |
| `color.text.muted` | `#94A3B8` |
| `color.border` | `#E2E8F0` |
| `color.accent` | `#2563EB` |
| `color.accentHover` | `#1D4ED8` |
| `color.accentSoft` | `#DBEAFE` |
| `color.success` | `#22C55E` |
| `color.successSoft` | `#DCFCE7` |
| `color.warning` | `#F59E0B` |
| `color.warningSoft` | `#FEF3C7` |
| `color.error` | `#EF4444` |
| `color.errorSoft` | `#FEE2E2` |

## Spacing Tokens

| Token | Value |
|---|---|
| `space.1` | `4px` |
| `space.2` | `8px` |
| `space.3` | `12px` |
| `space.4` | `16px` |
| `space.5` | `20px` |
| `space.6` | `24px` |
| `space.8` | `32px` |
| `space.10` | `40px` |
| `space.12` | `48px` |
| `space.16` | `64px` |

## Radius Tokens

| Token | Value |
|---|---|
| `radius.sm` | `8px` |
| `radius.md` | `12px` |
| `radius.lg` | `16px` |
| `radius.xl` | `24px` |
| `radius.full` | `9999px` |

## Shadow Tokens

| Token | Value |
|---|---|
| `shadow.sm` | `0 1px 2px rgba(15, 23, 42, 0.06)` |
| `shadow.md` | `0 8px 24px rgba(15, 23, 42, 0.08)` |
| `shadow.lg` | `0 16px 40px rgba(15, 23, 42, 0.12)` |

## Button Tokens

| Token | Value |
|---|---|
| `button.height.sm` | `36px` |
| `button.height.md` | `44px` |
| `button.height.lg` | `52px` |
| `button.radius` | `14px` |
| `button.padding.x` | `16px` |
| `button.font.size` | `14px` |
| `button.font.weight` | `600` |

### Button styles
- Primary: filled accent.
- Secondary: outlined or soft fill.
- Tertiary: text button.
- Destructive: red but restrained.

## Input Tokens

| Token | Value |
|---|---|
| `input.height` | `44px` |
| `input.radius` | `12px` |
| `input.border` | `#E2E8F0` |
| `input.focus` | `#2563EB` |
| `input.padding.x` | `16px` |

## Card Tokens

| Token | Value |
|---|---|
| `card.padding` | `24px` |
| `card.radius` | `16px` |
| `card.border` | `#E2E8F0` |
| `card.background` | `#FFFFFF` |
| `card.shadow` | `shadow.md` |

## Motion Tokens

| Token | Value |
|---|---|
| `motion.fast` | `150ms` |
| `motion.normal` | `250ms` |
| `motion.slow` | `350ms` |
| `motion.easeOut` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `motion.easeInOut` | `cubic-bezier(0.65, 0, 0.35, 1)` |

### Motion usage
- Fade up on page load.
- Slide in cards.
- Small button hover scale.
- Modal open/close.
- Success reveal.
- Scroll reveal for sections.

## Component Mapping

| Component | Token Usage |
|---|---|
| Header | bg, border, shadow.sm, radius.lg |
| Primary button | accent, accentHover, white text, radius.md |
| Status chip | semantic colors + radius.full |
| Card | surface, border, shadow.md, radius.lg |
| Modal | surface, shadow.lg, radius.xl |
| Input | border, focus, radius.md |
| Badge preview | surfaceAlt, border, shadow.sm |

## Page Styling Rules

### Landing page
- Large heading.
- One strong CTA.
- Three feature cards.
- Soft motion on load.

### Claim page
- Event card top.
- Eligibility chip.
- Large claim button.
- Clear credential preview.

### Success page
- Bigger badge preview.
- Clean proof details.
- Reward feeling.

### Verify page
- One search field cluster.
- One result card.
- High clarity.

### Organizer dashboard
- Stats cards on top.
- Table below.
- Minimal distraction.

## CSS Variables Starter

```css
:root {
  --font-brand: "Space Grotesk", sans-serif;
  --font-body: "Manrope", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-text: #0F172A;
  --color-text-secondary: #64748B;
  --color-border: #E2E8F0;
  --color-accent: #2563EB;
  --color-accent-hover: #1D4ED8;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 8px 24px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 16px 40px rgba(15, 23, 42, 0.12);
}
```

## Final Recommendation
Keep Credify minimal and polished:
- 2 fonts,
- 1 accent color,
- 3 semantic colors,
- 3 radius levels,
- 3 shadows,
- 3 button types,
- simple motion.

That will keep the app neat, modern, and beginner-friendly.
