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

    if (s.lastVisitDate === today) return;

    const yesterday = getYesterday(today);
    if (s.lastVisitDate === yesterday) {
      s.currentStreak += 1;
    } else {
      s.currentStreak = 1;
    }

    s.lastVisitDate = today;
    s.totalVisits += 1;
    if (s.currentStreak > s.bestStreak) s.bestStreak = s.currentStreak;

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
