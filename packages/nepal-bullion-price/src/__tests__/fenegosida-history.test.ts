import { describe, it, expect } from 'vitest';
import { buildHistory } from '../providers/nepal-price/fenegosida.js';

describe('buildHistory', () => {
  it('converts chart prices to history array with dates', () => {
    const prices = [161000, 161200, 160800, 161500, 161300, 161800, 162000];
    const todayStr = '2026-03-27';
    const result = buildHistory(prices, todayStr);

    expect(result).toHaveLength(7);
    expect(result[6].date).toBe('2026-03-27');
    expect(result[6].price).toBe(162000);
    expect(result[0].date).toBe('2026-03-21');
    expect(result[0].price).toBe(161000);
  });

  it('returns null for empty array', () => {
    const result = buildHistory([], '2026-03-27');
    expect(result).toBeNull();
  });

  it('returns null for single entry', () => {
    const result = buildHistory([161000], '2026-03-27');
    expect(result).toBeNull();
  });

  it('handles 2-day data', () => {
    const result = buildHistory([161000, 162000], '2026-03-27');
    expect(result).toHaveLength(2);
    expect(result![0].date).toBe('2026-03-26');
    expect(result![1].date).toBe('2026-03-27');
  });
});
