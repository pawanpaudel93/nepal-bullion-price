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
  currentPrediction: Direction | null;
  lastResult: { direction: Direction; actual: Direction; correct: boolean; priceChange: number; pctChange: number } | null;
  hasPredictedToday: boolean;
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

  useEffect(() => {
    if (resolvedRef.current) return;
    if (!goldPrice || !goldPrevPrice) return;
    resolvedRef.current = true;

    const today = getNepalDate();
    const yesterday = getYesterday(today);
    const s = { ...state };

    if (s.currentPrediction && s.currentPrediction.date === yesterday) {
      const actual: Direction = goldPrice >= goldPrevPrice ? 'up' : 'down';
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
        lastResult: null,
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
