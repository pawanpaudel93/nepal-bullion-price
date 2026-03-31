import { describe, it, expect } from 'vitest';
import { deduplicateAndSort } from '../providers/news/index.js';
import type { NewsItem } from '../types.js';

function makeItem(overrides: Partial<NewsItem>): NewsItem {
  return {
    id: 'abc',
    title: 'Test',
    url: 'https://example.com',
    source: 'test',
    language: 'en',
    publishedAt: '2026-04-01T10:00:00Z',
    ...overrides,
  };
}

describe('deduplicateAndSort', () => {
  it('removes duplicates by id, keeping the first occurrence', () => {
    const items = [
      makeItem({ id: '1', title: 'First', source: 'A' }),
      makeItem({ id: '1', title: 'Dupe', source: 'B' }),
      makeItem({ id: '2', title: 'Second' }),
    ];
    const result = deduplicateAndSort(items);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('First');
  });

  it('sorts by publishedAt descending (newest first)', () => {
    const items = [
      makeItem({ id: '1', publishedAt: '2026-03-30T10:00:00Z' }),
      makeItem({ id: '2', publishedAt: '2026-04-01T10:00:00Z' }),
      makeItem({ id: '3', publishedAt: '2026-03-31T10:00:00Z' }),
    ];
    const result = deduplicateAndSort(items);
    expect(result.map(i => i.id)).toEqual(['2', '3', '1']);
  });

  it('returns empty array for empty input', () => {
    expect(deduplicateAndSort([])).toEqual([]);
  });
});
