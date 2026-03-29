import { describe, it, expect } from 'vitest';
import { buildHistory } from '../providers/nepal-price/fenegosida.js';

describe('buildHistory', () => {
  it('creates history entries from chart day labels and prices', () => {
    // Real FENEGOSIDA format: 7 trading days, Saturday (day 7) skipped
    const days = [6, 8, 9, 10, 11, 12, 13];
    const prices = [294500, 282000, 275500, 273900, 288500, 285600, 281000];
    const result = buildHistory(days, prices);

    expect(result).toHaveLength(7);
    // Each entry maps a BS day label to its price
    expect(result![0]).toEqual({ date: '6', price: 294500 });
    expect(result![6]).toEqual({ date: '13', price: 281000 });
    // Saturday (day 7) is not in the data
    expect(result!.find(e => e.date === '7')).toBeUndefined();
  });

  it('returns null for empty arrays', () => {
    expect(buildHistory([], [])).toBeNull();
  });

  it('returns null for single entry', () => {
    expect(buildHistory([13], [281000])).toBeNull();
  });

  it('returns null for mismatched arrays', () => {
    expect(buildHistory([12, 13], [281000])).toBeNull();
  });

  it('handles month boundary in day labels', () => {
    // Chart spans end of one BS month into the next (e.g., Falgun 28 → Chaitra 1)
    const days = [27, 28, 1, 2, 3];
    const prices = [160000, 161000, 162000, 163000, 164000];
    const result = buildHistory(days, prices);

    expect(result).toHaveLength(5);
    expect(result![0]).toEqual({ date: '27', price: 160000 });
    expect(result![2]).toEqual({ date: '1', price: 162000 });
    expect(result![4]).toEqual({ date: '3', price: 164000 });
  });
});
