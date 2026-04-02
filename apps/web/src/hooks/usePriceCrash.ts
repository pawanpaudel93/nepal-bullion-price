import { useState, useCallback } from 'react';

const STORAGE_KEY = 'bullion-price-crash';

interface PriceCrashState {
  bestMultiplier: number;
  gamesPlayed: number;
}

function loadState(): PriceCrashState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { bestMultiplier: 0, gamesPlayed: 0 };
}

function saveState(state: PriceCrashState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

export function usePriceCrash() {
  const [state, setState] = useState<PriceCrashState>(loadState);

  const submitResult = useCallback((multiplier: number) => {
    const isNewBest = multiplier > state.bestMultiplier;
    setState(prev => {
      const next: PriceCrashState = {
        bestMultiplier: Math.max(prev.bestMultiplier, multiplier),
        gamesPlayed: prev.gamesPlayed + 1,
      };
      saveState(next);
      return next;
    });
    return isNewBest;
  }, [state.bestMultiplier]);

  return {
    bestMultiplier: state.bestMultiplier,
    gamesPlayed: state.gamesPlayed,
    submitResult,
  };
}
