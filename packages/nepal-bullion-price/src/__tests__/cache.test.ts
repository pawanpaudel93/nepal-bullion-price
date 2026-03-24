import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Cache } from '../cache.js';

describe('Cache', () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache<string>(1000);
  });

  it('returns undefined for missing key', () => {
    expect(cache.get('missing')).toBeUndefined();
  });

  it('stores and retrieves values', () => {
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('returns undefined for expired entries', () => {
    vi.useFakeTimers();
    cache.set('key', 'value');
    vi.advanceTimersByTime(1001);
    expect(cache.get('key')).toBeUndefined();
    vi.useRealTimers();
  });

  it('getStale returns expired entries', () => {
    vi.useFakeTimers();
    cache.set('key', 'value');
    vi.advanceTimersByTime(1001);
    expect(cache.get('key')).toBeUndefined();
    expect(cache.getStale('key')).toBe('value');
    vi.useRealTimers();
  });

  it('getStale returns undefined if never set', () => {
    expect(cache.getStale('never')).toBeUndefined();
  });
});
