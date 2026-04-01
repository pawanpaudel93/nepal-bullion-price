# Phase 2 — "Give Them a Reason to Return" Engagement Features

**Date:** 2026-04-01
**Scope:** 3 client-side engagement features for Nepal Bullion Price web app
**Goal:** Create daily return habits (prediction game), provide a glanceable summary (digest), and add a practical tool people need when buying/selling (calculator)

## Overview

All three features are client-side only (localStorage + existing API data). No new API endpoints or backend changes. They build on Phase 1's streak/badge system and fun comparisons.

## Feature 1: Daily Price Prediction Game

Users predict whether gold will go up or down tomorrow. Creates a must-return-tomorrow loop.

### UI States

**State 1 — No prediction yet today:**
- Heading: "Predict Tomorrow" / "भोलिको अनुमान"
- Subtext: "Will gold go up or down tomorrow?"
- Two large buttons: ▲ Up (green tint) / ▼ Down (red tint)
- Shows current prediction streak and accuracy %

**State 2 — Prediction locked (waiting for tomorrow):**
- Shows user's pick: "▲ Gold will go UP" in green (or ▼ Down in red)
- Subtext: "Check back tomorrow to see if you were right!"
- Prediction streak + accuracy stats
- Buttons disabled/hidden

**State 3 — Result revealed (next day, before new prediction):**
- Result: "✅ You were right!" (green) or "❌ Not this time" (red)
- Context: "Gold went up Rs 7,400 (+2.5%)" 
- Updated streak + accuracy
- New prediction buttons appear below for today

### Game Logic

- Prediction: `'up' | 'down'` stored with date in localStorage
- Resolution: compare today's Nepal gold price vs yesterday's
  - If today > yesterday → actual = 'up'
  - If today < yesterday → actual = 'down'
  - If today = yesterday → prediction counts as correct (market was flat, no loss)
- Prediction streak: consecutive correct predictions (resets on wrong)
- Accuracy: `(totalCorrect / totalPredictions) * 100`
- One prediction per calendar day (Nepal timezone UTC+5:45)

### Placement

Standalone card below the price card grid, above the fold. Full width, same glass-card style as price cards.

### State (localStorage)

```typescript
interface PredictionState {
  currentPrediction: { date: string; direction: 'up' | 'down' } | null;
  lastResult: { date: string; direction: 'up' | 'down'; actual: 'up' | 'down'; correct: boolean } | null;
  predictionStreak: number;
  bestPredictionStreak: number;
  totalPredictions: number;
  totalCorrect: number;
}
```

### i18n Keys

- `predictTomorrow`, `willGoldGoUpOrDown`, `up`, `down`
- `goldWillGoUp`, `goldWillGoDown`, `checkBackTomorrow`
- `youWereRight`, `notThisTime`, `goldWentUp`, `goldWentDown`, `goldFlat`
- `predictionStreak`, `accuracy`, `bestPredictionStreak`

## Feature 2: Morning Digest Card

A glanceable summary shown once per day on first visit.

### Content

1. **Greeting** — changes by Nepal time:
   - 5:00–11:59 → ☀️ Good morning / शुभ प्रभात
   - 12:00–16:59 → 🌤️ Good afternoon / शुभ दिन
   - 17:00–4:59 → 🌙 Good evening / शुभ सन्ध्या

2. **Price summary** — 2-column grid:
   - Gold: price + change from yesterday (Rs amount + %)
   - Silver: price + change from yesterday

3. **Prediction result** (if user predicted yesterday):
   - "🎯 Yesterday's prediction: ✅ Correct!" or "❌ Wrong"

4. **Visit streak count**: "🔥 Streak: 7 days"

### Behavior

- Shows once per day on first visit (tracks `lastDigestDate` in localStorage)
- Dismissable via ✕ button (hides for rest of day)
- Appears at top of prices tab, above the price cards
- Uses existing data: `nepalPrice`, `previousPrice`, streak from `useStreak`, prediction result from `usePrediction`
- No new API calls

### State (localStorage)

```typescript
// Stored as part of existing streak state or simple key
lastDigestDate: string; // "YYYY-MM-DD" — don't show again today after dismiss
```

## Feature 3: Gold/Silver Calculator

Bidirectional weight ↔ value converter. Practical tool for buying/selling jewellery.

### UI

- **Metal toggle:** Gold | Silver pills (like the Prices|News tabs)
- **Weight input:** number field + unit dropdown (tola / gram)
- **Value output:** formatted Rs amount (or vice versa if user types in value field)
- **Bidirectional:** typing in either field updates the other
- **Rate display:** "Based on today's rate: Rs 2,97,600/tola (hallmark)"
- **Fun comparison:** reuses `getComparisons` to show a rotating comparison for the calculated value

### Conversion Logic

```
Gold:
  1 tola = price from nepalGoldPrice.hallmark
  1 gram = hallmark / 11.6638 (1 tola = 11.6638 grams)

Silver:
  1 tola = price from nepalSilverPrice.price
  1 gram = price / 11.6638
```

### Placement

New tab: `Prices | News | Calculator` — adds a third tab to the existing tab bar.

### Tab Type Update

```typescript
type Tab = 'prices' | 'news' | 'calculator';
```

### i18n Keys

- `calculator`, `weight`, `value`, `tola`, `gram`
- `basedOnTodaysRate`, `enterWeight`, `enterValue`

## New Files

| File | Purpose |
|---|---|
| `src/hooks/usePrediction.ts` | Prediction game state + resolution logic |
| `src/components/PredictionCard.tsx` | Prediction game UI (3 states) |
| `src/components/MorningDigest.tsx` | Daily digest card |
| `src/components/CalculatorPage.tsx` | Calculator tab content |

## Modified Files

| File | Changes |
|---|---|
| `src/components/Header.tsx` | Add 'calculator' to Tab type, render 3rd tab |
| `src/App.tsx` | Wire usePrediction, render PredictionCard + MorningDigest, add CalculatorPage for calculator tab |
| `src/i18n.tsx` | Add ~25 new translation keys |

## Accessibility

- Prediction buttons: minimum 44px touch targets, `aria-pressed` state
- Calculator inputs: proper `<label>` elements, `inputMode="decimal"` for mobile number keyboard
- Digest: `role="status"`, `aria-live="polite"`
- All interactive elements: `focus-visible:ring`, `cursor-pointer`

## Out of Scope (Phase 3)

- Price Alerts (push notifications)
- Investment Time Machine
- "On This Day" Historical Prices
