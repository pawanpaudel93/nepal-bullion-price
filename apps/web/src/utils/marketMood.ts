export interface MarketMood {
  emoji: string;
  labelKey: string;
}

export function getMarketMood(current: number, previous: number): MarketMood | null {
  if (previous === 0) return null;

  const pct = Math.abs((current - previous) / previous) * 100;

  if (pct >= 2) return { emoji: '🔥', labelKey: 'moodOnFire' };
  if (pct >= 1) return { emoji: '⚡', labelKey: 'moodActive' };
  if (pct >= 0.3) return { emoji: '😊', labelKey: 'moodCalm' };
  return { emoji: '💤', labelKey: 'moodQuiet' };
}
