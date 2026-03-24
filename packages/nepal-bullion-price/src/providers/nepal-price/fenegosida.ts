import * as cheerio from 'cheerio';
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { NepalPriceData } from '../../types.js';

export async function fetchFenegosida(): Promise<NepalPriceData> {
  const res = await fetch('https://fenegosida.org/', {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`fenegosida.org returned ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const headerRates = $('#header-rate');
  const tolaBlock = headerRates.first();
  const gramBlock = headerRates.last();

  const tolaValues = tolaBlock.find('.rate-gold.post b, .rate-silver.post b')
    .map((_, el) => parseInt($(el).text().replace(/,/g, ''), 10))
    .get();

  const gramValues = gramBlock.find('.rate-gold.post b, .rate-silver.post b')
    .map((_, el) => parseInt($(el).text().replace(/,/g, ''), 10))
    .get();

  if (tolaValues.length < 3) {
    throw new Error('Failed to parse fenegosida.org prices');
  }

  return {
    goldHallmark: tolaValues[0],
    goldTajabi: tolaValues[1],
    silver: tolaValues[2],
    goldHallmarkPerGram10: gramValues[0] ?? 0,
    goldTajabiPerGram10: gramValues[1] ?? 0,
    silverPerGram10: gramValues[2] ?? 0,
    date: new Date().toISOString().split('T')[0],
  };
}
