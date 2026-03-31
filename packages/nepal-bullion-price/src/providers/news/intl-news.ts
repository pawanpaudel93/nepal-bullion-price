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
  { name: 'Google News Gold', url: 'https://news.google.com/rss/search?q=gold+price&hl=en-US&gl=US&ceid=US:en', language: 'en' },
  { name: 'Google News Silver', url: 'https://news.google.com/rss/search?q=silver+price+market&hl=en-US&gl=US&ceid=US:en', language: 'en' },
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
