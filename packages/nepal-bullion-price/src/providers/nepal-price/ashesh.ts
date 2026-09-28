import * as cheerio from 'cheerio';
import { getConfig } from '../../config.js';
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { NepalPriceData } from '../../types.js';

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

/** Parse the widget header date ("27-Sep-2026" or "2026-09-27") to YYYY-MM-DD. */
export function parseAsheshDate(text: string): string | null {
  const iso = text.match(/\d{4}-\d{2}-\d{2}/);
  if (iso) return iso[0];
  const dmy = text.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
  if (dmy && MONTHS[dmy[2].toLowerCase()]) {
    return `${dmy[3]}-${MONTHS[dmy[2].toLowerCase()]}-${dmy[1].padStart(2, '0')}`;
  }
  return null;
}

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

  // Rows come as: Hallmark, Tajabi, Silver (per tola) then the same three per 10g.
  const rows: { name: string; price: number }[] = [];
  $('.country').each((_, el) => {
    const name = $(el).find('.name').text().trim().toLowerCase();
    const price = parseInt($(el).find('.rate_buying').text().replace(/,/g, '').trim(), 10);
    rows.push({ name, price: isNaN(price) ? 0 : price });
  });

  if (rows.length < 6) {
    throw new Error('Failed to parse ashesh.com.np widget');
  }

  const tola = rows.slice(0, 3);
  const gram = rows.slice(3, 6);
  const pick = (set: typeof rows, label: string, index: number) =>
    (set.find(r => r.name.includes(label)) ?? set[index]).price;

  const hallmark = pick(tola, 'hallmark', 0);
  const silver = pick(tola, 'silver', 2);
  if (!hallmark || hallmark < 1000) {
    throw new Error('Suspicious gold price from ashesh.com.np: ' + hallmark);
  }
  if (!silver || silver < 100) {
    throw new Error('Suspicious silver price from ashesh.com.np: ' + silver);
  }

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kathmandu' });
  const priceDate = parseAsheshDate($('.header_date').text());

  return {
    goldHallmark: hallmark,
    goldTajabi: pick(tola, 'tajabi', 1) || null,
    silver,
    goldHallmarkPerGram10: pick(gram, 'hallmark', 0),
    goldTajabiPerGram10: pick(gram, 'tajabi', 1) || null,
    silverPerGram10: pick(gram, 'silver', 2),
    previousGoldHallmark: null,
    previousSilver: null,
    goldHistory: null,
    silverHistory: null,
    priceDate,
    date: today,
  };
}
