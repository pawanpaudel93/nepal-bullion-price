# Phase 1 — "Make It Feel Alive" Engagement Features

**Date:** 2026-04-01
**Scope:** 4 client-side engagement features for Nepal Bullion Price web app
**Goal:** Transform the app from a static price display into something people want to open daily and share with friends

## Overview

All four features are client-side only (localStorage + existing API data). No new API endpoints, no backend changes, no user accounts. They work together: the mood indicator and fun comparisons make price cards feel alive, milestones turn price movements into events, and streaks reward daily visits.

## Feature 1: Market Mood Indicator

An emoji on each price card reflecting how active the market is today. Neutral framing — no buyer/holder bias.

### Mood Scale

| Absolute % Change | Emoji | EN Label | NP Label |
|---|---|---|---|
| ≥ 2% | 🔥 | On Fire | तातो |
| 1–2% | ⚡ | Active | सक्रिय |
| 0.3–1% | 😊 | Calm | शान्त |
| < 0.3% | 💤 | Quiet | सुस्त |

### Behavior

- Compares today's Nepal price (`nepalPrice`) vs `previousPrice` — data already available
- Uses absolute percentage change (no directional judgment)
- Displays inline in PriceCard header, next to metal name: "Gold 🔥"
- Tooltip on hover/tap shows the label ("On Fire")
- Subtle scale-in entrance animation (0 → 1, 300ms ease-out)
- `aria-label` with mood text for accessibility

### Implementation

- Pure function: `getMarketMood(current: number, previous: number) → { emoji: string; labelKey: string }`
- 4 new i18n keys per language: `moodOnFire`, `moodActive`, `moodCalm`, `moodQuiet`
- Renders inside `PriceCard.tsx` header div, after the `<h2>` title

## Feature 2: Fun Price Comparisons

Rotating real-world comparisons below the Nepal price. "1 tola gold = 1,392 momo plates."

### Comparison Items

All reference prices must reflect actual Nepal market prices.

**Gold comparisons:**

| Emoji | Item | Reference Price (NPR) | Notes |
|---|---|---|---|
| 🍛 | Momo plates | 200 | Standard plate in Kathmandu |
| 📱 | iPhone 16 Pro | 229,900 | Nepal authorized price |
| 🏍️ | Royal Enfield Classic 350 | 125,000 | Nepal showroom price (verify) |
| 🏠 | Months rent in KTM | 15,000 | Average 2BHK in Kathmandu |
| ✈️ | KTM→Delhi flights | 18,000 | Average one-way |
| ☕ | Cups of chiya | 30 | Standard roadside price |
| ⛰️ | Everest Base Camp treks | 150,000 | Budget package price |

**Silver comparisons** (scaled for lower tola price ~Rs 4,500):

| Emoji | Item | Reference Price (NPR) | Notes |
|---|---|---|---|
| 🍛 | Momo plates | 200 | |
| ☕ | Cups of chiya | 30 | |
| 🎬 | Movie tickets | 400 | Kathmandu multiplex |
| 🚐 | Micro bus rides | 25 | Standard fare |

**Important:** Reference prices should be verified against current Nepal market prices during implementation. These are starting estimates.

### Behavior

- Positioned below the Nepal price and source line, above the 7-Day Trend section
- Auto-rotates every 8 seconds with crossfade animation (opacity transition, 400ms)
- Tap/click cycles to next comparison manually
- Only shows comparisons where result ≥ 1 (skip fractional results like "0.3 iPhones")
- Format: `{emoji} That's roughly {count} {item}` / `{emoji} लगभग {count} {item}`

### Implementation

- New component: `FunComparison.tsx`
- Props: `price: number`, `metal: 'gold' | 'silver'`
- Static comparison arrays with `{ emoji, labelKey, referencePrice }` objects
- `useEffect` with `setInterval` for auto-rotation, cleared on unmount
- Bilingual item labels via i18n (new keys for each comparison item)
- Renders inside `PriceCard.tsx`, after the source/perTola line, before TrendSection

## Feature 3: Milestone Celebrations

Confetti and banners when gold/silver crosses round numbers or hits all-time highs.

### Triggers

| Trigger | Condition | Effect |
|---|---|---|
| Round number | Gold crosses a Rs 10,000 boundary (280K→290K→300K) | 🎉 Confetti + banner |
| Round number | Silver crosses a Rs 500 boundary (4,500→5,000) | 🎉 Confetti + banner |
| All-time high | Price exceeds highest recorded in localStorage | 🏆 Gold confetti + ATH badge |
| Big daily move | ≥ 2% absolute change | ⚡ Pulse glow on price (no confetti) |

### Milestone Detection Logic

```
roundGold = Math.floor(currentPrice / 10000) > Math.floor(previousPrice / 10000)
roundSilver = Math.floor(currentPrice / 500) > Math.floor(previousPrice / 500)
isATH = currentPrice > localStorage.getItem('ath_gold') (or ath_silver)
```

### Banner UI

- Appears above the price card grid in App.tsx
- Gradient background (gold tint for gold milestones, silver tint for silver)
- Content: emoji + "Gold crossed Rs X!" + subtitle with context
- Dismissable via ✕ button
- Auto-dismisses after 30 seconds

### Confetti

- Library: `canvas-confetti` (~6KB gzipped)
- Gold milestones: gold/amber particle colors
- Silver milestones: silver/white particle colors
- ATH: extended duration (3s vs 2s), more particles
- Respects `prefers-reduced-motion`: skip confetti, show banner only

### State (localStorage)

```typescript
interface MilestoneState {
  seenMilestones: string[];    // e.g. ["gold_280000", "silver_5000"]
  athGold: number;             // highest gold price seen
  athSilver: number;           // highest silver price seen
}
```

- Milestones stored as `{metal}_{threshold}` strings
- Don't re-celebrate on page refresh or if price dips and re-crosses
- Fire on first load if milestone crossed since last visit

### Implementation

- New hook: `useMilestones(goldPrice, silverPrice, goldPrev, silverPrev)`
- Returns: `{ activeMilestone: MilestoneEvent | null, dismiss: () => void }`
- New component: `MilestoneBanner.tsx` — renders the dismissable banner
- Confetti triggered via `useEffect` when `activeMilestone` changes
- Renders in `App.tsx` above the price card grid

## Feature 4: Visit Streak & Badges

Daily visit tracking with evolving streak icons and unlockable badges.

### Streak Mechanics

- A "visit" = opening the app on a calendar day (Nepal timezone, UTC+5:45)
- Consecutive calendar days build the streak
- Missing a full calendar day resets the streak to 0
- Best streak is tracked separately and never resets

### Streak Icon Tiers

| Days | Emoji | EN Label | NP Label |
|---|---|---|---|
| 1–6 | 🔥 | Getting started | सुरुवात |
| 7–29 | ⚡ | On a roll | जोशमा |
| 30–99 | 👑 | Dedicated | समर्पित |
| 100+ | 💎 | Legend | दिग्गज |

### Badges

| Emoji | Name (EN) | Name (NP) | Condition |
|---|---|---|---|
| 👀 | Price Checker | मूल्य जाँचकर्ता | First visit |
| 🔥 | Gold Watcher | सुन पर्यवेक्षक | 7-day streak |
| ⚡ | Silver Sentinel | चाँदी प्रहरी | 30-day streak |
| 👑 | Bullion Baron | बुलियन बारन | 100-day streak |
| 💎 | Diamond Hands | हीरा हात | 365-day streak |
| 🎉 | Milestone Witness | माइलस्टोन साक्षी | Witnessed a round-number crossing |
| 🏆 | ATH Hunter | ATH शिकारी | Witnessed an all-time high |

### UI Components

**StreakPill** (in Header):
- Compact pill: `{streakEmoji} {count}` — e.g., "🔥 7"
- Background: subtle gold tint
- Position: in header controls row, before refresh/NP/dark-mode buttons
- Tappable — opens BadgePopover

**BadgePopover**:
- Positioned below the StreakPill
- Shows: current streak count, best streak, divider, badge grid
- Earned badges: full opacity with name tooltip
- Locked badges: 20% opacity with "?" or lock tooltip
- Closes on outside click or Escape key
- Entrance animation: scale + fade from pill origin

### State (localStorage)

```typescript
interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastVisitDate: string;     // "YYYY-MM-DD" in Nepal timezone
  badges: string[];          // ["price_checker", "gold_watcher", ...]
  totalVisits: number;
}
```

### Implementation

- New hook: `useStreak()` — manages streak state, returns `{ streak, bestStreak, badges, streakEmoji, streakLabel }`
- On mount: checks today's date (Nepal TZ) vs `lastVisitDate`. Same day = no-op. Yesterday = increment streak. Older = reset to 1.
- Badge unlocks checked after streak update — fires confetti on new badge
- New components: `StreakPill.tsx`, `BadgePopover.tsx`
- StreakPill renders in `Header.tsx`
- Milestone/ATH badges awarded by `useMilestones` hook calling into streak state

## Cross-Feature Integration

- **Milestones → Badges**: When `useMilestones` fires, it also awards the "Milestone Witness" or "ATH Hunter" badge via `useStreak`
- **Confetti sharing**: Both milestones and badge unlocks use `canvas-confetti` — import once, share the instance
- **Share card**: The mood emoji and fun comparison could optionally be included in the share image (future enhancement, not Phase 1 scope)

## New Dependencies

| Package | Size | Purpose |
|---|---|---|
| `canvas-confetti` | ~6KB gzip | Confetti animations for milestones and badge unlocks |

## New Files

| File | Purpose |
|---|---|
| `src/utils/marketMood.ts` | `getMarketMood()` pure function |
| `src/components/FunComparison.tsx` | Rotating comparison component |
| `src/utils/comparisons.ts` | Comparison item data (prices, labels) |
| `src/components/MilestoneBanner.tsx` | Dismissable milestone banner |
| `src/hooks/useMilestones.ts` | Milestone detection + state |
| `src/hooks/useStreak.ts` | Streak tracking + badge management |
| `src/components/StreakPill.tsx` | Header streak counter pill |
| `src/components/BadgePopover.tsx` | Badge display popover |

## Modified Files

| File | Changes |
|---|---|
| `src/components/PriceCard.tsx` | Add mood emoji + FunComparison |
| `src/components/Header.tsx` | Add StreakPill |
| `src/App.tsx` | Add MilestoneBanner, wire useMilestones |
| `src/i18n.tsx` | Add ~30 new translation keys (moods, comparisons, streaks, badges) |
| `src/index.css` | Add confetti-related animations if needed |

## Accessibility

- All emojis have `aria-label` with text description
- Confetti respects `prefers-reduced-motion`
- BadgePopover: focus trap, Escape to close, `role="dialog"`
- FunComparison: `aria-live="polite"` for screen reader announcements on rotation
- All interactive elements meet 44px minimum touch target

## Out of Scope (Phase 2 & 3)

- Daily Price Prediction Game
- Morning Digest Card
- Gold Calculator
- Price Alerts (push notifications)
- Investment Time Machine
- "On This Day" Historical Prices
