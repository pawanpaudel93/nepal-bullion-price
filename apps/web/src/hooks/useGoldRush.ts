import { useState, useCallback } from 'react';

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

  const submitScore = useCallback((score: number) => {
    setState(prev => {
      const next: GoldRushState = {
        highScore: Math.max(prev.highScore, score),
        gamesPlayed: prev.gamesPlayed + 1,
        totalCoins: prev.totalCoins + score,
      };
      saveState(next);
      return next;
    });
    return score > state.highScore;
  }, [state.highScore]);

  return {
    highScore: state.highScore,
    gamesPlayed: state.gamesPlayed,
    totalCoins: state.totalCoins,
    submitScore,
  };
}
