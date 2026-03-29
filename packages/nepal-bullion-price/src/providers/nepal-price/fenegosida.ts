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
 * the gaps between consecutive day labels rather than assuming consecutive days.
 * Each entry has a 1:1 mapping between day label, price, and computed date.
 * Returns null if fewer than 2 data points.
 */
export function buildHistory(
  days: number[],
  prices: number[],
  todayStr: string,
): { date: string; price: number }[] | null {
  if (days.length < 2 || days.length !== prices.length) return null;

  // Anchor the last chart entry to its actual date, not today.
  // On non-trading days (Saturday) the last chart day will be before today.
  const today = new Date(todayStr + 'T00:00:00Z');
  const lastChartDay = days[days.length - 1];
  const todayDay = today.getUTCDate();

  const dates = new Array<Date>(days.length);
  const lastDate = new Date(today);
  // Offset from today: if today=29 and last chart day=27, go back 2 days
  let dayOffset = todayDay - lastChartDay;
  // If offset is negative, last chart day is from previous month (e.g., today=2, chart=30)
  if (dayOffset < 0) dayOffset += new Date(Date.UTC(
    today.getUTCFullYear(), today.getUTCMonth(), 0,
  )).getUTCDate();
  lastDate.setUTCDate(lastDate.getUTCDate() - dayOffset);
  dates[days.length - 1] = lastDate;

  for (let i = days.length - 2; i >= 0; i--) {
    let gap = days[i + 1] - days[i];
    // If gap is <= 0, we crossed a month boundary (e.g., day 28 → day 1).
    // In that case the real gap is small (1-3 days), not ~27 days.
    if (gap <= 0) gap += new Date(Date.UTC(
      dates[i + 1].getUTCFullYear(),
      dates[i + 1].getUTCMonth(),
      0, // day 0 = last day of previous month
    )).getUTCDate();
    const d = new Date(dates[i + 1]);
    d.setUTCDate(d.getUTCDate() - gap);
    dates[i] = d;
  }

  return dates.map((d, i) => ({
    date: d.toISOString().split('T')[0],
    price: prices[i],
  }));
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
