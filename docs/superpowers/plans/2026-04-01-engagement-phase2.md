# Phase 2 Engagement Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 engagement features — daily price prediction game, morning digest card, and gold/silver calculator — to drive daily return habits and add practical utility.

**Architecture:** All client-side. localStorage for prediction/digest state. Reuses existing price data and Phase 1 infrastructure (streak, comparisons, Nepal timezone). One new tab added to header.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vitest, localStorage

---

## File Structure

### New Files

| File | Responsibility |
|---|---|
| `apps/web/src/hooks/usePrediction.ts` | Prediction game state, resolution, streak tracking |
| `apps/web/src/components/PredictionCard.tsx` | Prediction game UI — 3 states |
| `apps/web/src/components/MorningDigest.tsx` | Daily digest card with greeting + summary |
| `apps/web/src/components/CalculatorPage.tsx` | Gold/silver weight ↔ value calculator |

### Modified Files

| File | Changes |
|---|---|
| `apps/web/src/i18n.tsx` | ~25 new translation keys |
| `apps/web/src/components/Header.tsx` | Add 'calculator' tab |
| `apps/web/src/App.tsx` | Wire prediction + digest, add calculator tab rendering |

---

### Task 1: Add i18n keys for Phase 2

**Files:**
- Modify: `apps/web/src/i18n.tsx`

- [ ] **Step 1: Add English keys**

After the existing `badgeLocked: 'Locked',` entry in the `en` object, add:

```typescript
    // Prediction Game
    predictTomorrow: 'Predict Tomorrow',
    willGoldGoUpOrDown: 'Will gold go up or down tomorrow?',
    up: 'Up',
    down: 'Down',
    goldWillGoUp: 'Gold will go UP',
    goldWillGoDown: 'Gold will go DOWN',
    checkBackTomorrow: 'Check back tomorrow to see if you were right!',
    youWereRight: 'You were right!',
    notThisTime: 'Not this time',
    goldWentUp: 'Gold went up Rs {amount} ({pct}%)',
    goldWentDown: 'Gold went down Rs {amount} ({pct}%)',
    goldFlat: 'Gold stayed flat — your prediction counts!',
    predictionStreak: 'Prediction streak',
    accuracy: 'Accuracy',
    // Morning Digest
    goodMorning: 'Good morning!',
    goodAfternoon: 'Good afternoon!',
    goodEvening: 'Good evening!',
    yesterdayPrediction: "Yesterday's prediction",
    correct: 'Correct!',
    wrong: 'Wrong',
    // Calculator
    calculator: 'Calculator',
    weight: 'Weight',
    value: 'Value',
    tola: 'tola',
    gram: 'gram',
    basedOnRate: "Based on today's rate: Rs {price}/{unit}",
    enterWeight: 'Enter weight',
    enterValue: 'Enter value',
```

- [ ] **Step 2: Add Nepali keys**

After the existing `badgeLocked: 'लक गरिएको',` entry in the `ne` object, add:

```typescript
    // Prediction Game
    predictTomorrow: 'भोलिको अनुमान',
    willGoldGoUpOrDown: 'भोलि सुन बढ्छ कि घट्छ?',
    up: 'बढ्छ',
    down: 'घट्छ',
    goldWillGoUp: 'सुन बढ्छ',
    goldWillGoDown: 'सुन घट्छ',
    checkBackTomorrow: 'भोलि आएर हेर्नुहोस्!',
    youWereRight: 'तपाईंको अनुमान सही थियो!',
    notThisTime: 'यो पटक होइन',
    goldWentUp: 'सुन रू {amount} ({pct}%) ले बढ्यो',
    goldWentDown: 'सुन रू {amount} ({pct}%) ले घट्यो',
    goldFlat: 'सुन स्थिर — तपाईंको अनुमान गनियो!',
    predictionStreak: 'अनुमान स्ट्रिक',
    accuracy: 'शुद्धता',
    // Morning Digest
    goodMorning: 'शुभ प्रभात!',
    goodAfternoon: 'शुभ दिन!',
    goodEvening: 'शुभ सन्ध्या!',
    yesterdayPrediction: 'हिजोको अनुमान',
    correct: 'सही!',
    wrong: 'गलत',
    // Calculator
    calculator: 'क्यालकुलेटर',
    weight: 'तौल',
    value: 'मूल्य',
    tola: 'तोला',
    gram: 'ग्राम',
    basedOnRate: 'आजको दर: रू {price}/{unit}',
    enterWeight: 'तौल राख्नुहोस्',
    enterValue: 'मूल्य राख्नुहोस्',
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/i18n.tsx
git commit -m "feat: add i18n keys for Phase 2 (prediction, digest, calculator)"
```

---

### Task 2: Prediction Game — Hook

**Files:**
- Create: `apps/web/src/hooks/usePrediction.ts`

- [ ] **Step 1: Create the usePrediction hook**

Create `apps/web/src/hooks/usePrediction.ts`:

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';

export type Direction = 'up' | 'down';

interface PredictionState {
  currentPrediction: { date: string; direction: Direction } | null;
  lastResult: { date: string; direction: Direction; actual: Direction; correct: boolean } | null;
  predictionStreak: number;
  bestPredictionStreak: number;
  totalPredictions: number;
  totalCorrect: number;
}

const STORAGE_KEY = 'bullion-prediction';

function getNepalDate(): string {
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

function loadState(): PredictionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return {
    currentPrediction: null,
    lastResult: null,
    predictionStreak: 0,
    bestPredictionStreak: 0,
    totalPredictions: 0,
    totalCorrect: 0,
  };
}

function saveState(state: PredictionState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

interface UsePredictionReturn {
  /** null = no prediction today, can predict */
  currentPrediction: Direction | null;
  /** Result from yesterday's prediction (if any), null if no pending result */
  lastResult: { direction: Direction; actual: Direction; correct: boolean; priceChange: number; pctChange: number } | null;
  /** Whether user has already predicted today */
  hasPredictedToday: boolean;
  /** Whether there's an unresolved result to show */
  hasResult: boolean;
  predictionStreak: number;
  bestPredictionStreak: number;
  accuracy: number;
  predict: (direction: Direction) => void;
  dismissResult: () => void;
}

export function usePrediction(
  goldPrice: number | null,
  goldPrevPrice: number | null,
): UsePredictionReturn {
  const [state, setState] = useState<PredictionState>(loadState);
  const resolvedRef = useRef(false);

  // Resolve yesterday's prediction on mount
  useEffect(() => {
    if (resolvedRef.current) return;
    if (!goldPrice || !goldPrevPrice) return;
    resolvedRef.current = true;

    const today = getNepalDate();
    const yesterday = getYesterday(today);
    const s = { ...state };

    // Check if we have a prediction from yesterday to resolve
    if (s.currentPrediction && s.currentPrediction.date === yesterday) {
      const actual: Direction = goldPrice >= goldPrevPrice ? 'up' : 'down';
      // If prices are equal, count as correct
      const correct = goldPrice === goldPrevPrice ? true : s.currentPrediction.direction === actual;

      s.lastResult = {
        date: yesterday,
        direction: s.currentPrediction.direction,
        actual,
        correct,
      };
      s.totalPredictions += 1;
      if (correct) {
        s.totalCorrect += 1;
        s.predictionStreak += 1;
        if (s.predictionStreak > s.bestPredictionStreak) {
          s.bestPredictionStreak = s.predictionStreak;
        }
      } else {
        s.predictionStreak = 0;
      }
      s.currentPrediction = null;
      saveState(s);
      setState(s);
    } else if (s.currentPrediction && s.currentPrediction.date !== today && s.currentPrediction.date !== yesterday) {
      // Prediction is stale (older than yesterday) — clear it without resolving
      s.currentPrediction = null;
      s.predictionStreak = 0;
      saveState(s);
      setState(s);
    }
  }, [goldPrice, goldPrevPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  const today = getNepalDate();
  const hasPredictedToday = state.currentPrediction?.date === today;

  const predict = useCallback((direction: Direction) => {
    setState(prev => {
      const next: PredictionState = {
        ...prev,
        currentPrediction: { date: getNepalDate(), direction },
        lastResult: null, // clear old result when making new prediction
      };
      saveState(next);
      return next;
    });
  }, []);

  const dismissResult = useCallback(() => {
    setState(prev => {
      const next = { ...prev, lastResult: null };
      saveState(next);
      return next;
    });
  }, []);

  const priceChange = goldPrice && goldPrevPrice ? goldPrice - goldPrevPrice : 0;
  const pctChange = goldPrevPrice ? Math.abs((priceChange / goldPrevPrice) * 100) : 0;

  const lastResultWithPrice = state.lastResult ? {
    ...state.lastResult,
    priceChange: Math.abs(priceChange),
    pctChange: Math.round(pctChange * 10) / 10,
  } : null;

  return {
    currentPrediction: hasPredictedToday ? state.currentPrediction!.direction : null,
    lastResult: lastResultWithPrice,
    hasPredictedToday,
    hasResult: state.lastResult !== null,
    predictionStreak: state.predictionStreak,
    bestPredictionStreak: state.bestPredictionStreak,
    accuracy: state.totalPredictions > 0
      ? Math.round((state.totalCorrect / state.totalPredictions) * 100)
      : 0,
    predict,
    dismissResult,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/hooks/usePrediction.ts
git commit -m "feat: add usePrediction hook for daily price prediction game"
```

---

### Task 3: Prediction Game — UI Component

**Files:**
- Create: `apps/web/src/components/PredictionCard.tsx`

- [ ] **Step 1: Create PredictionCard component**

Create `apps/web/src/components/PredictionCard.tsx`:

```tsx
import { useLocale } from '../i18n';
import type { Direction } from '../hooks/usePrediction';

interface PredictionCardProps {
  currentPrediction: Direction | null;
  lastResult: { direction: Direction; actual: Direction; correct: boolean; priceChange: number; pctChange: number } | null;
  hasPredictedToday: boolean;
  hasResult: boolean;
  predictionStreak: number;
  accuracy: number;
  onPredict: (direction: Direction) => void;
  onDismissResult: () => void;
}

export function PredictionCard({
  currentPrediction, lastResult, hasPredictedToday, hasResult,
  predictionStreak, accuracy, onPredict, onDismissResult,
}: PredictionCardProps) {
  const { t, numberLocale } = useLocale();

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 mt-7 animate-fade-up">
      {/* Result from yesterday */}
      {hasResult && lastResult ? (
        <div className="mb-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-ink-faint mb-3">
            {t.yesterdayPrediction}
          </p>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{lastResult.correct ? '✅' : '❌'}</span>
            <span className={`font-semibold text-lg ${lastResult.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {lastResult.correct ? t.youWereRight : t.notThisTime}
            </span>
          </div>
          {lastResult.priceChange > 0 ? (
            <p className="text-[13px] text-ink-muted dark:text-ink-faint mb-4">
              {(lastResult.actual === 'up' ? t.goldWentUp : t.goldWentDown)
                .replace('{amount}', lastResult.priceChange.toLocaleString(numberLocale))
                .replace('{pct}', String(lastResult.pctChange))}
            </p>
          ) : (
            <p className="text-[13px] text-ink-muted dark:text-ink-faint mb-4">{t.goldFlat}</p>
          )}
          {hasPredictedToday ? null : (
            <div className="h-px bg-gradient-to-r from-transparent via-ink/6 dark:via-white/6 to-transparent mb-6" />
          )}
        </div>
      ) : null}

      {/* Prediction input or locked state */}
      {hasPredictedToday && currentPrediction ? (
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-ink-faint mb-3">
            {t.predictTomorrow}
          </p>
          <p className={`text-lg font-semibold ${currentPrediction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {currentPrediction === 'up' ? `▲ ${t.goldWillGoUp}` : `▼ ${t.goldWillGoDown}`}
          </p>
          <p className="text-[12px] text-ink-faint mt-2">{t.checkBackTomorrow}</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-ink-faint mb-2">
            {t.predictTomorrow}
          </p>
          <p className="text-[14px] text-ink-muted dark:text-ink-faint mb-4">{t.willGoldGoUpOrDown}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => onPredict('up')}
              className="flex flex-col items-center gap-1 px-8 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              <span className="text-xl">▲</span>
              <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">{t.up}</span>
            </button>
            <button
              onClick={() => onPredict('down')}
              className="flex flex-col items-center gap-1 px-8 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
            >
              <span className="text-xl">▼</span>
              <span className="text-[13px] font-semibold text-red-500 dark:text-red-400">{t.down}</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-center gap-4 mt-5 text-[12px] text-ink-muted dark:text-ink-faint">
        <span>🎯 {t.predictionStreak}: <strong className="text-ink dark:text-white">{predictionStreak}</strong></span>
        <span className="w-[3px] h-[3px] rounded-full bg-ink-faint/30" />
        <span>{t.accuracy}: <strong className="text-ink dark:text-white">{accuracy}%</strong></span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/PredictionCard.tsx
git commit -m "feat: add PredictionCard component with 3 UI states"
```

---

### Task 4: Morning Digest Card

**Files:**
- Create: `apps/web/src/components/MorningDigest.tsx`

- [ ] **Step 1: Create MorningDigest component**

Create `apps/web/src/components/MorningDigest.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { useLocale } from '../i18n';

interface DigestProps {
  goldPrice: number | null;
  goldPrev: number | null;
  silverPrice: number | null;
  silverPrev: number | null;
  predictionResult: { correct: boolean } | null;
  streak: number;
}

function getNepalHour(): number {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const nepal = new Date(utc + 5.75 * 60 * 60_000);
  return nepal.getHours();
}

function getNepalDate(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const nepal = new Date(utc + 5.75 * 60 * 60_000);
  return nepal.toISOString().slice(0, 10);
}

const DIGEST_KEY = 'bullion-digest-date';

export function MorningDigest({ goldPrice, goldPrev, silverPrice, silverPrev, predictionResult, streak }: DigestProps) {
  const { t, numberLocale } = useLocale();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DIGEST_KEY) === getNepalDate();
    } catch { return false; }
  });

  if (dismissed) return null;
  if (!goldPrice || !goldPrev) return null;

  const hour = getNepalHour();
  const greeting = hour >= 5 && hour < 12 ? t.goodMorning
    : hour >= 12 && hour < 17 ? t.goodAfternoon
    : t.goodEvening;
  const greetingEmoji = hour >= 5 && hour < 12 ? '☀️' : hour >= 12 && hour < 17 ? '🌤️' : '🌙';

  const goldDiff = goldPrice - goldPrev;
  const goldPct = ((goldDiff / goldPrev) * 100).toFixed(1);
  const silverDiff = silverPrice && silverPrev ? silverPrice - silverPrev : 0;
  const silverPct = silverPrev ? ((silverDiff / silverPrev) * 100).toFixed(1) : '0';

  function handleDismiss() {
    setDismissed(true);
    try { localStorage.setItem(DIGEST_KEY, getNepalDate()); } catch { /* quota */ }
  }

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-br from-gold-400/8 to-silver-400/4 dark:from-gold-400/10 dark:to-silver-400/6 border border-gold-400/10 dark:border-gold-400/15 p-5 animate-fade-up">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[14px] font-medium text-ink dark:text-white">
          {greetingEmoji} {greeting}
        </p>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 text-ink-faint hover:text-ink dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white/40 dark:bg-white/5 rounded-xl px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-faint">{t.gold}</p>
          <p className="font-mono text-[16px] font-semibold text-ink dark:text-white mt-0.5">
            Rs {goldPrice.toLocaleString(numberLocale)}
          </p>
          <p className={`text-[12px] mt-0.5 ${goldDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {goldDiff >= 0 ? '▲' : '▼'} Rs {Math.abs(goldDiff).toLocaleString(numberLocale)} ({goldDiff >= 0 ? '+' : ''}{goldPct}%)
          </p>
        </div>
        {silverPrice ? (
          <div className="bg-white/40 dark:bg-white/5 rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-faint">{t.silver}</p>
            <p className="font-mono text-[16px] font-semibold text-ink dark:text-white mt-0.5">
              Rs {silverPrice.toLocaleString(numberLocale)}
            </p>
            <p className={`text-[12px] mt-0.5 ${silverDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {silverDiff >= 0 ? '▲' : '▼'} Rs {Math.abs(silverDiff).toLocaleString(numberLocale)} ({silverDiff >= 0 ? '+' : ''}{silverPct}%)
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-4 text-[12px] text-ink-muted dark:text-ink-faint flex-wrap">
        {predictionResult ? (
          <span>🎯 {t.yesterdayPrediction}: <strong className={predictionResult.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>
            {predictionResult.correct ? `✅ ${t.correct}` : `❌ ${t.wrong}`}
          </strong></span>
        ) : null}
        {streak > 0 ? (
          <span>🔥 {(t.dayStreak as string).replace('{n}', String(streak))}</span>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/MorningDigest.tsx
git commit -m "feat: add MorningDigest card with greeting and price summary"
```

---

### Task 5: Calculator Page

**Files:**
- Create: `apps/web/src/components/CalculatorPage.tsx`

- [ ] **Step 1: Create CalculatorPage component**

Create `apps/web/src/components/CalculatorPage.tsx`:

```tsx
import { useState, useMemo } from 'react';
import { useLocale } from '../i18n';
import { FunComparison } from './FunComparison';

interface CalculatorPageProps {
  goldPricePerTola: number | null;
  silverPricePerTola: number | null;
}

type Metal = 'gold' | 'silver';
type Unit = 'tola' | 'gram';

const GRAMS_PER_TOLA = 11.6638;

export function CalculatorPage({ goldPricePerTola, silverPricePerTola }: CalculatorPageProps) {
  const { t, numberLocale } = useLocale();
  const [metal, setMetal] = useState<Metal>('gold');
  const [unit, setUnit] = useState<Unit>('tola');
  const [weightInput, setWeightInput] = useState('1');
  const [mode, setMode] = useState<'weight' | 'value'>('weight');
  const [valueInput, setValueInput] = useState('');

  const pricePerTola = metal === 'gold' ? goldPricePerTola : silverPricePerTola;
  const pricePerUnit = pricePerTola
    ? unit === 'tola' ? pricePerTola : Math.round(pricePerTola / GRAMS_PER_TOLA)
    : null;

  const result = useMemo(() => {
    if (!pricePerUnit) return null;
    if (mode === 'weight') {
      const w = parseFloat(weightInput);
      if (isNaN(w) || w <= 0) return null;
      return { weight: w, value: Math.round(w * pricePerUnit) };
    } else {
      const v = parseFloat(valueInput);
      if (isNaN(v) || v <= 0) return null;
      const w = v / pricePerUnit;
      return { weight: Math.round(w * 100) / 100, value: Math.round(v) };
    }
  }, [mode, weightInput, valueInput, pricePerUnit]);

  function handleWeightChange(val: string) {
    setWeightInput(val);
    setMode('weight');
  }

  function handleValueChange(val: string) {
    setValueInput(val);
    setMode('value');
  }

  if (!goldPricePerTola && !silverPricePerTola) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-ink-faint">{t.unavailable}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        {/* Metal toggle */}
        <div className="flex rounded-full border border-ink/8 dark:border-white/8 overflow-hidden w-fit mb-6">
          {(['gold', 'silver'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMetal(m)}
              className={`px-4 py-1.5 text-[12px] font-medium tracking-wide cursor-pointer transition-all duration-300 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none ${
                metal === m
                  ? 'bg-ink dark:bg-white text-white dark:text-ink'
                  : 'text-ink-muted dark:text-ink-faint hover:bg-ink/5 dark:hover:bg-white/5'
              }`}
            >
              {m === 'gold' ? t.gold : t.silver}
            </button>
          ))}
        </div>

        {/* Input fields */}
        <div className="flex items-end gap-3 sm:gap-4 mb-4">
          <div className="flex-1">
            <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink-faint mb-1.5 block">
              {t.weight}
            </label>
            <div className="flex rounded-xl border border-ink/10 dark:border-white/10 overflow-hidden">
              <input
                type="text"
                inputMode="decimal"
                value={mode === 'weight' ? weightInput : (result ? String(result.weight) : '')}
                onChange={e => handleWeightChange(e.target.value)}
                placeholder={t.enterWeight}
                className="flex-1 px-3 py-3 text-[16px] bg-transparent text-ink dark:text-white outline-none"
              />
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as Unit)}
                className="px-3 py-3 bg-ink/3 dark:bg-white/5 border-l border-ink/10 dark:border-white/10 text-[13px] text-ink-muted dark:text-ink-faint outline-none cursor-pointer"
              >
                <option value="tola">{t.tola}</option>
                <option value="gram">{t.gram}</option>
              </select>
            </div>
          </div>

          <div className="text-xl text-ink-faint pb-3">⇄</div>

          <div className="flex-1">
            <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink-faint mb-1.5 block">
              {t.value}
            </label>
            <div className="flex rounded-xl border border-ink/10 dark:border-white/10 overflow-hidden">
              <span className="px-3 py-3 bg-ink/3 dark:bg-white/5 border-r border-ink/10 dark:border-white/10 text-[13px] text-ink-muted dark:text-ink-faint">Rs</span>
              <input
                type="text"
                inputMode="decimal"
                value={mode === 'value' ? valueInput : (result ? result.value.toLocaleString(numberLocale) : '')}
                onChange={e => handleValueChange(e.target.value.replace(/,/g, ''))}
                placeholder={t.enterValue}
                className="flex-1 px-3 py-3 text-[16px] bg-transparent text-ink dark:text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Rate info */}
        {pricePerUnit ? (
          <p className="text-[12px] text-ink-faint mb-4">
            {(t.basedOnRate as string)
              .replace('{price}', pricePerUnit.toLocaleString(numberLocale))
              .replace('{unit}', unit === 'tola' ? t.tola : t.gram)}
          </p>
        ) : null}

        {/* Fun comparison for calculated value */}
        {result && result.value > 0 ? (
          <FunComparison price={result.value} metal={metal} />
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/CalculatorPage.tsx
git commit -m "feat: add CalculatorPage with bidirectional weight/value conversion"
```

---

### Task 6: Wire Everything — Header + App.tsx

**Files:**
- Modify: `apps/web/src/components/Header.tsx`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Update Tab type in Header.tsx**

In `apps/web/src/components/Header.tsx`, find:

```typescript
export type Tab = 'prices' | 'news';
```

Replace with:

```typescript
export type Tab = 'prices' | 'news' | 'calculator';
```

Then find the tab rendering loop and add the calculator tab. Replace:

```tsx
          {(['prices', 'news'] as const).map(tab => (
```

With:

```tsx
          {(['prices', 'news', 'calculator'] as const).map(tab => (
```

And update the label logic. Replace:

```tsx
              {tab === 'prices' ? t.prices : t.news}
```

With:

```tsx
              {tab === 'prices' ? t.prices : tab === 'news' ? t.news : t.calculator}
```

- [ ] **Step 2: Wire hooks and components in App.tsx**

Add imports at the top of `apps/web/src/App.tsx`:

```typescript
import { usePrediction } from './hooks/usePrediction';
import { PredictionCard } from './components/PredictionCard';
import { MorningDigest } from './components/MorningDigest';
import { CalculatorPage } from './components/CalculatorPage';
```

After the existing `useMilestones` call, add:

```typescript
  const {
    currentPrediction, lastResult, hasPredictedToday, hasResult,
    predictionStreak, accuracy, predict, dismissResult,
  } = usePrediction(goldNepalPrice, goldPrevPrice);
```

In the JSX, add MorningDigest before the MilestoneBanner inside the prices tab:

Replace:

```tsx
        {activeTab === 'prices' ? (
          <>
            {activeMilestone ? (
```

With:

```tsx
        {activeTab === 'prices' ? (
          <>
            <MorningDigest
              goldPrice={goldNepalPrice}
              goldPrev={goldPrevPrice}
              silverPrice={silverNepalPrice}
              silverPrev={silverPrevPrice}
              predictionResult={lastResult ? { correct: lastResult.correct } : null}
              streak={streak}
            />

            {activeMilestone ? (
```

After the price card grid closing `</div>`, add the PredictionCard:

Find the closing of the grid div and add after it:

```tsx
                <PredictionCard
                  currentPrediction={currentPrediction}
                  lastResult={lastResult}
                  hasPredictedToday={hasPredictedToday}
                  hasResult={hasResult}
                  predictionStreak={predictionStreak}
                  accuracy={accuracy}
                  onPredict={predict}
                  onDismissResult={dismissResult}
                />
```

Add the calculator tab rendering. Find the `<NewsPage />` and update the conditional:

Replace:

```tsx
        ) : (
          <NewsPage />
        )}
```

With:

```tsx
        ) : activeTab === 'news' ? (
          <NewsPage />
        ) : (
          <CalculatorPage
            goldPricePerTola={goldNepalPrice}
            silverPricePerTola={silverNepalPrice}
          />
        )}
```

- [ ] **Step 3: Run tests**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice/apps/web && npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/Header.tsx apps/web/src/App.tsx
git commit -m "feat: wire prediction game, morning digest, and calculator into app"
```

---

### Task 7: Manual QA & Visual Polish

- [ ] **Step 1: Build package and start dev server**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice && npx turbo build --filter=nepal-bullion-price && cd apps/web && pnpm dev
```

- [ ] **Step 2: Test prediction game**

- Make a prediction (tap Up or Down)
- Verify it locks and shows "check back tomorrow"
- Verify stats (streak: 0, accuracy: 0% for first prediction)

- [ ] **Step 3: Test morning digest**

- Verify greeting matches time of day
- Verify gold/silver prices and changes shown
- Dismiss and verify it doesn't reappear on refresh

- [ ] **Step 4: Test calculator**

- Switch between gold/silver
- Enter weight, verify value calculates
- Enter value, verify weight calculates
- Switch tola/gram, verify conversion
- Check fun comparison updates with calculated value

- [ ] **Step 5: Test at 320px, 375px, 768px, 1280px**

- [ ] **Step 6: Test dark mode**

- [ ] **Step 7: Fix issues and commit each separately**

---

### Task 8: Final Verification & Push

- [ ] **Step 1: Run full test suite**

```bash
cd /Users/blokchainaholic/Desktop/MyProjects/goldprice/apps/web && npx vitest run
```

- [ ] **Step 2: Production build**

```bash
pnpm build
```

- [ ] **Step 3: Push**

```bash
git push origin main
```
