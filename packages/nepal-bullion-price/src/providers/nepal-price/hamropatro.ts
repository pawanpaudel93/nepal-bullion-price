import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { NepalPriceData } from '../../types.js';

const HISTORY_DAYS = 30;

interface PricePoint {
  date: string;
  price: number;
}

interface SegmentItem {
  name: string;
  symbol: string;
  prices: { name: string; price: PricePoint; history?: PricePoint[] }[];
}

interface Segment {
  date: string;
  items: SegmentItem[];
}

/**
 * hamropatro.com/gold is a Next.js app. The rates are not in the markup as plain
 * text; they are embedded as JSON in the React Server Components payload
 * (`self.__next_f.push([1, "..."])` script chunks). We join the chunks and pull
 * out the English segment, which uses Gregorian (AD) dates.
 */
export function extractSegment(html: string): Segment | null {
  const chunks: string[] = [];
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  for (const m of html.matchAll(re)) {
    try {
      chunks.push(JSON.parse(m[1]));
    } catch {
      // ignore malformed chunk
    }
  }
  const flight = chunks.join('');

  const key = '"enSegment":';
  const start = flight.indexOf(key);
  if (start === -1) return null;

  // Walk forward to the matching closing brace of the segment object.
  const from = start + key.length;
  let depth = 0;
  let inString = false;
  for (let i = from; i < flight.length; i++) {
    const ch = flight[i];
    if (inString) {
      if (ch === '\\') i++;
      else if (ch === '"') inString = false;
    } else if (ch === '"') {
      inString = true;
    } else if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(flight.slice(from, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function findPrice(item: SegmentItem | undefined, unit: RegExp) {
  return item?.prices.find(p => unit.test(p.name));
}

/** History from newest-first points → oldest-first, last N days. */
function toHistory(points: PricePoint[] | undefined): PricePoint[] | null {
  if (!points || points.length < 2) return null;
  return points
    .filter(p => p.price > 0)
    .slice(0, HISTORY_DAYS)
    .map(p => ({ date: p.date, price: p.price }))
    .reverse();
}

export async function fetchHamropatro(): Promise<NepalPriceData> {
  const res = await fetch('https://www.hamropatro.com/gold', {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`hamropatro.com returned ${res.status}`);

  const segment = extractSegment(await res.text());
  if (!segment?.items?.length) {
    throw new Error('Failed to parse hamropatro.com gold page');
  }

  const gold = segment.items.find(i => /HALMARK|HALLMARK/i.test(i.symbol));
  const silverItem = segment.items.find(i => /SILVER/i.test(i.symbol));

  const goldTola = findPrice(gold, /tola/i);
  const goldGram = findPrice(gold, /gm|gram/i);
  const silverTola = findPrice(silverItem, /tola/i);
  const silverGram = findPrice(silverItem, /gm|gram/i);

  const hallmark = goldTola?.price.price ?? 0;
  const silver = silverTola?.price.price ?? 0;
  if (hallmark < 1000) {
    throw new Error('Suspicious gold price from hamropatro.com: ' + hallmark);
  }
  if (silver < 100) {
    throw new Error('Suspicious silver price from hamropatro.com: ' + silver);
  }

  const goldHistory = toHistory(goldTola?.history);
  const silverHistory = toHistory(silverTola?.history);
  const previous = (h: PricePoint[] | null) => (h && h.length >= 2 ? h[h.length - 2].price : null);

  return {
    goldHallmark: hallmark,
    goldTajabi: null, // no longer listed on hamropatro.com
    silver,
    goldHallmarkPerGram10: goldGram?.price.price ?? 0,
    goldTajabiPerGram10: null,
    silverPerGram10: silverGram?.price.price ?? 0,
    previousGoldHallmark: previous(goldHistory),
    previousSilver: previous(silverHistory),
    goldHistory,
    silverHistory,
    priceDate: goldTola?.price.date ?? segment.date ?? null,
    date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kathmandu' }),
  };
}
