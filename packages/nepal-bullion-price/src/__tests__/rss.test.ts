import { describe, it, expect } from 'vitest';
import { parseRssFeed } from '../providers/news/rss.js';

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>Gold prices surge to record high</title>
      <link>https://example.com/article-1</link>
      <description>Gold hit an all-time high today amid global uncertainty.</description>
      <pubDate>Mon, 31 Mar 2026 10:00:00 GMT</pubDate>
      <enclosure url="https://example.com/img.jpg" type="image/jpeg" />
    </item>
    <item>
      <title>Silver demand rises in Nepal</title>
      <link>https://example.com/article-2</link>
      <description>Silver imports up 20% year-over-year.</description>
      <pubDate>Sun, 30 Mar 2026 08:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

describe('parseRssFeed', () => {
  it('parses RSS XML into structured items', () => {
    const items = parseRssFeed(SAMPLE_RSS, 'test-source', 'en');
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({
      id: expect.any(String),
      title: 'Gold prices surge to record high',
      summary: 'Gold hit an all-time high today amid global uncertainty.',
      url: 'https://example.com/article-1',
      source: 'test-source',
      language: 'en',
      publishedAt: expect.any(String),
      imageUrl: 'https://example.com/img.jpg',
      category: undefined,
    });
  });

  it('generates deterministic IDs from URLs', () => {
    const items1 = parseRssFeed(SAMPLE_RSS, 'src1', 'en');
    const items2 = parseRssFeed(SAMPLE_RSS, 'src2', 'en');
    expect(items1[0].id).toBe(items2[0].id); // same URL = same ID
  });

  it('returns empty array for invalid XML', () => {
    const items = parseRssFeed('not xml', 'test', 'en');
    expect(items).toEqual([]);
  });

  it('handles missing optional fields', () => {
    const minimal = `<?xml version="1.0"?>
    <rss version="2.0"><channel><item>
      <title>Headline</title>
      <link>https://example.com/a</link>
    </item></channel></rss>`;
    const items = parseRssFeed(minimal, 'test', 'np');
    expect(items).toHaveLength(1);
    expect(items[0].summary).toBeUndefined();
    expect(items[0].imageUrl).toBeUndefined();
    expect(items[0].language).toBe('np');
  });
});
