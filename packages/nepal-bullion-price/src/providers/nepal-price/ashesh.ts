import * as cheerio from 'cheerio';
import { getConfig } from '../../config.js';
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { NepalPriceData } from '../../types.js';

export async function fetchAshesh(): Promise<NepalPriceData> {
  // '402137q239' is a publicly available widget API key from ashesh.com.np — not a secret.
  // It can be overridden via configure({ apiKeys: { asheshApiKey: '...' } }) if needed.
  const apiKey = getConfig().apiKeys.asheshApiKey ?? '402137q239';
  const res = await fetch(
    `https://www.ashesh.com.np/gold/widget.php?api=${apiKey}&header_color=0077e5`,
    { signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS) },
  );
  if (!res.ok) throw new Error(`ashesh.com.np returned ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const prices: number[] = [];
  $('.country').each((_, el) => {
    const price = parseInt(
      $(el).find('.rate_buying').text().replace(/,/g, '').trim(),
      10,
    );
    prices.push(isNaN(price) ? 0 : price);
  });

  if (prices.length < 6) {
    throw new Error('Failed to parse ashesh.com.np widget');
  }

  const dateMatch = $('.header_date').text().match(/\d{4}-\d{2}-\d{2}/);
  const date = dateMatch?.[0] ?? new Date().toISOString().split('T')[0];

  return {
    goldHallmark: prices[0],
    goldTajabi: prices[1],
    silver: prices[2],
    goldHallmarkPerGram10: prices[3],
    goldTajabiPerGram10: prices[4],
    silverPerGram10: prices[5],
    date,
  };
}
