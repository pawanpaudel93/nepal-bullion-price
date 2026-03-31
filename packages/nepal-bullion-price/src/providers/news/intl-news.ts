import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { NewsItem } from '../../types.js';
import { parseRssFeed } from './rss.js';
import { categorizeItem } from './nepal-news.js';

interface RssSource {
  name: string;
  url: string;
  language: 'en' | 'np';
}

const INTL_SOURCES: RssSource[] = [
  { name: 'Kitco', url: 'https://www.kitco.com/feed/rss/news/gold', language: 'en' },
  { name: 'Mining.com', url: 'https://www.mining.com/tag/gold/feed/', language: 'en' },
];

async function fetchRss(source: RssSource): Promise<NewsItem[]> {
  try {
    const res = await fetch(source.url, {
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRssFeed(xml, source.name, source.language);
  } catch {
    return [];
  }
}

export async function fetchIntlNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(INTL_SOURCES.map(fetchRss));
  const allItems = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  return allItems.map(categorizeItem);
}
