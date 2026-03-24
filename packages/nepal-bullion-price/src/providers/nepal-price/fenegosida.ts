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

  // Block 0 = per 10g (labels "10 grm"), Block 1 = per tola (labels "1 tola")
  // Silver only appears in the tola block
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

  return {
    goldHallmark: tola.golds[0],
    goldTajabi: tola.golds[1],
    silver: tola.silver,
    goldHallmarkPerGram10: gram.golds[0] ?? 0,
    goldTajabiPerGram10: gram.golds[1] ?? 0,
    silverPerGram10: gram.silver,
    date: new Date().toISOString().split('T')[0],
  };
}
