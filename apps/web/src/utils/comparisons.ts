export interface ComparisonItem {
  emoji: string;
  labelKey: string;
  referencePrice: number;
}

export const goldComparisons: ComparisonItem[] = [
  { emoji: '🍛', labelKey: 'compMomo', referencePrice: 200 },
  { emoji: '📱', labelKey: 'compIphone', referencePrice: 229_900 },
  { emoji: '🏍️', labelKey: 'compEnfield', referencePrice: 125_000 },
  { emoji: '🏠', labelKey: 'compRent', referencePrice: 15_000 },
  { emoji: '✈️', labelKey: 'compFlight', referencePrice: 18_000 },
  { emoji: '☕', labelKey: 'compChiya', referencePrice: 30 },
  { emoji: '⛰️', labelKey: 'compEBC', referencePrice: 150_000 },
];

export const silverComparisons: ComparisonItem[] = [
  { emoji: '🍛', labelKey: 'compMomo', referencePrice: 200 },
  { emoji: '☕', labelKey: 'compChiya', referencePrice: 30 },
  { emoji: '🎬', labelKey: 'compMovie', referencePrice: 400 },
  { emoji: '🚐', labelKey: 'compMicroBus', referencePrice: 25 },
];

export function getComparisons(price: number, metal: 'gold' | 'silver'): { emoji: string; labelKey: string; count: number }[] {
  const items = metal === 'gold' ? goldComparisons : silverComparisons;
  return items
    .map(item => ({
      emoji: item.emoji,
      labelKey: item.labelKey,
      count: Math.floor(price / item.referencePrice),
    }))
    .filter(item => item.count >= 1);
}
