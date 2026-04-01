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

      if (goldPrice && goldPrice > state.athGold) state.athGold = goldPrice;
      if (silverPrice && silverPrice > state.athSilver) state.athSilver = silverPrice;

      saveState(state);
      setActiveMilestone(event);
      fireConfetti(event);
    } else {
      let updated = false;
      if (goldPrice && goldPrice > state.athGold) { state.athGold = goldPrice; updated = true; }
      if (silverPrice && silverPrice > state.athSilver) { state.athSilver = silverPrice; updated = true; }
      if (updated) saveState(state);
    }
  }, [goldPrice, silverPrice, goldPrev, silverPrev, onBadge]);

  const dismiss = useCallback(() => setActiveMilestone(null), []);

  return { activeMilestone, dismiss, awardBadge: onBadge ?? null };
}
