import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import { getConfig } from '../../config.js';
import type { NewsItem } from '../../types.js';
import { hashUrl } from './rss.js';
import { categorizeItem } from './nepal-news.js';

interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string };
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

async function searchGNews(query: string, lang: 'en' | 'np', apiKey: string): Promise<NewsItem[]> {
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=${lang === 'np' ? 'ne' : 'en'}&max=10&apikey=${apiKey}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) return [];
  const data: GNewsResponse = await res.json();
  if (!data.articles?.length) return [];

  return data.articles.map(article => categorizeItem({
    id: hashUrl(article.url),
    title: article.title,
    summary: article.description || undefined,
    url: article.url,
    source: article.source.name,
    language: lang,
    publishedAt: article.publishedAt,
    imageUrl: article.image || undefined,
    category: undefined,
  }));
}

export async function fetchGNews(): Promise<NewsItem[]> {
  const apiKey = getConfig().apiKeys.gnewsApiKey;
  if (!apiKey) return [];

  const results = await Promise.allSettled([
    searchGNews('gold price', 'en', apiKey),
    searchGNews('silver market', 'en', apiKey),
    searchGNews('सुनको भाउ', 'np', apiKey),
  ]);

  return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
}
