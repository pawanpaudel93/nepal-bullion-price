import * as cheerio from 'cheerio';
import type { NewsItem } from '../../types.js';

export function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function parseRssFeed(
  xml: string,
  source: string,
  language: 'en' | 'np',
): NewsItem[] {
  try {
    const $ = cheerio.load(xml, { xml: true });
    const items: NewsItem[] = [];

    $('item').each((_, el) => {
      const title = $(el).find('title').first().text().trim();
      const url = $(el).find('link').first().text().trim();
      if (!title || !url) return;

      const rawDesc = $(el).find('description').first().text().trim();
      // Strip HTML tags from description (Google News RSS includes HTML in CDATA)
      const description = rawDesc
        ? cheerio.load(rawDesc, { xml: false }).text().trim() || undefined
        : undefined;
      const pubDate = $(el).find('pubDate').first().text().trim();
      const enclosure = $(el).find('enclosure[type^="image"]').attr('url');
      const mediaContent = $(el).find('media\\:content, content').attr('url');

      // Google News RSS appends " - SourceName" to titles — extract the real source
      const sourceMatch = title.match(/^(.+)\s+-\s+(.+)$/);
      const cleanTitle = sourceMatch ? sourceMatch[1].trim() : title;
      const realSource = sourceMatch ? sourceMatch[2].trim() : source;

      items.push({
        id: hashUrl(url),
        title: cleanTitle,
        summary: description,
        url,
        source: realSource,
        language,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        imageUrl: enclosure || mediaContent || undefined,
        category: undefined,
      });
    });

    return items;
  } catch {
    return [];
  }
}
