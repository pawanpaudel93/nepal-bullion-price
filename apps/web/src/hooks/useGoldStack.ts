import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'bullion-gold-blocks';

interface GoldBlocksState {
  highScore: number;
  bestLines: number;
  gamesPlayed: number;
}

function loadState(): GoldBlocksState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { highScore: 0, bestLines: 0, gamesPlayed: 0 };
}

function saveState(state: GoldBlocksState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

export function useGoldStack() {
  const [state, setState] = useState<GoldBlocksState>(loadState);
  const isNewHighRef = useRef(false);

  const submitScore = useCallback((score: number, lines: number) => {
    setState(prev => {
      const isNew = score > prev.highScore;
      isNewHighRef.current = isNew;
      const next: GoldBlocksState = {
        highScore: Math.max(prev.highScore, score),
        bestLines: Math.max(prev.bestLines, lines),
        gamesPlayed: prev.gamesPlayed + 1,
      };
      saveState(next);
      return next;
    });
    return isNewHighRef.current;
  }, []);

  return {
    highScore: state.highScore,
    bestLines: state.bestLines,
    gamesPlayed: state.gamesPlayed,
    submitScore,
  };
}
