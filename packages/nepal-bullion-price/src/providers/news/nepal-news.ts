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

// Exclude articles that mention gold/silver only in irrelevant contexts
const EXCLUDE_EN = /\b(theft|robbery|stolen|heist|murder|archaeolog|fossil|medal|olympic|trophy|golden\s+gate|golden\s+state|golden\s+globe|silver\s+screen|silver\s+lining|gold\s+coast|fashion\s+week|runway|netflix|movie\s+review|album|song)\b/i;
const EXCLUDE_NP = /चोरी|डकैती|हत्या|अपराध|पदक|ट्रफी|फिल्म/;

export function matchesKeywords(item: NewsItem): boolean {
  const text = `${item.title} ${item.summary ?? ''}`;
  const hasKeyword = item.language === 'np' ? KEYWORDS_NP.test(text) : KEYWORDS_EN.test(text);
  if (!hasKeyword) return false;
  // Reject if it matches exclusion patterns (irrelevant contexts)
  const excluded = item.language === 'np' ? EXCLUDE_NP.test(text) : EXCLUDE_EN.test(text);
  return !excluded;
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
