import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { NewsItem } from '../../types.js';
import { parseRssFeed } from './rss.js';

interface RssSource {
  name: string;
  url: string;
  language: 'en' | 'np';
}

const NEPAL_SOURCES: RssSource[] = [
  { name: 'OnlineKhabar', url: 'https://www.onlinekhabar.com/feed', language: 'np' },
  { name: 'Google News Nepal', url: 'https://news.google.com/rss/search?q=gold+price+nepal&hl=en-US&gl=US&ceid=US:en', language: 'en' },
];

const KEYWORDS_EN = /gold|silver|bullion|precious\s+metal|jewel/i;
const KEYWORDS_NP = /सुन|चाँदी|बुलियन|सुनचाँदी|फेनेगोसिडा/;

function matchesKeywords(item: NewsItem): boolean {
  const text = `${item.title} ${item.summary ?? ''}`;
  return item.language === 'np' ? KEYWORDS_NP.test(text) : KEYWORDS_EN.test(text);
}

export function categorizeItem(item: NewsItem): NewsItem {
  const text = `${item.title} ${item.summary ?? ''}`.toLowerCase();
  const hasGold = /gold|सुन/i.test(text);
  const hasSilver = /silver|चाँदी/i.test(text);
  if (hasGold && !hasSilver) return { ...item, category: 'gold' };
  if (hasSilver && !hasGold) return { ...item, category: 'silver' };
  return { ...item, category: 'market' };
}

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

export async function fetchNepalNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(NEPAL_SOURCES.map(fetchRss));
  const allItems = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  return allItems.filter(matchesKeywords).map(categorizeItem);
}
