import { Cache } from '../../cache.js';
import type { NewsItem, NewsData } from '../../types.js';
import { fetchNepalNews } from './nepal-news.js';
import { fetchIntlNews } from './intl-news.js';
import { fetchGNews } from './gnews.js';

const NEWS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const newsCache = new Cache<NewsData>(NEWS_CACHE_TTL_MS);

export function deduplicateAndSort(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const unique = items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
  return unique.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function fetchAllNews(): Promise<NewsData> {
  const cached = newsCache.get('news');
  if (cached) return cached;

  const [nepalItems, intlItems, gnewsItems] = await Promise.allSettled([
    fetchNepalNews(),
    fetchIntlNews(),
    fetchGNews(),
  ]);

  const allItems = [
    ...(nepalItems.status === 'fulfilled' ? nepalItems.value : []),
    ...(intlItems.status === 'fulfilled' ? intlItems.value : []),
    ...(gnewsItems.status === 'fulfilled' ? gnewsItems.value : []),
  ];

  const data: NewsData = {
    items: deduplicateAndSort(allItems),
    fetchedAt: new Date().toISOString(),
  };

  newsCache.set('news', data);

  // Also try stale fallback if we got zero items
  if (data.items.length === 0) {
    const stale = newsCache.getStale('news');
    if (stale && stale.items.length > 0) return stale;
  }

  return data;
}
