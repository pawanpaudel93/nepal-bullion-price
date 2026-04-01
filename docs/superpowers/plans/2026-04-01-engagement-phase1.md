# Phase 1 Engagement Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 client-side engagement features (market mood, fun comparisons, milestone celebrations, visit streaks/badges) to the Nepal Bullion Price web app.

**Architecture:** All features are client-side only — localStorage for state, existing API data for inputs. One new dependency (`canvas-confetti`). 8 new files, 4 modified files. Features integrate through shared confetti and cross-hook badge awards.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vitest, canvas-confetti, localStorage

---

## File Structure

### New Files

| File | Responsibility |
|---|---|
| `apps/web/src/utils/marketMood.ts` | Pure function mapping price change % to mood emoji/label |
| `apps/web/src/utils/marketMood.test.ts` | Tests for mood thresholds |
| `apps/web/src/utils/comparisons.ts` | Static comparison item data + computation |
| `apps/web/src/components/FunComparison.tsx` | Rotating comparison display component |
| `apps/web/src/hooks/useMilestones.ts` | Milestone detection, localStorage state, confetti trigger |
| `apps/web/src/components/MilestoneBanner.tsx` | Dismissable milestone banner UI |
| `apps/web/src/hooks/useStreak.ts` | Visit streak tracking, badge management |
| `apps/web/src/components/StreakPill.tsx` | Header streak pill + badge popover |

### Modified Files

| File | Changes |
|---|---|
| `apps/web/src/i18n.tsx` | ~40 new translation keys for all 4 features |
| `apps/web/src/components/PriceCard.tsx` | Add mood emoji in header, FunComparison below price |
| `apps/web/src/components/Header.tsx` | Add StreakPill to controls row |
| `apps/web/src/App.tsx` | Wire useMilestones + useStreak, render MilestoneBanner |

---

### Task 1: Install canvas-confetti

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install the dependency**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice && pnpm --filter nepal-bullion-web add canvas-confetti
```

- [ ] **Step 2: Install types**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice && pnpm --filter nepal-bullion-web add -D @types/canvas-confetti
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml
git commit -m "chore: add canvas-confetti dependency for milestone celebrations"
```

---

### Task 2: Add i18n keys for all 4 features

**Files:**
- Modify: `apps/web/src/i18n.tsx`

- [ ] **Step 1: Add all new translation keys to the `en` object**

Add these keys after the existing `justNow` entry (line 65 in `apps/web/src/i18n.tsx`):

```typescript
    // Market Mood
    moodOnFire: 'On Fire',
    moodActive: 'Active',
    moodCalm: 'Calm',
    moodQuiet: 'Quiet',
    // Fun Comparisons
    thatsRoughly: "That's roughly",
    compMomo: 'momo plates',
    compIphone: 'iPhone 16 Pros',
    compEnfield: 'Royal Enfields',
    compRent: 'months rent in KTM',
    compFlight: 'KTM→Delhi flights',
    compChiya: 'cups of chiya',
    compEBC: 'EBC treks',
    compMovie: 'movie tickets',
    compMicroBus: 'micro bus rides',
    // Milestones
    milestoneCrossed: '{metal} crossed Rs {price}!',
    milestoneATH: 'New all-time high!',
    milestoneContext: 'Up from Rs {previous} yesterday',
    // Streaks
    streakGettingStarted: 'Getting started',
    streakOnARoll: 'On a roll',
    streakDedicated: 'Dedicated',
    streakLegend: 'Legend',
    dayStreak: '{n} day streak',
    bestStreak: 'Best: {n} days',
    badgesEarned: 'Badges Earned',
    badgePriceChecker: 'Price Checker',
    badgeGoldWatcher: 'Gold Watcher',
    badgeSilverSentinel: 'Silver Sentinel',
    badgeBullionBaron: 'Bullion Baron',
    badgeDiamondHands: 'Diamond Hands',
    badgeMilestoneWitness: 'Milestone Witness',
    badgeATHHunter: 'ATH Hunter',
    badgeLocked: 'Locked',
```

- [ ] **Step 2: Add the corresponding `ne` translations**

Add after the existing `justNow` entry in the `ne` object:

```typescript
    // Market Mood
    moodOnFire: 'तातो',
    moodActive: 'सक्रिय',
    moodCalm: 'शान्त',
    moodQuiet: 'सुस्त',
    // Fun Comparisons
    thatsRoughly: 'लगभग',
    compMomo: 'मोमो प्लेट',
    compIphone: 'आइफोन १६ प्रो',
    compEnfield: 'रोयल एनफिल्ड',
    compRent: 'महिना भाडा (काठमाडौं)',
    compFlight: 'काठमाडौं→दिल्ली उडान',
    compChiya: 'कप चिया',
    compEBC: 'EBC ट्रेक',
    compMovie: 'सिनेमा टिकट',
    compMicroBus: 'माइक्रो बस यात्रा',
    // Milestones
    milestoneCrossed: '{metal} रू {price} पुग्यो!',
    milestoneATH: 'नयाँ सर्वकालिक उच्च!',
    milestoneContext: 'हिजो रू {previous} बाट बढ्यो',
    // Streaks
    streakGettingStarted: 'सुरुवात',
    streakOnARoll: 'जोशमा',
    streakDedicated: 'समर्पित',
    streakLegend: 'दिग्गज',
    dayStreak: '{n} दिनको स्ट्रिक',
    bestStreak: 'उत्कृष्ट: {n} दिन',
    badgesEarned: 'प्राप्त ब्याज',
    badgePriceChecker: 'मूल्य जाँचकर्ता',
    badgeGoldWatcher: 'सुन पर्यवेक्षक',
    badgeSilverSentinel: 'चाँदी प्रहरी',
    badgeBullionBaron: 'बुलियन बारन',
    badgeDiamondHands: 'हीरा हात',
    badgeMilestoneWitness: 'माइलस्टोन साक्षी',
    badgeATHHunter: 'ATH शिकारी',
    badgeLocked: 'लक गरिएको',
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice/apps/web && npx tsc --noEmit
```

Expected: no errors (both objects must have identical keys).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/i18n.tsx
git commit -m "feat: add i18n keys for engagement features (mood, comparisons, milestones, streaks)"
```

---

### Task 3: Market Mood Indicator

**Files:**
- Create: `apps/web/src/utils/marketMood.ts`
- Create: `apps/web/src/utils/marketMood.test.ts`
- Modify: `apps/web/src/components/PriceCard.tsx:42-46`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/src/utils/marketMood.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getMarketMood } from './marketMood';

describe('getMarketMood', () => {
  it('returns onFire for ≥2% change', () => {
    const mood = getMarketMood(102000, 100000); // +2%
    expect(mood.emoji).toBe('🔥');
    expect(mood.labelKey).toBe('moodOnFire');
  });

  it('returns onFire for ≥2% drop', () => {
    const mood = getMarketMood(98000, 100000); // -2%
    expect(mood.emoji).toBe('🔥');
    expect(mood.labelKey).toBe('moodOnFire');
  });

  it('returns active for 1-2% change', () => {
    const mood = getMarketMood(101500, 100000); // +1.5%
    expect(mood.emoji).toBe('⚡');
    expect(mood.labelKey).toBe('moodActive');
  });

  it('returns calm for 0.3-1% change', () => {
    const mood = getMarketMood(100500, 100000); // +0.5%
    expect(mood.emoji).toBe('😊');
    expect(mood.labelKey).toBe('moodCalm');
  });

  it('returns quiet for <0.3% change', () => {
    const mood = getMarketMood(100100, 100000); // +0.1%
    expect(mood.emoji).toBe('💤');
    expect(mood.labelKey).toBe('moodQuiet');
  });

  it('returns quiet for zero change', () => {
    const mood = getMarketMood(100000, 100000);
    expect(mood.emoji).toBe('💤');
    expect(mood.labelKey).toBe('moodQuiet');
  });

  it('returns null when previous is 0', () => {
    const mood = getMarketMood(100000, 0);
    expect(mood).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice/apps/web && npx vitest run src/utils/marketMood.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement getMarketMood**

Create `apps/web/src/utils/marketMood.ts`:

```typescript
export interface MarketMood {
  emoji: string;
  labelKey: string;
}

export function getMarketMood(current: number, previous: number): MarketMood | null {
  if (previous === 0) return null;

  const pct = Math.abs((current - previous) / previous) * 100;

  if (pct >= 2) return { emoji: '🔥', labelKey: 'moodOnFire' };
  if (pct >= 1) return { emoji: '⚡', labelKey: 'moodActive' };
  if (pct >= 0.3) return { emoji: '😊', labelKey: 'moodCalm' };
  return { emoji: '💤', labelKey: 'moodQuiet' };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice/apps/web && npx vitest run src/utils/marketMood.test.ts
```

Expected: all 7 tests pass.

- [ ] **Step 5: Add mood emoji to PriceCard header**

In `apps/web/src/components/PriceCard.tsx`, add the import at the top:

```typescript
import { getMarketMood } from '../utils/marketMood';
```

Then modify the header section (around line 42-46). Replace the existing header div:

```tsx
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="font-display text-2xl font-bold text-ink dark:text-white tracking-tight">{title}</h2>
```

With:

```tsx
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="font-display text-2xl font-bold text-ink dark:text-white tracking-tight">{title}</h2>
          {nepalPrice && nepalPrice.previousPrice != null && nepalTola !== null ? (() => {
            const mood = getMarketMood(nepalTola, nepalPrice.previousPrice);
            return mood ? (
              <span
                className="text-xl animate-fade-up"
                title={t[mood.labelKey as keyof typeof t] as string}
                aria-label={t[mood.labelKey as keyof typeof t] as string}
              >
                {mood.emoji}
              </span>
            ) : null;
          })() : null}
```

- [ ] **Step 6: Run full test suite**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice/apps/web && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/utils/marketMood.ts apps/web/src/utils/marketMood.test.ts apps/web/src/components/PriceCard.tsx
git commit -m "feat: add market mood indicator to price cards"
```

---

### Task 4: Fun Price Comparisons

**Files:**
- Create: `apps/web/src/utils/comparisons.ts`
- Create: `apps/web/src/components/FunComparison.tsx`
- Modify: `apps/web/src/components/PriceCard.tsx:75-83`

- [ ] **Step 1: Create comparison data**

Create `apps/web/src/utils/comparisons.ts`:

```typescript
export interface ComparisonItem {
  emoji: string;
  labelKey: string;
  referencePrice: number;
}

export const goldComparisons: ComparisonItem[] = [
  { emoji: '🍛', labelKey: 'compMomo', referencePrice: 200 },
  { emoji: '📱', labelKey: 'compIphone', referencePrice: 229_900 },
  { emoji: '🏍️', labelKey: 'compEnfield', referencePrice: 125_000 },
  { emoji: '🏠', labelKey: 'compRent', referencePrice: 15_000 },
  { emoji: '✈️', labelKey: 'compFlight', referencePrice: 18_000 },
  { emoji: '☕', labelKey: 'compChiya', referencePrice: 30 },
  { emoji: '⛰️', labelKey: 'compEBC', referencePrice: 150_000 },
];

export const silverComparisons: ComparisonItem[] = [
  { emoji: '🍛', labelKey: 'compMomo', referencePrice: 200 },
  { emoji: '☕', labelKey: 'compChiya', referencePrice: 30 },
  { emoji: '🎬', labelKey: 'compMovie', referencePrice: 400 },
  { emoji: '🚐', labelKey: 'compMicroBus', referencePrice: 25 },
];

export function getComparisons(price: number, metal: 'gold' | 'silver'): { emoji: string; labelKey: string; count: number }[] {
  const items = metal === 'gold' ? goldComparisons : silverComparisons;
  return items
    .map(item => ({
      emoji: item.emoji,
      labelKey: item.labelKey,
      count: Math.floor(price / item.referencePrice),
    }))
    .filter(item => item.count >= 1);
}
```

- [ ] **Step 2: Create FunComparison component**

Create `apps/web/src/components/FunComparison.tsx`:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { getComparisons } from '../utils/comparisons';
import { useLocale } from '../i18n';

interface FunComparisonProps {
  price: number;
  metal: 'gold' | 'silver';
}

export function FunComparison({ price, metal }: FunComparisonProps) {
  const { t, numberLocale } = useLocale();
  const comparisons = getComparisons(price, metal);
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const advance = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setIndex(prev => (prev + 1) % comparisons.length);
      setFading(false);
    }, 300);
  }, [comparisons.length]);

  useEffect(() => {
    if (comparisons.length <= 1) return;
    const timer = setInterval(advance, 8000);
    return () => clearInterval(timer);
  }, [advance, comparisons.length]);

  if (comparisons.length === 0) return null;

  const current = comparisons[index % comparisons.length];

  return (
    <button
      type="button"
      onClick={advance}
      className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gold-400/5 dark:bg-gold-400/8 text-[13px] text-ink-muted dark:text-ink-faint cursor-pointer hover:bg-gold-400/10 dark:hover:bg-gold-400/12 transition-colors duration-200"
      aria-live="polite"
    >
      <span
        className={`flex items-center gap-2 transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}
      >
        <span>{current.emoji}</span>
        <span className="text-[11px] opacity-60">{t.thatsRoughly}</span>
        <strong className="font-medium text-ink dark:text-white">
          {current.count.toLocaleString(numberLocale)} {t[current.labelKey as keyof typeof t]}
        </strong>
      </span>
    </button>
  );
}
```

- [ ] **Step 3: Wire FunComparison into PriceCard**

In `apps/web/src/components/PriceCard.tsx`, add the import at the top:

```typescript
import { FunComparison } from './FunComparison';
```

Then find the source line section (around line 75-83 after the mood edit). After the `<p>` tag with `{t.perTola}` and `<SourceLink>` and before the `{nepalPrice.history &&` check, add:

```tsx
            {nepalTola !== null ? (
              <FunComparison price={nepalTola} metal={symbol === 'XAU' ? 'gold' : 'silver'} />
            ) : null}
```

- [ ] **Step 4: Run full test suite**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice/apps/web && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/utils/comparisons.ts apps/web/src/components/FunComparison.tsx apps/web/src/components/PriceCard.tsx
git commit -m "feat: add fun price comparisons (momos, iPhones, Royal Enfields)"
```

---

### Task 5: Milestone Celebrations — Hook

**Files:**
- Create: `apps/web/src/hooks/useMilestones.ts`

- [ ] **Step 1: Create the useMilestones hook**

Create `apps/web/src/hooks/useMilestones.ts`:

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

export interface MilestoneEvent {
  type: 'round' | 'ath';
  metal: 'gold' | 'silver';
  threshold: number;
  previous: number;
}

interface MilestoneState {
  seenMilestones: string[];
  athGold: number;
  athSilver: number;
}

const STORAGE_KEY = 'bullion-milestones';

function loadState(): MilestoneState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { seenMilestones: [], athGold: 0, athSilver: 0 };
}

function saveState(state: MilestoneState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

function detectMilestone(
  current: number,
  previous: number,
  metal: 'gold' | 'silver',
  state: MilestoneState,
): MilestoneEvent | null {
  if (!current || !previous) return null;

  const step = metal === 'gold' ? 10_000 : 500;
  const currentBucket = Math.floor(current / step);
  const previousBucket = Math.floor(previous / step);
  const athKey = metal === 'gold' ? 'athGold' : 'athSilver';

  // Check ATH first (higher priority)
  if (current > state[athKey] && state[athKey] > 0) {
    const key = `${metal}_ath_${currentBucket * step}`;
    if (!state.seenMilestones.includes(key)) {
      return { type: 'ath', metal, threshold: current, previous };
    }
  }

  // Check round number crossing
  if (currentBucket > previousBucket) {
    const threshold = currentBucket * step;
    const key = `${metal}_${threshold}`;
    if (!state.seenMilestones.includes(key)) {
      return { type: 'round', metal, threshold, previous };
    }
  }

  return null;
}

function fireConfetti(event: MilestoneEvent): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const colors = event.metal === 'gold'
    ? ['#D4A843', '#CA8A04', '#F0D68A']
    : ['#D6D3D1', '#A8A29E', '#78716C'];

  const duration = event.type === 'ath' ? 3000 : 2000;
  const particleCount = event.type === 'ath' ? 150 : 80;

  confetti({
    particleCount,
    spread: 70,
    origin: { y: 0.3 },
    colors,
    disableForReducedMotion: true,
  });

  if (event.type === 'ath') {
    setTimeout(() => {
      confetti({ particleCount: 50, spread: 100, origin: { y: 0.4 }, colors });
    }, 500);
  }

  // Auto-clear after duration
  setTimeout(() => confetti.reset(), duration);
}

interface UseMilestonesReturn {
  activeMilestone: MilestoneEvent | null;
  dismiss: () => void;
  awardBadge: ((badgeId: string) => void) | null;
}

export function useMilestones(
  goldPrice: number | null,
  silverPrice: number | null,
  goldPrev: number | null,
  silverPrev: number | null,
  onBadge?: (badgeId: string) => void,
): UseMilestonesReturn {
  const [activeMilestone, setActiveMilestone] = useState<MilestoneEvent | null>(null);
  const stateRef = useRef(loadState());
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    if (!goldPrice && !silverPrice) return;
    checkedRef.current = true;

    const state = stateRef.current;
    let event: MilestoneEvent | null = null;

    if (goldPrice && goldPrev) {
      event = detectMilestone(goldPrice, goldPrev, 'gold', state);
    }
    if (!event && silverPrice && silverPrev) {
      event = detectMilestone(silverPrice, silverPrev, 'silver', state);
    }

    if (event) {
      // Update state
      const key = event.type === 'ath'
        ? `${event.metal}_ath_${Math.floor(event.threshold / (event.metal === 'gold' ? 10_000 : 500)) * (event.metal === 'gold' ? 10_000 : 500)}`
        : `${event.metal}_${event.threshold}`;
      state.seenMilestones.push(key);

      if (event.type === 'ath') {
        if (event.metal === 'gold') state.athGold = event.threshold;
        else state.athSilver = event.threshold;
        onBadge?.('ath_hunter');
      } else {
        onBadge?.('milestone_witness');
      }

      // Always update ATH tracking even without celebration
      if (goldPrice && goldPrice > state.athGold) state.athGold = goldPrice;
      if (silverPrice && silverPrice > state.athSilver) state.athSilver = silverPrice;

      saveState(state);
      setActiveMilestone(event);
      fireConfetti(event);
    } else {
      // Still track ATH silently
      let updated = false;
      if (goldPrice && goldPrice > state.athGold) { state.athGold = goldPrice; updated = true; }
      if (silverPrice && silverPrice > state.athSilver) { state.athSilver = silverPrice; updated = true; }
      if (updated) saveState(state);
    }
  }, [goldPrice, silverPrice, goldPrev, silverPrev, onBadge]);

  const dismiss = useCallback(() => setActiveMilestone(null), []);

  return { activeMilestone, dismiss, awardBadge: onBadge ?? null };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/hooks/useMilestones.ts
git commit -m "feat: add useMilestones hook with confetti and ATH tracking"
```

---

### Task 6: Milestone Celebrations — Banner Component

**Files:**
- Create: `apps/web/src/components/MilestoneBanner.tsx`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Create MilestoneBanner component**

Create `apps/web/src/components/MilestoneBanner.tsx`:

```tsx
import { useEffect } from 'react';
import type { MilestoneEvent } from '../hooks/useMilestones';
import { useLocale } from '../i18n';

interface MilestoneBannerProps {
  event: MilestoneEvent;
  onDismiss: () => void;
}

export function MilestoneBanner({ event, onDismiss }: MilestoneBannerProps) {
  const { t, numberLocale } = useLocale();

  useEffect(() => {
    const timer = setTimeout(onDismiss, 30_000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const emoji = event.type === 'ath' ? '🏆' : '🎉';
  const metalName = event.metal === 'gold' ? t.gold : t.silver;

  const title = event.type === 'ath'
    ? t.milestoneATH
    : (t.milestoneCrossed as string)
        .replace('{metal}', metalName)
        .replace('{price}', event.threshold.toLocaleString(numberLocale));

  const subtitle = (t.milestoneContext as string)
    .replace('{previous}', event.previous.toLocaleString(numberLocale));

  const bgClass = event.metal === 'gold'
    ? 'from-gold-400/12 to-gold-400/4 border-gold-400/20'
    : 'from-silver-400/12 to-silver-400/4 border-silver-400/20';

  return (
    <div
      className={`mb-6 flex items-center gap-3 rounded-2xl border bg-gradient-to-r ${bgClass} p-4 animate-fade-up`}
      role="status"
      aria-live="polite"
    >
      <span className="text-3xl shrink-0">{emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-ink dark:text-white">{title}</p>
        <p className="text-xs text-ink-muted dark:text-ink-faint mt-0.5">{subtitle}</p>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 text-ink-faint hover:text-ink dark:hover:text-white transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/MilestoneBanner.tsx
git commit -m "feat: add MilestoneBanner component"
```

---

### Task 7: Visit Streak — Hook

**Files:**
- Create: `apps/web/src/hooks/useStreak.ts`

- [ ] **Step 1: Create the useStreak hook**

Create `apps/web/src/hooks/useStreak.ts`:

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export interface Badge {
  id: string;
  emoji: string;
  labelKey: string;
  condition: string;
}

export const ALL_BADGES: Badge[] = [
  { id: 'price_checker', emoji: '👀', labelKey: 'badgePriceChecker', condition: 'first_visit' },
  { id: 'gold_watcher', emoji: '🔥', labelKey: 'badgeGoldWatcher', condition: 'streak_7' },
  { id: 'silver_sentinel', emoji: '⚡', labelKey: 'badgeSilverSentinel', condition: 'streak_30' },
  { id: 'bullion_baron', emoji: '👑', labelKey: 'badgeBullionBaron', condition: 'streak_100' },
  { id: 'diamond_hands', emoji: '💎', labelKey: 'badgeDiamondHands', condition: 'streak_365' },
  { id: 'milestone_witness', emoji: '🎉', labelKey: 'badgeMilestoneWitness', condition: 'milestone' },
  { id: 'ath_hunter', emoji: '🏆', labelKey: 'badgeATHHunter', condition: 'ath' },
];

interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastVisitDate: string;
  badges: string[];
  totalVisits: number;
}

const STORAGE_KEY = 'bullion-streak';

function getNepalDate(): string {
  // Nepal is UTC+5:45
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const nepal = new Date(utc + 5.75 * 60 * 60_000);
  return nepal.toISOString().slice(0, 10);
}

function getYesterday(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { currentStreak: 0, bestStreak: 0, lastVisitDate: '', badges: [], totalVisits: 0 };
}

function saveStreak(state: StreakState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

function fireBadgeConfetti(): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  confetti({
    particleCount: 60,
    spread: 50,
    origin: { y: 0.2, x: 0.8 },
    colors: ['#D4A843', '#CA8A04', '#F0D68A', '#FDF8E8'],
    disableForReducedMotion: true,
  });
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 100) return '💎';
  if (streak >= 30) return '👑';
  if (streak >= 7) return '⚡';
  return '🔥';
}

export function getStreakLabelKey(streak: number): string {
  if (streak >= 100) return 'streakLegend';
  if (streak >= 30) return 'streakDedicated';
  if (streak >= 7) return 'streakOnARoll';
  return 'streakGettingStarted';
}

interface UseStreakReturn {
  streak: number;
  bestStreak: number;
  badges: string[];
  streakEmoji: string;
  streakLabelKey: string;
  awardBadge: (badgeId: string) => void;
}

export function useStreak(): UseStreakReturn {
  const [state, setState] = useState<StreakState>(loadStreak);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const today = getNepalDate();
    const s = { ...state };

    if (s.lastVisitDate === today) return; // already visited today

    const yesterday = getYesterday(today);
    if (s.lastVisitDate === yesterday) {
      s.currentStreak += 1;
    } else {
      s.currentStreak = 1;
    }

    s.lastVisitDate = today;
    s.totalVisits += 1;
    if (s.currentStreak > s.bestStreak) s.bestStreak = s.currentStreak;

    // Check streak badges
    const newBadges: string[] = [];
    if (!s.badges.includes('price_checker')) {
      s.badges.push('price_checker');
      newBadges.push('price_checker');
    }
    if (s.currentStreak >= 7 && !s.badges.includes('gold_watcher')) {
      s.badges.push('gold_watcher');
      newBadges.push('gold_watcher');
    }
    if (s.currentStreak >= 30 && !s.badges.includes('silver_sentinel')) {
      s.badges.push('silver_sentinel');
      newBadges.push('silver_sentinel');
    }
    if (s.currentStreak >= 100 && !s.badges.includes('bullion_baron')) {
      s.badges.push('bullion_baron');
      newBadges.push('bullion_baron');
    }
    if (s.currentStreak >= 365 && !s.badges.includes('diamond_hands')) {
      s.badges.push('diamond_hands');
      newBadges.push('diamond_hands');
    }

    saveStreak(s);
    setState(s);

    // Fire confetti for new badges (skip price_checker on first visit — too early)
    if (newBadges.length > 0 && !(newBadges.length === 1 && newBadges[0] === 'price_checker')) {
      fireBadgeConfetti();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const awardBadge = useCallback((badgeId: string) => {
    setState(prev => {
      if (prev.badges.includes(badgeId)) return prev;
      const next = { ...prev, badges: [...prev.badges, badgeId] };
      saveStreak(next);
      fireBadgeConfetti();
      return next;
    });
  }, []);

  return {
    streak: state.currentStreak,
    bestStreak: state.bestStreak,
    badges: state.badges,
    streakEmoji: getStreakEmoji(state.currentStreak),
    streakLabelKey: getStreakLabelKey(state.currentStreak),
    awardBadge,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/hooks/useStreak.ts
git commit -m "feat: add useStreak hook with badge management"
```

---

### Task 8: Streak UI — StreakPill + BadgePopover

**Files:**
- Create: `apps/web/src/components/StreakPill.tsx`
- Modify: `apps/web/src/components/Header.tsx`

- [ ] **Step 1: Create StreakPill component with inline BadgePopover**

Create `apps/web/src/components/StreakPill.tsx`:

```tsx
import { useState, useRef, useEffect } from 'react';
import { ALL_BADGES } from '../hooks/useStreak';
import { useLocale } from '../i18n';

interface StreakPillProps {
  streak: number;
  bestStreak: number;
  badges: string[];
  emoji: string;
}

export function StreakPill({ streak, bestStreak, badges, emoji }: StreakPillProps) {
  const { t, numberLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (streak === 0) return null;

  const streakText = (t.dayStreak as string).replace('{n}', streak.toLocaleString(numberLocale));
  const bestText = (t.bestStreak as string).replace('{n}', bestStreak.toLocaleString(numberLocale));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gold-400/10 dark:bg-gold-400/15 text-sm font-medium text-ink dark:text-white cursor-pointer hover:bg-gold-400/15 dark:hover:bg-gold-400/20 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
        aria-label={streakText}
        aria-expanded={open}
      >
        <span>{emoji}</span>
        <span className="font-mono text-[13px]">{streak}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={streakText}
          className="absolute right-0 top-full mt-2 w-64 glass-card rounded-2xl p-5 z-50 animate-fade-up"
        >
          <div className="text-center mb-4">
            <div className="text-4xl mb-1">{emoji}</div>
            <div className="font-bold text-lg text-ink dark:text-white">{streakText}</div>
            <div className="text-xs text-ink-faint">{bestText}</div>
          </div>

          <div className="border-t border-ink/6 dark:border-white/6 pt-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-faint mb-2">
              {t.badgesEarned}
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_BADGES.map(badge => {
                const earned = badges.includes(badge.id);
                const label = earned
                  ? (t[badge.labelKey as keyof typeof t] as string)
                  : t.badgeLocked;
                return (
                  <span
                    key={badge.id}
                    className={`text-2xl transition-opacity ${earned ? 'opacity-100' : 'opacity-20'}`}
                    title={label}
                    aria-label={label}
                  >
                    {badge.emoji}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Add StreakPill to Header**

In `apps/web/src/components/Header.tsx`, add the import:

```typescript
import { StreakPill } from './StreakPill';
```

Add streak props to the interface (line 7-11). Replace:

```typescript
interface HeaderProps {
  lastFetched: Date | null;
  onRefresh: () => void;
  isFetching: boolean;
}
```

With:

```typescript
interface HeaderProps {
  lastFetched: Date | null;
  onRefresh: () => void;
  isFetching: boolean;
  streak?: number;
  bestStreak?: number;
  badges?: string[];
  streakEmoji?: string;
}
```

Update the destructuring (line 13). Replace:

```typescript
export function Header({ lastFetched, onRefresh, isFetching }: HeaderProps) {
```

With:

```typescript
export function Header({ lastFetched, onRefresh, isFetching, streak, bestStreak, badges, streakEmoji }: HeaderProps) {
```

In the controls area, add the StreakPill before the refresh button (inside the `<div className="flex flex-col sm:flex-row ...">`, around line 46-54). Replace:

```tsx
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
        <button
          onClick={onRefresh}
```

With:

```tsx
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
        {streak != null && streak > 0 && bestStreak != null && badges && streakEmoji ? (
          <StreakPill streak={streak} bestStreak={bestStreak} badges={badges} emoji={streakEmoji} />
        ) : null}
        <button
          onClick={onRefresh}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/StreakPill.tsx apps/web/src/components/Header.tsx
git commit -m "feat: add StreakPill with badge popover in header"
```

---

### Task 9: Wire Everything in App.tsx

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Add imports and wire hooks**

In `apps/web/src/App.tsx`, add imports at the top:

```typescript
import { useMilestones } from './hooks/useMilestones';
import { useStreak } from './hooks/useStreak';
import { MilestoneBanner } from './components/MilestoneBanner';
```

- [ ] **Step 2: Add hooks inside the App component**

After the existing `const [activeTab, setActiveTab] = useState<Tab>('prices');` line, add:

```typescript
  const { streak, bestStreak, badges, streakEmoji, awardBadge } = useStreak();

  const goldNepalPrice = data?.gold.nepal ? ('hallmark' in data.gold.nepal ? data.gold.nepal.hallmark : 0) : null;
  const silverNepalPrice = data?.silver.nepal?.price ?? null;
  const goldPrevPrice = data?.gold.nepal?.previousPrice ?? null;
  const silverPrevPrice = data?.silver.nepal?.previousPrice ?? null;

  const { activeMilestone, dismiss } = useMilestones(
    goldNepalPrice,
    silverNepalPrice,
    goldPrevPrice,
    silverPrevPrice,
    awardBadge,
  );
```

- [ ] **Step 3: Pass streak props to Header**

Replace the `<Header` call:

```tsx
        <Header lastFetched={lastFetched} onRefresh={refresh} isFetching={isFetching} />
```

With:

```tsx
        <Header
          lastFetched={lastFetched}
          onRefresh={refresh}
          isFetching={isFetching}
          streak={streak}
          bestStreak={bestStreak}
          badges={badges}
          streakEmoji={streakEmoji}
        />
```

- [ ] **Step 4: Add MilestoneBanner before the price grid**

Find the line `{activeTab === 'prices' ? (` and add the banner right after the `<>` fragment open. Replace:

```tsx
        {activeTab === 'prices' ? (
          <>
            {error ? (
```

With:

```tsx
        {activeTab === 'prices' ? (
          <>
            {activeMilestone ? (
              <MilestoneBanner event={activeMilestone} onDismiss={dismiss} />
            ) : null}

            {error ? (
```

- [ ] **Step 5: Run the full test suite**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice/apps/web && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/App.tsx
git commit -m "feat: wire milestones + streaks into App layout"
```

---

### Task 10: Manual QA & Visual Polish

**Files:**
- Possibly: `apps/web/src/index.css`, any component files for fixes

- [ ] **Step 1: Build the package and start dev server**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice && npx turbo build --filter=nepal-bullion-price && cd apps/web && pnpm dev
```

Dev server at http://localhost:5174. Always use port 5174.

- [ ] **Step 2: Test at multiple viewport widths**

Check at 320px, 375px, 768px, 1024px, 1280px:
- Mood emoji visible and not overlapping
- Fun comparison fits in card without overflow
- Streak pill doesn't crowd header controls
- Badge popover doesn't overflow viewport on mobile
- Milestone banner is readable and dismissable

- [ ] **Step 3: Test dark mode**

Toggle dark mode. Verify:
- Mood emoji visible against dark background
- Fun comparison background tint works
- Milestone banner gradient looks good
- Badge popover glass-card contrast is sufficient

- [ ] **Step 4: Test streak behavior**

Open localStorage in DevTools. Verify:
- `bullion-streak` key exists with correct structure
- Streak increments on first visit
- `price_checker` badge awarded

- [ ] **Step 5: Test milestone behavior**

In DevTools console, manually set `bullion-milestones` to trigger a milestone on next load:

```javascript
localStorage.setItem('bullion-milestones', JSON.stringify({ seenMilestones: [], athGold: 1, athSilver: 1 }));
```

Refresh the page. Confetti should fire for ATH if current prices are higher than 1.

- [ ] **Step 6: Fix any issues found, commit each fix separately**

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "fix: visual polish and responsive fixes for engagement features"
```

---

### Task 11: Final Verification & Push

- [ ] **Step 1: Run full test suite**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice/apps/web && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 2: Build for production**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice && pnpm build
```

Expected: builds successfully with no errors.

- [ ] **Step 3: Push to remote**

```bash
git push origin main
```
