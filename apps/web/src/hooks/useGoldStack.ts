import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'bullion-gold-stack';

interface GoldStackState {
  highScore: number;
  bestHeight: number;
  gamesPlayed: number;
}

function loadState(): GoldStackState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { highScore: 0, bestHeight: 0, gamesPlayed: 0 };
}

function saveState(state: GoldStackState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

export function useGoldStack() {
  const [state, setState] = useState<GoldStackState>(loadState);
  const isNewHighRef = useRef(false);

  const submitScore = useCallback((score: number, height: number) => {
    setState(prev => {
      const isNew = score > prev.highScore;
      isNewHighRef.current = isNew;
      const next: GoldStackState = {
        highScore: Math.max(prev.highScore, score),
        bestHeight: Math.max(prev.bestHeight, height),
        gamesPlayed: prev.gamesPlayed + 1,
      };
      saveState(next);
      return next;
    });
    return isNewHighRef.current;
  }, []);

  return {
    highScore: state.highScore,
    bestHeight: state.bestHeight,
    gamesPlayed: state.gamesPlayed,
    submitScore,
  };
}
