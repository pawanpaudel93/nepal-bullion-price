import * as cheerio from 'cheerio';
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { NepalPriceData } from '../../types.js';

export async function fetchHamropatro(): Promise<NepalPriceData> {
  const res = await fetch('https://www.hamropatro.com/gold', {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`hamropatro.com returned ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const items = $('ul.gold-silver li')
    .map((_, el) => $(el).text().trim())
    .get();

  const parsePrice = (text: string): number => {
    const match = text.match(/[\d,]+(?:\.\d+)?/);
    return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
  };

  if (items.length < 12) {
    throw new Error('Failed to parse hamropatro.com gold page');
  }

  const hallmark = parsePrice(items[1]);
  const silver = parsePrice(items[5]);
  if (hallmark < 1000) {
    throw new Error('Suspicious gold price from hamropatro.com: ' + hallmark);
  }
  if (silver < 100) {
    throw new Error('Suspicious silver price from hamropatro.com: ' + silver);
  }

  return {
    goldHallmark: hallmark,
    goldTajabi: parsePrice(items[3]),
    silver,
    goldHallmarkPerGram10: parsePrice(items[7]),
    goldTajabiPerGram10: parsePrice(items[9]),
    silverPerGram10: parsePrice(items[11]),
    previousGoldHallmark: null,
    previousSilver: null,
    goldHistory: null,
    silverHistory: null,
    priceDate: null,
    date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kathmandu' }),
  };
}
