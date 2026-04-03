import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'bullion-gold-quiz';

interface GoldQuizState {
  highScore: number;
  gamesPlayed: number;
  totalCorrect: number;
  totalAnswered: number;
}

function loadState(): GoldQuizState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { highScore: 0, gamesPlayed: 0, totalCorrect: 0, totalAnswered: 0 };
}

function saveState(state: GoldQuizState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

export function useGoldQuiz() {
  const [state, setState] = useState<GoldQuizState>(loadState);
  const isNewHighRef = useRef(false);

  const submitScore = useCallback((score: number, correct: number, answered: number) => {
    setState(prev => {
      const isNew = score > prev.highScore;
      isNewHighRef.current = isNew;
      const next: GoldQuizState = {
        highScore: Math.max(prev.highScore, score),
        gamesPlayed: prev.gamesPlayed + 1,
        totalCorrect: prev.totalCorrect + correct,
        totalAnswered: prev.totalAnswered + answered,
      };
      saveState(next);
      return next;
    });
    return isNewHighRef.current;
  }, []);

  return {
    highScore: state.highScore,
    gamesPlayed: state.gamesPlayed,
    totalCorrect: state.totalCorrect,
    totalAnswered: state.totalAnswered,
    submitScore,
  };
}
