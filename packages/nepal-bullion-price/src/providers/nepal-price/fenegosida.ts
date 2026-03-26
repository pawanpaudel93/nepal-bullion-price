import * as cheerio from 'cheerio';
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { NepalPriceData } from '../../types.js';

/**
 * Parse the weekly chart data from the inline Google Charts script.
 * Format: ['day',tolaPrice,gram10Price], e.g. ['12',285600,244855]
 * Returns an array of tola prices ordered oldest → newest.
 */
function parseChartData(html: string, varName: string): number[] {
  const regex = new RegExp(`var\\s+${varName}\\s*=\\s*google\\.visualization\\.arrayToDataTable\\(\\[([\\s\\S]*?)\\]\\)`);
  const match = html.match(regex);
  if (!match) return [];

  const entries = match[1].matchAll(/\['[^']+',(\d+(?:\.\d+)?),/g);
  return [...entries].map(m => parseFloat(m[1]));
}

export async function fetchFenegosida(): Promise<NepalPriceData> {
  const res = await fetch('https://fenegosida.org/', {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`fenegosida.org returned ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  // Block 0 = per 10g (labels "10 grm"), Block 1 = per tola (labels "1 tola")
  const headerRates = $('#header-rate');
  const gramBlock = headerRates.first();
  const tolaBlock = headerRates.last();

  const parseBlock = (block: ReturnType<typeof $>) => {
    const golds = block.find('.rate-gold.post b')
      .map((_, el) => parseInt($(el).text().replace(/,/g, ''), 10))
      .get();
    const silvers = block.find('.rate-silver.post b')
      .map((_, el) => parseInt($(el).text().replace(/,/g, ''), 10))
      .get();
    return { golds, silver: silvers[0] ?? 0 };
  };

  const tola = parseBlock(tolaBlock);
  const gram = parseBlock(gramBlock);

  if (tola.golds.length < 2) {
    throw new Error('Failed to parse fenegosida.org prices');
  }

  if (!tola.golds[0] || tola.golds[0] < 1000) {
    throw new Error('Suspicious gold price from fenegosida.org: ' + tola.golds[0]);
  }

  // Extract previous day's price from the weekly chart
  // data = gold weekly (7 days), data2 = silver weekly (7 days)
  const goldChart = parseChartData(html, 'data');
  const silverChart = parseChartData(html, 'data2');

  // Second-to-last entry is yesterday's price
  const previousGoldHallmark = goldChart.length >= 2 ? goldChart[goldChart.length - 2] : null;
  const previousSilver = silverChart.length >= 2 ? silverChart[silverChart.length - 2] : null;

  return {
    goldHallmark: tola.golds[0],
    goldTajabi: tola.golds[1],
    silver: tola.silver,
    goldHallmarkPerGram10: gram.golds[0] ?? 0,
    goldTajabiPerGram10: gram.golds[1] ?? 0,
    silverPerGram10: gram.silver,
    previousGoldHallmark,
    previousSilver,
    date: new Date().toISOString().split('T')[0],
  };
}
