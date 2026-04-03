# Play Section — New Games Design Spec

**Date:** 2026-04-03
**Status:** Approved
**Goal:** Add 3 new games to the Play tab — one for daily retention, one educational, one arcade — to increase engagement, teach bullion knowledge, and make the app more fun.

## Existing Context

The app currently has 3 games:
- **Gold Rush** — tap falling coins, avoid silver (arcade)
- **Price Crash** — cash out before the multiplier crashes (risk/reward)
- **Price Prediction** — daily up/down guess on real gold prices (daily)

All games follow a shared architecture:
- Custom hook for state + localStorage persistence
- Card component on Play tab (shows stats, opens game)
- Full-screen overlay for gameplay (fixed z-50, dark gradient background)
- Phase-based state machine (start → playing → over)
- `canvas-confetti` for celebrations
- Localized strings via `i18n.tsx` (English + Nepali)
- Accessibility: ARIA labels, `role="dialog"`, reduced motion support

Tech stack: React 19, TypeScript, Tailwind CSS v4, Vite, localStorage.

---

## Game 1: Gold Trader (Virtual Portfolio Simulator)

### Purpose
Daily retention loop tied to real gold prices. Users manage a virtual portfolio, learning how market timing works.

### Mechanics
- Start with **₹500,000 virtual cash**
- Buy or sell Fine Gold at the current real price (from existing `useBullionPrices` hook)
- **One trade per day** (buy X tola, sell X tola, or hold) — resets at midnight Nepal time (UTC+5:45)
- Fractional tola allowed (e.g., 0.5 tola)
- Portfolio value = cash + (gold holdings in tola × current Fine Gold price per tola)
- Track: total P&L (%), best single trade, worst single trade, portfolio value history

### UI Structure

**Play Tab Card:**
- Portfolio value with P&L indicator (green/red arrow + percentage)
- Gold holdings (X.XX tola)
- "Trade" button

**Full-Screen Trade View:**
- Current Fine Gold price per tola (live)
- Portfolio breakdown: cash balance | gold holdings (tola) | total value
- Trade action: Buy / Sell toggle
- Amount input (in tola) with quick buttons (0.5, 1, 2, 5, All)
- Confirmation button showing the rupee cost/proceeds
- Sparkline chart of portfolio value over last 7/30 days (simple SVG, no library)
- Trade history list (last 10 trades: date, action, amount, price)
- "Reset Portfolio" button (with confirmation dialog)

**Game Over / Milestones:**
- Confetti when portfolio doubles (100% return)
- Badge/toast for first trade, 10th trade, first profit, etc.

### Data Model (localStorage key: `bullion-gold-trader`)
```typescript
interface GoldTraderState {
  cash: number;              // rupees
  goldTola: number;          // gold holdings
  trades: Trade[];           // history
  portfolioHistory: { date: string; value: number }[];
  startDate: string;         // ISO date
  lastTradeDate: string;     // Nepal date string, for daily limit
}

interface Trade {
  date: string;
  action: 'buy' | 'sell';
  tola: number;
  pricePerTola: number;
  total: number;
}
```

### Dependencies
- Existing `useBullionPrices` hook for live prices
- No new API endpoints needed

---

## Game 2: Gold Quiz (Bullion Trivia)

### Purpose
Educational engagement — teach users about gold, silver, Nepal's bullion market, hallmarks, weights, and world gold facts through quick-fire trivia.

### Mechanics
- **10 questions per round**, 15 seconds per question
- **4 multiple-choice answers** per question
- **3 lives** — wrong answer costs a life, round ends at 0 lives (or after 10 questions)
- **Scoring:** +10 base per correct answer, +1 to +5 speed bonus (faster = more bonus)
- Questions drawn randomly from a static bank (no repeats within a round)
- **6 categories:** History, Nepal Market, Purity & Hallmarks, Weights & Measures, World Gold, Fun Facts

### Question Bank
Static TypeScript file with 50-100 questions to start. Easily expandable.

```typescript
interface QuizQuestion {
  id: string;
  category: 'history' | 'nepal' | 'purity' | 'weights' | 'world' | 'funfact';
  question: string;
  questionNP?: string;       // Nepali translation
  options: [string, string, string, string];
  optionsNP?: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation?: string;      // shown after answering
  explanationNP?: string;
}
```

**Sample Questions:**
| Category | Question | Answer |
|----------|----------|--------|
| Weights | How many grams is 1 tola? | 11.66g |
| Purity | What karat is 99.9% pure gold? | 24K |
| World | Which country has the largest gold reserves? | USA |
| Nepal | What is the Nepali word for gold? | सुन (Sun) |
| Nepal | Fine Gold (छापावाल) refers to what purity? | 99.5%+ |
| Purity | What does the hallmark 'BIS 916' mean? | 22 karat gold |
| History | Which metal is more dense: gold or silver? | Gold (~19.3 g/cm3 vs ~10.5 g/cm3) |
| Fun Fact | How much gold has been mined in all of human history? | ~210,000 tonnes |

### UI Structure

**Play Tab Card:**
- Best score, games played
- "Play Quiz" button

**Full-Screen Game Overlay:**
- Timer bar at top (shrinks over 15 seconds, color shifts green → amber → red)
- Category badge (e.g., "Nepal Market")
- Question text (large, centered)
- 4 answer buttons in a 2×2 grid
- Lives display (3 heart icons, top-left)
- Score (top-right)
- On correct: button flashes green, "+10" floats up, brief explanation shown (1.5s)
- On wrong: button flashes red, correct answer highlighted green, shake animation, lose heart
- On timeout: treated as wrong answer

**End Screen:**
- Final score, correct count / total, accuracy %
- New high score → confetti
- "Play Again" button

### Data Model (localStorage key: `bullion-gold-quiz`)
```typescript
interface GoldQuizState {
  highScore: number;
  gamesPlayed: number;
  totalCorrect: number;
  totalAnswered: number;
}
```

### Dependencies
- None — fully self-contained with static question bank
- Reuse `canvas-confetti` for celebrations
- Add quiz strings to `i18n.tsx` for localization

---

## Game 3: Gold Stack Tower (Precision Stacking Arcade)

### Purpose
Quick, addictive arcade game with zero learning curve. Gold-themed stacking that complements the existing tap/timing games.

### Mechanics
- First gold bar is full-width, placed at the bottom of the screen
- Each new bar slides **left ↔ right** above the current stack
- **Tap anywhere** to drop the bar
- Overlapping portion stays on the stack; overhang is sliced off and falls away
- Next bar starts at the width of the remaining overlap
- **Perfect drop** (within 3px tolerance): bar stays full width, "+5 Perfect!" bonus
- **Scoring:** +1 per bar placed, +5 for perfect drops
- **Speed:** bar slide speed increases every 5 levels (starts at 3s per traverse, minimum 0.8s)
- **Game over:** when remaining bar width reaches 0 (complete miss)
- **Camera:** viewport pans upward as stack grows (stack stays visually centered)

### Visual Design
- Bars styled as gold ingots: horizontal gradient (#D4A843 → #CA8A04 → #7C5F1B), subtle inner shadow
- Alternating slight shade variation per bar for depth perception
- Sliced overhang piece falls with fade-out + slight rotation
- "Perfect!" text pops with sparkle animation on exact drops
- Background: warm gradient that deepens as height increases (amber → deep gold → dark bronze)
- Shimmer animation on the most recently placed bar
- Stack height counter displayed as "X bars" in HUD

### UI Structure

**Play Tab Card:**
- Best height (bars), best score
- "Play" button

**Full-Screen Game Overlay:**
- Tap anywhere to drop (entire screen is touch target)
- HUD: score (top-left), height (top-right)
- Current sliding bar clearly visible above stack
- Smooth camera pan upward as stack grows
- Game over screen: final height, final score, new high score → confetti, "Play Again"

### Animation Details
- Bar sliding: CSS transform with `requestAnimationFrame` for smooth movement
- Bar drop: quick ease-out transition to stack position
- Overhang slice: separate element that falls + fades (CSS animation, removed after 500ms)
- Camera pan: CSS transform on the stack container, smooth transition
- Perfect indicator: scale-up + fade-out text animation

### Data Model (localStorage key: `bullion-gold-stack`)
```typescript
interface GoldStackState {
  highScore: number;
  bestHeight: number;
  gamesPlayed: number;
}
```

### Dependencies
- None — purely visual/interactive
- Reuse `canvas-confetti` for celebrations
- Add stack game strings to `i18n.tsx`

---

## Shared Considerations

### Architecture Pattern
All 3 games follow the existing pattern:
1. **Custom hook** (`useGoldTrader`, `useGoldQuiz`, `useGoldStack`) — state + localStorage persistence
2. **Card component** — summary stats on Play tab
3. **Game component** — full-screen overlay with phase-based state machine

### Localization
- Add all game strings to existing `i18n.tsx` (English + Nepali)
- Gold Quiz has bilingual question support via optional `questionNP`/`optionsNP` fields
- Gold Trader uses `localizeNum()` for currency/number formatting

### Accessibility
- All interactive elements get ARIA labels
- Full-screen overlays use `role="dialog"` + focus trap
- Respect `prefers-reduced-motion` (disable animations, use instant transitions)
- Gold Stack Tower: provide visual cue (border flash) in addition to animation for drops

### Performance
- Gold Trader sparkline: simple SVG path, no charting library
- Gold Stack Tower: use `requestAnimationFrame` for sliding bar, throttle renders
- Gold Quiz timer: single `setInterval`, cleanup on unmount
- All games: ref-based state for animation loops to avoid stale closures (existing pattern)

### File Structure (new files)
```
apps/web/src/
├── components/
│   ├── GoldTraderCard.tsx        # Play tab card
│   ├── GoldTraderGame.tsx        # Full-screen trade view
│   ├── GoldQuizCard.tsx          # Play tab card
│   ├── GoldQuizGame.tsx          # Full-screen quiz
│   ├── GoldStackCard.tsx         # Play tab card
│   └── GoldStackGame.tsx         # Full-screen stacking game
├── hooks/
│   ├── useGoldTrader.ts          # Portfolio state + persistence
│   ├── useGoldQuiz.ts            # Quiz score + persistence
│   └── useGoldStack.ts           # Stack score + persistence
└── data/
    └── quizQuestions.ts           # Static question bank
```

### Implementation Order
1. **Gold Quiz** — simplest, self-contained, no data dependencies
2. **Gold Stack Tower** — pure arcade, medium complexity (animation work)
3. **Gold Trader** — most complex, depends on price data, has the most UI states
