import { describe, it, expect } from 'vitest';
import { getMarketMood } from './marketMood';

describe('getMarketMood', () => {
  it('returns onFire for ≥2% change', () => {
    const mood = getMarketMood(102000, 100000);
    expect(mood.emoji).toBe('🔥');
    expect(mood.labelKey).toBe('moodOnFire');
  });

  it('returns onFire for ≥2% drop', () => {
    const mood = getMarketMood(98000, 100000);
    expect(mood.emoji).toBe('🔥');
    expect(mood.labelKey).toBe('moodOnFire');
  });

  it('returns active for 1-2% change', () => {
    const mood = getMarketMood(101500, 100000);
    expect(mood.emoji).toBe('⚡');
    expect(mood.labelKey).toBe('moodActive');
  });

  it('returns calm for 0.3-1% change', () => {
    const mood = getMarketMood(100500, 100000);
    expect(mood.emoji).toBe('😊');
    expect(mood.labelKey).toBe('moodCalm');
  });

  it('returns quiet for <0.3% change', () => {
    const mood = getMarketMood(100100, 100000);
    expect(mood.emoji).toBe('💤');
    expect(mood.labelKey).toBe('moodQuiet');
  });

  it('returns quiet for zero change', () => {
    const mood = getMarketMood(100000, 100000);
    expect(mood.emoji).toBe('💤');
    expect(mood.labelKey).toBe('moodQuiet');
  });

  it('returns null when previous is 0', () => {
    const mood = getMarketMood(100000, 0);
    expect(mood).toBeNull();
  });
});
