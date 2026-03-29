import * as cheerio from 'cheerio';
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { NepalPriceData } from '../../types.js';

/**
 * Parse the weekly chart data from the inline Google Charts script.
 * Format: ['day',tolaPrice,gram10Price], e.g. ['12',285600,244855]
 * Returns arrays of day labels and tola prices ordered oldest → newest.
 * Saturday is skipped in Nepal (weekly holiday), so days are not consecutive.
 */
const CHART_ENTRY_RE = /\['(\d+)',(\d+(?:\.\d+)?),/g;

function parseChartData(html: string, varName: string): { days: number[]; prices: number[] } {
  const regex = new RegExp(`var\\s+${varName}\\s*=\\s*google\\.visualization\\.arrayToDataTable\\(\\[([\\s\\S]*?)\\]\\)`);
  const match = html.match(regex);
  if (!match) return { days: [], prices: [] };

  const entries = [...match[1].matchAll(CHART_ENTRY_RE)];
  return {
    days: entries.map(m => parseInt(m[1], 10)),
    prices: entries.map(m => parseFloat(m[2])),
  };
}

/**
 * Convert chart data into dated history entries using actual day-of-month labels.
 * FENEGOSIDA skips Saturday (Nepal's weekly holiday), so we derive dates from
 * the day labels rather than assuming consecutive days.
 * Returns null if fewer than 2 data points.
 */
export function buildHistory(
  days: number[],
  prices: number[],
  todayStr: string,
): { date: string; price: number }[] | null {
  if (days.length < 2 || days.length !== prices.length) return null;

  // The last chart entry corresponds to today (or the most recent trading day).
  // Walk backwards day by day from today, matching chart day labels to find actual dates.
  const today = new Date(todayStr + 'T00:00:00Z');

  // Build a map: day-of-month → price, then walk calendar backwards to find each day
  const dayPriceMap = new Map<number, number>();
  for (let i = 0; i < days.length; i++) {
    dayPriceMap.set(days[i], prices[i]);
  }

  // Walk backwards from today, collecting entries whose day-of-month appears in chart data
  const result: { date: string; price: number }[] = [];
  const d = new Date(today);
  const maxLookback = 14; // chart spans ~7 trading days, max 14 calendar days back

  for (let step = 0; step < maxLookback && result.length < days.length; step++) {
    const dom = d.getUTCDate();
    if (dayPriceMap.has(dom)) {
      result.unshift({
        date: d.toISOString().split('T')[0],
        price: dayPriceMap.get(dom)!,
      });
    }
    d.setUTCDate(d.getUTCDate() - 1);
  }

  return result.length >= 2 ? result : null;
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

  // Extract weekly chart data (skips Saturday — Nepal's weekly holiday)
  // data = gold weekly, data2 = silver weekly
  const goldChart = parseChartData(html, 'data');
  const silverChart = parseChartData(html, 'data2');

  const previousGoldHallmark = goldChart.prices.length >= 2 ? goldChart.prices[goldChart.prices.length - 2] : null;
  const previousSilver = silverChart.prices.length >= 2 ? silverChart.prices[silverChart.prices.length - 2] : null;

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kathmandu' });

  return {
    goldHallmark: tola.golds[0],
    goldTajabi: tola.golds[1],
    silver: tola.silver,
    goldHallmarkPerGram10: gram.golds[0] ?? 0,
    goldTajabiPerGram10: gram.golds[1] ?? 0,
    silverPerGram10: gram.silver,
    previousGoldHallmark,
    previousSilver,
    goldHistory: buildHistory(goldChart.days, goldChart.prices, todayStr),
    silverHistory: buildHistory(silverChart.days, silverChart.prices, todayStr),
    date: todayStr,
  };
}
