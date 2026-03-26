import { Cache } from './cache.js';
import { getConfig, configure, resetConfig } from './config.js';
import { fetchWithFallback } from './fallback.js';
import { calculateTaxBreakdown } from './calculator.js';
import { fetchFenegosida } from './providers/nepal-price/fenegosida.js';
import { fetchAshesh } from './providers/nepal-price/ashesh.js';
import { fetchHamropatro } from './providers/nepal-price/hamropatro.js';
import { fetchGoldApiCom } from './providers/live-price/gold-api.js';
import { fetchSwissquote } from './providers/live-price/swissquote.js';
import { fetchGoldApiIo } from './providers/live-price/goldapi-io.js';
import { fetchNrb } from './providers/forex/nrb.js';
import { fetchFawazahmed0 } from './providers/forex/fawazahmed0.js';
import { fetchExchangeRateApi } from './providers/forex/exchangerate-api.js';
import type {
  NepalGoldPrice, NepalSilverPrice, LiveMetalPrice,
  AllPrices, NepalPriceData, LivePriceData, ForexData,
} from './types.js';

// FENEGOSIDA updates at ~10:30 AM NPT. Poll frequently during the
// update window, cache longer outside it.
// NOTE: The Nepal cache intentionally uses its own adaptive TTL logic based on
// time of day, and does NOT use the global configure({ cacheTtl }) value.
// This is by design — the adaptive TTL is necessary to catch daily price updates
// promptly while avoiding unnecessary requests during off-hours.
const NEPAL_UPDATE_WINDOW = { startHour: 10, endHour: 12 }; // 10 AM - 12 PM NPT
const NEPAL_CACHE_TTL_ACTIVE_MS = 5 * 60 * 1000;  // 5 min during update window
const NEPAL_CACHE_TTL_IDLE_MS = 60 * 60 * 1000;    // 1 hour outside window

function getNepalCacheTtl(): number {
  const hour = parseInt(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu', hour: 'numeric', hour12: false }),
    10,
  );
  return hour >= NEPAL_UPDATE_WINDOW.startHour && hour < NEPAL_UPDATE_WINDOW.endHour
    ? NEPAL_CACHE_TTL_ACTIVE_MS
    : NEPAL_CACHE_TTL_IDLE_MS;
}

// Caches — use lazy getter so configure() changes are respected
function createCaches() {
  const ttl = getConfig().cacheTtl;
  return {
    nepal: new Cache<{ data: NepalPriceData; source: string }>(NEPAL_CACHE_TTL_IDLE_MS),
    live: new Cache<{ data: LivePriceData; source: string }>(ttl),
    forex: new Cache<{ data: ForexData; source: string }>(ttl),
  };
}
let caches = createCaches();

// Call after configure() to pick up new TTL
export function resetCaches(): void {
  caches = createCaches();
}

function getNepalProviders() {
  return [
    { name: 'fenegosida.org', fetch: fetchFenegosida },
    { name: 'ashesh.com.np', fetch: fetchAshesh },
    { name: 'hamropatro.com', fetch: fetchHamropatro },
  ];
}

function getLiveProviders(symbol: 'XAU' | 'XAG') {
  const config = getConfig();
  const providers = [
    { name: 'gold-api.com', fetch: () => fetchGoldApiCom(symbol) },
    { name: 'swissquote', fetch: () => fetchSwissquote(symbol) },
  ];
  if (config.apiKeys.goldApiIo) {
    providers.push({
      name: 'goldapi.io',
      fetch: () => fetchGoldApiIo(symbol, config.apiKeys.goldApiIo!),
    });
  }
  return providers;
}

function getForexProviders() {
  return [
    { name: 'nrb.org.np', fetch: fetchNrb },
    { name: 'fawazahmed0', fetch: fetchFawazahmed0 },
    { name: 'exchangerate-api', fetch: fetchExchangeRateApi },
  ];
}

async function fetchNepalPrices(): Promise<{ data: NepalPriceData; source: string; isStale: boolean }> {
  const cached = caches.nepal.get('nepal');
  if (cached) return { ...cached, isStale: false };

  const result = await fetchWithFallback(getNepalProviders());
  if (result) {
    caches.nepal.set('nepal', result, getNepalCacheTtl());
    return { data: result.data, source: result.source, isStale: false };
  }

  const stale = caches.nepal.getStale('nepal');
  if (stale) return { ...stale, isStale: true };

  throw new Error('All Nepal price providers failed and no cached data available');
}

async function fetchLivePrice(symbol: 'XAU' | 'XAG'): Promise<{ data: LivePriceData; source: string; isStale: boolean }> {
  const cacheKey = `live-${symbol}`;
  const cached = caches.live.get(cacheKey);
  if (cached) return { ...cached, isStale: false };

  const result = await fetchWithFallback(getLiveProviders(symbol));
  if (result) {
    caches.live.set(cacheKey, result);
    return { data: result.data, source: result.source, isStale: false };
  }

  const stale = caches.live.getStale(cacheKey);
  if (stale) return { ...stale, isStale: true };

  throw new Error(`All live price providers failed for ${symbol} and no cached data available`);
}

async function fetchForex(): Promise<{ data: ForexData; source: string; isStale: boolean }> {
  const cached = caches.forex.get('forex');
  if (cached) return { ...cached, isStale: false };

  const result = await fetchWithFallback(getForexProviders());
  if (result) {
    caches.forex.set('forex', result);
    return { data: result.data, source: result.source, isStale: false };
  }

  const stale = caches.forex.getStale('forex');
  if (stale) return { ...stale, isStale: true };

  throw new Error('All forex providers failed and no cached data available');
}

function toNepalGoldPrice(data: NepalPriceData, source: string, isStale: boolean): NepalGoldPrice {
  return {
    hallmark: data.goldHallmark,
    tajabi: data.goldTajabi,
    unit: 'tola',
    perGram10: data.goldHallmarkPerGram10,
    previousPrice: data.previousGoldHallmark,
    source,
    date: data.date,
    updatedAt: new Date().toISOString(),
    isStale,
  };
}

function toNepalSilverPrice(data: NepalPriceData, source: string, isStale: boolean): NepalSilverPrice {
  return {
    price: data.silver,
    unit: 'tola',
    perGram10: data.silverPerGram10,
    previousPrice: data.previousSilver,
    source,
    date: data.date,
    updatedAt: new Date().toISOString(),
    isStale,
  };
}

export async function getNepalGoldPrice(): Promise<NepalGoldPrice> {
  const { data, source, isStale } = await fetchNepalPrices();
  return toNepalGoldPrice(data, source, isStale);
}

export async function getNepalSilverPrice(): Promise<NepalSilverPrice> {
  const { data, source, isStale } = await fetchNepalPrices();
  return toNepalSilverPrice(data, source, isStale);
}

async function buildLivePrice(symbol: 'XAU' | 'XAG'): Promise<LiveMetalPrice> {
  const [live, forex] = await Promise.all([
    fetchLivePrice(symbol),
    fetchForex(),
  ]);

  const config = getConfig();
  const metalRates = symbol === 'XAU' ? config.rates.gold : config.rates.silver;
  const breakdown = calculateTaxBreakdown(
    live.data.priceUsd,
    forex.data.usdToNpr,
    metalRates,
  );

  return {
    raw: {
      usdPerOz: live.data.priceUsd,
      usdToNpr: forex.data.usdToNpr,
    },
    perTola: breakdown,
    rates: { ...metalRates },
    source: live.source,
    updatedAt: live.data.updatedAt,
    isStale: live.isStale || forex.isStale,
  };
}

export async function getLiveGoldPrice(): Promise<LiveMetalPrice> {
  return buildLivePrice('XAU');
}

export async function getLiveSilverPrice(): Promise<LiveMetalPrice> {
  return buildLivePrice('XAG');
}

export async function getAllPrices(): Promise<AllPrices> {
  const [nepalData, liveGold, liveSilver] = await Promise.allSettled([
    fetchNepalPrices(),
    buildLivePrice('XAU'),
    buildLivePrice('XAG'),
  ]);

  const nepal = nepalData.status === 'fulfilled' ? nepalData.value : null;

  return {
    gold: {
      nepal: nepal ? toNepalGoldPrice(nepal.data, nepal.source, nepal.isStale) : null,
      live: liveGold.status === 'fulfilled' ? liveGold.value : null,
    },
    silver: {
      nepal: nepal ? toNepalSilverPrice(nepal.data, nepal.source, nepal.isStale) : null,
      live: liveSilver.status === 'fulfilled' ? liveSilver.value : null,
    },
  };
}

// Re-exports
export { configure, resetConfig } from './config.js';
export type {
  NepalGoldPrice, NepalSilverPrice, LiveMetalPrice,
  TaxBreakdown, TaxRates, MetalRates, AllPrices, Config,
  ProviderResult,
} from './types.js';
