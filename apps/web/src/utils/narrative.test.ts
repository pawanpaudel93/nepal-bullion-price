import { describe, it, expect } from 'vitest';
import { generateNarratives, type Narrative } from './narrative';

const rising3Days = [
  { date: '2026-03-21', price: 160000 },
  { date: '2026-03-22', price: 159500 },
  { date: '2026-03-23', price: 159800 },
  { date: '2026-03-24', price: 160000 },
  { date: '2026-03-25', price: 160500 },
  { date: '2026-03-26', price: 161000 },
  { date: '2026-03-27', price: 161800 },
];

const falling3Days = [
  { date: '2026-03-21', price: 161000 },
  { date: '2026-03-22', price: 161500 },
  { date: '2026-03-23', price: 161800 },
  { date: '2026-03-24', price: 161200 },
  { date: '2026-03-25', price: 160800 },
  { date: '2026-03-26', price: 160500 },
  { date: '2026-03-27', price: 160000 },
];

const weeklyHigh = [
  { date: '2026-03-21', price: 159000 },
  { date: '2026-03-22', price: 158500 },
  { date: '2026-03-23', price: 159200 },
  { date: '2026-03-24', price: 158800 },
  { date: '2026-03-25', price: 159500 },
  { date: '2026-03-26', price: 159000 },
  { date: '2026-03-27', price: 160000 },
];

const bigJump = [
  { date: '2026-03-21', price: 160000 },
  { date: '2026-03-22', price: 160100 },
  { date: '2026-03-23', price: 160050 },
  { date: '2026-03-24', price: 160200 },
  { date: '2026-03-25', price: 160150 },
  { date: '2026-03-26', price: 160100 },
  { date: '2026-03-27', price: 162000 },
];

const flatWeek = [
  { date: '2026-03-21', price: 160000 },
  { date: '2026-03-22', price: 160000 },
  { date: '2026-03-23', price: 160000 },
  { date: '2026-03-24', price: 160000 },
  { date: '2026-03-25', price: 160000 },
  { date: '2026-03-26', price: 160000 },
  { date: '2026-03-27', price: 160000 },
];

describe('generateNarratives', () => {
  it('detects a rising streak (including today)', () => {
    const result = generateNarratives(rising3Days);
    const streak = result.find(n => n.key === 'streak_rising');
    expect(streak).toBeDefined();
    // Days 23→24→25→26→27 all rising = 5 consecutive days including today
    expect(streak!.values!.n).toBe(5);
  });

  it('detects a falling streak (including today)', () => {
    const result = generateNarratives(falling3Days);
    const streak = result.find(n => n.key === 'streak_falling');
    expect(streak).toBeDefined();
    // Days 24→25→26→27 all falling = 4 days including today
    expect(streak!.values!.n).toBe(4);
  });

  it('detects weekly high', () => {
    const result = generateNarratives(weeklyHigh);
    const high = result.find(n => n.key === 'weekly_high');
    expect(high).toBeDefined();
  });

  it('detects biggest jump in the week', () => {
    const result = generateNarratives(bigJump);
    const jump = result.find(n => n.key === 'biggest_jump');
    expect(jump).toBeDefined();
  });

  it('returns empty array for flat prices', () => {
    const result = generateNarratives(flatWeek);
    expect(result).toHaveLength(0);
  });

  it('returns max 2 narratives', () => {
    const result = generateNarratives(rising3Days);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('returns empty for less than 2 data points', () => {
    const result = generateNarratives([{ date: '2026-03-27', price: 160000 }]);
    expect(result).toHaveLength(0);
  });
});
