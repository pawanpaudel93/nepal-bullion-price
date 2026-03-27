export interface Narrative {
  emoji: string;
  key: string;
  values?: Record<string, string | number>;
}

interface HistoryEntry {
  date: string;
  price: number;
}

/**
 * Generate contextual narratives from 7-day price history.
 * Returns up to 2 narratives ordered by priority:
 * 1. Big move (today's change is largest in the window)
 * 2. Weekly high/low (today is max or min of window)
 * 3. Streak (3+ consecutive days in same direction)
 */
export function generateNarratives(history: HistoryEntry[]): Narrative[] {
  if (history.length < 2) return [];

  const narratives: Narrative[] = [];
  const today = history[history.length - 1];
  const yesterday = history[history.length - 2];
  const todayChange = today.price - yesterday.price;

  // Priority 1: Big move — today's absolute change > all other daily changes
  const dailyChanges = history.slice(1).map((entry, i) => Math.abs(entry.price - history[i].price));
  const todayAbsChange = Math.abs(todayChange);
  if (todayAbsChange > 0) {
    const otherChanges = dailyChanges.slice(0, -1);
    if (otherChanges.length > 0 && otherChanges.every(c => todayAbsChange > c)) {
      narratives.push({
        emoji: '⚡',
        key: todayChange > 0 ? 'biggest_jump' : 'biggest_drop',
      });
    }
  }

  // Priority 2: Streak — 3+ consecutive prior days in same direction (capped at 3)
  if (narratives.length < 2) {
    let streak = 0;
    const maxLookback = 3;
    for (let i = history.length - 2; i > 0 && streak < maxLookback; i--) {
      const diff = history[i].price - history[i - 1].price;
      if (todayChange > 0 && diff > 0) streak++;
      else if (todayChange < 0 && diff < 0) streak++;
      else break;
    }
    if (streak >= 3) {
      narratives.push({
        emoji: todayChange > 0 ? '🔥' : '📉',
        key: todayChange > 0 ? 'streak_rising' : 'streak_falling',
        values: { n: streak },
      });
    }
  }

  // Priority 3: Weekly high/low
  if (narratives.length < 2) {
    const prices = history.map(h => h.price);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    if (today.price === max && today.price !== min) {
      narratives.push({ emoji: '📈', key: 'weekly_high' });
    } else if (today.price === min && today.price !== max) {
      narratives.push({ emoji: '📉', key: 'weekly_low' });
    }
  }

  return narratives.slice(0, 2);
}
