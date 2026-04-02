import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'bullion-gold-rush';

interface GoldRushState {
  highScore: number;
  gamesPlayed: number;
  totalCoins: number;
}

function loadState(): GoldRushState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { highScore: 0, gamesPlayed: 0, totalCoins: 0 };
}

function saveState(state: GoldRushState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

export function useGoldRush() {
  const [state, setState] = useState<GoldRushState>(loadState);
  const isNewHighRef = useRef(false);

  const submitScore = useCallback((score: number) => {
    setState(prev => {
      const isNew = score > prev.highScore;
      isNewHighRef.current = isNew;
      const next: GoldRushState = {
        highScore: Math.max(prev.highScore, score),
        gamesPlayed: prev.gamesPlayed + 1,
        totalCoins: prev.totalCoins + score,
      };
      saveState(next);
      return next;
    });
    return isNewHighRef.current;
  }, []);

  return {
    highScore: state.highScore,
    gamesPlayed: state.gamesPlayed,
    totalCoins: state.totalCoins,
    submitScore,
  };
}
