import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { NepalPriceData } from '../../types.js';

// fenegosida.org is a client-rendered SPA; its rates come from this JSON API.
const API_BASE = 'https://api.fenegosida.org/api/website/v1/Dashboard';
const HISTORY_DAYS = 30;

const MONTHS: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

interface TodayRate {
  todayDate: string;
  yestardayDate: string;
  rateType: string;
  todayBaseRatePerGram: number;
  yestardayBaseRatePerGram: number;
}

interface ChartEntry {
  date: string;
  year: string;
  month: string;
  day: string;
  gm: number;
  tola: number;
}

interface ChartResponse {
  goldData?: ChartEntry[];
  silverData?: ChartEntry[];
}

type History = { date: string; price: number }[];

/** Convert an ISO timestamp to its calendar date in Nepal (YYYY-MM-DD). */
export function toNptDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kathmandu' });
}

/**
 * Build history from chart entries (oldest → newest).
 * The chart forward-fills Saturdays (weekly market holiday) and days after the
 * last published rate, so both are dropped to keep only real trading days.
 * Returns null if fewer than 2 data points.
 */
export function buildHistory(entries: ChartEntry[], publishedDate: string): History | null {
  const history = entries
    .filter(e => e.day !== 'Saturday' && e.tola > 0 && MONTHS[e.month])
    .map(e => ({
      date: `${e.year}-${MONTHS[e.month]}-${e.date.padStart(2, '0')}`,
      price: e.tola,
    }))
    .filter(e => e.date <= publishedDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  return history.length >= 2 ? history : null;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`fenegosida API returned ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchFenegosida(): Promise<NepalPriceData> {
  const [rates, chart] = await Promise.all([
    getJson<TodayRate[]>('today'),
    // History is a nice-to-have; don't fail the whole provider without it.
    getJson<ChartResponse>(`WeeklyChartRate?weekmonthyear=${HISTORY_DAYS}`).catch(() => null),
  ]);

  if (!Array.isArray(rates) || rates.length === 0) {
    throw new Error('Empty response from fenegosida API');
  }

  // rateType labels are Nepali, e.g. "छापावाल सुन (१ तोला)", "असली चाँदी दर (१० ग्राम)"
  const find = (metal: string, unit: string) =>
    rates.find(r => r.rateType?.includes(metal) && r.rateType.includes(unit));

  const goldTola = find('सुन', 'तोला');
  const goldGram = find('सुन', 'ग्राम');
  const silverTola = find('चाँदी', 'तोला');
  const silverGram = find('चाँदी', 'ग्राम');

  const hallmark = goldTola?.todayBaseRatePerGram ?? 0;
  const silver = silverTola?.todayBaseRatePerGram ?? 0;
  if (hallmark < 1000) {
    throw new Error('Suspicious gold price from fenegosida API: ' + hallmark);
  }
  if (silver < 100) {
    throw new Error('Suspicious silver price from fenegosida API: ' + silver);
  }

  const publishedDate = toNptDate(goldTola!.todayDate);

  return {
    goldHallmark: hallmark,
    goldTajabi: null, // FENEGOSIDA no longer publishes a Tajabi rate
    silver,
    goldHallmarkPerGram10: goldGram?.todayBaseRatePerGram ?? 0,
    goldTajabiPerGram10: null,
    silverPerGram10: silverGram?.todayBaseRatePerGram ?? 0,
    previousGoldHallmark: goldTola!.yestardayBaseRatePerGram || null,
    previousSilver: silverTola!.yestardayBaseRatePerGram || null,
    goldHistory: chart?.goldData ? buildHistory(chart.goldData, publishedDate) : null,
    silverHistory: chart?.silverData ? buildHistory(chart.silverData, publishedDate) : null,
    priceDate: publishedDate,
    date: toNptDate(new Date().toISOString()),
  };
}
