import { describe, it, expect } from 'vitest';
import { buildHistory } from '../providers/nepal-price/fenegosida.js';

describe('buildHistory', () => {
  it('converts chart data with day labels to correct dates', () => {
    // Real FENEGOSIDA format: 7 trading days, Saturday (day 7) skipped
    const days = [6, 8, 9, 10, 11, 12, 13];
    const prices = [294500, 282000, 275500, 273900, 288500, 285600, 281000];
    const todayStr = '2026-03-13';
    const result = buildHistory(days, prices, todayStr);

    expect(result).toHaveLength(7);
    // Last entry should be today (13th)
    expect(result![6]).toEqual({ date: '2026-03-13', price: 281000 });
    // First entry should be the 6th
    expect(result![0]).toEqual({ date: '2026-03-06', price: 294500 });
    // Saturday (7th) is skipped — no entry for it
    expect(result![1]).toEqual({ date: '2026-03-08', price: 282000 });
  });

  it('returns null for empty arrays', () => {
    const result = buildHistory([], [], '2026-03-13');
    expect(result).toBeNull();
  });

  it('returns null for single entry', () => {
    const result = buildHistory([13], [281000], '2026-03-13');
    expect(result).toBeNull();
  });

  it('returns null for mismatched arrays', () => {
    const result = buildHistory([12, 13], [281000], '2026-03-13');
    expect(result).toBeNull();
  });

  it('handles consecutive days (no Saturday skip)', () => {
    const days = [11, 12, 13];
    const prices = [288500, 285600, 281000];
    const result = buildHistory(days, prices, '2026-03-13');

    expect(result).toHaveLength(3);
    expect(result![0].date).toBe('2026-03-11');
    expect(result![1].date).toBe('2026-03-12');
    expect(result![2].date).toBe('2026-03-13');
  });

  it('handles month boundary correctly', () => {
    // Chart spans end of Feb into March
    const days = [27, 28, 1, 2, 3];
    const prices = [160000, 161000, 162000, 163000, 164000];
    const result = buildHistory(days, prices, '2026-03-03');

    expect(result).toHaveLength(5);
    expect(result![0].date).toBe('2026-02-27');
    expect(result![1].date).toBe('2026-02-28');
    expect(result![2].date).toBe('2026-03-01');
    expect(result![4].date).toBe('2026-03-03');
  });
});
